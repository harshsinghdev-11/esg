"use client";

import React, { useState } from "react";
import { useEsg } from "@/context/EsgContext";
import AppIcon from "@/components/AppIcon";

interface EnvironmentalViewsProps {
  activeTab: "dashboard" | "factors" | "goals" | "transactions";
}

export default function EnvironmentalViews({ activeTab }: EnvironmentalViewsProps) {
  const {
    emissionFactors,
    sustainabilityGoals,
    carbonTransactions,
    addEmissionFactor,
    addSustainabilityGoal,
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

  const [showTxnForm, setShowTxnForm] = useState(false);
  const [txnSource, setTxnSource] = useState("");
  const [txnDept, setTxnDept] = useState("");
  const [txnEmissions, setTxnEmissions] = useState("");

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

  const handleAddTxn = (e: React.FormEvent) => {
    e.preventDefault();
    if (txnSource && txnDept && txnEmissions) {
      addCarbonTransaction(txnSource, txnDept, txnEmissions + " kg CO2");
      setTxnSource("");
      setTxnDept("");
      setTxnEmissions("");
      setShowTxnForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab content renderer */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Environmental Analytics</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Q3 2026 Emissions Overview</p>
            </div>
            <button className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg font-semibold text-label-md transition-colors flex items-center gap-2 cursor-pointer">
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
                <span className="font-bold text-headline-lg text-primary">42,850</span>
                <span className="font-semibold text-body-sm text-on-surface-variant">kg CO2e</span>
              </div>
              <div className="flex items-center text-leaf-green font-semibold text-label-md bg-leaf-green/10 w-fit px-2 py-0.5 rounded-full">
                <AppIcon name="trending_down" className="text-[14px] mr-1 font-bold" />
                -5.2% vs last quarter
              </div>
            </div>

            {/* Stat card 2 */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AppIcon name="track_changes" className="text-6xl text-leaf-green" />
              </div>
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Emissions vs Target</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-bold text-headline-lg text-primary">92%</span>
                <span className="font-semibold text-body-sm text-on-surface-variant">of Q3 goal</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                <div className="bg-leaf-green h-full rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>

            {/* Stat card 3 */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AppIcon name="factory" className="text-6xl text-secondary" />
              </div>
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Top Emitting Dept</h3>
              <div className="font-bold text-headline-sm text-on-surface mb-1">Manufacturing</div>
              <div className="text-xs text-outline font-semibold">62% of total corporate output</div>
            </div>
          </div>

          {/* Detailed graphs placeholder & breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <h3 className="font-semibold text-headline-sm text-on-surface mb-6">Emissions by Source</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-body-sm font-semibold mb-1">
                    <span>Scope 1: Direct (Generators/Company Vehicles)</span>
                    <span className="font-bold">24,500 kg CO2</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: "57%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-body-sm font-semibold mb-1">
                    <span>Scope 2: Indirect (Purchased Electricity)</span>
                    <span className="font-bold">14,200 kg CO2</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-[#1565C0] h-full" style={{ width: "33%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-body-sm font-semibold mb-1">
                    <span>Scope 3: Other Indirect (Business Flights/Commute)</span>
                    <span className="font-bold">4,150 kg CO2</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-[#FFF8E1] border border-[#FFE0B2] h-full" style={{ width: "10%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col justify-between">
              <h3 className="font-semibold text-headline-sm text-on-surface mb-4">Carbon Neutrality Milestones</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <AppIcon name="verified" className="text-[#2E7D32]" />
                  <div>
                    <h4 className="font-bold text-body-sm">Offset 10,000 kg via tree plantation</h4>
                    <p className="text-xs text-outline">Verified by ForestGuard Services on 2026-06-15</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <AppIcon name="verified" className="text-[#2E7D32]" />
                  <div>
                    <h4 className="font-bold text-body-sm">Transition to 100% Renewable energy (HQ Office)</h4>
                    <p className="text-xs text-outline">Completed Q2 2026</p>
                  </div>
                </div>
              </div>
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
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Source Event description</label>
                <input
                  type="text"
                  required
                  value={txnSource}
                  onChange={(e) => setTxnSource(e.target.value)}
                  placeholder="e.g. Diesel generator run 2hrs"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
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
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Calculated Emissions (in kg CO2)</label>
                <input
                  type="number"
                  required
                  value={txnEmissions}
                  onChange={(e) => setTxnEmissions(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
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
