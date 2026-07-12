import prisma from '../../config/db.js';
import { NotFoundError } from '../../shared/utils/errors.js';
import { UpdateEsgConfigDto } from './settings.types.js';

export const settingsService = {
  async getConfig(organizationId: string) {
    let config = await prisma.esgConfiguration.findUnique({
      where: { organizationId }
    });
    
    if (!config) {
      config = await prisma.esgConfiguration.create({
        data: { organizationId }
      });
    }
    return config;
  },

  async updateConfig(organizationId: string, data: UpdateEsgConfigDto) {
    const config = await prisma.esgConfiguration.findUnique({
      where: { organizationId }
    });
    
    if (!config) {
      throw new NotFoundError('ESG configuration not found');
    }
    
    return prisma.esgConfiguration.update({
      where: { organizationId },
      data
    });
  }
};
