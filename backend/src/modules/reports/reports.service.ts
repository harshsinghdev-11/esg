import { randomUUID } from 'crypto';
import prisma from '../../config/db.js';
import { EmployeeStatus, LifecycleStatus, RecordStatus } from '../../generated/prisma/index.js';
import { NotFoundError } from '../../shared/utils/errors.js';
import { dashboardService } from '../dashboard/dashboard.service.js';
import { resolveScorePeriod, scoresService } from '../scores/scores.service.js';

type StoredReport = {
  reportId: string;
  organizationId: string;
  reportType: string;
  filters: any;
  generatedAt: string;
  content: any;
};

const reportStore = new Map<string, StoredReport>();

function storeReport(organizationId: string, reportType: string, filters: any, content: any) {
  const reportId = randomUUID();
  const report: StoredReport = {
    reportId,
    organizationId,
    reportType,
    filters,
    generatedAt: new Date().toISOString(),
    content,
  };

  reportStore.set(reportId, report);
  return report;
}

function flattenToCsvRows(value: any, prefix = ''): Array<[string, string | number | boolean]> {
  if (value === null || value === undefined) {
    return [[prefix || 'value', '']];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => flattenToCsvRows(entry, `${prefix}[${index}]`));
  }

  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([key, entry]) =>
      flattenToCsvRows(entry, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [[prefix || 'value', value as string | number | boolean]];
}

function reportFiltersToQuery(filters: any) {
  return {
    period_start: filters.date_from,
    period_end: filters.date_to,
  };
}

export const reportsService = {
  async getEnvironmentalReport(organizationId: string, filters: any) {
    const summary = await dashboardService.getEnvironmentalSummary(organizationId, reportFiltersToQuery(filters));
    return storeReport(organizationId, 'environmental', filters, summary);
  },

  async getSocialReport(organizationId: string, filters: any) {
    const summary = await dashboardService.getSocialSummary(organizationId, reportFiltersToQuery(filters));
    return storeReport(organizationId, 'social', filters, summary);
  },

  async getGovernanceReport(organizationId: string, filters: any) {
    const summary = await dashboardService.getGovernanceSummary(organizationId, reportFiltersToQuery(filters));
    return storeReport(organizationId, 'governance', filters, summary);
  },

  async getEsgSummaryReport(organizationId: string, filters: any) {
    const query = reportFiltersToQuery(filters);
    const [overview, departmentScores] = await Promise.all([
      dashboardService.getOverview(organizationId, query),
      scoresService.listDepartmentScores(organizationId, {
        period_start: query.period_start,
        period_end: query.period_end,
        limit: 100,
        page: 1,
      }),
    ]);

    return storeReport(organizationId, 'esg-summary', filters, {
      overview,
      departmentScores: departmentScores.data,
    });
  },

  async createCustomReport(organizationId: string, filters: any) {
    const period = resolveScorePeriod({
      period_start: filters.date_from,
      period_end: filters.date_to,
    });

    const reportQuery = {
      period_start: period.periodStart.toISOString(),
      period_end: period.periodEnd.toISOString(),
    };

    if (filters.module === 'environmental') {
      return this.getEnvironmentalReport(organizationId, filters);
    }

    if (filters.module === 'social') {
      return this.getSocialReport(organizationId, filters);
    }

    if (filters.module === 'governance') {
      return this.getGovernanceReport(organizationId, filters);
    }

    if (filters.module === 'gamification') {
      const gamification = await dashboardService.getGamificationSummary(organizationId, reportQuery);
      return storeReport(organizationId, 'gamification', filters, gamification);
    }

    const [environmental, social, governance, gamification, organizationScore] = await Promise.all([
      dashboardService.getEnvironmentalSummary(organizationId, reportQuery),
      dashboardService.getSocialSummary(organizationId, reportQuery),
      dashboardService.getGovernanceSummary(organizationId, reportQuery),
      dashboardService.getGamificationSummary(organizationId, reportQuery),
      scoresService.getOrganizationScore(organizationId),
    ]);

    const [employeeCount, activeChallengeCount, activePolicyCount] = await Promise.all([
      prisma.employee.count({
        where: {
          organizationId,
          status: EmployeeStatus.ACTIVE,
        },
      }),
      prisma.challenge.count({
        where: {
          organizationId,
          status: {
            in: [LifecycleStatus.ACTIVE, LifecycleStatus.UNDER_REVIEW],
          },
        },
      }),
      prisma.esgPolicy.count({
        where: {
          organizationId,
          status: RecordStatus.ACTIVE,
        },
      }),
    ]);

    return storeReport(organizationId, 'custom', filters, {
      organizationScore,
      employeeCount,
      activeChallengeCount,
      activePolicyCount,
      environmental,
      social,
      governance,
      gamification,
    });
  },

  async exportReport(organizationId: string, reportId: string, format: 'pdf' | 'excel' | 'csv') {
    const report = reportStore.get(reportId);

    if (!report || report.organizationId !== organizationId) {
      throw new NotFoundError('Report not found');
    }

    if (format === 'csv') {
      const rows = flattenToCsvRows(report.content);
      const csv = ['key,value', ...rows.map(([key, value]) => `${JSON.stringify(key)},${JSON.stringify(String(value))}`)].join('\n');

      return {
        reportId: report.reportId,
        format,
        mimeType: 'text/csv',
        fileName: `${report.reportType}-${report.reportId}.csv`,
        content: csv,
      };
    }

    return {
      reportId: report.reportId,
      format,
      mimeType:
        format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileName: `${report.reportType}-${report.reportId}.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
      content: JSON.stringify(report.content, null, 2),
    };
  },
};
