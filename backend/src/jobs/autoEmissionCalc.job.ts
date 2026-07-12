import prisma from '../config/db.js';
import { CalculationType } from '../generated/prisma/index.js';

export async function runAutoEmissionCalc(targetOrganizationId?: string) {
  let processedCount = 0;
  let skippedCount = 0;
  let errorsCount = 0;

  try {
    const whereClause: any = { isProcessed: false };
    if (targetOrganizationId) {
      whereClause.organizationId = targetOrganizationId;
    }

    // Get all unprocessed records
    const records = await prisma.operationalRecord.findMany({
      where: whereClause
    });

    for (const record of records) {
      try {
        // Check if auto calc is enabled for this org
        const config = await prisma.esgConfiguration.findUnique({
          where: { organizationId: record.organizationId }
        });

        if (!config || !config.autoEmissionCalculationEnabled) {
          skippedCount++;
          continue;
        }

        if (!record.emissionFactorId) {
          console.warn(`[Job: AutoEmissionCalc] Skipping record ${record.operationalRecordId}: No emissionFactorId.`);
          skippedCount++;
          continue;
        }

        // Find valid active emission factor
        const factor = await prisma.emissionFactor.findFirst({
          where: {
            emissionFactorId: record.emissionFactorId,
            organizationId: record.organizationId,
            status: 'ACTIVE',
            validFrom: { lte: record.recordDate },
            OR: [
              { validTo: null },
              { validTo: { gte: record.recordDate } }
            ]
          }
        });

        if (!factor) {
          console.warn(`[Job: AutoEmissionCalc] Skipping record ${record.operationalRecordId}: No valid active emission factor.`);
          skippedCount++;
          continue;
        }

        const co2e = Number(record.quantity) * Number(factor.co2ePerUnit);

        // Transactionally insert carbon transaction and mark as processed
        await prisma.$transaction([
          prisma.carbonTransaction.create({
            data: {
              organizationId: record.organizationId,
              departmentId: record.departmentId || record.organizationId, // Fallback if no department
              sourceType: record.sourceType as any,
              operationalRecordId: record.operationalRecordId,
              emissionFactorId: factor.emissionFactorId,
              quantity: record.quantity,
              co2eEmitted: co2e,
              calculationType: CalculationType.AUTO,
              transactionDate: record.recordDate,
              createdBy: null,
            }
          }),
          prisma.operationalRecord.update({
            where: { operationalRecordId: record.operationalRecordId },
            data: { isProcessed: true }
          })
        ]);

        processedCount++;
      } catch (err) {
        console.error(`[Job: AutoEmissionCalc] Failed to process record ${record.operationalRecordId}:`, err);
        errorsCount++;
      }
    }

    return { processedCount, skippedCount, errorsCount };
  } catch (err) {
    console.error(`[Job: AutoEmissionCalc] Critical failure:`, err);
    throw err;
  }
}
