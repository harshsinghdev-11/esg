"use client";

import React, { useState, useEffect } from "react";
import { useEsg } from "@/context/EsgContext";
import { useSearchParams } from "next/navigation";
import AppIcon from "@/components/AppIcon";

interface GamificationViewsProps {
  activeTab: "challenges" | "approvals" | "badges" | "rewards-admin" | "rewards-employee" | "employee-challenges" | "employee-badges" | "employee-rewards" | "leaderboard";
}

export default function GamificationViews({ activeTab }: GamificationViewsProps) {
  const searchParams = useSearchParams();
  const {
    currentUser,
    challenges,
    submissions,
    badges,
    unlockedBadges,
    rewards,
    redemptions,
    employees,
    createChallenge,
    activateChallenge,
    approveSubmission,
    rejectSubmission,
    joinChallenge,
    submitChallengeProgress,
    redeemReward,
    createReward,
  } = useEsg();

  // Local Form / UI States
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [showRewardForm, setShowRewardForm] = useState(false);
  
  // Challenge creation states
  const [chTitle, setChTitle] = useState("");
  const [chCat, setChCat] = useState("Energy Saving");
  const [chXp, setChXp] = useState(100);
  const [chPoints, setChPoints] = useState(100);
  const [chDiff, setChDiff] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [chEvid, setChEvid] = useState(true);
  const [chDead, setChDead] = useState("");

  // Reward creation states
  const [rwTitle, setRwTitle] = useState("");
  const [rwCost, setRwCost] = useState(200);
  const [rwStock, setRwStock] = useState(10);

  // Submit Progress inline state
  const [submitProgressId, setSubmitProgressId] = useState<string | null>(null);
  const [progressVal, setProgressVal] = useState(50);
  const [proofUrl, setProofUrl] = useState("");

  // Reward Redemption Confirmation modal state
  const [confirmRedemptionId, setConfirmRedemptionId] = useState<string | null>(null);

  // Check if a challenge ID was passed via URL parameters to pre-open submission panel (convenient for employee log activity links)
  useEffect(() => {
    const preOpenSubId = searchParams.get("submit");
    if (preOpenSubId) {
      setSubmitProgressId(preOpenSubId);
    }
  }, [searchParams]);

  // Form submit handlers
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (chTitle && chDead) {
      createChallenge(chTitle, chCat, Number(chXp), Number(chPoints), chDiff, chEvid, chDead);
      setChTitle("");
      setChDead("");
      setShowChallengeForm(false);
    }
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (rwTitle) {
      createReward(rwTitle, Number(rwCost), Number(rwStock));
      setRwTitle("");
      setShowRewardForm(false);
    }
  };

  const handleSubmitProgress = (e: React.FormEvent, chId: string) => {
    e.preventDefault();
    if (proofUrl) {
      submitChallengeProgress(chId, Number(progressVal), proofUrl);
      setProofUrl("");
      setSubmitProgressId(null);
    }
  };

  const triggerRedemption = (rewardId: string) => {
    redeemReward(rewardId);
    setConfirmRedemptionId(null);
  };

  // Determine current view context
  const currentViewTab = currentUser.role === "employee" ? activeTab : activeTab;

  return (
    <div className="space-y-6">
      {/* 1. Challenges List (Admin view) */}
      {currentViewTab === "challenges" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Employee ESG Challenges</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Manage gamified sustainability challenges</p>
            </div>
            <button
              onClick={() => setShowChallengeForm(!showChallengeForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppIcon name="add" className="text-sm font-bold" />
              {showChallengeForm ? "Cancel" : "Add Challenge"}
            </button>
          </div>

          {showChallengeForm && (
            <form onSubmit={handleCreateChallenge} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-lg space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Create New Sustainability Challenge</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={chTitle}
                  onChange={(e) => setChTitle(e.target.value)}
                  placeholder="e.g. Zero-Waste Printing Week"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Category</label>
                  <select
                    value={chCat}
                    onChange={(e) => setChCat(e.target.value)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option>Energy Saving</option>
                    <option>Waste Reduction</option>
                    <option>Green Travel</option>
                    <option>Sustainable Printing</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Difficulty</label>
                  <select
                    value={chDiff}
                    onChange={(e) => setChDiff(e.target.value as any)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">XP Reward</label>
                  <input
                    type="number"
                    required
                    value={chXp}
                    onChange={(e) => setChXp(Number(e.target.value))}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Points Reward</label>
                  <input
                    type="number"
                    required
                    value={chPoints}
                    onChange={(e) => setChPoints(Number(e.target.value))}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Deadline</label>
                  <input
                    type="date"
                    required
                    value={chDead}
                    onChange={(e) => setChDead(e.target.value)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chEvid"
                    checked={chEvid}
                    onChange={(e) => setChEvid(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded"
                  />
                  <label htmlFor="chEvid" className="font-semibold text-xs text-on-surface cursor-pointer">
                    Requires photo proof upload
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Save Challenge Draft
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Challenge Name</th>
                  <th className="p-4 py-3">Difficulty</th>
                  <th className="p-4 py-3 text-center">XP / Points Value</th>
                  <th className="p-4 py-3">Deadline</th>
                  <th className="p-4 py-3">Status</th>
                  <th className="p-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {challenges.map((ch) => (
                  <tr key={ch.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 font-semibold">{ch.title}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          ch.difficulty === "Hard"
                            ? "bg-error-container text-error"
                            : ch.difficulty === "Medium"
                            ? "bg-[#FFF8E1] text-[#F57F17]"
                            : "bg-[#E8F5E9] text-[#2E7D32]"
                        }`}
                      >
                        {ch.difficulty}
                      </span>
                    </td>
                    <td className="p-4 text-center font-semibold text-primary">
                      +{ch.xp} XP / +{ch.points} pts
                    </td>
                    <td className="p-4 text-outline">{ch.deadline}</td>
                    <td className="p-4 font-bold text-on-surface-variant">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          ch.status === "Active"
                            ? "bg-leaf-green/10 text-[#2E7D32]"
                            : "bg-surface-container-high text-outline"
                        }`}
                      >
                        {ch.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {ch.status === "Draft" ? (
                        <button
                          onClick={() => activateChallenge(ch.id)}
                          className="bg-primary text-on-primary hover:bg-primary-container px-3 py-1 rounded text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                        >
                          Activate
                        </button>
                      ) : (
                        <span className="text-xs text-outline italic">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Employee Challenges (Join / Submit progress) */}
      {currentViewTab === "employee-challenges" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Available ESG Challenges</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Enroll in weekly challenges, track your progress, and secure XP rewards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.filter(c => c.status === "Active").map((ch) => {
              const empSub = submissions.find(
                (s) => s.employeeId === currentUser.id && s.targetId === ch.id && s.type === "challenge"
              );

              return (
                <div key={ch.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-primary-container/10 text-primary-container px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                        {ch.category}
                      </span>
                      <h3 className="font-bold text-body-md text-on-surface mt-2">{ch.title}</h3>
                      <p className="text-xs text-outline flex items-center gap-1 mt-1 font-semibold">
                        <AppIcon name="calendar_today" className="text-xs" />
                        Ends: {ch.deadline}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-primary font-bold text-body-md block">+{ch.xp} XP</span>
                      <span className="text-outline text-xs block">+{ch.points} pts</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle/50">
                    {!empSub ? (
                      <button
                        onClick={() => joinChallenge(ch.id)}
                        className="bg-primary text-on-primary hover:bg-primary-container w-full py-2 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center"
                      >
                        Join Challenge
                      </button>
                    ) : empSub.status === "Pending" && !empSub.proofUrl ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#F57F17] font-semibold flex items-center gap-1">
                            <AppIcon name="schedule" className="text-sm" />
                            Joined (Pending Completion Proof)
                          </span>
                          <span className="font-bold text-primary">{empSub.progressPercent || 0}% Completed</span>
                        </div>

                        {submitProgressId === ch.id ? (
                          <form onSubmit={(e) => handleSubmitProgress(e, ch.id)} className="space-y-3 bg-surface-container-low p-3 rounded-lg border border-border-subtle">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-on-surface">Update Progress: {progressVal}%</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={progressVal}
                                onChange={(e) => setProgressVal(Number(e.target.value))}
                                className="w-full h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-on-surface">Verification Proof (Photo/Document)</label>
                              <input
                                type="text"
                                required
                                value={proofUrl}
                                onChange={(e) => setProofUrl(e.target.value)}
                                placeholder="e.g. proof_recycling_bin.jpg"
                                className="w-full bg-surface-white border border-border-subtle rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full bg-primary text-on-primary hover:bg-primary-container py-1.5 rounded text-xs font-semibold cursor-pointer active:scale-95"
                            >
                              Submit Verification Log
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setSubmitProgressId(ch.id);
                              setProgressVal(empSub.progressPercent || 50);
                            }}
                            className="bg-leaf-green text-deep-forest w-full py-2 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center"
                          >
                            Update Progress & Submit Proof
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-surface-container-low px-3 py-2 rounded-lg">
                        <span className="text-xs text-on-surface-variant font-semibold flex items-center gap-1">
                          <AppIcon name="check_circle" className="text-sm" />
                          Status:
                        </span>
                        <span
                          className={`text-xs font-bold uppercase ${
                            empSub.status === "Approved"
                              ? "text-leaf-green"
                              : empSub.status === "Rejected"
                              ? "text-error"
                              : "text-[#F57F17]"
                          }`}
                        >
                          {empSub.status === "Pending" ? "Awaiting Verification" : empSub.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Approvals Queue (Admin view) */}
      {currentViewTab === "approvals" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Approvals Queue</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Review pending challenge and CSR submissions from employees</p>
          </div>

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            {submissions.filter(s => s.status === "Pending").length === 0 ? (
              <div className="text-center py-10 text-body-sm text-outline italic">
                All employee submissions are processed. No pending approvals!
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {submissions.filter(s => s.status === "Pending").map((sub) => (
                  <div key={sub.id} className="p-4 hover:bg-surface-container-low/30 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-body-sm text-on-surface">{sub.employeeName}</span>
                        <span className="text-xs text-outline">•</span>
                        <span className="text-xs bg-primary-container/10 text-primary-container px-2 py-0.5 rounded-full font-bold uppercase">
                          {sub.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-body-md text-primary">{sub.targetTitle}</h4>
                      {sub.progressPercent !== undefined && (
                        <p className="text-xs text-on-surface font-semibold">Reported Progress: {sub.progressPercent}%</p>
                      )}
                      {sub.proofUrl && (
                        <p className="text-xs text-outline font-semibold flex items-center gap-1">
                          <AppIcon name="attachment" className="text-xs" />
                          Proof: <span className="underline text-primary">{sub.proofUrl}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => approveSubmission(sub.id)}
                        className="bg-leaf-green text-deep-forest px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all hover:bg-leaf-green/90 w-full md:w-auto text-center"
                      >
                        Approve & Reward
                      </button>
                      <button
                        onClick={() => rejectSubmission(sub.id)}
                        className="bg-error-container text-on-error-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all hover:bg-error-container/80 w-full md:w-auto text-center"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Badges Gallery (Employee & Admin view) */}
      {(currentViewTab === "badges" || currentViewTab === "employee-badges") && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Sustainability Badges Cabinet</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Acquire and display unique badges as milestones are reached</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge) => {
              const isUnlocked = unlockedBadges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`border rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center transition-all ${
                    isUnlocked
                      ? "border-primary bg-surface-container-lowest hover:shadow-md"
                      : "border-border-subtle bg-surface-container-low/40 grayscale opacity-55"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-4 relative ${
                      isUnlocked ? "bg-primary-container text-on-primary-container" : "bg-surface-container-high text-outline"
                    }`}
                  >
                    <AppIcon name={badge.icon} className="text-4xl" />
                    {!isUnlocked && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-inverse-surface border-2 border-surface-white flex items-center justify-center">
                        <AppIcon name="lock" className="text-[10px] text-inverse-on-surface font-bold" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-body-md text-on-surface">{badge.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-2 min-h-[40px] leading-relaxed">{badge.description}</p>
                  
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase mt-4 tracking-wider ${
                      isUnlocked ? "bg-leaf-green text-deep-forest" : "bg-surface-container-high text-outline"
                    }`}
                  >
                    {isUnlocked ? "Unlocked!" : "Locked"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Rewards Catalog (Admin view) */}
      {currentViewTab === "rewards-admin" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Rewards Management</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Configure redeemable items in employee rewards catalog</p>
            </div>
            <button
              onClick={() => setShowRewardForm(!showRewardForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppIcon name="add" className="text-sm font-bold" />
              {showRewardForm ? "Cancel" : "Add Reward Item"}
            </button>
          </div>

          {showRewardForm && (
            <form onSubmit={handleCreateReward} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Add Catalog Reward Item</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Reward Title</label>
                <input
                  type="text"
                  required
                  value={rwTitle}
                  onChange={(e) => setRwTitle(e.target.value)}
                  placeholder="e.g. EcoSphere Reusable Tumbler"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Cost (Points value)</label>
                  <input
                    type="number"
                    required
                    value={rwCost}
                    onChange={(e) => setRwCost(Number(e.target.value))}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={rwStock}
                    onChange={(e) => setRwStock(Number(e.target.value))}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Publish Reward
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Reward Item</th>
                  <th className="p-4 py-3">Points Cost</th>
                  <th className="p-4 py-3 text-right">Available Stock</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {rewards.map((rw) => (
                  <tr key={rw.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 font-semibold">{rw.title}</td>
                    <td className="p-4 font-bold text-primary">{rw.cost} pts</td>
                    <td className="p-4 text-right font-bold text-on-surface-variant">{rw.stock} items left</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Rewards Catalog (Employee view) */}
      {currentViewTab === "employee-rewards" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-border-subtle/50">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Rewards Exchange</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Exchange your accumulated sustainability points for real-world rewards</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle flex items-center gap-2">
              <AppIcon name="stars" className="text-tertiary text-2xl" />
              <div>
                <span className="font-bold text-body-lg text-on-surface block leading-none">{currentUser.points}</span>
                <span className="text-[10px] text-outline font-semibold">my points balance</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rewards.map((rw) => (
              <div key={rw.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-body-md text-on-surface">{rw.title}</h3>
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0">
                      {rw.cost} Points
                    </span>
                  </div>
                  <p className="text-xs text-outline font-semibold">Stock: {rw.stock} available</p>
                </div>
                
                <div className="p-5 pt-0">
                  <button
                    disabled={rw.stock <= 0 || currentUser.points < rw.cost}
                    onClick={() => setConfirmRedemptionId(rw.id)}
                    className={`w-full py-2 rounded-lg text-xs font-semibold text-center transition-all ${
                      rw.stock <= 0
                        ? "bg-surface-container-high text-outline cursor-not-allowed"
                        : currentUser.points < rw.cost
                        ? "bg-surface-container-high text-outline cursor-not-allowed"
                        : "bg-primary text-on-primary hover:bg-primary-container cursor-pointer active:scale-95"
                    }`}
                  >
                    {rw.stock <= 0 ? "Out of Stock" : currentUser.points < rw.cost ? "Insufficient Points" : "Redeem Item"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Redemption History */}
          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-headline-sm text-on-surface mb-4">My Redemptions History</h3>
            {redemptions.length === 0 ? (
              <div className="text-body-sm text-outline italic">No redemptions logged.</div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {redemptions.map((red) => (
                  <div key={red.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-body-sm text-on-surface">{red.rewardTitle}</h4>
                      <span className="text-xs text-outline">{red.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-error font-bold text-body-sm block">-{red.cost} pts</span>
                      <span className="text-[10px] text-leaf-green font-semibold capitalize">{red.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Leaderboard (Shared view) */}
      {currentViewTab === "leaderboard" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Global ESG Leaderboard</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Ranking employees by accumulated points and XP levels</p>
          </div>

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Rank</th>
                  <th className="p-4 py-3">Employee</th>
                  <th className="p-4 py-3">Department</th>
                  <th className="p-4 py-3 text-right">Points Score</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {/* Dynamically build ranking list based on users list and current user details */}
                {[
                  { id: "adm_1", name: "Sarah Chen", department: "Executive", points: 9999 },
                  { id: "emp_3", name: "John Doe", department: "Operations", points: 3100 },
                  { id: "emp_1", name: currentUser.name, department: "Operations", points: currentUser.role === "employee" ? currentUser.points : 2450 },
                  { id: "emp_4", name: "Jane Smith", department: "HR", points: 1200 },
                  { id: "emp_5", name: "Robert Lee", department: "Manufacturing", points: 950 },
                ].sort((a, b) => b.points - a.points).map((user, index) => {
                  const isSelf = user.name === currentUser.name && currentUser.role === "employee";
                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${
                        isSelf ? "bg-primary-container/10 hover:bg-primary-container/15 font-semibold" : "hover:bg-surface-container-low/30"
                      }`}
                    >
                      <td className="p-4 font-bold text-on-surface-variant">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        <span>{user.name}</span>
                        {isSelf && (
                          <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-outline">{user.department}</td>
                      <td className="p-4 text-right font-bold text-primary">{user.points.toLocaleString()} pts</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reward Confirmation Modal */}
      {confirmRedemptionId && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-white border border-border-subtle rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center space-y-2">
              <AppIcon name="stars" className="text-[#F57F17] text-[48px]" />
              <h3 className="font-bold text-headline-sm text-on-surface">Redeem Reward?</h3>
              {(() => {
                const rw = rewards.find((r) => r.id === confirmRedemptionId);
                if (!rw) return null;
                return (
                  <>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">
                      Confirm exchange of <span className="font-bold text-primary">{rw.cost} points</span> for the
                      <span className="font-bold block text-on-surface mt-1">'{rw.title}'</span>?
                    </p>
                    <p className="text-xs text-outline">This action cannot be undone.</p>
                  </>
                );
              })()}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmRedemptionId(null)}
                className="flex-1 border border-border-subtle hover:bg-surface-container-low py-2 rounded-lg text-xs font-semibold text-on-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => triggerRedemption(confirmRedemptionId)}
                className="flex-1 bg-primary hover:bg-primary-container text-on-primary py-2 rounded-lg text-xs font-semibold cursor-pointer active:scale-95"
              >
                Confirm Exchange
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
