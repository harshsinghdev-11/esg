import { PrismaClient, EmployeeRole, RecordStatus } from '../src/generated/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB seed...');

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: 'EcoSphere HQ',
      status: RecordStatus.ACTIVE,
    },
  });

  // Create super admin
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.employee.create({
    data: {
      organizationId: organization.organizationId,
      email: 'admin@ecosphere.com',
      fullName: 'Super Admin',
      employeeCode: 'EMP-0001',
      role: EmployeeRole.SUPER_ADMIN,
      passwordHash,
    },
  });

  // Create esg configuration
  await prisma.esgConfiguration.create({
    data: {
      organizationId: organization.organizationId,
    }
  });

  console.log(`Seed successful.
Organization ID: ${organization.organizationId}
Admin Email: ${admin.email}
Admin Password: admin123
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
