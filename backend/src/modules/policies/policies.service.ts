import prisma from '../../config/db.js';
import { NotFoundError, ConflictError } from '../../shared/utils/errors.js';
import { RecordStatus, EmployeeStatus, NotificationEventType } from '../../generated/prisma/index.js';

export const policiesService = {
  async create(organizationId: string, data: any) {
    return prisma.esgPolicy.create({
      data: {
        ...data,
        effectiveDate: new Date(data.effectiveDate),
        organizationId,
        status: RecordStatus.ACTIVE
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { status } = query;
    return prisma.esgPolicy.findMany({
      where: {
        organizationId,
        ...(status ? { status: status as RecordStatus } : {})
      }
    });
  },

  async getById(organizationId: string, id: string) {
    const policy = await prisma.esgPolicy.findFirst({
      where: { esgPolicyId: id, organizationId }
    });
    if (!policy) throw new NotFoundError('Policy not found');
    return policy;
  },

  async update(organizationId: string, id: string, data: any) {
    const policy = await prisma.esgPolicy.findFirst({
      where: { esgPolicyId: id, organizationId }
    });
    if (!policy) throw new NotFoundError('Policy not found');

    const updateData: any = { ...data };
    if (data.effectiveDate) updateData.effectiveDate = new Date(data.effectiveDate);

    return prisma.esgPolicy.update({
      where: { esgPolicyId: id },
      data: updateData
    });
  },

  async delete(organizationId: string, id: string) {
    const policy = await prisma.esgPolicy.findFirst({
      where: { esgPolicyId: id, organizationId }
    });
    if (!policy) throw new NotFoundError('Policy not found');

    return prisma.esgPolicy.update({
      where: { esgPolicyId: id },
      data: { status: RecordStatus.INACTIVE }
    });
  },

  async getAcknowledgements(organizationId: string, id: string) {
    const policy = await prisma.esgPolicy.findFirst({
      where: { esgPolicyId: id, organizationId }
    });
    if (!policy) throw new NotFoundError('Policy not found');

    return prisma.policyAcknowledgement.findMany({
      where: { esgPolicyId: id },
      include: { employee: { select: { fullName: true, employeeCode: true } } }
    });
  },

  async acknowledge(organizationId: string, employeeId: string, id: string) {
    const policy = await prisma.esgPolicy.findFirst({
      where: { esgPolicyId: id, organizationId }
    });
    if (!policy) throw new NotFoundError('Policy not found');
    if (policy.status !== RecordStatus.ACTIVE) throw new ConflictError('Cannot acknowledge inactive policy');

    const existing = await prisma.policyAcknowledgement.findUnique({
      where: { esgPolicyId_employeeId: { esgPolicyId: id, employeeId } }
    });

    if (existing) throw new ConflictError('Already acknowledged');

    return prisma.policyAcknowledgement.create({
      data: {
        esgPolicyId: id,
        employeeId,
        acknowledgedAt: new Date()
      }
    });
  },

  async remind(organizationId: string, id: string) {
    const policy = await prisma.esgPolicy.findFirst({
      where: { esgPolicyId: id, organizationId }
    });
    if (!policy) throw new NotFoundError('Policy not found');
    if (policy.status !== RecordStatus.ACTIVE) throw new ConflictError('Cannot send reminders for inactive policy');

    const config = await prisma.esgConfiguration.findUnique({
      where: { organizationId }
    });

    const outstandingEmployees = await prisma.employee.findMany({
      where: {
        organizationId,
        status: EmployeeStatus.ACTIVE,
        policyAcknowledgements: {
          none: { esgPolicyId: id }
        }
      }
    });

    if (config?.notifyInApp && outstandingEmployees.length > 0) {
      const notifications = outstandingEmployees.map(emp => ({
        organizationId,
        recipientEmployeeId: emp.employeeId,
        eventType: NotificationEventType.POLICY_ACK_REMINDER,
        title: 'Policy Acknowledgement Reminder',
        message: `Please acknowledge the policy: ${policy.title}`,
        relatedEntityType: 'POLICY',
        relatedEntityId: policy.esgPolicyId
      }));

      await prisma.notification.createMany({
        data: notifications
      });
    }

    return { remindedCount: outstandingEmployees.length };
  }
};
