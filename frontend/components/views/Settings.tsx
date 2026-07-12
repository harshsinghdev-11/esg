"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDepartments, useEmployees, useCategories, useEsgConfig } from "@/hooks/useDomainData";
import { departmentsService } from "@/services/departments.service";
import { employeesService } from "@/services/employees.service";
import { categoriesService } from "@/services/categories.service";
import { settingsService } from "@/services/settings.service";
import AppIcon from "@/components/AppIcon";

interface SettingsViewsProps {
  activeTab: "departments" | "employees" | "categories" | "esg-config" | "notifications";
}

export default function SettingsViews({ activeTab }: SettingsViewsProps) {
  const { currentUser } = useAuth();
  
  const { departments, refetch: refetchDepartments } = useDepartments();
  const { employees, refetch: refetchEmployees } = useEmployees();
  const { categories, refetch: refetchCategories } = useCategories();
  const { esgConfig, refetch: refetchEsgConfig } = useEsgConfig();

  // Local Form states
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptHead, setDeptHead] = useState(""); 

  const [showEmpForm, setShowEmpForm] = useState(false);
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empRole, setEmpRole] = useState("EMPLOYEE");
  const [empDept, setEmpDept] = useState("");

  const [showCatForm, setShowCatForm] = useState(false);
  const [catType, setCatType] = useState<"CSR_ACTIVITY" | "CHALLENGE">("CSR_ACTIVITY");
  const [catName, setCatName] = useState("");

  // Config editing states
  const [envW, setEnvW] = useState(esgConfig?.environmentalWeightPct || 40);
  const [socW, setSocW] = useState(esgConfig?.socialWeightPct || 30);
  const [govW, setGovW] = useState(esgConfig?.governanceWeightPct || 30);
  const [autoEm, setAutoEm] = useState(esgConfig?.autoEmissionCalculationEnabled ?? true);
  const [evidReq, setEvidReq] = useState(esgConfig?.evidenceRequiredEnabled ?? true);
  const [badgeAw, setBadgeAw] = useState(esgConfig?.badgeAutoAwardEnabled ?? true);

  // Sync config state when loaded
  React.useEffect(() => {
    if (esgConfig) {
      setEnvW(Number(esgConfig.environmentalWeightPct));
      setSocW(Number(esgConfig.socialWeightPct));
      setGovW(Number(esgConfig.governanceWeightPct));
      setAutoEm(esgConfig.autoEmissionCalculationEnabled);
      setEvidReq(esgConfig.evidenceRequiredEnabled);
      setBadgeAw(esgConfig.badgeAutoAwardEnabled);
    }
  }, [esgConfig]);

  // Handlers
  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deptName) {
      try {
        await departmentsService.create(deptName, deptHead || currentUser?.employeeId);
        setDeptName("");
        setDeptHead("");
        setShowDeptForm(false);
        refetchDepartments();
      } catch (error) {
        console.error(error);
        alert("Failed to create department");
      }
    }
  };

  const handleCreateEmp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (empName && empEmail && empRole) {
      try {
        await employeesService.create(empName, empEmail, empRole, empDept);
        setEmpName("");
        setEmpEmail("");
        setEmpRole("EMPLOYEE");
        setShowEmpForm(false);
        refetchEmployees();
      } catch (error) {
        console.error(error);
        alert("Failed to create employee");
      }
    }
  };

  const handleCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (catName) {
      try {
        await categoriesService.create(catType, catName);
        setCatName("");
        setShowCatForm(false);
        refetchCategories();
      } catch (error) {
        console.error(error);
        alert("Failed to create category");
      }
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(envW) + Number(socW) + Number(govW) !== 100) {
      alert("Weights must sum up to exactly 100%!");
      return;
    }
    try {
      await settingsService.updateConfig({
        environmentalWeightPct: Number(envW),
        socialWeightPct: Number(socW),
        governanceWeightPct: Number(govW),
        autoEmissionCalculationEnabled: autoEm,
        evidenceRequiredEnabled: evidReq,
        badgeAutoAwardEnabled: badgeAw,
      });
      alert("Configuration saved successfully!");
      refetchEsgConfig();
    } catch (error) {
      console.error(error);
      alert("Failed to save configuration");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Departments settings */}
      {activeTab === "departments" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Organization Departments</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Manage active departments and assigned division heads</p>
            </div>
            <button
              onClick={() => setShowDeptForm(!showDeptForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppIcon name="add" className="text-sm font-bold" />
              {showDeptForm ? "Cancel" : "Add Department"}
            </button>
          </div>

          {showDeptForm && (
            <form onSubmit={handleCreateDept} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Create New Department</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Manufacturing Plant B"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Department Head</label>
                <select
                  value={deptHead}
                  onChange={(e) => setDeptHead(e.target.value)}
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select Department Head</option>
                  {employees.map((employee: any) => (
                    <option key={employee.employeeId} value={employee.employeeId}>
                      {employee.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Save Department
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Department Name</th>
                  <th className="p-4 py-3">Division Head / Manager</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {departments.map((d: any) => (
                  <tr key={d.departmentId} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 font-semibold">{d.name}</td>
                    <td className="p-4">{d.headEmployee?.fullName || "Unassigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Employees settings */}
      {activeTab === "employees" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Employee Roster</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Manage and assign corporate user accounts & roles</p>
            </div>
            <button
              onClick={() => setShowEmpForm(!showEmpForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppIcon name="person_add" className="text-sm font-bold" />
              {showEmpForm ? "Cancel" : "Add Employee"}
            </button>
          </div>

          {showEmpForm && (
            <form onSubmit={handleCreateEmp} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Onboard New Employee</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Full Name</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Email Address</label>
                <input
                  type="email"
                  required
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Role Designation</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="DEPT_HEAD">Department Head</option>
                    <option value="AUDITOR">Auditor</option>
                    <option value="ESG_MANAGER">ESG Manager</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Department</label>
                  <select
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d: any) => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Save Employee Account
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Employee Name</th>
                  <th className="p-4 py-3">Email Address</th>
                  <th className="p-4 py-3">Designated Role</th>
                  <th className="p-4 py-3">Department</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {employees.map((emp: any) => (
                  <tr key={emp.employeeId} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 font-semibold">{emp.fullName}</td>
                    <td className="p-4 text-outline">{emp.email}</td>
                    <td className="p-4 font-semibold text-primary">{emp.role}</td>
                    <td className="p-4">{emp.department?.name || "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Category Settings */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Category Settings</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Configure categories for CSR activities and challenges</p>
            </div>
            <button
              onClick={() => setShowCatForm(!showCatForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppIcon name="add" className="text-sm font-bold" />
              {showCatForm ? "Cancel" : "Add Category"}
            </button>
          </div>

          {showCatForm && (
            <form onSubmit={handleCreateCat} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Add Category Label</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Registry Type</label>
                <select
                  value={catType}
                  onChange={(e) => setCatType(e.target.value as any)}
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                >
                  <option value="CSR_ACTIVITY">CSR Activities</option>
                  <option value="CHALLENGE">Gamification Challenges</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Energy Saving"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Save Category
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSR Categories */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-headline-sm text-primary mb-4">CSR Categories</h3>
              <ul className="divide-y divide-border-subtle text-body-sm">
                {categories.csr.map((cat: any) => (
                  <li key={cat.categoryId} className="py-2.5 flex justify-between items-center">
                    <span className="font-semibold text-on-surface">{cat.name}</span>
                    <span className="text-[10px] text-outline uppercase font-semibold">Active</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenge Categories */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-headline-sm text-primary mb-4">Challenge Categories</h3>
              <ul className="divide-y divide-border-subtle text-body-sm">
                {categories.challenge.map((cat: any) => (
                  <li key={cat.categoryId} className="py-2.5 flex justify-between items-center">
                    <span className="font-semibold text-on-surface">{cat.name}</span>
                    <span className="text-[10px] text-outline uppercase font-semibold">Active</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. ESG Configuration weights & toggles */}
      {activeTab === "esg-config" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">ESG Weights & Configuration</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Configure scoring percentages and operational settings</p>
          </div>

          <form onSubmit={handleSaveConfig} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm space-y-6 max-w-2xl">
            <h3 className="font-bold text-body-md text-primary">Score Weights Balance (Sum must equal 100%)</h3>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Environmental (%)</label>
                <input
                  type="number"
                  required
                  value={envW}
                  onChange={(e) => setEnvW(Number(e.target.value))}
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Social (%)</label>
                <input
                  type="number"
                  required
                  value={socW}
                  onChange={(e) => setSocW(Number(e.target.value))}
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Governance (%)</label>
                <input
                  type="number"
                  required
                  value={govW}
                  onChange={(e) => setGovW(Number(e.target.value))}
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <h3 className="font-bold text-body-md text-primary pt-4 border-t border-border-subtle">Operational Features</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50">
                <div>
                  <h4 className="font-bold text-body-sm text-on-surface">Auto-calculate Carbon Emissions</h4>
                  <p className="text-xs text-outline">Compute operational transactions automatically where factors match.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoEm}
                  onChange={(e) => setAutoEm(e.target.checked)}
                  className="h-5 w-5 text-primary focus:ring-primary border-border-subtle rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50">
                <div>
                  <h4 className="font-bold text-body-sm text-on-surface">Require Evidence Upload</h4>
                  <p className="text-xs text-outline">Forces employee challenges to upload an attachment for validation.</p>
                </div>
                <input
                  type="checkbox"
                  checked={evidReq}
                  onChange={(e) => setEvidReq(e.target.checked)}
                  className="h-5 w-5 text-primary focus:ring-primary border-border-subtle rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50">
                <div>
                  <h4 className="font-bold text-body-sm text-on-surface">Badge Auto-Awarding</h4>
                  <p className="text-xs text-outline">Enables background triggers to unlock badges instantly on approvals.</p>
                </div>
                <input
                  type="checkbox"
                  checked={badgeAw}
                  onChange={(e) => setBadgeAw(e.target.checked)}
                  className="h-5 w-5 text-primary focus:ring-primary border-border-subtle rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary text-on-primary hover:bg-primary-container px-6 py-2.5 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all"
            >
              Save Configurations
            </button>
          </form>
        </div>
      )}

      {/* 5. Notification Toggles settings */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Notification Settings</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Configure in-app event trigger notifications</p>
          </div>

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm space-y-4 max-w-xl">
            <h3 className="font-bold text-body-md text-primary mb-2">Toggle Trigger Events</h3>
            <label className="flex items-center justify-between p-3 bg-surface-container-low/40 rounded-lg border border-border-subtle cursor-pointer hover:bg-surface-container-low transition-colors">
              <div>
                <span className="font-bold text-body-sm text-on-surface">ESG Policy Releases</span>
                <p className="text-xs text-outline mt-0.5">Notify employees when new policy acknowledgments are required.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary rounded" />
            </label>

            <label className="flex items-center justify-between p-3 bg-surface-container-low/40 rounded-lg border border-border-subtle cursor-pointer hover:bg-surface-container-low transition-colors">
              <div>
                <span className="font-bold text-body-sm text-on-surface">Challenge Status Changes</span>
                <p className="text-xs text-outline mt-0.5">Notify enrolled users when challenges start or reach review.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary rounded" />
            </label>

            <label className="flex items-center justify-between p-3 bg-surface-container-low/40 rounded-lg border border-border-subtle cursor-pointer hover:bg-surface-container-low transition-colors">
              <div>
                <span className="font-bold text-body-sm text-on-surface">Approval Queue Outcomes</span>
                <p className="text-xs text-outline mt-0.5">Notify employees when their submitted proof is approved or rejected.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary rounded" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
