"use client";

import React from "react";
import { useEsg } from "@/context/EsgContext";
import { useRouter } from "next/navigation";
import AppIcon from "@/components/AppIcon";

export default function EmployeeDashboardView() {
  const {
    currentUser,
    submissions,
    acknowledgements,
    policies,
    unlockedBadges,
    badges,
  } = useEsg();

  const pendingPolicyCount = policies.length - acknowledgements.filter((a) => a.employeeId === currentUser.id).length;

  const navigateTo = (path: string) => {
    if (typeof window !== "undefined") {
      window.location.assign(path);
    }
  };
  const activeChallengesSubmissions = submissions.filter(
    (s) => s.employeeId === currentUser.id && s.type === "challenge" && s.status !== "Approved"
  );
  const completedCsrCount = submissions.filter(
    (s) => s.employeeId === currentUser.id && s.type === "csr" && s.status === "Approved"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] sm:p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-safe">
          <div className="mb-2 inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Your impact
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Keep your sustainability momentum visible.</h2>
          <p className="mt-1 text-sm text-slate-500">Monitor your active work, recent recognition, and the next actions that matter most.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard?role=employee&view=employee-challenges")}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold text-label-md hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <AppIcon name="add" className="text-sm font-bold" /> Log Activity
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Your employee flow</h3>
            <p className="text-sm text-slate-500">Follow the core loop from acknowledgement to rewards with a single path through the workspace.</p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Acknowledge → Participate → Earn → Redeem
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Review policies", description: "Acknowledge new guidance", action: () => navigateTo("/dashboard?role=employee&view=employee-policies"), icon: "gavel" },
            { title: "Join CSR", description: "Participate in social activities", action: () => navigateTo("/dashboard?role=employee&view=employee-csr-activities"), icon: "volunteer_activism" },
            { title: "Track challenges", description: "Submit progress and evidence", action: () => navigateTo("/dashboard?role=employee&view=employee-challenges"), icon: "emoji_events" },
            { title: "Redeem rewards", description: "Spend points on available rewards", action: () => navigateTo("/dashboard?role=employee&view=employee-rewards"), icon: "redeem" },
          ].map((step) => (
            <button key={step.title} onClick={step.action} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:border-primary hover:bg-white">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{step.icon}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
              <p className="mt-1 text-sm text-slate-500">{step.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="panel-card overflow-hidden">
            <div className="bg-[linear-gradient(135deg,#0d3d1b_0%,#0b5c41_55%,#0b3f2d_100%)] p-6 text-white">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-3xl font-semibold">
                    {currentUser.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100/75">Sustainability lead</p>
                    <h3 className="text-2xl font-semibold">{currentUser.name}</h3>
                    <p className="text-sm text-emerald-50/80">Level {currentUser.level} • {currentUser.xp} XP</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
                  <p className="text-2xl font-semibold">{currentUser.points.toLocaleString()}</p>
                  <p className="text-sm text-emerald-50/80">points balance</p>
                </div>
              </div>
              
              <div className="shrink-0 text-center bg-surface-container-low p-4 rounded-lg border border-border-subtle min-w-[120px] w-full md:w-auto">
                <AppIcon name="stars" className="text-tertiary text-3xl mb-1" />
                <div className="font-bold text-headline-sm text-on-surface">
                  {currentUser.points.toLocaleString()}
                </div>
                <span className="text-sm font-semibold text-primary">{currentUser.xp} / 1000 XP</span>
              </div>
            </div>
            
            {/* Badges Row */}
            <div className="px-6 pb-6 pt-3 border-t border-border-subtle bg-surface-container-low/30">
              <h4 className="font-semibold text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Recent Badges</h4>
              {unlockedBadges.length === 0 ? (
                <div className="text-body-sm text-outline italic">No badges unlocked yet. Join challenges to earn badges!</div>
              ) : (
                <div className="flex gap-4 overflow-x-auto hide-scrollbar py-1">
                  {unlockedBadges.map((badgeId) => {
                    const badgeObj = badges.find((b) => b.id === badgeId);
                    if (!badgeObj) return null;
                    return (
                      <div
                        key={badgeId}
                        className="flex items-center gap-2 bg-surface-white border border-border-subtle rounded-lg px-3 py-1.5 shrink-0 shadow-sm"
                      >
                        <AppIcon name={badgeObj.icon} className="text-[#F57F17]" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-on-surface leading-tight">{badgeObj.name}</p>
                          <p className="text-[9px] text-outline leading-tight">Unlocked</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="panel-card p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-safe">
                <h3 className="text-xl font-semibold text-slate-900">My active challenges</h3>
                <p className="text-sm text-slate-500">Stay on top of what’s in motion.</p>
              </div>
              <button onClick={() => navigateTo("/dashboard?role=employee&view=employee-challenges")} className="text-sm font-semibold text-primary hover:underline">
                Browse all
              </button>
            </div>

            {activeChallengesSubmissions.length === 0 ? (
              <div className="text-center py-8 bg-surface-container-low/30 border border-dashed border-border-subtle rounded-xl">
                <AppIcon name="rocket_launch" className="text-outline text-4xl mb-2" />
                <p className="text-body-sm text-on-surface-variant font-semibold">No active challenges</p>
                <p className="text-xs text-outline mt-1 mb-4">Join active challenges to start earning XP and rewards.</p>
                <button
                  onClick={() => router.push("/dashboard?role=employee&view=employee-challenges")}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  Join a Challenge
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeChallengesSubmissions.map((sub) => (
                  <div key={sub.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{sub.targetTitle}</h4>
                        <p className="text-sm text-slate-500">Current status: {sub.status}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">+{sub.xpValue} XP</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-semibold text-primary">{sub.progressPercent || 0}%</span>
                    </div>
                    <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${sub.progressPercent || 0}%` }} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => navigateTo(`/dashboard?role=employee&view=employee-challenges`)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                        Details
                      </button>
                      <button onClick={() => navigateTo(`/dashboard?role=employee&view=employee-challenges&submit=${sub.targetId}`)} className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-container">
                        Update progress
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Stats Panel */}
          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="font-semibold text-headline-sm text-on-surface">Sustainability Summary</h3>
            
            {/* Stat item 1 */}
            <div className="flex items-center gap-4 p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50">
              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] shrink-0">
                <AppIcon name="volunteer_activism" />
              </div>
              <div>
                <div className="font-bold text-body-lg text-on-surface">{completedCsrCount}</div>
                <div className="text-xs text-on-surface-variant font-semibold">CSR Program involvements</div>
              </div>
            </div>

            {/* Stat item 2 */}
            <div className="flex items-center gap-4 p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50">
              <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center text-[#1565C0] shrink-0">
                <AppIcon name="trending_up" />
              </div>
              <div>
                <div className="font-bold text-body-lg text-on-surface">8.4%</div>
                <div className="text-xs text-on-surface-variant font-semibold">My ESG Contribution (Operations)</div>
              </div>
            </div>

            {/* Stat item 3 */}
            <div className="flex items-center gap-4 p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50">
              <div className="w-10 h-10 rounded-full bg-[#FFF8E1] flex items-center justify-center text-[#F57F17] shrink-0">
                <AppIcon name="gavel" />
              </div>
              <div>
                <div className="font-bold text-body-lg text-on-surface">
                  {policies.length - pendingPolicyCount} / {policies.length}
                </div>
              ))}
            </div>
          </div>

          {pendingPolicyCount > 0 && (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-5">
              <div className="flex items-start gap-3">
                <AppIcon name="warning" className="text-error shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Policy acknowledgement needed</h4>
                  <p className="mt-1 text-sm text-slate-600">You have {pendingPolicyCount} policy update{pendingPolicyCount > 1 ? "s" : ""} waiting for review.</p>
                </div>
              </div>
              <button onClick={() => navigateTo("/dashboard?role=employee&view=employee-policies")} className="mt-4 w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
                Review policy now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
