"use client";

import React, { useState } from "react";
import { useEsg } from "@/context/EsgContext";

export default function OrgDashboardView() {
  const { departments, complianceIssues } = useEsg();
  const [trendPillar, setTrendPillar] = useState("Overall");

  // Calculate some stats based on context state
  const openComplianceCount = complianceIssues.filter((c) => c.status === "Open").length;

  // Mock score statistics
  const overallScore = 78;
  const envScore = 82;
  const socialScore = 75;
  const govScore = 71;

  // Departments ESG statistics matching the design
  const departmentStats = [
    { rank: 1, name: "HR & Administration", env: 85, social: 90, gov: 88, total: 87.6 },
    { rank: 2, name: "Operations Division", env: 80, social: 78, gov: 75, total: 77.9 },
    { rank: 3, name: "Manufacturing Plant A", env: 72, social: 65, gov: 60, total: 66.3 },
  ];

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Organization Dashboard</h1>
          <p className="text-on-surface-variant mt-1">Overview of ESG performance and critical alerts.</p>
        </div>
        <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-semibold text-label-md hover:bg-primary/95 transition-colors shadow-sm cursor-pointer active:scale-95">
          Generate Report
        </button>
      </div>

      {/* Top Row: Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Overall Score Gauge */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
          <h2 className="font-semibold text-headline-sm text-on-surface mb-4">Overall ESG Score</h2>
          <div className="relative w-44 h-44">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-container-high"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary transition-all duration-500"
                strokeDasharray={`${overallScore}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-bold text-headline-lg text-on-surface leading-none">{overallScore}</span>
              <span className="text-[11px] text-outline font-semibold uppercase tracking-wider mt-1">/ 100</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-leaf-green">
            <span className="material-symbols-outlined text-sm font-bold">trending_up</span>
            <span className="font-semibold text-label-md">+2.4% vs last quarter</span>
          </div>
        </div>

        {/* Individual Pillar Scores */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Environmental */}
          <div className="bg-surface-container-lowest rounded-xl border border-border-subtle p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <span className="bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase">
                Environmental
              </span>
            </div>
            <div>
              <div className="font-bold text-headline-lg text-on-surface mb-1">{envScore}</div>
              <div className="flex items-center gap-1 text-[#2E7D32] font-semibold text-label-md">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                <span>+4.1 vs Q1</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="bg-surface-container-lowest rounded-xl border border-border-subtle p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center text-[#1565C0]">
                <span className="material-symbols-outlined">group</span>
              </div>
              <span className="bg-[#E3F2FD] text-[#1565C0] px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase">
                Social
              </span>
            </div>
            <div>
              <div className="font-bold text-headline-lg text-on-surface mb-1">{socialScore}</div>
              <div className="flex items-center gap-1 text-[#1565C0] font-semibold text-label-md">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                <span>+1.2 vs Q1</span>
              </div>
            </div>
          </div>

          {/* Governance */}
          <div className="bg-surface-container-lowest rounded-xl border border-border-subtle p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF8E1] flex items-center justify-center text-[#F57F17]">
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <span className="bg-[#FFF8E1] text-[#F57F17] px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase">
                Governance
              </span>
            </div>
            <div>
              <div className="font-bold text-headline-lg text-on-surface mb-1">{govScore}</div>
              <div className="flex items-center gap-1 text-error font-semibold text-label-md">
                <span className="material-symbols-outlined text-sm">arrow_downward</span>
                <span>-0.8 vs Q1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Alerts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="xl:col-span-2 bg-surface-container-lowest border border-border-subtle rounded-xl p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-headline-sm text-on-surface">6-Month ESG Trend</h2>
            <select
              value={trendPillar}
              onChange={(e) => setTrendPillar(e.target.value)}
              className="bg-surface-container-lowest border border-border-subtle text-on-surface-variant font-semibold text-label-md rounded-lg p-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option>Overall</option>
              <option>Environmental</option>
              <option>Social</option>
              <option>Governance</option>
            </select>
          </div>
          {/* CSS Chart Bars */}
          <div
            className="w-full h-64 bg-surface-container-low rounded-lg relative overflow-hidden flex items-end px-4 gap-4 pb-2"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, #e2e8f0 40px)",
            }}
          >
            {/* January */}
            <div className="w-full flex flex-col items-center justify-end h-full">
              <div className="w-8 bg-primary/30 rounded-t-lg h-[68%] hover:bg-primary transition-all duration-200 relative group cursor-pointer">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold py-1 px-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity mb-1 z-10">
                  68
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-2 font-semibold">Jan</span>
            </div>
            {/* February */}
            <div className="w-full flex flex-col items-center justify-end h-full">
              <div className="w-8 bg-primary/45 rounded-t-lg h-[70%] hover:bg-primary transition-all duration-200 relative group cursor-pointer">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold py-1 px-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity mb-1 z-10">
                  70
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-2 font-semibold">Feb</span>
            </div>
            {/* March */}
            <div className="w-full flex flex-col items-center justify-end h-full">
              <div className="w-8 bg-primary/60 rounded-t-lg h-[72%] hover:bg-primary transition-all duration-200 relative group cursor-pointer">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold py-1 px-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity mb-1 z-10">
                  72
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-2 font-semibold">Mar</span>
            </div>
            {/* April */}
            <div className="w-full flex flex-col items-center justify-end h-full">
              <div className="w-8 bg-primary/75 rounded-t-lg h-[75%] hover:bg-primary transition-all duration-200 relative group cursor-pointer">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold py-1 px-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity mb-1 z-10">
                  75
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-2 font-semibold">Apr</span>
            </div>
            {/* May */}
            <div className="w-full flex flex-col items-center justify-end h-full">
              <div className="w-8 bg-primary/85 rounded-t-lg h-[76%] hover:bg-primary transition-all duration-200 relative group cursor-pointer">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold py-1 px-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity mb-1 z-10">
                  76
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-2 font-semibold">May</span>
            </div>
            {/* June */}
            <div className="w-full flex flex-col items-center justify-end h-full">
              <div className="w-8 bg-primary rounded-t-lg h-[78%] hover:bg-primary-container transition-all duration-200 relative group cursor-pointer">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold py-1 px-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity mb-1 z-10">
                  78
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-2 font-bold text-primary">Jun</span>
            </div>
          </div>
        </div>

        {/* Compliance Alerts */}
        <div className="xl:col-span-1 bg-surface-container-lowest border border-border-subtle rounded-xl p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-headline-sm text-on-surface">Compliance Alerts</h2>
            <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-semibold text-xs shrink-0">
              {openComplianceCount + 1} Action Needed
            </span>
          </div>
          <div className="space-y-4 flex-grow overflow-y-auto max-h-[220px] hide-scrollbar">
            {/* Alert 1 */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-error-container bg-error-container/10">
              <span className="material-symbols-outlined text-error mt-0.5">warning</span>
              <div>
                <div className="font-semibold text-label-md text-on-surface mb-1">Waste Audit Overdue</div>
                <div className="text-body-sm text-on-surface-variant">Manufacturing Facility Plant A</div>
                <div className="mt-1.5">
                  <span className="bg-error text-on-error px-2 py-0.5 rounded-full text-[9px] font-bold">OVERDUE</span>
                </div>
              </div>
            </div>

            {/* Alert 2 */}
            {complianceIssues.filter(ci => ci.status === "Open").map((ci, index) => (
              <div key={ci.id} className="flex items-start gap-3 p-3 rounded-lg border border-error-container bg-error-container/5">
                <span className="material-symbols-outlined text-error mt-0.5">
                  {ci.severity === "Critical" ? "gavel" : "assignment_late"}
                </span>
                <div>
                  <div className="font-semibold text-label-md text-on-surface mb-1 truncate max-w-[180px]">{ci.title}</div>
                  <div className="text-body-sm text-on-surface-variant">Owner: {ci.owner}</div>
                  <div className="mt-1.5 flex gap-1.5">
                    <span className="bg-error text-on-error px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                      {ci.severity}
                    </span>
                    <span className="text-[10px] text-outline font-semibold">Due {ci.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Rankings Table */}
      <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
        <div className="p-6 border-b border-border-subtle bg-surface-container-lowest">
          <h2 className="font-semibold text-headline-sm text-on-surface">Department ESG Rankings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
              <tr>
                <th className="p-4 py-3">Rank</th>
                <th className="p-4 py-3">Department</th>
                <th className="p-4 py-3 text-center">Env Score</th>
                <th className="p-4 py-3 text-center">Social Score</th>
                <th className="p-4 py-3 text-center">Gov Score</th>
                <th className="p-4 py-3 text-center">Total Score</th>
              </tr>
            </thead>
            <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle bg-surface-container-lowest">
              {departmentStats.map((dept) => (
                <tr key={dept.rank} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-bold text-on-surface-variant">{dept.rank}</td>
                  <td className="p-4 font-semibold text-on-surface">{dept.name}</td>
                  <td className="p-4 text-center font-semibold text-[#2E7D32]">{dept.env}</td>
                  <td className="p-4 text-center font-semibold text-[#1565C0]">{dept.social}</td>
                  <td className="p-4 text-center font-semibold text-[#F57F17]">{dept.gov}</td>
                  <td className="p-4 text-center font-bold text-primary">{dept.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
