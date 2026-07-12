"use client";

import React from "react";
import { useEsg } from "@/context/EsgContext";
import { useRouter } from "next/navigation";

export default function EmployeeDashboardView() {
  const router = useRouter();
  const {
    currentUser,
    submissions,
    acknowledgements,
    policies,
    unlockedBadges,
    badges,
  } = useEsg();

  // Calculate statistics
  const pendingPolicyCount = policies.length - acknowledgements.filter((a) => a.employeeId === currentUser.id).length;
  const activeChallengesSubmissions = submissions.filter(
    (s) => s.employeeId === currentUser.id && s.type === "challenge" && s.status !== "Approved"
  );
  
  // Calculate completed CSR activities count
  const completedCsrCount = submissions.filter(
    (s) => s.employeeId === currentUser.id && s.type === "csr" && s.status === "Approved"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Your Impact</h2>
          <p className="text-on-surface-variant mt-1">Track your contributions and level up your sustainability journey.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard?role=employee&view=employee-challenges")}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold text-label-md hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span> Log Activity
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Profile & Challenges) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card (Bento Style) */}
          <div className="bg-surface-container-lowest rounded-xl border border-border-subtle shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-container to-deep-forest opacity-20"></div>
            <div className="p-6 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-full object-cover border-4 border-surface-white shadow-sm bg-primary-container/20 flex items-center justify-center text-primary font-bold text-4xl">
                    {currentUser.name[0]}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-leaf-green text-on-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-md border-2 border-surface-white shadow-sm">
                    {currentUser.level}
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left w-full">
                  <h3 className="font-bold text-headline-sm text-on-surface">{currentUser.name}</h3>
                  <p className="text-primary font-semibold text-label-md mt-1">Level {currentUser.level} Sustainability Lead</p>
                  
                  <div className="mt-4 flex items-center justify-between mb-1">
                    <span className="font-semibold text-label-md text-on-surface-variant">XP Progress</span>
                    <span className="font-semibold text-label-md text-primary">{currentUser.xp} / 1000 XP</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-leaf-green rounded-full shadow-[0_0_8px_rgba(46,204,113,0.6)] transition-all duration-300"
                      style={{ width: `${(currentUser.xp / 1000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="shrink-0 text-center bg-surface-container-low p-4 rounded-lg border border-border-subtle min-w-[120px] w-full md:w-auto">
                <span className="material-symbols-outlined text-tertiary text-3xl mb-1">stars</span>
                <div className="font-bold text-headline-sm text-on-surface">
                  {currentUser.points.toLocaleString()}
                </div>
                <div className="font-semibold text-label-md text-on-surface-variant">pts balance</div>
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
                        <span className="material-symbols-outlined text-[#F57F17]">{badgeObj.icon}</span>
                        <div className="text-left">
                          <p className="text-xs font-bold text-on-surface leading-tight">{badgeObj.name}</p>
                          <p className="text-[9px] text-outline leading-tight">Unlocked</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Challenges List */}
          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-headline-sm text-on-surface">My Active Challenges</h3>
              <button
                onClick={() => router.push("/dashboard?role=employee&view=employee-challenges")}
                className="text-primary hover:underline text-body-sm font-semibold cursor-pointer"
              >
                Browse All
              </button>
            </div>

            {activeChallengesSubmissions.length === 0 ? (
              <div className="text-center py-8 bg-surface-container-low/30 border border-dashed border-border-subtle rounded-xl">
                <span className="material-symbols-outlined text-outline text-4xl mb-2">rocket_launch</span>
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
                  <div key={sub.id} className="border border-border-subtle rounded-xl p-4 bg-surface-container-lowest hover:shadow-sm transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-body-md text-on-surface">{sub.targetTitle}</h4>
                        <p className="text-xs text-outline mt-0.5">Enrolled</p>
                      </div>
                      <span className="bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        +{sub.xpValue} XP
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-on-surface-variant">Progress</span>
                      <span className="text-xs font-bold text-primary">{sub.progressPercent || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${sub.progressPercent || 0}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => router.push(`/dashboard?role=employee&view=employee-challenges`)}
                        className="border border-border-subtle hover:bg-surface-container-low px-4 py-1.5 rounded-lg text-xs font-semibold text-on-surface cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard?role=employee&view=employee-challenges&submit=${sub.targetId}`)}
                        className="bg-primary text-on-primary hover:bg-primary-container px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Update Progress
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Side Stats & Notifications) */}
        <div className="space-y-6">
          {/* Quick Stats Panel */}
          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="font-semibold text-headline-sm text-on-surface">Sustainability Summary</h3>
            
            {/* Stat item 1 */}
            <div className="flex items-center gap-4 p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50">
              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] shrink-0">
                <span className="material-symbols-outlined">volunteer_activism</span>
              </div>
              <div>
                <div className="font-bold text-body-lg text-on-surface">{completedCsrCount}</div>
                <div className="text-xs text-on-surface-variant font-semibold">CSR Program involvements</div>
              </div>
            </div>

            {/* Stat item 2 */}
            <div className="flex items-center gap-4 p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50">
              <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center text-[#1565C0] shrink-0">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <div className="font-bold text-body-lg text-on-surface">8.4%</div>
                <div className="text-xs text-on-surface-variant font-semibold">My ESG Contribution (Operations)</div>
              </div>
            </div>

            {/* Stat item 3 */}
            <div className="flex items-center gap-4 p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50">
              <div className="w-10 h-10 rounded-full bg-[#FFF8E1] flex items-center justify-center text-[#F57F17] shrink-0">
                <span className="material-symbols-outlined">gavel</span>
              </div>
              <div>
                <div className="font-bold text-body-lg text-on-surface">
                  {policies.length - pendingPolicyCount} / {policies.length}
                </div>
                <div className="text-xs text-on-surface-variant font-semibold">Corporate policies acknowledged</div>
              </div>
            </div>
          </div>

          {/* Pending Action Card */}
          {pendingPolicyCount > 0 && (
            <div className="bg-error-container/10 border border-error-container rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-error shrink-0 mt-0.5">warning</span>
                <div>
                  <h4 className="font-bold text-body-md text-on-error-container">Policy Acknowledgment Needed</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    You have {pendingPolicyCount} published policy directive requiring review and acknowledgment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/dashboard?role=employee&view=employee-policies")}
                className="mt-4 bg-error text-on-error hover:bg-error/90 w-full py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors text-center"
              >
                Review Policy Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
