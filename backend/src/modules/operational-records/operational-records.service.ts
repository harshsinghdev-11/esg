import prisma from '../../config/db.js';
import { NotFoundError, ConflictError } from '../../shared/utils/errors.js';
import { OperationalSourceType, CalculationType, CarbonSourceType } from '../../generated/prisma/index.js';

export const operationalRecordsService = {
  async create(organizationId: string, data: any) {
    return prisma.operationalRecord.create({
      data: {
        ...data,
        organizationId,
        recordDate: new Date(data.recordDate),
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { sourceType, departmentId, isProcessed, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { organizationId };
    if (sourceType) where.sourceType = sourceType;
    if (departmentId) where.departmentId = departmentId;
    if (isProcessed !== undefined) where.isProcessed = isProcessed === 'true';
    if (dateFrom || dateTo) {
      where.recordDate = {};
      if (dateFrom) where.recordDate.gte = new Date(dateFrom);
      if (dateTo) where.recordDate.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      prisma.operationalRecord.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { recordDate: 'desc' },
        include: { department: true, emissionFactor: true }
      }),
      prisma.operationalRecord.count({ where })
    ]);

    return { data, meta: { page: Number(page), limit: Number(limit), total } };
  },

  async getById(organizationId: string, id: string) {
    const record = await prisma.operationalRecord.findFirst({
      where: { operationalRecordId: id, organizationId },
      include: { department: true, emissionFactor: true }
    });
    if (!record) throw new NotFoundError('Operational record not found');
    return record;
  },

  async update(organizationId: string, id: string, data: any) {
    const record = await prisma.operationalRecord.findFirst({
      where: { operationalRecordId: id, organizationId }
    });
    if (!record) throw new NotFoundError('Operational record not found');

    const updateData = { ...data };
    if (data.recordDate) updateData.recordDate = new Date(data.recordDate);

    return prisma.operationalRecord.update({
      where: { operationalRecordId: id },
      data: updateData
    });
  },

  async delete(organizationId: string, id: string) {
    const record = await prisma.operationalRecord.findFirst({
      where: { operationalRecordId: id, organizationId }
    });
    if (!record) throw new NotFoundError('Operational record not found');
    if (record.isProcessed) throw new ConflictError('Cannot delete a processed record');

    return prisma.operationalRecord.delete({
      where: { operationalRecordId: id }
    });
  },

  async calculate(organizationId: string, id: string, employeeId?: string) {
    const record = await prisma.operationalRecord.findFirst({
      where: { operationalRecordId: id, organizationId }
    });
    if (!record) throw new NotFoundError('Operational record not found');
    if (record.isProcessed) throw new ConflictError('Record is already processed');
    if (!record.emissionFactorId) throw new ConflictError('No emission factor attached to this record');

    const factor = await prisma.emissionFactor.findFirst({
      where: {
        emissionFactorId: record.emissionFactorId,
        organizationId,
        status: 'ACTIVE',
        validFrom: { lte: record.recordDate },
        OR: [
          { validTo: null },
          { validTo: { gte: record.recordDate } }
        ]
      }
    });

    if (!factor) throw new ConflictError('No valid active emission factor found for this record date');

    const co2e = Number(record.quantity) * Number(factor.co2ePerUnit);

    // All in one transaction
    const [transaction, updatedRecord] = await prisma.$transaction([
      prisma.carbonTransaction.create({
        data: {
          organizationId,
          departmentId: record.departmentId || organizationId, // fallback if no dept
          sourceType: record.sourceType as any,
          operationalRecordId: record.operationalRecordId,
          emissionFactorId: factor.emissionFactorId,
          quantity: record.quantity,
          co2eEmitted: co2e,
          calculationType: CalculationType.AUTO,
          transactionDate: record.recordDate,
          createdBy: employeeId || null,
        }
      }),
      prisma.operationalRecord.update({
        where: { operationalRecordId: record.operationalRecordId },
        data: { isProcessed: true }
      })
    ]);

    return { transaction, record: updatedRecord };
  }
};
