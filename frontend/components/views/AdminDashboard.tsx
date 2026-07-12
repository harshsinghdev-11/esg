"use client";

import React, { useState } from "react";
import { useEsg } from "@/context/EsgContext";

export default function OrgDashboardView() {
  const { complianceIssues } = useEsg();
  const [trendPillar, setTrendPillar] = useState("Overall");

  const openComplianceCount = complianceIssues.filter((c) => c.status === "Open").length;
  const overallScore = 78;
  const envScore = 82;
  const socialScore = 75;
  const govScore = 71;

  const departmentStats = [
    { rank: 1, name: "HR & Administration", env: 85, social: 90, gov: 88, total: 87.6 },
    { rank: 2, name: "Operations Division", env: 80, social: 78, gov: 75, total: 77.9 },
    { rank: 3, name: "Manufacturing Plant A", env: 72, social: 65, gov: 60, total: 66.3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Executive overview
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Organization Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Track sustainability performance, highlight risks, and keep momentum visible across teams.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-container">
          Generate report
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Overall ESG score</p>
              <h2 className="text-xl font-semibold text-slate-900">Balanced performance</h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">+2.4% QoQ</span>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="mx-auto flex w-full max-w-[220px] items-center justify-center">
              <div className="relative h-44 w-44">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-primary" strokeDasharray={`${overallScore}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-semibold text-slate-900">{overallScore}</span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">/ 100</span>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {[
                { label: "Environmental", value: envScore, tone: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Social", value: socialScore, tone: "text-sky-600", bg: "bg-sky-50" },
                { label: "Governance", value: govScore, tone: "text-amber-600", bg: "bg-amber-50" },
              ].map((item) => (
                <div key={item.label} className={`flex items-center justify-between rounded-2xl border border-slate-200 ${item.bg} px-4 py-3`}>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-500">Quarterly trend</p>
                  </div>
                  <div className={`text-lg font-semibold ${item.tone}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          {[
            { title: "Open actions", value: `${openComplianceCount + 1}`, caption: "Policy and audit follow-ups", icon: "task_alt", tint: "bg-rose-50 text-rose-600" },
            { title: "Active challenges", value: "12", caption: "Employee participation", icon: "emoji_events", tint: "bg-violet-50 text-violet-600" },
            { title: "Reward redemptions", value: "28", caption: "This month", icon: "redeem", tint: "bg-amber-50 text-amber-600" },
          ].map((item) => (
            <div key={item.title} className="panel-card p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${item.tint}`}>
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
              </div>
              <p className="text-sm font-semibold text-slate-500">{item.title}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
              <p className="text-sm text-slate-500">{item.caption}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel-card p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">6-month ESG trend</h2>
              <p className="text-sm text-slate-500">Performance movement for {trendPillar.toLowerCase()}.</p>
            </div>
            <select value={trendPillar} onChange={(e) => setTrendPillar(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none focus:border-primary">
              <option>Overall</option>
              <option>Environmental</option>
              <option>Social</option>
              <option>Governance</option>
            </select>
          </div>
          <div className="flex h-64 items-end gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 pb-3 pt-4" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, #e2e8f0 40px)" }}>
            {[68, 70, 72, 75, 76, 78].map((value, index) => (
              <div key={index} className="flex h-full w-full flex-col items-center justify-end">
                <div className={`w-8 rounded-t-xl bg-primary ${index === 5 ? "bg-primary" : "bg-primary/75"}`} style={{ height: `${value}%` }} />
                <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Compliance alerts</h2>
              <p className="text-sm text-slate-500">Immediate follow-up items</p>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600">{openComplianceCount + 1} active</span>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-rose-600" aria-hidden="true">warning</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Waste audit overdue</p>
                  <p className="text-sm text-slate-600">Manufacturing Facility Plant A</p>
                </div>
              </div>
            </div>
            {complianceIssues.filter((ci) => ci.status === "Open").map((ci) => (
              <div key={ci.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-slate-500" aria-hidden="true">assignment_late</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{ci.title}</p>
                    <p className="text-sm text-slate-600">Owner: {ci.owner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
          <h2 className="text-xl font-semibold text-slate-900">Department ESG rankings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-white text-sm font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-center">Env</th>
                <th className="px-4 py-3 text-center">Social</th>
                <th className="px-4 py-3 text-center">Gov</th>
                <th className="px-4 py-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
              {departmentStats.map((dept) => (
                <tr key={dept.rank} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-500">{dept.rank}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{dept.name}</td>
                  <td className="px-4 py-3 text-center font-semibold text-emerald-600">{dept.env}</td>
                  <td className="px-4 py-3 text-center font-semibold text-sky-600">{dept.social}</td>
                  <td className="px-4 py-3 text-center font-semibold text-amber-600">{dept.gov}</td>
                  <td className="px-4 py-3 text-center font-semibold text-primary">{dept.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
