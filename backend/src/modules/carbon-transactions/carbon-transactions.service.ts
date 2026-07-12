import prisma from '../../config/db.js';
import { NotFoundError, ConflictError } from '../../shared/utils/errors.js';
import { CalculationType, CarbonSourceType } from '../../generated/prisma/index.js';
import { runAutoEmissionCalc } from '../../jobs/autoEmissionCalc.job.js';

export const carbonTransactionsService = {
  async create(organizationId: string, data: any, employeeId: string) {
    const factor = await prisma.emissionFactor.findFirst({
      where: {
        emissionFactorId: data.emissionFactorId,
        organizationId,
        status: 'ACTIVE',
        validFrom: { lte: new Date(data.transactionDate) },
        OR: [
          { validTo: null },
          { validTo: { gte: new Date(data.transactionDate) } }
        ]
      }
    });

    if (!factor) throw new ConflictError('No valid active emission factor found for this transaction date');

    const co2e = Number(data.quantity) * Number(factor.co2ePerUnit);

    return prisma.carbonTransaction.create({
      data: {
        organizationId,
        departmentId: data.departmentId,
        sourceType: data.sourceType || CarbonSourceType.MANUAL,
        emissionFactorId: factor.emissionFactorId,
        quantity: data.quantity,
        co2eEmitted: co2e,
        calculationType: CalculationType.MANUAL,
        transactionDate: new Date(data.transactionDate),
        createdBy: employeeId,
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { departmentId, sourceType, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { organizationId };
    if (departmentId) where.departmentId = departmentId;
    if (sourceType) where.sourceType = sourceType;
    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = new Date(dateFrom);
      if (dateTo) where.transactionDate.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      prisma.carbonTransaction.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { transactionDate: 'desc' },
        include: { department: true, emissionFactor: true, creator: true }
      }),
      prisma.carbonTransaction.count({ where })
    ]);

    return { data, meta: { page: Number(page), limit: Number(limit), total } };
  },

  async getById(organizationId: string, id: string) {
    const transaction = await prisma.carbonTransaction.findFirst({
      where: { carbonTransactionId: id, organizationId },
      include: { department: true, emissionFactor: true, creator: true, operationalRecord: true }
    });
    if (!transaction) throw new NotFoundError('Carbon transaction not found');
    return transaction;
  },

  async update(organizationId: string, id: string, data: any) {
    const transaction = await prisma.carbonTransaction.findFirst({
      where: { carbonTransactionId: id, organizationId }
    });
    if (!transaction) throw new NotFoundError('Carbon transaction not found');
    if (transaction.calculationType === CalculationType.AUTO) throw new ConflictError('Cannot manually update an auto-calculated transaction');

    const updateData = { ...data };
    if (data.transactionDate) updateData.transactionDate = new Date(data.transactionDate);

    // If quantity or emission factor changed, recalculate co2e
    const finalQuantity = data.quantity !== undefined ? data.quantity : transaction.quantity;
    const finalFactorId = data.emissionFactorId !== undefined ? data.emissionFactorId : transaction.emissionFactorId;
    const finalDate = updateData.transactionDate || transaction.transactionDate;

    if (data.quantity !== undefined || data.emissionFactorId !== undefined || data.transactionDate !== undefined) {
      const factor = await prisma.emissionFactor.findFirst({
        where: {
          emissionFactorId: finalFactorId,
          organizationId,
          status: 'ACTIVE',
          validFrom: { lte: finalDate },
          OR: [
            { validTo: null },
            { validTo: { gte: finalDate } }
          ]
        }
      });
      if (!factor) throw new ConflictError('No valid active emission factor found for this transaction date');
      updateData.co2eEmitted = Number(finalQuantity) * Number(factor.co2ePerUnit);
    }

    return prisma.carbonTransaction.update({
      where: { carbonTransactionId: id },
      data: updateData
    });
  },

  async delete(organizationId: string, id: string) {
    const transaction = await prisma.carbonTransaction.findFirst({
      where: { carbonTransactionId: id, organizationId }
    });
    if (!transaction) throw new NotFoundError('Carbon transaction not found');
    if (transaction.calculationType === CalculationType.AUTO) throw new ConflictError('Cannot delete an auto-calculated transaction');

    return prisma.carbonTransaction.delete({
      where: { carbonTransactionId: id }
    });
  },

  async summary(organizationId: string, query: any) {
    const { departmentId, dateFrom, dateTo } = query;
    const where: any = { organizationId };
    if (departmentId) where.departmentId = departmentId;
    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = new Date(dateFrom);
      if (dateTo) where.transactionDate.lte = new Date(dateTo);
    }

    const aggregations = await prisma.carbonTransaction.aggregate({
      where,
      _sum: {
        co2eEmitted: true
      }
    });

    return { totalCo2eEmitted: aggregations._sum.co2eEmitted || 0 };
  },

  async autoCalculate(organizationId: string) {
    return runAutoEmissionCalc(organizationId);
  }
};
