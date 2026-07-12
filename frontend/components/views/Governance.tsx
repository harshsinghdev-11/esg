"use client";

import React, { useState } from "react";
import { useEsg } from "@/context/EsgContext";

interface GovernanceViewsProps {
  activeTab: "dashboard" | "policies" | "employee-policies" | "audits" | "compliance";
}

export default function GovernanceViews({ activeTab }: GovernanceViewsProps) {
  const {
    currentUser,
    policies,
    audits,
    complianceIssues,
    acknowledgements,
    createPolicy,
    scheduleAudit,
    addComplianceIssue,
    resolveComplianceIssue,
    acknowledgePolicy,
    departments,
    employees,
  } = useEsg();

  // Local Form / Details states
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);

  // Policy creation states
  const [polTitle, setPolTitle] = useState("");
  const [polContent, setPolContent] = useState("");

  // Audit creation states
  const [audDate, setAudDate] = useState("");
  const [auditor, setAuditor] = useState("");
  const [audDept, setAudDept] = useState("Operations");

  // Issue creation states
  const [issTitle, setIssTitle] = useState("");
  const [issSev, setIssSev] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [issOwner, setIssOwner] = useState("");
  const [issDue, setIssDue] = useState("");

  // Acknowledging reader state
  const [readingPolicyId, setReadingPolicyId] = useState<string | null>(null);
  const [checkedAck, setCheckedAck] = useState(false);

  // Handlers
  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (polTitle && polContent) {
      createPolicy(polTitle, polContent);
      setPolTitle("");
      setPolContent("");
      setShowPolicyForm(false);
    }
  };

  const handleScheduleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (audDate && auditor) {
      scheduleAudit(audDate, auditor, audDept);
      setAudDate("");
      setAuditor("");
      setShowAuditForm(false);
    }
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (issTitle && issOwner && issDue) {
      addComplianceIssue(issTitle, issSev, issOwner, issDue);
      setIssTitle("");
      setIssOwner("");
      setIssDue("");
      setShowIssueForm(false);
    }
  };

  const handleConfirmAck = (policyId: string) => {
    if (checkedAck) {
      acknowledgePolicy(policyId);
      setCheckedAck(false);
      setReadingPolicyId(null);
    }
  };

  const currentViewTab = currentUser.role === "employee" ? "employee-policies" : activeTab;

  return (
    <div className="space-y-6">
      {currentViewTab === "dashboard" && (
        <div className="space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Governance & Compliance</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Audit status, policy guidelines, and corporate compliance issues</p>
            </div>
            <button className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg font-semibold text-label-md transition-colors flex items-center gap-1 cursor-pointer">
              Schedule Review
            </button>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <span className="material-symbols-outlined text-4xl text-[#F57F17] mb-2 block" aria-hidden="true">task_alt</span>
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Average Policy Ack</h3>
              <div className="font-bold text-headline-lg text-primary">87.5%</div>
              <span className="text-xs text-outline font-semibold mt-1 block">Target: 95% by end of year</span>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <span className="material-symbols-outlined text-4xl text-primary mb-2 block" aria-hidden="true">fact_check</span>
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Audit Status</h3>
              <div className="font-bold text-headline-lg text-[#2E7D32]">2 / 3 Complete</div>
              <span className="text-xs text-outline font-semibold mt-1 block">1 Scheduled in HR</span>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden group hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] transition-shadow">
              <span className="material-symbols-outlined text-4xl text-error mb-2 block" aria-hidden="true">gavel</span>
              <h3 className="font-semibold text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Unresolved Compliance</h3>
              <div className="font-bold text-headline-lg text-error">
                {complianceIssues.filter((c) => c.status === "Open").length} Open
              </div>
              <span className="text-xs text-error font-semibold mt-1 block">Requires action</span>
            </div>
          </div>
        </div>
      )}

      {currentViewTab === "policies" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Compliance Policies</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Publish and track policy acknowledgements</p>
            </div>
            <button
              onClick={() => setShowPolicyForm(!showPolicyForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold" aria-hidden="true">add</span>
              {showPolicyForm ? "Cancel" : "Publish Policy"}
            </button>
          </div>

          {showPolicyForm && (
            <form onSubmit={handleCreatePolicy} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Publish New Policy Directive</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Policy Title</label>
                <input
                  type="text"
                  required
                  value={polTitle}
                  onChange={(e) => setPolTitle(e.target.value)}
                  placeholder="e.g. Remote Work Energy Code"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Policy content summary</label>
                <textarea
                  required
                  rows={4}
                  value={polContent}
                  onChange={(e) => setPolContent(e.target.value)}
                  placeholder="Summarize rules and expectations..."
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Publish & Notify Employees
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Policy Title</th>
                  <th className="p-4 py-3">Publication Date</th>
                  <th className="p-4 py-3 text-right">Acknowledgement Rate</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {policies.map((pol) => (
                  <tr key={pol.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 font-semibold">{pol.title}</td>
                    <td className="p-4 text-outline">{pol.date}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-bold text-primary">{pol.ackRate}</span>
                        <div className="w-20 bg-surface-container-high h-2 rounded-full overflow-hidden">
                          <div className="bg-leaf-green h-full" style={{ width: pol.ackRate }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentViewTab === "employee-policies" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Corporate ESG Policies</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Review and acknowledge compliance policies</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left list of policies */}
            <div className="lg:col-span-1 space-y-4">
              {policies.map((pol) => {
                const isAcked = acknowledgements.some(
                  (a) => a.employeeId === currentUser.id && a.policyId === pol.id
                );

                return (
                  <button
                    key={pol.id}
                    onClick={() => {
                      setReadingPolicyId(pol.id);
                      setCheckedAck(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      readingPolicyId === pol.id
                        ? "border-primary bg-primary-container/10 shadow-sm"
                        : "border-border-subtle bg-surface-container-lowest hover:bg-surface-container-low/20"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-body-sm text-on-surface truncate max-w-[150px]">
                        {pol.title}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isAcked
                            ? "bg-leaf-green/10 text-[#2E7D32]"
                            : "bg-error-container text-error animate-pulse"
                        }`}
                      >
                        {isAcked ? "Acknowledged" : "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-outline mt-1">Published: {pol.date}</p>
                  </button>
                );
              })}
            </div>

            {/* Right reader content */}
            <div className="lg:col-span-2">
              {readingPolicyId ? (
                (() => {
                  const pol = policies.find((p) => p.id === readingPolicyId);
                  if (!pol) return null;

                  const isAcked = acknowledgements.some(
                    (a) => a.employeeId === currentUser.id && a.policyId === pol.id
                  );

                  return (
                    <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm space-y-5">
                      <div className="pb-3 border-b border-border-subtle">
                        <h3 className="font-bold text-headline-sm text-on-surface">{pol.title}</h3>
                        <p className="text-xs text-outline mt-1">Directives published on {pol.date}</p>
                      </div>

                      <div className="text-body-sm text-on-surface-variant leading-relaxed space-y-3">
                        <p>{pol.content}</p>
                        <p className="text-xs italic bg-surface-container-low p-3 rounded-lg border border-border-subtle">
                          By confirming acknowledgement, you agree to adhere to the directives and integrate these environmental guidelines into your daily operations.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {isAcked ? (
                          <div className="flex items-center gap-2 text-leaf-green font-bold text-body-sm">
                            <span className="material-symbols-outlined text-lg" aria-hidden="true">check_circle</span>
                            You acknowledged this policy.
                          </div>
                        ) : (
                          <>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checkedAck}
                                onChange={(e) => setCheckedAck(e.target.checked)}
                                className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded"
                              />
                              <span className="text-xs text-on-surface font-semibold">
                                I confirm that I have read and agree to follow these guidelines.
                              </span>
                            </label>
                            <button
                              onClick={() => handleConfirmAck(pol.id)}
                              disabled={!checkedAck}
                              className={`px-6 py-2 rounded-lg font-semibold text-label-md transition-all ${
                                checkedAck
                                  ? "bg-primary text-on-primary hover:bg-primary-container cursor-pointer active:scale-95"
                                  : "bg-surface-container-high text-outline cursor-not-allowed"
                              }`}
                            >
                              Confirm
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="bg-surface-container-lowest border border-border-subtle border-dashed rounded-xl p-8 text-center text-outline italic">
                  Select a policy from the list on the left to read and acknowledge.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentViewTab === "audits" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">ESG Audits Log</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Schedule and monitor operational safety & waste audits</p>
            </div>
            <button
              onClick={() => setShowAuditForm(!showAuditForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold" aria-hidden="true">add</span>
              {showAuditForm ? "Cancel" : "Schedule Audit"}
            </button>
          </div>

          {showAuditForm && (
            <form onSubmit={handleScheduleAudit} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Schedule New ESG Audit</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Target Date</label>
                <input
                  type="date"
                  required
                  value={audDate}
                  onChange={(e) => setAudDate(e.target.value)}
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Auditor Name / Agency</label>
                <input
                  type="text"
                  required
                  value={auditor}
                  onChange={(e) => setAuditor(e.target.value)}
                  placeholder="e.g. Sarah Chen or external ISO agency"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Department</label>
                <select
                  value={audDept}
                  onChange={(e) => setAudDept(e.target.value)}
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Book Audit
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Audit Date</th>
                  <th className="p-4 py-3">Auditor</th>
                  <th className="p-4 py-3">Department</th>
                  <th className="p-4 py-3">Status</th>
                  <th className="p-4 py-3 text-right">Compliance Issues</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {audits.map((aud) => (
                  <tr key={aud.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 text-outline font-semibold">{aud.date}</td>
                    <td className="p-4 font-semibold">{aud.auditor}</td>
                    <td className="p-4">{aud.department}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          aud.status === "Completed"
                            ? "bg-leaf-green/10 text-[#2E7D32]"
                            : "bg-[#FFF8E1] text-[#F57F17]"
                        }`}
                      >
                        {aud.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-error">{aud.issuesCount} Issues Found</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentViewTab === "compliance" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Compliance Issues Log</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Monitor and resolve ESG compliance gaps</p>
            </div>
            <button
              onClick={() => setShowIssueForm(!showIssueForm)}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold" aria-hidden="true">add</span>
              {showIssueForm ? "Cancel" : "Report Issue"}
            </button>
          </div>

          {showIssueForm && (
            <form onSubmit={handleAddIssue} className="glass-panel border border-border-subtle rounded-xl p-6 max-w-md space-y-4">
              <h3 className="font-semibold text-body-md text-primary">Log Compliance Issue</h3>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Issue Title</label>
                <input
                  type="text"
                  required
                  value={issTitle}
                  onChange={(e) => setIssTitle(e.target.value)}
                  placeholder="e.g. Missing safety signage in lift lobby"
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Severity</label>
                  <select
                    value={issSev}
                    onChange={(e) => setIssSev(e.target.value as any)}
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface">Owner (Employee)</label>
                  <select
                    value={issOwner}
                    onChange={(e) => setIssOwner(e.target.value)}
                    required
                    className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Assignee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Resolve Due Date</label>
                <input
                  type="date"
                  required
                  value={issDue}
                  onChange={(e) => setIssDue(e.target.value)}
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Log Compliance Gap
              </button>
            </form>
          )}

          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low font-semibold text-label-md text-on-surface-variant border-b border-border-subtle">
                <tr>
                  <th className="p-4 py-3">Compliance Gap Issue</th>
                  <th className="p-4 py-3">Severity</th>
                  <th className="p-4 py-3">Assignee Owner</th>
                  <th className="p-4 py-3">Due Date</th>
                  <th className="p-4 py-3">Status</th>
                  <th className="p-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-border-subtle">
                {complianceIssues.map((ci) => (
                  <tr key={ci.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 font-semibold">{ci.title}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          ci.severity === "Critical"
                            ? "bg-error text-on-error font-bold"
                            : ci.severity === "High"
                            ? "bg-error-container text-error"
                            : "bg-[#FFF8E1] text-[#F57F17]"
                        }`}
                      >
                        {ci.severity}
                      </span>
                    </td>
                    <td className="p-4">{ci.owner}</td>
                    <td className="p-4 text-outline">{ci.dueDate}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          ci.status === "Resolved"
                            ? "bg-leaf-green/10 text-[#2E7D32]"
                            : "bg-error-container text-error animate-pulse"
                        }`}
                      >
                        {ci.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {ci.status === "Open" ? (
                        <button
                          onClick={() => resolveComplianceIssue(ci.id)}
                          className="bg-primary text-on-primary hover:bg-primary-container px-3 py-1 rounded text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-[#2E7D32] font-semibold flex items-center justify-end gap-1">
                          <span className="material-symbols-outlined text-xs" aria-hidden="true">done_all</span> Resolved
                        </span>
                      )}
                    </td>
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
