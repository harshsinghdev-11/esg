"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  xp: number;
  level: number;
  points: number;
}

export interface Department {
  id: string;
  name: string;
  head: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface EsgConfig {
  envWeight: number;
  socialWeight: number;
  govWeight: number;
  autoEmission: boolean;
  evidenceReq: boolean;
  autoBadge: boolean;
}

export interface EmissionFactor {
  id: string;
  name: string;
  value: string;
}

export interface SustainabilityGoal {
  id: string;
  department: string;
  target: string;
  progress: string;
}

export interface CarbonTransaction {
  id: string;
  date: string;
  source: string;
  department: string;
  emissions: string;
  status: string;
}

export interface CsrActivity {
  id: string;
  title: string;
  category: string;
  date: string;
  department: string;
  status: "Active" | "Completed" | "Draft" | "Under Review" | "Archived";
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  category: string;
  xp: number;
  points: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  evidenceRequired: boolean;
  deadline: string;
  status: "Draft" | "Active" | "Under Review" | "Completed" | "Archived";
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rule: string;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  stock: number;
  image: string;
}

export interface Redemption {
  id: string;
  date: string;
  rewardTitle: string;
  cost: number;
  status: string;
}

export interface ComplianceIssue {
  id: string;
  title: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  owner: string;
  dueDate: string;
  status: "Open" | "In Progress" | "Resolved" | "Overdue" | "Closed";
}

export interface Audit {
  id: string;
  date: string;
  auditor: string;
  department: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  issuesCount: number;
}

export interface Policy {
  id: string;
  title: string;
  content: string;
  date: string;
  ackRate: string;
}

export interface Submission {
  id: string;
  type: "challenge" | "csr";
  targetId: string;
  targetTitle: string;
  employeeId: string;
  employeeName: string;
  date: string;
  progressPercent?: number;
  proofUrl?: string;
  status: "Pending" | "Approved" | "Rejected";
  xpValue: number;
  pointsValue: number;
}

export interface PolicyAcknowledgement {
  id: string;
  policyId: string;
  policyTitle: string;
  employeeId: string;
  date: string;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

export interface DepartmentRanking {
  rank: number;
  departmentId: string;
  departmentName: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  totalScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  fullName: string;
  departmentName: string;
  totalXp: number;
  totalPointsBalance: number;
}

export interface EsgContextType {
  currentUser: User;
  departments: Department[];
  employees: Employee[];
  categories: { csr: string[]; challenge: string[] };
  esgConfig: EsgConfig;
  emissionFactors: EmissionFactor[];
  sustainabilityGoals: SustainabilityGoal[];
  carbonTransactions: CarbonTransaction[];
  csrActivities: CsrActivity[];
  challenges: Challenge[];
  badges: Badge[];
  rewards: Reward[];
  redemptions: Redemption[];
  complianceIssues: ComplianceIssue[];
  audits: Audit[];
  policies: Policy[];
  submissions: Submission[];
  acknowledgements: PolicyAcknowledgement[];
  unlockedBadges: string[];
  notifications: Notification[];
  leaderboard: LeaderboardEntry[];
  departmentRankings: DepartmentRanking[];
  overview: any;
  environmentalSummary: any;
  socialSummary: any;
  governanceSummary: any;
  gamificationSummary: any;
  loadingData: boolean;
  switchRole: (role: "admin" | "employee") => void;
  createDepartment: (name: string, head: string) => Promise<void>;
  createEmployee: (name: string, email: string, role: string, department: string) => Promise<void>;
  addCategory: (type: "csr" | "challenge", name: string) => Promise<void>;
  updateEsgConfig: (config: Partial<EsgConfig>) => Promise<void>;
  addEmissionFactor: (name: string, value: string) => Promise<void>;
  addSustainabilityGoal: (department: string, target: string) => Promise<void>;
  addCarbonTransaction: (input: {
    departmentId: string;
    emissionFactorId: string;
    quantity: number;
    transactionDate: string;
    sourceType: "PURCHASE" | "MANUFACTURING" | "EXPENSE" | "FLEET" | "MANUAL";
  }) => Promise<void>;
  createCsrActivity: (
    title: string,
    category: string,
    date: string,
    department: string,
    points: number,
  ) => Promise<void>;
  createChallenge: (
    title: string,
    category: string,
    xp: number,
    points: number,
    difficulty: "Easy" | "Medium" | "Hard",
    evidenceRequired: boolean,
    deadline: string,
  ) => Promise<void>;
  activateChallenge: (id: string) => Promise<void>;
  createBadge: (name: string, description: string, icon: string, rule: string) => Promise<void>;
  createReward: (title: string, cost: number, stock: number) => Promise<void>;
  createPolicy: (title: string, content: string) => Promise<void>;
  scheduleAudit: (date: string, auditor: string, department: string) => Promise<void>;
  addComplianceIssue: (input: {
    description: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    ownerEmployeeId: string;
    dueDate: string;
    auditId: string;
  }) => Promise<void>;
  resolveComplianceIssue: (id: string) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  submitChallengeProgress: (challengeId: string, progressPercent: number, proofUrl: string) => Promise<void>;
  joinActivity: (activityId: string) => Promise<void>;
  submitActivityProof: (activityId: string, proofUrl: string) => Promise<void>;
  acknowledgePolicy: (policyId: string) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
  approveSubmission: (submissionId: string) => Promise<void>;
  rejectSubmission: (submissionId: string) => Promise<void>;
  clearNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (text: string, type?: "info" | "success" | "warning") => void;
}

const emptyUser: User = {
  id: "",
  name: "",
  email: "",
  role: "employee",
  xp: 0,
  level: 1,
  points: 0,
};

const emptyConfig: EsgConfig = {
  envWeight: 40,
  socialWeight: 30,
  govWeight: 30,
  autoEmission: true,
  evidenceReq: true,
  autoBadge: true,
};

const EsgContext = createContext<EsgContextType | undefined>(undefined);

function unwrapData<T>(response: any): T {
  const body = response?.data;
  if (body && typeof body === "object" && "data" in body) {
    return body.data as T;
  }

  return body as T;
}

function unwrapList<T>(response: any): T[] {
  const body = response?.data;

  if (Array.isArray(body?.data)) {
    return body.data as T[];
  }

  if (body?.data && Array.isArray(body.data.data)) {
    return body.data.data as T[];
  }

  if (Array.isArray(body)) {
    return body as T[];
  }

  return [];
}

function formatDate(value?: string | Date | null) {
  if (!value) {
    return "N/A";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toISOString().slice(0, 10);
}

function calculateLevel(xp: number) {
  return Math.floor(Math.sqrt(Math.max(xp, 0) / 100)) + 1;
}

function toLegacyRole(role?: string) {
  return role === "EMPLOYEE" ? "employee" : "admin";
}

function titleCase(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function relativeTime(value?: string | Date | null) {
  if (!value) {
    return "Just now";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function notificationTypeFromEvent(eventType?: string): "info" | "success" | "warning" {
  if (!eventType) {
    return "info";
  }

  if (eventType.includes("APPROVAL") || eventType.includes("BADGE_UNLOCKED")) {
    return "success";
  }

  if (eventType.includes("ISSUE") || eventType.includes("REMINDER")) {
    return "warning";
  }

  return "info";
}

function extractErrorMessage(error: any) {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
}

function generateDepartmentCode(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, ""));
  const base = parts.map((part) => part.slice(0, 3).toUpperCase()).join("").slice(0, 8);
  return base || `DEPT${Date.now().toString().slice(-4)}`;
}

function generateEmployeeCode(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4);

  return `${initials || "EMP"}-${Date.now().toString().slice(-4)}`;
}

function normalizeProofUrl(value: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).toString();
  } catch {
    return `https://example.com/proofs/${encodeURIComponent(value.trim())}`;
  }
}

function parseFactorValue(value: string) {
  const match = value.match(/-?\d+(\.\d+)?/);
  const numeric = match ? Number(match[0]) : NaN;
  const unit = value.replace(match?.[0] ?? "", "").trim().replace(/^[^A-Za-z0-9]+/, "");

  return {
    co2ePerUnit: Number.isFinite(numeric) ? numeric : 0,
    unit: unit || "unit",
  };
}

function parseGoalTarget(value: string) {
  const match = value.match(/-?\d+(\.\d+)?/);
  const numeric = match ? Number(match[0]) : NaN;
  const unit = value.replace(match?.[0] ?? "", "").trim().replace(/^max\s+/i, "");

  return {
    targetValue: Number.isFinite(numeric) ? numeric : 0,
    unit: unit || "kg CO2e",
  };
}

function resolveBadgeIcon(name: string, rule: any) {
  const lower = name.toLowerCase();

  if (lower.includes("energy")) return "bolt";
  if (lower.includes("carbon") || lower.includes("forest")) return "forest";
  if (lower.includes("green")) return "eco";
  if (lower.includes("champion") || lower.includes("leader")) return "emoji_events";
  if (rule?.metric === "completed_challenge_count") return "military_tech";
  if (rule?.metric === "total_points_balance") return "stars";
  return "workspace_premium";
}

function buildDepartmentRankings(rows: any[]) {
  const latestByDepartment = new Map<string, any>();

  rows.forEach((row) => {
    const existing = latestByDepartment.get(row.departmentId);
    const rowPeriod = new Date(row.periodEnd ?? row.period_end ?? 0).getTime();
    const existingPeriod = existing ? new Date(existing.periodEnd ?? existing.period_end ?? 0).getTime() : -1;

    if (!existing || rowPeriod >= existingPeriod) {
      latestByDepartment.set(row.departmentId, row);
    }
  });

  return Array.from(latestByDepartment.values())
    .sort((left, right) => Number(right.totalScore) - Number(left.totalScore))
    .map((row, index) => ({
      rank: index + 1,
      departmentId: row.departmentId,
      departmentName: row.department?.name ?? row.departmentName ?? "Unknown Department",
      environmentalScore: Number(row.environmentalScore ?? 0),
      socialScore: Number(row.socialScore ?? 0),
      governanceScore: Number(row.governanceScore ?? 0),
      totalScore: Number(row.totalScore ?? 0),
    }));
}

export const EsgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser: authUser, loading: authLoading, refreshUser } = useAuth();
  const [loadingData, setLoadingData] = useState(false);

  const [rawDepartments, setRawDepartments] = useState<any[]>([]);
  const [rawEmployees, setRawEmployees] = useState<any[]>([]);
  const [rawCsrCategories, setRawCsrCategories] = useState<any[]>([]);
  const [rawChallengeCategories, setRawChallengeCategories] = useState<any[]>([]);
  const [rawConfig, setRawConfig] = useState<any | null>(null);
  const [rawEmissionFactors, setRawEmissionFactors] = useState<any[]>([]);
  const [rawGoals, setRawGoals] = useState<any[]>([]);
  const [rawTransactions, setRawTransactions] = useState<any[]>([]);
  const [rawCsrActivities, setRawCsrActivities] = useState<any[]>([]);
  const [rawParticipations, setRawParticipations] = useState<any[]>([]);
  const [rawChallenges, setRawChallenges] = useState<any[]>([]);
  const [rawChallengeParticipations, setRawChallengeParticipations] = useState<any[]>([]);
  const [rawBadges, setRawBadges] = useState<any[]>([]);
  const [rawEmployeeBadges, setRawEmployeeBadges] = useState<any[]>([]);
  const [rawRewards, setRawRewards] = useState<any[]>([]);
  const [rawRedemptions, setRawRedemptions] = useState<any[]>([]);
  const [rawAudits, setRawAudits] = useState<any[]>([]);
  const [rawComplianceIssues, setRawComplianceIssues] = useState<any[]>([]);
  const [rawPolicies, setRawPolicies] = useState<any[]>([]);
  const [rawNotifications, setRawNotifications] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [environmentalSummary, setEnvironmentalSummary] = useState<any>(null);
  const [socialSummary, setSocialSummary] = useState<any>(null);
  const [governanceSummary, setGovernanceSummary] = useState<any>(null);
  const [gamificationSummary, setGamificationSummary] = useState<any>(null);
  const [rawLeaderboard, setRawLeaderboard] = useState<any[]>([]);
  const [rawDepartmentScores, setRawDepartmentScores] = useState<any[]>([]);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);

  const resetData = useCallback(() => {
    setRawDepartments([]);
    setRawEmployees([]);
    setRawCsrCategories([]);
    setRawChallengeCategories([]);
    setRawConfig(null);
    setRawEmissionFactors([]);
    setRawGoals([]);
    setRawTransactions([]);
    setRawCsrActivities([]);
    setRawParticipations([]);
    setRawChallenges([]);
    setRawChallengeParticipations([]);
    setRawBadges([]);
    setRawEmployeeBadges([]);
    setRawRewards([]);
    setRawRedemptions([]);
    setRawAudits([]);
    setRawComplianceIssues([]);
    setRawPolicies([]);
    setRawNotifications([]);
    setOverview(null);
    setEnvironmentalSummary(null);
    setSocialSummary(null);
    setGovernanceSummary(null);
    setGamificationSummary(null);
    setRawLeaderboard([]);
    setRawDepartmentScores([]);
    setLocalNotifications([]);
    setDismissedNotificationIds([]);
  }, []);

  const loadAll = useCallback(async () => {
    if (!authUser?.employeeId) {
      resetData();
      return;
    }

    setLoadingData(true);

    const requests = await Promise.allSettled([
      api.get("/departments"),
      api.get("/employees"),
      api.get("/categories?type=CSR_ACTIVITY"),
      api.get("/categories?type=CHALLENGE"),
      api.get("/settings/esg-configuration"),
      api.get("/emission-factors"),
      api.get("/environmental-goals"),
      api.get("/carbon-transactions?limit=200"),
      api.get("/csr-activities?limit=200"),
      api.get("/participations?limit=200"),
      api.get("/challenges?limit=200"),
      api.get("/challenge-participations?limit=200"),
      api.get("/badges"),
      api.get(`/employees/${authUser.employeeId}/badges`),
      api.get("/rewards"),
      api.get("/redemptions"),
      api.get("/audits?limit=200"),
      api.get("/compliance-issues?limit=200"),
      api.get("/policies"),
      api.get("/notifications?limit=50"),
      api.get("/dashboard/overview"),
      api.get("/dashboard/environmental"),
      api.get("/dashboard/social"),
      api.get("/dashboard/governance"),
      api.get("/dashboard/gamification"),
      api.get("/leaderboard?limit=50"),
      api.get("/scores/departments?limit=200"),
    ]);

    const [
      departmentsRes,
      employeesRes,
      csrCategoriesRes,
      challengeCategoriesRes,
      configRes,
      emissionFactorsRes,
      goalsRes,
      transactionsRes,
      csrActivitiesRes,
      participationsRes,
      challengesRes,
      challengeParticipationsRes,
      badgesRes,
      employeeBadgesRes,
      rewardsRes,
      redemptionsRes,
      auditsRes,
      complianceIssuesRes,
      policiesRes,
      notificationsRes,
      overviewRes,
      environmentalRes,
      socialRes,
      governanceRes,
      gamificationRes,
      leaderboardRes,
      departmentScoresRes,
    ] = requests;

    if (departmentsRes.status === "fulfilled") setRawDepartments(unwrapList<any>(departmentsRes.value));
    if (employeesRes.status === "fulfilled") setRawEmployees(unwrapList<any>(employeesRes.value));
    if (csrCategoriesRes.status === "fulfilled") setRawCsrCategories(unwrapList<any>(csrCategoriesRes.value));
    if (challengeCategoriesRes.status === "fulfilled") setRawChallengeCategories(unwrapList<any>(challengeCategoriesRes.value));
    if (configRes.status === "fulfilled") setRawConfig(unwrapData<any>(configRes.value));
    if (emissionFactorsRes.status === "fulfilled") setRawEmissionFactors(unwrapList<any>(emissionFactorsRes.value));
    if (goalsRes.status === "fulfilled") setRawGoals(unwrapList<any>(goalsRes.value));
    if (transactionsRes.status === "fulfilled") setRawTransactions(unwrapList<any>(transactionsRes.value));
    if (csrActivitiesRes.status === "fulfilled") setRawCsrActivities(unwrapList<any>(csrActivitiesRes.value));
    if (participationsRes.status === "fulfilled") setRawParticipations(unwrapList<any>(participationsRes.value));
    if (challengesRes.status === "fulfilled") setRawChallenges(unwrapList<any>(challengesRes.value));
    if (challengeParticipationsRes.status === "fulfilled") {
      setRawChallengeParticipations(unwrapList<any>(challengeParticipationsRes.value));
    }
    if (badgesRes.status === "fulfilled") setRawBadges(unwrapList<any>(badgesRes.value));
    if (employeeBadgesRes.status === "fulfilled") setRawEmployeeBadges(unwrapData<any[]>(employeeBadgesRes.value) ?? []);
    if (rewardsRes.status === "fulfilled") setRawRewards(unwrapList<any>(rewardsRes.value));
    if (redemptionsRes.status === "fulfilled") setRawRedemptions(unwrapList<any>(redemptionsRes.value));
    if (auditsRes.status === "fulfilled") setRawAudits(unwrapList<any>(auditsRes.value));
    if (complianceIssuesRes.status === "fulfilled") setRawComplianceIssues(unwrapList<any>(complianceIssuesRes.value));
    if (policiesRes.status === "fulfilled") setRawPolicies(unwrapList<any>(policiesRes.value));
    if (notificationsRes.status === "fulfilled") setRawNotifications(unwrapList<any>(notificationsRes.value));
    if (overviewRes.status === "fulfilled") setOverview(unwrapData<any>(overviewRes.value));
    if (environmentalRes.status === "fulfilled") setEnvironmentalSummary(unwrapData<any>(environmentalRes.value));
    if (socialRes.status === "fulfilled") setSocialSummary(unwrapData<any>(socialRes.value));
    if (governanceRes.status === "fulfilled") setGovernanceSummary(unwrapData<any>(governanceRes.value));
    if (gamificationRes.status === "fulfilled") setGamificationSummary(unwrapData<any>(gamificationRes.value));
    if (leaderboardRes.status === "fulfilled") setRawLeaderboard(unwrapList<any>(leaderboardRes.value));
    if (departmentScoresRes.status === "fulfilled") setRawDepartmentScores(unwrapList<any>(departmentScoresRes.value));

    setLoadingData(false);
  }, [authUser?.employeeId, resetData]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!authUser) {
      resetData();
      return;
    }

    loadAll().catch((error) => {
      console.error("Failed to load ESG data", error);
      setLoadingData(false);
    });
  }, [authLoading, authUser, loadAll, resetData]);

  useEffect(() => {
    setLocalNotifications([]);
    setDismissedNotificationIds([]);
  }, [authUser?.employeeId]);

  const addNotification = useCallback((text: string, type: "info" | "success" | "warning" = "info") => {
    const notification: Notification = {
      id: `local:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      text,
      time: "Just now",
      read: false,
      type,
    };

    setLocalNotifications((current) => [notification, ...current]);
  }, []);

  const withActionHandling = useCallback(
    async (action: () => Promise<void>, successMessage?: string, refreshProfile?: boolean) => {
      try {
        await action();

        if (refreshProfile) {
          await refreshUser().catch((error) => {
            console.error("Failed to refresh current user", error);
          });
        }

        await loadAll();

        if (successMessage) {
          addNotification(successMessage, "success");
        }
      } catch (error) {
        console.error(error);
        addNotification(extractErrorMessage(error), "warning");
      }
    },
    [addNotification, loadAll, refreshUser],
  );

  const currentUser = useMemo<User>(() => {
    if (!authUser) {
      return emptyUser;
    }

    return {
      id: authUser.employeeId,
      name: authUser.fullName,
      email: authUser.email,
      role: toLegacyRole(authUser.role),
      xp: authUser.totalXp ?? 0,
      level: authUser.level ?? calculateLevel(authUser.totalXp ?? 0),
      points: authUser.totalPointsBalance ?? 0,
    };
  }, [authUser]);

  const departments = useMemo<Department[]>(
    () =>
      rawDepartments.map((department) => ({
        id: department.departmentId,
        name: department.name,
        head: department.headEmployee?.fullName ?? "Unassigned",
      })),
    [rawDepartments],
  );

  const employees = useMemo<Employee[]>(
    () =>
      rawEmployees.map((employee) => ({
        id: employee.employeeId,
        name: employee.fullName,
        email: employee.email,
        role: titleCase(employee.role),
        department: employee.department?.name ?? "Unassigned",
      })),
    [rawEmployees],
  );

  const categories = useMemo(
    () => ({
      csr: rawCsrCategories.map((category) => category.name),
      challenge: rawChallengeCategories.map((category) => category.name),
    }),
    [rawChallengeCategories, rawCsrCategories],
  );

  const esgConfig = useMemo<EsgConfig>(
    () =>
      rawConfig
        ? {
            envWeight: Number(rawConfig.environmentalWeightPct ?? 40),
            socialWeight: Number(rawConfig.socialWeightPct ?? 30),
            govWeight: Number(rawConfig.governanceWeightPct ?? 30),
            autoEmission: Boolean(rawConfig.autoEmissionCalculationEnabled),
            evidenceReq: Boolean(rawConfig.evidenceRequiredEnabled),
            autoBadge: Boolean(rawConfig.badgeAutoAwardEnabled),
          }
        : emptyConfig,
    [rawConfig],
  );

  const emissionFactors = useMemo<EmissionFactor[]>(
    () =>
      rawEmissionFactors.map((factor) => ({
        id: factor.emissionFactorId,
        name: factor.name,
        value: `${factor.co2ePerUnit} ${factor.unit}`,
      })),
    [rawEmissionFactors],
  );

  const sustainabilityGoals = useMemo<SustainabilityGoal[]>(
    () =>
      rawGoals.map((goal) => ({
        id: goal.environmentalGoalId,
        department: goal.department?.name ?? "Organization-wide",
        target: `${goal.targetValue} ${goal.unit}`,
        progress: `${goal.currentValue} ${goal.unit}`,
      })),
    [rawGoals],
  );

  const carbonTransactions = useMemo<CarbonTransaction[]>(
    () =>
      rawTransactions.map((transaction) => ({
        id: transaction.carbonTransactionId,
        date: formatDate(transaction.transactionDate),
        source: titleCase(transaction.sourceType),
        department: transaction.department?.name ?? "Unknown",
        emissions: `${transaction.co2eEmitted} kg CO2e`,
        status: transaction.calculationType === "AUTO" ? "Auto-Calculated" : "Manually Logged",
      })),
    [rawTransactions],
  );

  const csrActivities = useMemo<CsrActivity[]>(
    () =>
      rawCsrActivities.map((activity) => ({
        id: activity.csrActivityId,
        title: activity.title,
        category: activity.category?.name ?? "Uncategorized",
        date: formatDate(activity.activityDate),
        department: activity.department?.name ?? "Organization-wide",
        status: titleCase(activity.status) as CsrActivity["status"],
        points: activity.pointsValue ?? 0,
      })),
    [rawCsrActivities],
  );

  const challenges = useMemo<Challenge[]>(
    () =>
      rawChallenges.map((challenge) => ({
        id: challenge.challengeId,
        title: challenge.title,
        category: challenge.category?.name ?? "Uncategorized",
        xp: challenge.xp ?? 0,
        points: 0,
        difficulty: titleCase(challenge.difficulty) as Challenge["difficulty"],
        evidenceRequired: Boolean(challenge.evidenceRequired),
        deadline: formatDate(challenge.deadline),
        status: titleCase(challenge.status) as Challenge["status"],
      })),
    [rawChallenges],
  );

  const badges = useMemo<Badge[]>(
    () =>
      rawBadges.map((badge) => ({
        id: badge.badgeId,
        name: badge.name,
        description: badge.description ?? "Earn this badge through consistent ESG impact.",
        icon: resolveBadgeIcon(badge.name, badge.unlockRule),
        rule: JSON.stringify(badge.unlockRule),
      })),
    [rawBadges],
  );

  const rewards = useMemo<Reward[]>(
    () =>
      rawRewards.map((reward) => ({
        id: reward.rewardId,
        title: reward.name,
        cost: reward.pointsRequired,
        stock: reward.stock,
        image: "",
      })),
    [rawRewards],
  );

  const redemptions = useMemo<Redemption[]>(
    () =>
      rawRedemptions.map((redemption) => ({
        id: redemption.rewardRedemptionId,
        date: formatDate(redemption.redeemedAt),
        rewardTitle: redemption.reward?.name ?? "Reward",
        cost: redemption.pointsSpent,
        status: titleCase(redemption.status),
      })),
    [rawRedemptions],
  );

  const complianceIssues = useMemo<ComplianceIssue[]>(
    () =>
      rawComplianceIssues.map((issue) => ({
        id: issue.complianceIssueId,
        title: issue.description,
        severity: titleCase(issue.severity) as ComplianceIssue["severity"],
        owner: issue.owner?.fullName ?? "Unassigned",
        dueDate: formatDate(issue.dueDate),
        status: titleCase(issue.status) as ComplianceIssue["status"],
      })),
    [rawComplianceIssues],
  );

  const audits = useMemo<Audit[]>(
    () =>
      rawAudits.map((audit) => ({
        id: audit.auditId,
        date: formatDate(audit.scheduledDate ?? audit.completedDate),
        auditor: audit.auditType ?? audit.title ?? "Audit",
        department: audit.department?.name ?? "Organization-wide",
        status: titleCase(audit.status) as Audit["status"],
        issuesCount: audit._count?.complianceIssues ?? 0,
      })),
    [rawAudits],
  );

  const policies = useMemo<Policy[]>(
    () =>
      rawPolicies.map((policy) => ({
        id: policy.esgPolicyId,
        title: policy.title,
        content: policy.description ?? "No policy summary available yet.",
        date: formatDate(policy.effectiveDate),
        ackRate: `${Number(policy.acknowledgementRate ?? 0).toFixed(1)}%`,
      })),
    [rawPolicies],
  );

  const acknowledgements = useMemo<PolicyAcknowledgement[]>(
    () =>
      rawPolicies
        .filter((policy) => policy.acknowledgedByCurrentEmployee && policy.currentEmployeeAcknowledgement)
        .map((policy) => ({
          id: policy.currentEmployeeAcknowledgement.policyAcknowledgementId,
          policyId: policy.esgPolicyId,
          policyTitle: policy.title,
          employeeId: currentUser.id,
          date: formatDate(policy.currentEmployeeAcknowledgement.acknowledgedAt),
        })),
    [currentUser.id, rawPolicies],
  );

  const submissions = useMemo<Submission[]>(() => {
    const csrSubmissions = rawParticipations.map((participation) => ({
      id: participation.employeeParticipationId,
      type: "csr" as const,
      targetId: participation.csrActivityId,
      targetTitle: participation.csrActivity?.title ?? "CSR Activity",
      employeeId: participation.employeeId,
      employeeName: participation.employee?.fullName ?? "Employee",
      date: formatDate(participation.createdAt),
      proofUrl: participation.proofUrl ?? undefined,
      status: titleCase(participation.approvalStatus) as Submission["status"],
      xpValue: 0,
      pointsValue: participation.csrActivity?.pointsValue ?? participation.pointsEarned ?? 0,
    }));

    const challengeSubmissions = rawChallengeParticipations.map((participation) => ({
      id: participation.challengeParticipationId,
      type: "challenge" as const,
      targetId: participation.challengeId,
      targetTitle: participation.challenge?.title ?? "Challenge",
      employeeId: participation.employeeId,
      employeeName: participation.employee?.fullName ?? "Employee",
      date: formatDate(participation.createdAt),
      progressPercent: Number(participation.progressPct ?? 0),
      proofUrl: participation.proofUrl ?? undefined,
      status: titleCase(participation.approvalStatus) as Submission["status"],
      xpValue: participation.challenge?.xp ?? participation.xpAwarded ?? 0,
      pointsValue: 0,
    }));

    return [...challengeSubmissions, ...csrSubmissions].sort((left, right) => right.date.localeCompare(left.date));
  }, [rawChallengeParticipations, rawParticipations]);

  const unlockedBadges = useMemo<string[]>(
    () => rawEmployeeBadges.map((badge) => badge.badgeId ?? badge.badge?.badgeId).filter(Boolean),
    [rawEmployeeBadges],
  );

  const notifications = useMemo<Notification[]>(() => {
    const backendNotifications = rawNotifications
      .filter((notification) => !dismissedNotificationIds.includes(notification.notificationId))
      .map((notification) => ({
        id: notification.notificationId,
        text: notification.message ?? notification.title,
        time: relativeTime(notification.sentAt),
        read: Boolean(notification.isRead),
        type: notificationTypeFromEvent(notification.eventType),
      }));

    return [...localNotifications, ...backendNotifications];
  }, [dismissedNotificationIds, localNotifications, rawNotifications]);

  const leaderboard = useMemo<LeaderboardEntry[]>(
    () =>
      rawLeaderboard.map((employee, index) => ({
        rank: index + 1,
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        departmentName: employee.department?.name ?? "Unassigned",
        totalXp: employee.totalXp ?? 0,
        totalPointsBalance: employee.totalPointsBalance ?? 0,
      })),
    [rawLeaderboard],
  );

  const departmentRankings = useMemo<DepartmentRanking[]>(
    () => buildDepartmentRankings(rawDepartmentScores),
    [rawDepartmentScores],
  );

  const switchRole = useCallback(() => {
    addNotification("Role switching is now driven by your real backend account.", "info");
  }, [addNotification]);

  const createDepartment = useCallback(
    async (name: string, head: string) => {
      await withActionHandling(async () => {
        await api.post("/departments", {
          name,
          code: generateDepartmentCode(name),
          headEmployeeId: head || undefined,
        });
      }, `Department '${name}' created.`);
    },
    [withActionHandling],
  );

  const createEmployee = useCallback(
    async (name: string, email: string, role: string, department: string) => {
      await withActionHandling(async () => {
        await api.post("/employees", {
          employeeCode: generateEmployeeCode(name),
          fullName: name,
          email,
          role,
          departmentId: department || undefined,
        });
      }, `Employee '${name}' added.`);
    },
    [withActionHandling],
  );

  const addCategory = useCallback(
    async (type: "csr" | "challenge", name: string) => {
      await withActionHandling(async () => {
        await api.post("/categories", {
          type: type === "csr" ? "CSR_ACTIVITY" : "CHALLENGE",
          name,
          description: name,
        });
      }, `Category '${name}' created.`);
    },
    [withActionHandling],
  );

  const updateEsgConfig = useCallback(
    async (config: Partial<EsgConfig>) => {
      await withActionHandling(async () => {
        await api.patch("/settings/esg-configuration", {
          ...(config.envWeight !== undefined ? { environmentalWeightPct: config.envWeight } : {}),
          ...(config.socialWeight !== undefined ? { socialWeightPct: config.socialWeight } : {}),
          ...(config.govWeight !== undefined ? { governanceWeightPct: config.govWeight } : {}),
          ...(config.autoEmission !== undefined ? { autoEmissionCalculationEnabled: config.autoEmission } : {}),
          ...(config.evidenceReq !== undefined ? { evidenceRequiredEnabled: config.evidenceReq } : {}),
          ...(config.autoBadge !== undefined ? { badgeAutoAwardEnabled: config.autoBadge } : {}),
        });
      }, "ESG configuration updated.");
    },
    [withActionHandling],
  );

  const addEmissionFactor = useCallback(
    async (name: string, value: string) => {
      const parsed = parseFactorValue(value);
      await withActionHandling(async () => {
        await api.post("/emission-factors", {
          name,
          unit: parsed.unit,
          co2ePerUnit: parsed.co2ePerUnit,
          source: "Frontend entry",
          validFrom: new Date().toISOString().slice(0, 10),
        });
      }, `Emission factor '${name}' added.`);
    },
    [withActionHandling],
  );

  const addSustainabilityGoal = useCallback(
    async (department: string, target: string) => {
      const departmentRecord = rawDepartments.find((entry) => entry.name === department);
      const parsed = parseGoalTarget(target);
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + 30);

      await withActionHandling(async () => {
        await api.post("/environmental-goals", {
          departmentId: departmentRecord?.departmentId ?? undefined,
          title: `${department} emissions goal`,
          metric: "co2e_emissions",
          targetValue: parsed.targetValue,
          unit: parsed.unit,
          startDate: today.toISOString().slice(0, 10),
          targetDate: targetDate.toISOString().slice(0, 10),
        });
      }, `Goal created for ${department}.`);
    },
    [rawDepartments, withActionHandling],
  );

  const addCarbonTransaction = useCallback(
    async (input: {
      departmentId: string;
      emissionFactorId: string;
      quantity: number;
      transactionDate: string;
      sourceType: "PURCHASE" | "MANUFACTURING" | "EXPENSE" | "FLEET" | "MANUAL";
    }) => {
      await withActionHandling(async () => {
        await api.post("/carbon-transactions", input);
      }, "Carbon transaction logged.");
    },
    [withActionHandling],
  );

  const createCsrActivity = useCallback(
    async (title: string, category: string, date: string, department: string, points: number) => {
      const categoryRecord = rawCsrCategories.find((entry) => entry.name === category);
      const departmentRecord = rawDepartments.find((entry) => entry.name === department);

      await withActionHandling(async () => {
        const created = await api.post("/csr-activities", {
          categoryId: categoryRecord?.categoryId,
          departmentId: departmentRecord?.departmentId ?? null,
          title,
          activityDate: date,
          pointsValue: points,
          evidenceRequired: esgConfig.evidenceReq,
        });

        const activity = unwrapData<any>(created);
        await api.patch(`/csr-activities/${activity.csrActivityId}`, {
          status: "ACTIVE",
        });
      }, `CSR activity '${title}' scheduled.`);
    },
    [esgConfig.evidenceReq, rawCsrCategories, rawDepartments, withActionHandling],
  );

  const createChallenge = useCallback(
    async (
      title: string,
      category: string,
      xp: number,
      _points: number,
      difficulty: "Easy" | "Medium" | "Hard",
      evidenceRequired: boolean,
      deadline: string,
    ) => {
      const categoryRecord = rawChallengeCategories.find((entry) => entry.name === category);

      await withActionHandling(async () => {
        await api.post("/challenges", {
          categoryId: categoryRecord?.categoryId,
          title,
          xp,
          difficulty: difficulty.toUpperCase(),
          evidenceRequired,
          deadline,
        });
      }, `Challenge '${title}' created.`);
    },
    [rawChallengeCategories, withActionHandling],
  );

  const activateChallenge = useCallback(
    async (id: string) => {
      await withActionHandling(async () => {
        await api.patch(`/challenges/${id}/status`, { status: "ACTIVE" });
      }, "Challenge activated.");
    },
    [withActionHandling],
  );

  const createBadge = useCallback(
    async (name: string, description: string, _icon: string, _rule: string) => {
      await withActionHandling(async () => {
        await api.post("/badges", {
          name,
          description,
          unlockRule: {
            metric: "total_xp",
            operator: ">=",
            value: 100,
          },
        });
      }, `Badge '${name}' created.`);
    },
    [withActionHandling],
  );

  const createReward = useCallback(
    async (title: string, cost: number, stock: number) => {
      await withActionHandling(async () => {
        await api.post("/rewards", {
          name: title,
          pointsRequired: cost,
          stock,
        });
      }, `Reward '${title}' published.`);
    },
    [withActionHandling],
  );

  const createPolicy = useCallback(
    async (title: string, content: string) => {
      await withActionHandling(async () => {
        await api.post("/policies", {
          title,
          description: content,
          effectiveDate: new Date().toISOString().slice(0, 10),
        });
      }, `Policy '${title}' published.`);
    },
    [withActionHandling],
  );

  const scheduleAudit = useCallback(
    async (date: string, auditor: string, department: string) => {
      const departmentRecord = rawDepartments.find((entry) => entry.name === department);
      await withActionHandling(async () => {
        await api.post("/audits", {
          title: `${department} ESG Audit`,
          auditType: auditor,
          departmentId: departmentRecord?.departmentId ?? null,
          scheduledDate: date,
        });
      }, "Audit scheduled.");
    },
    [rawDepartments, withActionHandling],
  );

  const addComplianceIssue = useCallback(
    async (input: {
      description: string;
      severity: "Low" | "Medium" | "High" | "Critical";
      ownerEmployeeId: string;
      dueDate: string;
      auditId: string;
    }) => {
      await withActionHandling(async () => {
        await api.post("/compliance-issues", {
          auditId: input.auditId,
          description: input.description,
          severity: input.severity.toUpperCase(),
          ownerEmployeeId: input.ownerEmployeeId,
          dueDate: input.dueDate,
        });
      }, "Compliance issue created.");
    },
    [withActionHandling],
  );

  const resolveComplianceIssue = useCallback(
    async (id: string) => {
      await withActionHandling(async () => {
        await api.patch(`/compliance-issues/${id}`, {
          status: "RESOLVED",
        });
      }, "Compliance issue resolved.");
    },
    [withActionHandling],
  );

  const joinChallenge = useCallback(
    async (challengeId: string) => {
      await withActionHandling(async () => {
        await api.post(`/challenges/${challengeId}/join`, {});
      }, "Challenge joined.");
    },
    [withActionHandling],
  );

  const submitChallengeProgress = useCallback(
    async (challengeId: string, progressPercent: number, proofUrl: string) => {
      const participation = rawChallengeParticipations.find((entry) => entry.challengeId === challengeId);

      if (!participation) {
        addNotification("Join the challenge before submitting progress.", "warning");
        return;
      }

      await withActionHandling(async () => {
        await api.patch(`/challenge-participations/${participation.challengeParticipationId}/progress`, {
          progressPct: progressPercent,
          proofUrl: normalizeProofUrl(proofUrl),
        });
      }, "Challenge progress submitted.");
    },
    [addNotification, rawChallengeParticipations, withActionHandling],
  );

  const joinActivity = useCallback(
    async (activityId: string) => {
      await withActionHandling(async () => {
        await api.post(`/csr-activities/${activityId}/participate`, {});
      }, "CSR activity joined.");
    },
    [withActionHandling],
  );

  const submitActivityProof = useCallback(
    async (activityId: string, proofUrl: string) => {
      const participation = rawParticipations.find((entry) => entry.csrActivityId === activityId);

      if (!participation) {
        addNotification("Join the activity before uploading proof.", "warning");
        return;
      }

      await withActionHandling(async () => {
        await api.patch(`/participations/${participation.employeeParticipationId}/proof`, {
          proofUrl: normalizeProofUrl(proofUrl),
        });
      }, "CSR proof uploaded.");
    },
    [addNotification, rawParticipations, withActionHandling],
  );

  const acknowledgePolicy = useCallback(
    async (policyId: string) => {
      await withActionHandling(
        async () => {
          await api.post(`/policies/${policyId}/acknowledge`);
        },
        "Policy acknowledged.",
        true,
      );
    },
    [withActionHandling],
  );

  const redeemReward = useCallback(
    async (rewardId: string) => {
      await withActionHandling(
        async () => {
          await api.post(`/rewards/${rewardId}/redeem`);
        },
        "Reward redeemed.",
        true,
      );
    },
    [withActionHandling],
  );

  const approveSubmission = useCallback(
    async (submissionId: string) => {
      const submission = submissions.find((entry) => entry.id === submissionId);

      if (!submission) {
        addNotification("Submission not found.", "warning");
        return;
      }

      const path =
        submission.type === "challenge"
          ? `/challenge-participations/${submissionId}/approve`
          : `/participations/${submissionId}/approve`;

      await withActionHandling(async () => {
        await api.patch(path);
      }, "Submission approved.");
    },
    [addNotification, submissions, withActionHandling],
  );

  const rejectSubmission = useCallback(
    async (submissionId: string) => {
      const submission = submissions.find((entry) => entry.id === submissionId);

      if (!submission) {
        addNotification("Submission not found.", "warning");
        return;
      }

      const path =
        submission.type === "challenge"
          ? `/challenge-participations/${submissionId}/reject`
          : `/participations/${submissionId}/reject`;

      await withActionHandling(async () => {
        await api.patch(path);
      }, "Submission rejected.");
    },
    [addNotification, submissions, withActionHandling],
  );

  const clearNotification = useCallback(
    async (notificationId: string) => {
      if (notificationId.startsWith("local:")) {
        setLocalNotifications((current) => current.filter((notification) => notification.id !== notificationId));
        return;
      }

      setDismissedNotificationIds((current) =>
        current.includes(notificationId) ? current : [...current, notificationId],
      );

      try {
        await api.patch(`/notifications/${notificationId}/read`);
      } catch (error) {
        console.error(error);
      }
    },
    [],
  );

  const clearAllNotifications = useCallback(async () => {
    setLocalNotifications([]);
    setDismissedNotificationIds(rawNotifications.map((notification) => notification.notificationId));

    try {
      await api.patch("/notifications/read-all");
    } catch (error) {
      console.error(error);
    }
  }, [rawNotifications]);

  return (
    <EsgContext.Provider
      value={{
        currentUser,
        departments,
        employees,
        categories,
        esgConfig,
        emissionFactors,
        sustainabilityGoals,
        carbonTransactions,
        csrActivities,
        challenges,
        badges,
        rewards,
        redemptions,
        complianceIssues,
        audits,
        policies,
        submissions,
        acknowledgements,
        unlockedBadges,
        notifications,
        leaderboard,
        departmentRankings,
        overview,
        environmentalSummary,
        socialSummary,
        governanceSummary,
        gamificationSummary,
        loadingData,
        switchRole,
        createDepartment,
        createEmployee,
        addCategory,
        updateEsgConfig,
        addEmissionFactor,
        addSustainabilityGoal,
        addCarbonTransaction,
        createCsrActivity,
        createChallenge,
        activateChallenge,
        createBadge,
        createReward,
        createPolicy,
        scheduleAudit,
        addComplianceIssue,
        resolveComplianceIssue,
        joinChallenge,
        submitChallengeProgress,
        joinActivity,
        submitActivityProof,
        acknowledgePolicy,
        redeemReward,
        approveSubmission,
        rejectSubmission,
        clearNotification,
        clearAllNotifications,
        addNotification,
      }}
    >
      {children}
    </EsgContext.Provider>
  );
};

export const useEsg = () => {
  const context = useContext(EsgContext);
  if (context === undefined) {
    throw new Error("useEsg must be used within an EsgProvider");
  }
  return context;
};
