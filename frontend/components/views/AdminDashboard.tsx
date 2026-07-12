"use client";

import React, { useState } from "react";
import { useEsg } from "@/context/EsgContext";
import AppIcon from "@/components/AppIcon";

export default function OrgDashboardView() {
  const { complianceIssues } = useEsg();
  const [trendPillar, setTrendPillar] = useState("Overall");

  const openComplianceCount = complianceIssues.filter((c) => c.status === "Open").length;

  const navigateTo = (path: string) => {
    if (typeof window !== "undefined") {
      window.location.assign(path);
    }
  };
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
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] sm:p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-safe">
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

      <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Suggested admin flow</h2>
            <p className="text-sm text-slate-500">Use this path to move from setup to reporting in the same order as the demo flow.</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-leaf-green">
            <AppIcon name="trending_up" className="text-sm font-bold" />
            <span className="font-semibold text-label-md">+2.4% vs last quarter</span>
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
                <AppIcon name="arrow_upward" className="text-sm" />
                <span>+4.1 vs Q1</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{step.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-card p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-safe">
              <p className="text-sm font-semibold text-slate-500">Overall ESG score</p>
              <h2 className="text-xl font-semibold text-slate-900">Balanced performance</h2>
            </div>
            <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">+2.4% QoQ</span>
          </div>

          {/* Social */}
          <div className="bg-surface-container-lowest rounded-xl border border-border-subtle p-6 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center text-[#1565C0]">
                <AppIcon name="group" />
              </div>
            </div>
            <div>
              <div className="font-bold text-headline-lg text-on-surface mb-1">{socialScore}</div>
              <div className="flex items-center gap-1 text-[#1565C0] font-semibold text-label-md">
                <AppIcon name="arrow_upward" className="text-sm" />
                <span>+1.2 vs Q1</span>
              </div>
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
                <AppIcon name="arrow_downward" className="text-sm" />
                <span>-0.8 vs Q1</span>
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
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-safe">
              <h2 className="text-xl font-semibold text-slate-900">6-month ESG trend</h2>
              <p className="text-sm text-slate-500">Performance movement for {trendPillar.toLowerCase()}.</p>
            </div>
            <select value={trendPillar} onChange={(e) => setTrendPillar(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none focus:border-primary sm:w-auto">
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
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-safe">
              <h2 className="text-xl font-semibold text-slate-900">Compliance alerts</h2>
              <p className="text-sm text-slate-500">Immediate follow-up items</p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600">{openComplianceCount + 1} active</span>
          </div>
          <div className="space-y-4 flex-grow overflow-y-auto max-h-[220px] hide-scrollbar">
            {/* Alert 1 */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-error-container bg-error-container/10">
              <AppIcon name="warning" className="text-error mt-0.5" />
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

      <div className="panel-card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-5 sm:px-6">
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
