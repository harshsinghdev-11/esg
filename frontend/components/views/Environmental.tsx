"use client";

import React, { useState } from "react";
import { useEsg } from "@/context/EsgContext";
import { useRouter } from "next/navigation";
import AppIcon from "@/components/AppIcon";

interface EnvironmentalViewsProps {
  activeTab: "dashboard" | "factors" | "goals" | "operations" | "transactions";
}

export default function EnvironmentalViews({ activeTab }: EnvironmentalViewsProps) {
  const router = useRouter();
  const {
    esgConfig,
    emissionFactors,
    sustainabilityGoals,
    operationalRecords,
    carbonTransactions,
    environmentalSummary,
    addEmissionFactor,
    addSustainabilityGoal,
    addOperationalRecord,
    calculateOperationalRecord,
    autoCalculateOperationalRecords,
    addCarbonTransaction,
    departments,
  } = useEsg();

  // Local Form States
  const [showFactorForm, setShowFactorForm] = useState(false);
  const [factorName, setFactorName] = useState("");
  const [factorValue, setFactorValue] = useState("");

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalDept, setGoalDept] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const [showOpsForm, setShowOpsForm] = useState(false);
  const [opsSource, setOpsSource] = useState<"PURCHASE" | "MANUFACTURING" | "EXPENSE" | "FLEET">("PURCHASE");
  const [opsDept, setOpsDept] = useState("");
  const [opsFactor, setOpsFactor] = useState("");
  const [opsDescription, setOpsDescription] = useState("");
  const [opsQuantity, setOpsQuantity] = useState("");
  const [opsUnit, setOpsUnit] = useState("unit");
  const [opsDate, setOpsDate] = useState(new Date().toISOString().slice(0, 10));
  const [opsAmount, setOpsAmount] = useState("");

  const [showTxnForm, setShowTxnForm] = useState(false);
  const [txnSource, setTxnSource] = useState<"PURCHASE" | "MANUFACTURING" | "EXPENSE" | "FLEET" | "MANUAL">("MANUAL");
  const [txnDept, setTxnDept] = useState("");
  const [txnFactor, setTxnFactor] = useState("");
  const [txnQuantity, setTxnQuantity] = useState("");
  const [txnDate, setTxnDate] = useState(new Date().toISOString().slice(0, 10));

  // Submissions Handlers
  const handleAddFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (factorName && factorValue) {
      addEmissionFactor(factorName, factorValue);
      setFactorName("");
      setFactorValue("");
      setShowFactorForm(false);
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalDept && goalTarget) {
      addSustainabilityGoal(goalDept, goalTarget);
      setGoalDept("");
      setGoalTarget("");
      setShowGoalForm(false);
    }
  };

  const handleAddOperationalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (opsDept && opsFactor && opsQuantity && opsUnit && opsDate) {
      addOperationalRecord({
        sourceType: opsSource,
        departmentId: opsDept,
        description: opsDescription,
        quantity: Number(opsQuantity),
        unit: opsUnit,
        emissionFactorId: opsFactor,
        recordDate: opsDate,
        amount: opsAmount ? Number(opsAmount) : undefined,
      });
      setOpsDescription("");
      setOpsQuantity("");
      setOpsUnit("unit");
      setOpsDate(new Date().toISOString().slice(0, 10));
      setOpsAmount("");
      setOpsDept("");
      setOpsFactor("");
      setOpsSource("PURCHASE");
      setShowOpsForm(false);
    }
  };

  const handleAddTxn = (e: React.FormEvent) => {
    e.preventDefault();
    if (txnSource && txnDept && txnFactor && txnQuantity && txnDate) {
      addCarbonTransaction({
        sourceType: txnSource,
        departmentId: txnDept,
        emissionFactorId: txnFactor,
        quantity: Number(txnQuantity),
        transactionDate: txnDate,
      });
      setTxnSource("MANUAL");
      setTxnDept("");
      setTxnFactor("");
      setTxnQuantity("");
      setTxnDate(new Date().toISOString().slice(0, 10));
      setShowTxnForm(false);
    }
  };

  const totalEmissions = Number(environmentalSummary?.totalCo2eEmitted ?? 0);
  const totalGoalTarget = sustainabilityGoals.reduce((sum, goal) => {
    const match = goal.target.match(/-?\d+(\.\d+)?/);
    return sum + Number(match?.[0] ?? 0);
  }, 0);
  const totalGoalProgress = sustainabilityGoals.reduce((sum, goal) => {
    const match = goal.progress.match(/-?\d+(\.\d+)?/);
    return sum + Number(match?.[0] ?? 0);
  }, 0);
  const targetPct = totalGoalTarget > 0 ? Math.min(100, (totalGoalProgress / totalGoalTarget) * 100) : 0;
  const topSource = environmentalSummary?.emissionsBySource?.[0];
  const environmentalTabs = [
    { label: "Dashboard", view: "environmental-dashboard" },
    { label: "Factors", view: "emission-factors" },
    { label: "Goals", view: "sustainability-goals" },
    { label: "Operations", view: "operational-records" },
    { label: "Transactions", view: "carbon-transactions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border-subtle bg-surface-container-lowest p-2 shadow-sm">
        {environmentalTabs.map((tab) => {
          const isActive =
            (activeTab === "dashboard" && tab.view === "environmental-dashboard") ||
            (activeTab === "factors" && tab.view === "emission-factors") ||
            (activeTab === "goals" && tab.view === "sustainability-goals") ||
            (activeTab === "operations" && tab.view === "operational-records") ||
            (activeTab === "transactions" && tab.view === "carbon-transactions");

          return (
            <button
              key={tab.view}
              onClick={() => router.push(`/dashboard?view=${tab.view}`)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content renderer */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Environmental Analytics</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Q3 2026 Emissions Overview</p>
            </div>
            <button
              onClick={() => router.push("/dashboard?view=reports")}
              className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg font-semibold text-label-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <AppIcon name="download" className="text-[18px]" />
              Export Report
            </button>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat card 1 */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AppIcon name="co2" className="text-6xl text-primary font-bold" />
              </div>
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Total Emissions</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-bold text-headline-lg text-primary">{totalEmissions.toLocaleString()}</span>
                <span className="font-semibold text-body-sm text-on-surface-variant">kg CO2e</span>
              </div>
              <div className="flex items-center text-leaf-green font-semibold text-label-md bg-leaf-green/10 w-fit px-2 py-0.5 rounded-full">
                <AppIcon name="analytics" className="text-[14px] mr-1 font-bold" />
                Live from carbon transactions
              </div>
            </div>

            {/* Stat card 2 */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AppIcon name="track_changes" className="text-6xl text-leaf-green" />
              </div>
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Emissions vs Target</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-bold text-headline-lg text-primary">{targetPct.toFixed(0)}%</span>
                <span className="font-semibold text-body-sm text-on-surface-variant">of active goals</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                <div className="bg-leaf-green h-full rounded-full" style={{ width: `${targetPct}%` }}></div>
              </div>
            </div>

            {/* Stat card 3 */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AppIcon name="factory" className="text-6xl text-secondary" />
              </div>
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Top Emitting Dept</h3>
              <div className="font-bold text-headline-sm text-on-surface mb-1">{topSource ? topSource.sourceType : "No data yet"}</div>
              <div className="text-xs text-outline font-semibold">
                {topSource ? `${Number(topSource.totalCo2eEmitted ?? 0).toLocaleString()} kg CO2e logged` : "Add transactions to see trends"}
              </div>
            </div>
          </div>

          {/* Detailed graphs placeholder & breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <h3 className="font-semibold text-headline-sm text-on-surface mb-6">Emissions by Source</h3>
              <div className="space-y-4">
                {(environmentalSummary?.emissionsBySource ?? []).length === 0 ? (
                  <p className="text-body-sm text-outline">No emissions data available yet.</p>
                ) : (
                  environmentalSummary.emissionsBySource.map((item: any) => {
                    const share = totalEmissions > 0 ? (Number(item.totalCo2eEmitted ?? 0) / totalEmissions) * 100 : 0;
                    return (
                      <div key={item.sourceType}>
                        <div className="flex justify-between text-body-sm font-semibold mb-1">
                          <span>{item.sourceType}</span>
                          <span className="font-bold">{Number(item.totalCo2eEmitted ?? 0).toLocaleString()} kg CO2e</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${share}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col justify-between">
              <h3 className="font-semibold text-headline-sm text-on-surface mb-4">Active Goal Progress</h3>
              <div className="space-y-4">
                {(environmentalSummary?.goalsProgress ?? []).length === 0 ? (
                  <p className="text-body-sm text-outline">No environmental goals configured yet.</p>
                ) : (
                  environmentalSummary.goalsProgress.slice(0, 3).map((goal: any) => (
                    <div key={goal.environmentalGoalId} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-bold text-body-sm">{goal.title}</h4>
                        <span className="text-xs font-semibold text-primary">{Number(goal.progressPct ?? 0).toFixed(0)}%</span>
                      </div>
                      <p className="text-xs text-outline">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </p>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div className="bg-leaf-green h-full" style={{ width: `${Math.min(100, Number(goal.progressPct ?? 0))}%` }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-headline-sm text-on-surface">Operational Pipeline</h3>
                  <p className="text-xs text-outline mt-1">Capture source operations, then convert them into emissions.</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                    esgConfig.autoEmission ? "bg-leaf-green/10 text-[#2E7D32]" : "bg-[#FFF8E1] text-[#F57F17]"
                  }`}
                >
                  Auto calc {esgConfig.autoEmission ? "enabled" : "disabled"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                  <p className="text-xs font-semibold uppercase text-outline">Operational records</p>
                  <p className="mt-2 text-2xl font-bold text-on-surface">{operationalRecords.length}</p>
                </div>
                <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                  <p className="text-xs font-semibold uppercase text-outline">Pending processing</p>
                  <p className="mt-2 text-2xl font-bold text-primary">
                    {operationalRecords.filter((record) => !record.isProcessed).length}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/dashboard?view=operational-records")}
                  className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Open Operations
                </button>
                <button
                  onClick={() => autoCalculateOperationalRecords()}
                  className="border border-border-subtle hover:bg-surface-container-low px-4 py-2 rounded-lg text-xs font-semibold text-on-surface cursor-pointer"
                >
                  Run Auto-Calculation
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-headline-sm text-on-surface">Latest Operational Records</h3>
              {operationalRecords.length === 0 ? (
                <p className="text-body-sm text-outline">No operational records logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {operationalRecords.slice(0, 3).map((record) => (
                    <div key={record.id} className="rounded-lg border border-border-subtle bg-surface-container-low/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-body-sm text-on-surface">{record.description}</p>
                          <p className="text-xs text-outline mt-1">
                            {record.sourceType} • {record.department} • {record.quantity}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            record.isProcessed
                              ? "bg-leaf-green/10 text-[#2E7D32]"
                              : "bg-[#FFF8E1] text-[#F57F17]"
                          }`}
                        >
                          {record.isProcessed ? "Processed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "goals" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Sustainability Goals</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Configure carbon goals per department</p>
            </div>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppIcon name="add" className="text-sm font-bold" />
              {showGoalForm ? "Cancel" : "Set Target"}
            </button>
          </div>

          {showGoalForm && (
            <form onSubmit={handleAddGoal} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Set Department Sustainability Target</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Department</label>
                <select
                  value={goalDept}
                  onChange={(e) => setGoalDept(e.target.value)}
                  required
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Goal Target (e.g. Max 500kg CO2/month)</label>
                <input
                  type="text"
                  required
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="Max 500kg CO2/month"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Save Target Goal
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Department</th>
                  <th className="p-4 py-3">Target Limit</th>
                  <th className="p-4 py-3">Current Progress</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {sustainabilityGoals.map((goal) => (
                  <tr key={goal.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 font-semibold">{goal.department}</td>
                    <td className="p-4 font-semibold text-primary">{goal.target}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-outline">{goal.progress} logged</span>
                      </div>
                      <div className="w-48 bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: "85%" }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Carbon Emissions Ledger</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">View or log carbon transaction logs</p>
            </div>
            <button
              onClick={() => setShowTxnForm(!showTxnForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppIcon name="add" className="text-sm font-bold" />
              {showTxnForm ? "Cancel" : "Log Transaction"}
            </button>
          </div>

          {showTxnForm && (
            <form onSubmit={handleAddTxn} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Log Manual Operational Event</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Source Type</label>
                  <select
                    value={txnSource}
                    onChange={(e) => setTxnSource(e.target.value as any)}
                    required
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="PURCHASE">Purchase</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="EXPENSE">Expense</option>
                    <option value="FLEET">Fleet</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={txnDate}
                    onChange={(e) => setTxnDate(e.target.value)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Department</label>
                <select
                  value={txnDept}
                  onChange={(e) => setTxnDept(e.target.value)}
                  required
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Emission Factor</label>
                  <select
                    value={txnFactor}
                    onChange={(e) => setTxnFactor(e.target.value)}
                    required
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Factor</option>
                    {emissionFactors.map((factor) => (
                      <option key={factor.id} value={factor.id}>
                        {factor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Quantity</label>
                  <input
                    type="number"
                    required
                    value={txnQuantity}
                    onChange={(e) => setTxnQuantity(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Log Transaction
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Date</th>
                  <th className="p-4 py-3">Source Event</th>
                  <th className="p-4 py-3">Department</th>
                  <th className="p-4 py-3">Calculated Emissions</th>
                  <th className="p-4 py-3">Logging Class</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {carbonTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 text-outline">{txn.date}</td>
                    <td className="p-4 font-semibold text-on-surface">{txn.source}</td>
                    <td className="p-4">{txn.department}</td>
                    <td className="p-4 font-bold text-error">{txn.emissions}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          txn.status.includes("Auto")
                            ? "bg-primary-container/10 text-primary-container"
                            : "bg-[#FFF8E1] text-[#F57F17]"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "operations" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Operational Records Intake</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Log purchase, manufacturing, expense, or fleet activity before emission calculation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowOpsForm(!showOpsForm)}
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AppIcon name="add" className="text-sm font-bold" />
                {showOpsForm ? "Cancel" : "Add Record"}
              </button>
              <button
                onClick={() => autoCalculateOperationalRecords()}
                className="border border-border-subtle hover:bg-surface-container-low px-4 py-2 rounded-lg text-xs font-semibold text-on-surface cursor-pointer"
              >
                Batch Auto-Calculate
              </button>
            </div>
          </div>

          {showOpsForm && (
            <form onSubmit={handleAddOperationalRecord} className="glass-panel border border-border-subtle rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Log Operational Source Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Source Type</label>
                  <select
                    value={opsSource}
                    onChange={(e) => setOpsSource(e.target.value as typeof opsSource)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option value="PURCHASE">Purchase</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="EXPENSE">Expense</option>
                    <option value="FLEET">Fleet</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Record Date</label>
                  <input
                    type="date"
                    value={opsDate}
                    onChange={(e) => setOpsDate(e.target.value)}
                    required
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Department</label>
                  <select
                    value={opsDept}
                    onChange={(e) => setOpsDept(e.target.value)}
                    required
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Emission Factor</label>
                  <select
                    value={opsFactor}
                    onChange={(e) => setOpsFactor(e.target.value)}
                    required
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Factor</option>
                    {emissionFactors.map((factor) => (
                      <option key={factor.id} value={factor.id}>
                        {factor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Description</label>
                <input
                  type="text"
                  value={opsDescription}
                  onChange={(e) => setOpsDescription(e.target.value)}
                  placeholder="e.g. Diesel purchase for delivery fleet"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Quantity</label>
                  <input
                    type="number"
                    value={opsQuantity}
                    onChange={(e) => setOpsQuantity(e.target.value)}
                    required
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Unit</label>
                  <input
                    type="text"
                    value={opsUnit}
                    onChange={(e) => setOpsUnit(e.target.value)}
                    required
                    placeholder="litre / km / unit"
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Amount (optional)</label>
                  <input
                    type="number"
                    value={opsAmount}
                    onChange={(e) => setOpsAmount(e.target.value)}
                    placeholder="1500"
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Save Operational Record
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Date</th>
                  <th className="p-4 py-3">Source</th>
                  <th className="p-4 py-3">Department</th>
                  <th className="p-4 py-3">Quantity</th>
                  <th className="p-4 py-3">Factor</th>
                  <th className="p-4 py-3">Status</th>
                  <th className="p-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {operationalRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 text-outline">{record.date}</td>
                    <td className="p-4">
                      <div className="font-semibold">{record.sourceType}</div>
                      <div className="text-xs text-outline mt-1">{record.description}</div>
                    </td>
                    <td className="p-4">{record.department}</td>
                    <td className="p-4 font-semibold text-primary">{record.quantity}</td>
                    <td className="p-4">{record.emissionFactor}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          record.isProcessed
                            ? "bg-leaf-green/10 text-[#2E7D32]"
                            : "bg-[#FFF8E1] text-[#F57F17]"
                        }`}
                      >
                        {record.isProcessed ? "Processed" : "Pending"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {record.isProcessed ? (
                        <span className="text-xs text-outline italic">Already calculated</span>
                      ) : (
                        <button
                          onClick={() => calculateOperationalRecord(record.id)}
                          className="bg-primary text-on-primary hover:bg-primary-container px-3 py-1 rounded text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                        >
                          Calculate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "factors" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Emission Factor Registry</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Browse and update carbon emission factors</p>
            </div>
            <button
              onClick={() => setShowFactorForm(!showFactorForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppIcon name="add" className="text-sm font-bold" />
              {showFactorForm ? "Cancel" : "Add Factor"}
            </button>
          </div>

          {showFactorForm && (
            <form onSubmit={handleAddFactor} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Create New Emission Factor</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Factor Label</label>
                <input
                  type="text"
                  required
                  value={factorName}
                  onChange={(e) => setFactorName(e.target.value)}
                  placeholder="e.g. Natural Gas"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Conversion Multiplier (e.g. 2.15 kg CO2/unit)</label>
                <input
                  type="text"
                  required
                  value={factorValue}
                  onChange={(e) => setFactorValue(e.target.value)}
                  placeholder="e.g. 1.89 kg CO2/kWh"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Add Factor
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Conversion Factor Name</th>
                  <th className="p-4 py-3">Co-efficient Value</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {emissionFactors.map((factor) => (
                  <tr key={factor.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 font-semibold">{factor.name}</td>
                    <td className="p-4 text-primary font-bold">{factor.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
