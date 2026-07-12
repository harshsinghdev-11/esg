export type BackendRole = "SUPER_ADMIN" | "ESG_MANAGER" | "DEPT_HEAD" | "AUDITOR" | "EMPLOYEE";

export const can = {
  manageOrg: (role: string | undefined) => ["SUPER_ADMIN"].includes(role as BackendRole),
  manageEmployees: (role: string | undefined) => ["SUPER_ADMIN", "ESG_MANAGER"].includes(role as BackendRole),
  approveCsr: (role: string | undefined) => ["SUPER_ADMIN", "ESG_MANAGER", "DEPT_HEAD"].includes(role as BackendRole),
  manageAudits: (role: string | undefined) => ["SUPER_ADMIN", "ESG_MANAGER", "AUDITOR"].includes(role as BackendRole),
  viewReports: (role: string | undefined) => ["SUPER_ADMIN", "ESG_MANAGER", "AUDITOR"].includes(role as BackendRole),
  redeemReward: (role: string | undefined) => role === "EMPLOYEE",
  joinChallenge: (role: string | undefined) => role === "EMPLOYEE",
  manageSettings: (role: string | undefined) => ["SUPER_ADMIN", "ESG_MANAGER"].includes(role as BackendRole),
};
