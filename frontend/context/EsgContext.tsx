"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
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
  status: "Active" | "Completed";
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  category: string;
  xp: number;
  points: number;
  difficulty: "Easy" | "Medium" | "Hard";
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
  status: "Open" | "Resolved";
}

export interface Audit {
  id: string;
  date: string;
  auditor: string;
  department: string;
  status: "Scheduled" | "Completed";
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
  unlockedBadges: string[]; // Badge IDs
  notifications: Notification[];
  
  // State Mutators
  switchRole: (role: "admin" | "employee") => void;
  createDepartment: (name: string, head: string) => void;
  createEmployee: (name: string, email: string, role: string, department: string) => void;
  addCategory: (type: "csr" | "challenge", name: string) => void;
  updateEsgConfig: (config: Partial<EsgConfig>) => void;
  addEmissionFactor: (name: string, value: string) => void;
  addSustainabilityGoal: (department: string, target: string) => void;
  addCarbonTransaction: (source: string, department: string, emissions: string) => void;
  createCsrActivity: (title: string, category: string, date: string, department: string, points: number) => void;
  createChallenge: (title: string, category: string, xp: number, points: number, difficulty: "Easy" | "Medium" | "Hard", evidenceRequired: boolean, deadline: string) => void;
  activateChallenge: (id: string) => void;
  createBadge: (name: string, description: string, icon: string, rule: string) => void;
  createReward: (title: string, cost: number, stock: number) => void;
  createPolicy: (title: string, content: string) => void;
  scheduleAudit: (date: string, auditor: string, department: string) => void;
  addComplianceIssue: (title: string, severity: "Low" | "Medium" | "High" | "Critical", owner: string, dueDate: string) => void;
  resolveComplianceIssue: (id: string) => void;
  
  // Employee Actions
  joinChallenge: (challengeId: string) => void;
  submitChallengeProgress: (challengeId: string, progressPercent: number, proofUrl: string) => void;
  joinActivity: (activityId: string) => void;
  submitActivityProof: (activityId: string, proofUrl: string) => void;
  acknowledgePolicy: (policyId: string) => void;
  redeemReward: (rewardId: string) => void;
  
  // Admin Actions
  approveSubmission: (submissionId: string) => void;
  rejectSubmission: (submissionId: string) => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  addNotification: (text: string, type?: "info" | "success" | "warning") => void;
}

// Initial Data Mock
const defaultUser: User = {
  id: "emp_1",
  name: "Alex Rivera",
  email: "employee@company.com",
  role: "employee",
  xp: 850,
  level: 12,
  points: 2450,
};

const adminUser: User = {
  id: "adm_1",
  name: "Sarah Chen",
  email: "admin@company.com",
  role: "admin",
  xp: 5000,
  level: 50,
  points: 9999,
};

const EsgContext = createContext<EsgContextType | undefined>(undefined);

export const EsgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [categories, setCategories] = useState<{ csr: string[]; challenge: string[] }>({ csr: [], challenge: [] });
  const [esgConfig, setEsgConfig] = useState<EsgConfig>({
    envWeight: 40,
    socialWeight: 30,
    govWeight: 30,
    autoEmission: true,
    evidenceReq: true,
    autoBadge: true,
  });
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
  const [sustainabilityGoals, setSustainabilityGoals] = useState<SustainabilityGoal[]>([]);
  const [carbonTransactions, setCarbonTransactions] = useState<CarbonTransaction[]>([]);
  const [csrActivities, setCsrActivities] = useState<CsrActivity[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [acknowledgements, setAcknowledgements] = useState<PolicyAcknowledgement[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load from local storage or set defaults
  useEffect(() => {
    const local = localStorage.getItem("ecosphere_state");
    if (local) {
      try {
        const data = JSON.parse(local);
        setCurrentUser(data.currentUser || defaultUser);
        setDepartments(data.departments || []);
        setEmployees(data.employees || []);
        setCategories(data.categories || { csr: [], challenge: [] });
        setEsgConfig(data.esgConfig || {
          envWeight: 40,
          socialWeight: 30,
          govWeight: 30,
          autoEmission: true,
          evidenceReq: true,
          autoBadge: true,
        });
        setEmissionFactors(data.emissionFactors || []);
        setSustainabilityGoals(data.sustainabilityGoals || []);
        setCarbonTransactions(data.carbonTransactions || []);
        setCsrActivities(data.csrActivities || []);
        setChallenges(data.challenges || []);
        setBadges(data.badges || []);
        setRewards(data.rewards || []);
        setRedemptions(data.redemptions || []);
        setComplianceIssues(data.complianceIssues || []);
        setAudits(data.audits || []);
        setPolicies(data.policies || []);
        setSubmissions(data.submissions || []);
        setAcknowledgements(data.acknowledgements || []);
        setUnlockedBadges(data.unlockedBadges || []);
        setNotifications(data.notifications || []);
        return;
      } catch (e) {
        console.error("Error loading local storage state, using defaults", e);
      }
    }

    // Default Seed Data
    setDepartments([
      { id: "dept_1", name: "Operations", head: "John Doe" },
      { id: "dept_2", name: "HR", head: "Jane Smith" },
      { id: "dept_3", name: "Manufacturing", head: "Robert Lee" },
    ]);
    setEmployees([
      { id: "emp_1", name: "Alex Rivera", email: "employee@company.com", role: "Operations Lead", department: "Operations" },
      { id: "emp_2", name: "Sarah Chen", email: "admin@company.com", role: "Chief Sustainability Officer", department: "Executive" },
      { id: "emp_3", name: "John Doe", email: "john@company.com", role: "Head of Operations", department: "Operations" },
      { id: "emp_4", name: "Jane Smith", email: "jane@company.com", role: "Head of HR", department: "HR" },
      { id: "emp_5", name: "Robert Lee", email: "robert@company.com", role: "Head of Manufacturing", department: "Manufacturing" },
    ]);
    setCategories({
      csr: ["Tree Plantation", "Blood Donation", "Local Community Support", "E-Waste Recycling"],
      challenge: ["Energy Saving", "Waste Reduction", "Green Travel", "Sustainable Printing"],
    });
    setEmissionFactors([
      { id: "ef_1", name: "Diesel", value: "2.68 kg CO2/litre" },
      { id: "ef_2", name: "Electricity", value: "0.82 kg CO2/kWh" },
      { id: "ef_3", name: "Flights", value: "0.15 kg CO2/passenger-km" },
    ]);
    setSustainabilityGoals([
      { id: "sg_1", department: "Operations", target: "500kg CO2/month", progress: "420kg CO2" },
      { id: "sg_2", department: "Manufacturing", target: "2000kg CO2/month", progress: "1850kg CO2" },
      { id: "sg_3", department: "HR", target: "100kg CO2/month", progress: "85kg CO2" },
    ]);
    setCarbonTransactions([
      { id: "ctx_1", date: "2026-07-10", source: "Office Electricity", department: "Operations", emissions: "320 kg CO2", status: "Auto-Calculated" },
      { id: "ctx_2", date: "2026-07-09", source: "Diesel generator run", department: "Manufacturing", emissions: "670 kg CO2", status: "Manually Logged" },
      { id: "ctx_3", date: "2026-07-08", source: "Business travel (flight)", department: "HR", emissions: "180 kg CO2", status: "Auto-Calculated" },
    ]);
    setCsrActivities([
      { id: "csr_1", title: "Annual Reforestation Drive", category: "Tree Plantation", date: "2026-07-20", department: "Operations", status: "Active", points: 150 },
      { id: "csr_2", title: "Blood Donation Camp", category: "Blood Donation", date: "2026-07-05", department: "HR", status: "Completed", points: 100 },
      { id: "csr_3", title: "Neighborhood Cleanup", category: "Local Community Support", date: "2026-06-25", department: "Manufacturing", status: "Completed", points: 100 },
    ]);
    setChallenges([
      { id: "ch_1", title: "Energy Saver Challenge", category: "Energy Saving", xp: 100, points: 100, difficulty: "Medium", evidenceRequired: true, deadline: "2026-07-30", status: "Active" },
      { id: "ch_2", title: "Zero Waste Week", category: "Waste Reduction", xp: 150, points: 150, difficulty: "Hard", evidenceRequired: true, deadline: "2026-07-25", status: "Active" },
      { id: "ch_3", title: "Carpooling Hero", category: "Green Travel", xp: 50, points: 50, difficulty: "Easy", evidenceRequired: false, deadline: "2026-07-15", status: "Active" },
      { id: "ch_4", title: "Draft: Solar Installation Check", category: "Energy Saving", xp: 200, points: 200, difficulty: "Hard", evidenceRequired: true, deadline: "2026-08-10", status: "Draft" },
    ]);
    setBadges([
      { id: "bd_1", name: "Green Pioneer", description: "Unlock by acknowledging your first ESG Policy.", icon: "eco", rule: "policy_ack" },
      { id: "bd_2", name: "Energy Saver", description: "Unlock by completing the Energy Saver challenge.", icon: "bolt", rule: "challenge_ch_1" },
      { id: "bd_3", name: "Carbon Buster", description: "Unlock by participating in a tree plantation activity.", icon: "forest", rule: "csr_tree" },
      { id: "bd_4", name: "Sustainability Champion", description: "Unlock by completing 5 challenges.", icon: "trophy", rule: "challenges_count_5" },
    ]);
    setRewards([
      { id: "rw_1", title: "Reusable Bamboo Water Bottle", cost: 150, stock: 20, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjA7hJYutd78x0_wXlDWRkso6hhkrRC2L1aqyF8PK8X2xUHt4d9BSEaRjic3Lm8I_-ajf7vmHnO-T7PZ-PC68g8tAfU5zyeY-wG7zbzopWCXt8yRIWQj0OMyCyMMyZxHK7QNGvd0wyhl1TB3gp2soKga1-Fd5i-q1BjU_f6kczzxFi4_qRmPNYnNGbykwlF5mhWfWmsfgzoH5dAhl_NaDmvsnNrVumHYiuxDBhZq2p2rJHQpO33VH_hLYt_DmFWJu9AbVhwAxa1g" },
      { id: "rw_2", title: "Solar Powered Powerbank", cost: 500, stock: 5, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjA7hJYutd78x0_wXlDWRkso6hhkrRC2L1aqyF8PK8X2xUHt4d9BSEaRjic3Lm8I_-ajf7vmHnO-T7PZ-PC68g8tAfU5zyeY-wG7zbzopWCXt8yRIWQj0OMyCyMMyZxHK7QNGvd0wyhl1TB3gp2soKga1-Fd5i-q1BjU_f6kczzxFi4_qRmPNYnNGbykwlF5mhWfWmsfgzoH5dAhl_NaDmvsnNrVumHYiuxDBhZq2p2rJHQpO33VH_hLYt_DmFWJu9AbVhwAxa1g" },
      { id: "rw_3", title: "1 Month Public Transit Pass", cost: 800, stock: 15, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjA7hJYutd78x0_wXlDWRkso6hhkrRC2L1aqyF8PK8X2xUHt4d9BSEaRjic3Lm8I_-ajf7vmHnO-T7PZ-PC68g8tAfU5zyeY-wG7zbzopWCXt8yRIWQj0OMyCyMMyZxHK7QNGvd0wyhl1TB3gp2soKga1-Fd5i-q1BjU_f6kczzxFi4_qRmPNYnNGbykwlF5mhWfWmsfgzoH5dAhl_NaDmvsnNrVumHYiuxDBhZq2p2rJHQpO33VH_hLYt_DmFWJu9AbVhwAxa1g" },
    ]);
    setRedemptions([
      { id: "rd_1", date: "2026-07-01", rewardTitle: "Reusable Bamboo Water Bottle", cost: 150, status: "Fulfilled" },
    ]);
    setComplianceIssues([
      { id: "ci_1", title: "Improper waste sorting in pantry", severity: "Medium", owner: "John Doe", dueDate: "2026-07-20", status: "Open" },
      { id: "ci_2", title: "Diesel generator lack of servicing certificates", severity: "Critical", owner: "Robert Lee", dueDate: "2026-07-15", status: "Open" },
    ]);
    setAudits([
      { id: "au_1", date: "2026-07-05", auditor: "Internal Auditor", department: "Manufacturing", status: "Completed", issuesCount: 1 },
      { id: "au_2", date: "2026-07-11", auditor: "External Agency", department: "Operations", status: "Completed", issuesCount: 1 },
      { id: "au_3", date: "2026-07-25", auditor: "Jane Smith", department: "HR", status: "Scheduled", issuesCount: 0 },
    ]);
    setPolicies([
      { id: "pol_1", title: "Green Travel Policy", content: "This policy outlines recommendations for public transport and carpooling...", date: "2026-07-01", ackRate: "80%" },
      { id: "pol_2", title: "Single-Use Plastics Ban", content: "Under this policy, single-use plastics are forbidden in all company office spaces...", date: "2026-07-02", ackRate: "95%" },
      { id: "pol_3", title: "Energy Conservation Directives", content: "Ensure all workstations and lights are switched off at the end of business hours...", date: "2026-07-12", ackRate: "0%" },
    ]);
    setUnlockedBadges([]);
    setNotifications([
      { id: "not_1", text: "New policy 'Energy Conservation Directives' requires acknowledgement.", time: "10 mins ago", read: false, type: "warning" },
    ]);
  }, []);

  // Save changes to local storage whenever state changes
  useEffect(() => {
    if (currentUser.id === "emp_1" || currentUser.id === "adm_1") {
      const state = {
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
      };
      localStorage.setItem("ecosphere_state", JSON.stringify(state));
    }
  }, [
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
  ]);

  // Notifications handler
  const addNotification = (text: string, type: "info" | "success" | "warning" = "info") => {
    const newNotif: Notification = {
      id: "not_" + Date.now(),
      text,
      time: "Just now",
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Switch role action (Admin vs Employee)
  const switchRole = (role: "admin" | "employee") => {
    if (role === "admin") {
      setCurrentUser((prev) => ({ ...adminUser, points: prev.role === "admin" ? prev.points : 9999 }));
    } else {
      setCurrentUser((prev) => ({ ...defaultUser, xp: prev.role === "employee" ? prev.xp : 850, points: prev.role === "employee" ? prev.points : 2450 }));
    }
  };

  // State Mutators
  const createDepartment = (name: string, head: string) => {
    setDepartments((prev) => [...prev, { id: "dept_" + Date.now(), name, head }]);
    addNotification(`Department '${name}' created successfully.`, "success");
  };

  const createEmployee = (name: string, email: string, role: string, department: string) => {
    setEmployees((prev) => [...prev, { id: "emp_" + Date.now(), name, email, role, department }]);
    addNotification(`Employee '${name}' added to department '${department}'.`, "success");
  };

  const addCategory = (type: "csr" | "challenge", name: string) => {
    setCategories((prev) => {
      const updated = { ...prev };
      if (!updated[type].includes(name)) {
        updated[type] = [...updated[type], name];
      }
      return updated;
    });
    addNotification(`Added Category: ${name} to ${type.toUpperCase()}`, "success");
  };

  const updateEsgConfig = (config: Partial<EsgConfig>) => {
    setEsgConfig((prev) => ({ ...prev, ...config }));
    addNotification("ESG configurations updated successfully.", "success");
  };

  const addEmissionFactor = (name: string, value: string) => {
    setEmissionFactors((prev) => [...prev, { id: "ef_" + Date.now(), name, value }]);
    addNotification(`Emission factor added: ${name}`, "success");
  };

  const addSustainabilityGoal = (department: string, target: string) => {
    setSustainabilityGoals((prev) => [
      ...prev,
      { id: "sg_" + Date.now(), department, target, progress: "0 kg CO2" },
    ]);
    addNotification(`Sustainability Goal set for ${department}.`, "success");
  };

  const addCarbonTransaction = (source: string, department: string, emissions: string) => {
    setCarbonTransactions((prev) => [
      { id: "ctx_" + Date.now(), date: new Date().toISOString().split("T")[0], source, department, emissions, status: "Manually Logged" },
      ...prev,
    ]);
    addNotification(`Carbon transaction logged: ${source} (${emissions})`, "success");
  };

  const createCsrActivity = (title: string, category: string, date: string, department: string, points: number) => {
    setCsrActivities((prev) => [
      ...prev,
      { id: "csr_" + Date.now(), title, category, date, department, status: "Active", points },
    ]);
    addNotification(`New CSR Activity '${title}' scheduled for ${date}.`, "success");
  };

  const createChallenge = (title: string, category: string, xp: number, points: number, difficulty: "Easy" | "Medium" | "Hard", evidenceRequired: boolean, deadline: string) => {
    setChallenges((prev) => [
      ...prev,
      { id: "ch_" + Date.now(), title, category, xp, points, difficulty, evidenceRequired, deadline, status: "Draft" },
    ]);
    addNotification(`Challenge draft '${title}' created.`, "info");
  };

  const activateChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Active" as const } : c))
    );
    const ch = challenges.find((c) => c.id === id);
    addNotification(`Challenge '${ch?.title || ""}' is now Active for employees.`, "success");
  };

  const createBadge = (name: string, description: string, icon: string, rule: string) => {
    setBadges((prev) => [...prev, { id: "bd_" + Date.now(), name, description, icon, rule }]);
    addNotification(`New Badge created: ${name}`, "success");
  };

  const createReward = (title: string, cost: number, stock: number) => {
    setRewards((prev) => [
      ...prev,
      { id: "rw_" + Date.now(), title, cost, stock, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjA7hJYutd78x0_wXlDWRkso6hhkrRC2L1aqyF8PK8X2xUHt4d9BSEaRjic3Lm8I_-ajf7vmHnO-T7PZ-PC68g8tAfU5zyeY-wG7zbzopWCXt8yRIWQj0OMyCyMMyZxHK7QNGvd0wyhl1TB3gp2soKga1-Fd5i-q1BjU_f6kczzxFi4_qRmPNYnNGbykwlF5mhWfWmsfgzoH5dAhl_NaDmvsnNrVumHYiuxDBhZq2p2rJHQpO33VH_hLYt_DmFWJu9AbVhwAxa1g" },
    ]);
    addNotification(`New Reward added: ${title}`, "success");
  };

  const createPolicy = (title: string, content: string) => {
    setPolicies((prev) => [
      ...prev,
      { id: "pol_" + Date.now(), title, content, date: new Date().toISOString().split("T")[0], ackRate: "0%" },
    ]);
    addNotification(`New ESG Policy published: '${title}'`, "warning");
  };

  const scheduleAudit = (date: string, auditor: string, department: string) => {
    setAudits((prev) => [
      ...prev,
      { id: "au_" + Date.now(), date, auditor, department, status: "Scheduled", issuesCount: 0 },
    ]);
    addNotification(`ESG Audit scheduled for ${department} department.`, "success");
  };

  const addComplianceIssue = (title: string, severity: "Low" | "Medium" | "High" | "Critical", owner: string, dueDate: string) => {
    setComplianceIssues((prev) => [
      ...prev,
      { id: "ci_" + Date.now(), title, severity, owner, dueDate, status: "Open" },
    ]);
    addNotification(`Compliance Issue flagged: ${title}`, "warning");
  };

  const resolveComplianceIssue = (id: string) => {
    setComplianceIssues((prev) =>
      prev.map((ci) => (ci.id === id ? { ...ci, status: "Resolved" as const } : ci))
    );
    addNotification("Compliance issue marked as Resolved.", "success");
  };

  // Employee Actions
  const joinChallenge = (challengeId: string) => {
    const ch = challenges.find((c) => c.id === challengeId);
    if (!ch) return;

    setSubmissions((prev) => {
      // Check if already joined/submitted
      const exists = prev.find((s) => s.employeeId === currentUser.id && s.targetId === challengeId && s.type === "challenge");
      if (exists) return prev;

      return [
        ...prev,
        {
          id: "sub_" + Date.now(),
          type: "challenge",
          targetId: challengeId,
          targetTitle: ch.title,
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          date: new Date().toISOString().split("T")[0],
          progressPercent: 0,
          status: "Pending", // Draft representation until progress submitted
          xpValue: ch.xp,
          pointsValue: ch.points,
        },
      ];
    });
    addNotification(`You joined the challenge: ${ch.title}`, "success");
  };

  const submitChallengeProgress = (challengeId: string, progressPercent: number, proofUrl: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.employeeId === currentUser.id && s.targetId === challengeId && s.type === "challenge") {
          return {
            ...s,
            progressPercent,
            proofUrl,
            status: "Pending" as const, // Put into the queue for admin approval
            date: new Date().toISOString().split("T")[0],
          };
        }
        return s;
      })
    );
    const ch = challenges.find((c) => c.id === challengeId);
    addNotification(`Submitted progress proof for ${ch?.title || "challenge"}. Pending admin review.`, "info");
  };

  const joinActivity = (activityId: string) => {
    const act = csrActivities.find((a) => a.id === activityId);
    if (!act) return;

    setSubmissions((prev) => {
      const exists = prev.find((s) => s.employeeId === currentUser.id && s.targetId === activityId && s.type === "csr");
      if (exists) return prev;

      return [
        ...prev,
        {
          id: "sub_" + Date.now(),
          type: "csr",
          targetId: activityId,
          targetTitle: act.title,
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          date: new Date().toISOString().split("T")[0],
          status: "Pending",
          xpValue: 50, // Static XP for CSR participation
          pointsValue: act.points,
        },
      ];
    });
    addNotification(`Registered for activity: ${act.title}`, "success");
  };

  const submitActivityProof = (activityId: string, proofUrl: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.employeeId === currentUser.id && s.targetId === activityId && s.type === "csr") {
          return {
            ...s,
            proofUrl,
            status: "Pending" as const,
            date: new Date().toISOString().split("T")[0],
          };
        }
        return s;
      })
    );
    const act = csrActivities.find((a) => a.id === activityId);
    addNotification(`Submitted participation proof for ${act?.title || "activity"}. Pending admin review.`, "info");
  };

  const acknowledgePolicy = (policyId: string) => {
    const pol = policies.find((p) => p.id === policyId);
    if (!pol) return;

    setAcknowledgements((prev) => [
      ...prev,
      {
        id: "ack_" + Date.now(),
        policyId,
        policyTitle: pol.title,
        employeeId: currentUser.id,
        date: new Date().toISOString().split("T")[0],
      },
    ]);

    // Update policies list to increment acknowledgement rate
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id === policyId) {
          const rate = parseInt(p.ackRate) || 0;
          return { ...p, ackRate: Math.min(100, rate + 20) + "%" };
        }
        return p;
      })
    );

    // Award immediate small XP/points if configured or standard
    if (currentUser.role === "employee") {
      setCurrentUser((prev) => ({
        ...prev,
        xp: prev.xp + 50,
        points: prev.points + 20,
      }));
    }

    addNotification(`Acknowledged policy: ${pol.title}. Earned +50 XP and +20 points!`, "success");

    // Check Green Pioneer badge unlock
    if (unlockedBadges.length === 0 || !unlockedBadges.includes("bd_1")) {
      setUnlockedBadges((prev) => [...prev, "bd_1"]);
      // Add notification specifically for badge unlock
      addNotification("New Badge Unlocked: Green Pioneer! Check your badges gallery.", "success");
    }
  };

  const redeemReward = (rewardId: string) => {
    const rw = rewards.find((r) => r.id === rewardId);
    if (!rw || rw.stock <= 0) return;

    if (currentUser.points < rw.cost) {
      addNotification("Insufficient points to redeem this reward.", "warning");
      return;
    }

    // Deduct points
    if (currentUser.role === "employee") {
      setCurrentUser((prev) => ({
        ...prev,
        points: prev.points - rw.cost,
      }));
    }

    // Reduce stock
    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, stock: r.stock - 1 } : r))
    );

    // Log Redemption
    setRedemptions((prev) => [
      { id: "rd_" + Date.now(), date: new Date().toISOString().split("T")[0], rewardTitle: rw.title, cost: rw.cost, status: "Processing" },
      ...prev,
    ]);

    addNotification(`Redemption successful for: ${rw.title}`, "success");
  };

  // Admin Actions: Approve submission in approvals queue
  const approveSubmission = (submissionId: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: "Approved" as const } : s))
    );

    // Award XP/Points to Employee
    if (sub.employeeId === currentUser.id && currentUser.role === "employee") {
      // Awarding points immediately because the admin Approved it while Alex Rivera was active
      setCurrentUser((prev) => {
        const nextXp = prev.xp + sub.xpValue;
        const nextLvl = nextXp >= 1000 ? prev.level + Math.floor(nextXp / 1000) : prev.level;
        return {
          ...prev,
          xp: nextXp % 1000,
          level: nextLvl,
          points: prev.points + sub.pointsValue,
        };
      });
    } else {
      // Alex Rivera is the employee being approved, so we update his stored profile details (if logged back in)
      // For the demo simplicity, if we are in admin mode, the points will be loaded when switching back to Alex Rivera
      // We do this by updating the base defaultUser object, so when switchRole is called, it loads the updated details!
      defaultUser.xp = (defaultUser.xp + sub.xpValue) % 1000;
      defaultUser.level = defaultUser.level + (defaultUser.xp + sub.xpValue >= 1000 ? 1 : 0);
      defaultUser.points = defaultUser.points + sub.pointsValue;
    }

    // Trigger notification to Employee
    addNotification(`Submission Approved: '${sub.targetTitle}' for employee ${sub.employeeName}. Awarded +${sub.xpValue} XP, +${sub.pointsValue} Points.`, "success");

    // Trigger badges rules check
    if (sub.type === "challenge" && sub.targetId === "ch_1") {
      if (!unlockedBadges.includes("bd_2")) {
        setUnlockedBadges((prev) => [...prev, "bd_2"]);
        addNotification(`New Badge unlocked for ${sub.employeeName}: Energy Saver!`, "success");
      }
    } else if (sub.type === "csr" && sub.targetId === "csr_1") {
      if (!unlockedBadges.includes("bd_3")) {
        setUnlockedBadges((prev) => [...prev, "bd_3"]);
        addNotification(`New Badge unlocked for ${sub.employeeName}: Carbon Buster!`, "success");
      }
    }
  };

  const rejectSubmission = (submissionId: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: "Rejected" as const } : s))
    );

    addNotification(`Submission Rejected: '${sub.targetTitle}' for employee ${sub.employeeName}.`, "warning");
  };

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
