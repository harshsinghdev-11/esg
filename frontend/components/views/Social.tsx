"use client";

import React, { useEffect, useState } from "react";
import { useEsg } from "@/context/EsgContext";
import { useRouter } from "next/navigation";
import AppIcon from "@/components/AppIcon";

interface SocialViewsProps {
  activeTab: "dashboard" | "csr-list" | "employee-csr" | "diversity" | "training";
}

export default function SocialViews({ activeTab }: SocialViewsProps) {
  const router = useRouter();
  const {
    currentUser,
    csrActivities,
    submissions,
    socialSummary,
    categories,
    joinActivity,
    submitActivityProof,
    approveSubmission,
    rejectSubmission,
    createCsrActivity,
    departments,
  } = useEsg();

  // Local UI States
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  
  // Create Activity form states
  const [actTitle, setActTitle] = useState("");
  const [actCat, setActCat] = useState("Tree Plantation");
  const [actDate, setActDate] = useState("");
  const [actDept, setActDept] = useState("");
  const [actPoints, setActPoints] = useState(100);

  // Submit proof form states
  const [showProofFormId, setShowProofFormId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (actTitle && actDate && actCat) {
      createCsrActivity(actTitle, actCat, actDate, actDept, Number(actPoints));
      setActTitle("");
      setActDate("");
      setShowActivityForm(false);
    }
  };

  const handleSubmitProof = (e: React.FormEvent, actId: string) => {
    e.preventDefault();
    if (proofUrl) {
      submitActivityProof(actId, proofUrl);
      setProofUrl("");
      setShowProofFormId(null);
    }
  };

  // Get current active view
  const currentViewTab = currentUser.role === "employee" ? "employee-csr" : activeTab;
  const adminTabs = [
    { label: "Dashboard", view: "social-dashboard" },
    { label: "CSR Activities", view: "csr-activities" },
  ];

  useEffect(() => {
    if (!actCat && categories.csr.length > 0) {
      setActCat(categories.csr[0]);
    }
  }, [actCat, categories.csr]);

  useEffect(() => {
    if (!actDept && departments.length > 0) {
      setActDept(departments[0].name);
    }
  }, [actDept, departments]);

  return (
    <div className="space-y-6">
      {currentUser.role !== "employee" && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-border-subtle bg-surface-container-lowest p-2 shadow-sm">
          {adminTabs.map((tab) => {
            const isActive =
              (currentViewTab === "dashboard" && tab.view === "social-dashboard") ||
              (currentViewTab === "csr-list" && tab.view === "csr-activities");

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
      )}

      {currentViewTab === "dashboard" && (
        <div className="space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Social Impact Analytics</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Diversity, training, and community engagement indicators</p>
            </div>
            <button
              onClick={() => router.push("/dashboard?view=reports")}
              className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg font-semibold text-label-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              Export Stats
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <AppIcon name="volunteer_activism" className="text-4xl text-primary mb-2 block" />
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Community Hours</h3>
              <div className="font-bold text-headline-lg text-primary">{socialSummary?.approvedCsrParticipations ?? 0}</div>
              <span className="text-xs text-leaf-green font-semibold mt-1 block">Approved CSR participations</span>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <AppIcon name="school" className="text-4xl text-primary mb-2 block" />
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Training Completion</h3>
              <div className="font-bold text-headline-lg text-primary">{Number(socialSummary?.challengeParticipationRate ?? 0).toFixed(1)}%</div>
              <div className="w-full bg-surface-container-high h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-leaf-green h-full" style={{ width: `${Math.min(100, Number(socialSummary?.challengeParticipationRate ?? 0))}%` }}></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <AppIcon name="diversity_3" className="text-4xl text-primary mb-2 block" />
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Diversity Index</h3>
              <div className="font-bold text-headline-lg text-primary">{Number(socialSummary?.combinedSocialEngagementRate ?? 0).toFixed(1)} / 100</div>
              <span className="text-xs text-outline font-semibold mt-1 block">Combined engagement rate</span>
            </div>
          </div>
        </div>
      )}

      {currentViewTab === "diversity" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Diversity & Inclusion Metrics</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Breakdown of organizational workforce parameters</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-body-md text-on-surface mb-4">Workforce Gender Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-body-sm font-semibold mb-1">
                    <span>Female</span>
                    <span className="font-bold">42%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-[#79526f] h-full" style={{ width: "42%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-body-sm font-semibold mb-1">
                    <span>Male</span>
                    <span className="font-bold">54%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: "54%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-body-sm font-semibold mb-1">
                    <span>Non-binary / Undisclosed</span>
                    <span className="font-bold">4%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-[#bdc9c9] h-full" style={{ width: "4%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-body-md text-on-surface mb-4">Representation in Leadership</h3>
              <div className="flex justify-around items-center h-44">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center font-bold text-lg text-primary">
                    38%
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant block mt-2">Women in Exec Roles</span>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-leaf-green flex items-center justify-center font-bold text-lg text-leaf-green">
                    15%
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant block mt-2">Minority Board Rep</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentViewTab === "training" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Employee Training Records</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Compliance rates on environmental and social guidelines</p>
          </div>

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Training Course Name</th>
                  <th className="p-4 py-3">Topic Category</th>
                  <th className="p-4 py-3">Compliance Rate</th>
                  <th className="p-4 py-3 text-right">Target Deadline</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-semibold">ESG Foundations Briefing</td>
                  <td className="p-4">Governance</td>
                  <td className="p-4 text-leaf-green font-bold">100%</td>
                  <td className="p-4 text-right text-outline">Completed</td>
                </tr>
                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-semibold">Office Waste Management Practices</td>
                  <td className="p-4">Environmental</td>
                  <td className="p-4 font-bold text-primary">88%</td>
                  <td className="p-4 text-right text-outline">2026-08-01</td>
                </tr>
                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-semibold">Workspace Safety Protocols</td>
                  <td className="p-4">Social</td>
                  <td className="p-4 font-bold text-[#F57F17]">91%</td>
                  <td className="p-4 text-right text-outline">2026-07-25</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentViewTab === "csr-list" && !selectedActivityId && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">CSR Program Activities</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Manage corporate social responsibility drives</p>
            </div>
            <button
              onClick={() => setShowActivityForm(!showActivityForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppIcon name="add" className="text-sm font-bold" />
              {showActivityForm ? "Cancel" : "Add Activity"}
            </button>
          </div>

          {showActivityForm && (
            <form onSubmit={handleCreateActivity} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Schedule New CSR Activity</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Activity Title</label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  placeholder="e.g. Annual Blood Donation Camp"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Category</label>
                  <select
                    value={actCat}
                    onChange={(e) => setActCat(e.target.value)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    {categories.csr.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Points Value</label>
                  <input
                    type="number"
                    required
                    value={actPoints}
                    onChange={(e) => setActPoints(Number(e.target.value))}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Target Date</label>
                  <input
                    type="date"
                    required
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Organizer Department</label>
                  <select
                    value={actDept}
                    onChange={(e) => setActDept(e.target.value)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
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
                Schedule Activity
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Activity</th>
                  <th className="p-4 py-3">Category</th>
                  <th className="p-4 py-3">Date</th>
                  <th className="p-4 py-3">Organizer</th>
                  <th className="p-4 py-3">Points value</th>
                  <th className="p-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {csrActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 font-semibold">{act.title}</td>
                    <td className="p-4">{act.category}</td>
                    <td className="p-4 text-outline">{act.date}</td>
                    <td className="p-4">{act.department}</td>
                    <td className="p-4 text-primary font-bold">+{act.points} pts</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedActivityId(act.id)}
                        className="text-primary hover:underline font-semibold cursor-pointer"
                      >
                        Inspect Proofs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSR Activity Detail Page (Admin proof verification) */}
      {currentViewTab === "csr-list" && selectedActivityId && (
        <div className="space-y-6">
          {(() => {
            const act = csrActivities.find((a) => a.id === selectedActivityId);
            if (!act) return null;

            // Get submissions related to this CSR activity
            const actSubmissions = submissions.filter(
              (s) => s.targetId === selectedActivityId && s.type === "csr"
            );

            return (
              <div className="space-y-6 bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start pb-4 border-b border-border-subtle">
                  <div>
                    <button
                      onClick={() => setSelectedActivityId(null)}
                      className="text-primary hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer mb-2"
                    >
                      <AppIcon name="arrow_back" className="text-xs" />
                      Back to activities list
                    </button>
                    <h3 className="font-bold text-headline-sm text-on-surface">{act.title}</h3>
                    <p className="text-xs text-outline mt-1 uppercase tracking-wider font-semibold">
                      Category: {act.category} | Scheduled: {act.date}
                    </p>
                  </div>
                  <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-semibold">
                    {act.points} Points
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-body-sm text-on-surface mb-3">Employee Participation Proof Submissions</h4>
                  {actSubmissions.length === 0 ? (
                    <div className="text-center py-6 text-body-sm text-outline italic bg-surface-container-low/20 rounded-xl border border-dashed border-border-subtle">
                      No proofs submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {actSubmissions.map((sub) => (
                        <div key={sub.id} className="border border-border-subtle rounded-lg p-4 bg-surface-container-low/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-body-sm text-on-surface">{sub.employeeName}</p>
                            <p className="text-xs text-outline">Submitted on {sub.date}</p>
                            {sub.proofUrl && (
                              <p className="text-xs font-semibold text-primary mt-1 flex items-center gap-1">
                                <AppIcon name="attachment" className="text-xs" />
                                Proof Attachment: <span className="underline">{sub.proofUrl}</span>
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {sub.status === "Pending" ? (
                              <>
                                <button
                                  onClick={() => approveSubmission(sub.id)}
                                  className="bg-leaf-green text-deep-forest px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all hover:bg-leaf-green/90"
                                >
                                  Approve & Credit
                                </button>
                                <button
                                  onClick={() => rejectSubmission(sub.id)}
                                  className="bg-error-container text-on-error-container px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all hover:bg-error-container/80"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                                  sub.status === "Approved"
                                    ? "bg-leaf-green/10 text-[#2E7D32]"
                                    : "bg-error-container text-error"
                                }`}
                              >
                                {sub.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Employee View: Join CSR and upload proofs */}
      {currentViewTab === "employee-csr" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">CSR Activity Enrollment</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Register for community-driven CSR tasks and earn points</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {csrActivities.map((act) => {
              // Find if employee joined this activity
              const empSub = submissions.find(
                (s) => s.employeeId === currentUser.id && s.targetId === act.id && s.type === "csr"
              );

              return (
                <div key={act.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-primary-container/10 text-primary-container px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                        {act.category}
                      </span>
                      <h3 className="font-bold text-body-md text-on-surface mt-2">{act.title}</h3>
                      <p className="text-xs text-outline flex items-center gap-1 mt-1 font-semibold">
                        <AppIcon name="calendar_today" className="text-xs" />
                        Scheduled: {act.date}
                      </p>
                    </div>
                    <span className="text-primary font-bold text-body-md">+{act.points} pts</span>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle/50">
                    {!empSub ? (
                      <button
                        onClick={() => joinActivity(act.id)}
                        className="bg-primary text-on-primary hover:bg-primary-container w-full py-2 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center"
                      >
                        Join Activity
                      </button>
                    ) : empSub.status === "Pending" && !empSub.proofUrl ? (
                      <div className="space-y-2">
                        <div className="text-xs text-[#F57F17] font-semibold flex items-center gap-1">
                          <AppIcon name="schedule" className="text-sm" />
                          Registered (Pending Proof Upload)
                        </div>
                        
                        {showProofFormId === act.id ? (
                          <form onSubmit={(e) => handleSubmitProof(e, act.id)} className="space-y-2 bg-surface-container-low p-3 rounded-lg border border-border-subtle">
                            <input
                              type="text"
                              required
                              value={proofUrl}
                              onChange={(e) => setProofUrl(e.target.value)}
                              placeholder="e.g. proof_photo_drive.jpg"
                              className="w-full bg-surface-white border border-border-subtle rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary"
                            />
                            <button
                              type="submit"
                              className="w-full bg-primary text-on-primary hover:bg-primary-container py-1 rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Submit Attachment
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => setShowProofFormId(act.id)}
                            className="bg-leaf-green text-deep-forest w-full py-2 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center"
                          >
                            Upload Completion Proof
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
                          {empSub.status === "Pending" ? "Awaiting Approval" : empSub.status}
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
    </div>
  );
}
