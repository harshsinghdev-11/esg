"use client";

import React, { useState } from "react";
import { useEsg } from "@/context/EsgContext";
import AppIcon from "@/components/AppIcon";

export default function OrgDashboardView() {
  const { overview, departmentRankings, complianceIssues } = useEsg();
  const [trendPillar, setTrendPillar] = useState("Overall");

  const openComplianceCount = complianceIssues.filter(
    (issue) => issue.status !== "Resolved" && issue.status !== "Closed",
  ).length;
  const orgScore = overview?.organizationScore ?? {};
  const overallScore = Number(orgScore.totalScore ?? 0).toFixed(1);
  const envScore = Number(orgScore.environmentalScore ?? 0).toFixed(1);
  const socialScore = Number(orgScore.socialScore ?? 0).toFixed(1);
  const govScore = Number(orgScore.governanceScore ?? 0).toFixed(1);
  const trendData = overview?.environmental?.emissionsTrend ?? [];
  const maxTrendValue = Math.max(...trendData.map((entry: any) => Number(entry.value ?? 0)), 1);

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
                strokeDasharray={`${Number(overallScore)}, 100`}
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
            <AppIcon name="analytics" className="text-sm font-bold" />
            <span className="font-semibold text-label-md">{overview?.organizationScore?.departmentCount ?? 0} departments contributing</span>
          </div>
        </div>

        {/* Individual Pillar Scores */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Environmental */}
          <div className="bg-surface-container-lowest rounded-xl border border-border-subtle p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                <AppIcon name="eco" />
              </div>
              <span className="bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase">
                Environmental
              </span>
            </div>
            <div>
              <div className="font-bold text-headline-lg text-on-surface mb-1">{envScore}</div>
              <div className="flex items-center gap-1 text-[#2E7D32] font-semibold text-label-md">
                <AppIcon name="eco" className="text-sm" />
                <span>Environmental</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="bg-surface-container-lowest rounded-xl border border-border-subtle p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center text-[#1565C0]">
                <AppIcon name="group" />
              </div>
              <span className="bg-[#E3F2FD] text-[#1565C0] px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase">
                Social
              </span>
            </div>
            <div>
              <div className="font-bold text-headline-lg text-on-surface mb-1">{socialScore}</div>
              <div className="flex items-center gap-1 text-[#1565C0] font-semibold text-label-md">
                <AppIcon name="group" className="text-sm" />
                <span>Social</span>
              </div>
            </div>
          </div>

          {/* Governance */}
          <div className="bg-surface-container-lowest rounded-xl border border-border-subtle p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF8E1] flex items-center justify-center text-[#F57F17]">
                <AppIcon name="account_balance" />
              </div>
              <span className="bg-[#FFF8E1] text-[#F57F17] px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase">
                Governance
              </span>
            </div>
            <div>
              <div className="font-bold text-headline-lg text-on-surface mb-1">{govScore}</div>
              <div className="flex items-center gap-1 text-error font-semibold text-label-md">
                <AppIcon name="gavel" className="text-sm" />
                <span>Governance</span>
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
            <h2 className="font-semibold text-headline-sm text-on-surface">Emissions Trend</h2>
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
          <div
            className="w-full h-64 bg-surface-container-low rounded-lg relative overflow-hidden flex items-end px-4 gap-4 pb-2"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, #e2e8f0 40px)",
            }}
          >
            {trendData.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-body-sm text-outline">
                No trend data available yet.
              </div>
            ) : (
              trendData.map((entry: any) => {
                const value = Number(entry.value ?? 0);
                const height = `${Math.max(8, (value / maxTrendValue) * 100)}%`;
                return (
                  <div key={entry.label} className="w-full flex flex-col items-center justify-end h-full">
                    <div className="w-8 bg-primary rounded-t-lg hover:bg-primary-container transition-all duration-200 relative group cursor-pointer" style={{ height }}>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold py-1 px-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity mb-1 z-10">
                        {value.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] text-on-surface-variant mt-2 font-semibold">{entry.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Compliance Alerts */}
        <div className="xl:col-span-1 bg-surface-container-lowest border border-border-subtle rounded-xl p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-headline-sm text-on-surface">Compliance Alerts</h2>
            <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-semibold text-xs shrink-0">
              {openComplianceCount} Action Needed
            </span>
          </div>
          <div className="space-y-4 flex-grow overflow-y-auto max-h-[220px] hide-scrollbar">
            {complianceIssues.filter(ci => ci.status !== "Resolved" && ci.status !== "Closed").map((ci) => (
              <div key={ci.id} className="flex items-start gap-3 p-3 rounded-lg border border-error-container bg-error-container/5">
                <AppIcon
                  name={ci.severity === "Critical" ? "gavel" : "warning"}
                  className="text-error mt-0.5"
                />
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
              {departmentRankings.map((dept) => (
                <tr key={dept.departmentId} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-bold text-on-surface-variant">{dept.rank}</td>
                  <td className="p-4 font-semibold text-on-surface">{dept.departmentName}</td>
                  <td className="p-4 text-center font-semibold text-[#2E7D32]">{dept.environmentalScore.toFixed(1)}</td>
                  <td className="p-4 text-center font-semibold text-[#1565C0]">{dept.socialScore.toFixed(1)}</td>
                  <td className="p-4 text-center font-semibold text-[#F57F17]">{dept.governanceScore.toFixed(1)}</td>
                  <td className="p-4 text-center font-bold text-primary">{dept.totalScore.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
