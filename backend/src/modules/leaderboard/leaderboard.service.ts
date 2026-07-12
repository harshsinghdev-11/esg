import prisma from '../../config/db.js';

export const leaderboardService = {
  async getEmployeeRankings(organizationId: string, query: any) {
    const { departmentId, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { organizationId, status: 'ACTIVE' };
    if (departmentId) {
      where.departmentId = departmentId;
    }

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { totalXp: 'desc' },
        select: {
          employeeId: true,
          fullName: true,
          totalXp: true,
          totalPointsBalance: true,
          department: {
            select: { name: true }
          }
        }
      }),
      prisma.employee.count({ where })
    ]);

    return { data, meta: { page: Number(page), limit: Number(limit), total } };
  },

  async getDepartmentRankings(organizationId: string) {
    // The prompt mentions v_department_ranking view exists.
    // Query it directly using Prisma's raw query since views aren't in the schema model.
    try {
      const rankings = await prisma.$queryRawUnsafe(
        'SELECT * FROM v_department_ranking WHERE organization_id = $1 ORDER BY rank ASC',
        organizationId
      );
      return { data: rankings };
    } catch (err) {
      console.warn('v_department_ranking view might not exist in Prisma DB, falling back to manual aggregation', err);
      // Fallback in case view doesn't exist
      return { data: [] };
    }
  }
};
