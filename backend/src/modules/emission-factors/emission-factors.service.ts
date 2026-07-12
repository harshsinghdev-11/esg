import prisma from '../../config/db.js';
import { NotFoundError } from '../../shared/utils/errors.js';
import { RecordStatus } from '../../generated/prisma/index.js';

export const emissionFactorsService = {
  async create(organizationId: string, data: any) {
    const validFromDate = new Date(data.validFrom);
    const validToDate = data.validTo ? new Date(data.validTo) : null;

    return prisma.emissionFactor.create({
      data: {
        name: data.name,
        unit: data.unit,
        co2ePerUnit: data.co2ePerUnit,
        source: data.source,
        validFrom: validFromDate,
        validTo: validToDate,
        organizationId,
        status: RecordStatus.ACTIVE
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { status } = query;
    return prisma.emissionFactor.findMany({
      where: {
        organizationId,
        ...(status ? { status: status as RecordStatus } : {})
      }
    });
  },

  async getById(organizationId: string, id: string) {
    const factor = await prisma.emissionFactor.findFirst({
      where: { emissionFactorId: id, organizationId }
    });
    if (!factor) throw new NotFoundError('Emission factor not found');
    return factor;
  },

  async update(organizationId: string, id: string, data: any) {
    const factor = await prisma.emissionFactor.findFirst({
      where: { emissionFactorId: id, organizationId }
    });
    if (!factor) throw new NotFoundError('Emission factor not found');

    const updateData: any = { ...data };
    if (data.validFrom) updateData.validFrom = new Date(data.validFrom);
    if (data.validTo) updateData.validTo = new Date(data.validTo);

    return prisma.emissionFactor.update({
      where: { emissionFactorId: id },
      data: updateData
    });
  },

  async delete(organizationId: string, id: string) {
    const factor = await prisma.emissionFactor.findFirst({
      where: { emissionFactorId: id, organizationId }
    });
    if (!factor) throw new NotFoundError('Emission factor not found');

    return prisma.emissionFactor.update({
      where: { emissionFactorId: id },
      data: { status: RecordStatus.INACTIVE }
    });
  }
};
