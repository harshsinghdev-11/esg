"use client";

import React, { useState } from "react";
import { useEsg } from "@/context/EsgContext";
import AppIcon from "@/components/AppIcon";

export default function ReportsViews() {
  const { departments, overview, environmentalSummary, socialSummary, governanceSummary } = useEsg();
  const [activeSubTab, setActiveSubTab] = useState<"portal" | "viewer" | "builder">("portal");
  const [selectedReportTitle, setSelectedReportTitle] = useState("ESG Summary Report");
  
  // Custom builder states
  const [filterDept, setFilterDept] = useState("All Departments");
  const [metricEmissions, setMetricEmissions] = useState(true);
  const [metricSocial, setMetricSocial] = useState(true);
  const [metricGov, setMetricGov] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Download PDF simulation
  const [isExporting, setIsExporting] = useState(false);
  const triggerExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Report downloaded successfully as PDF!");
    }, 1500);
  };

  const orgScore = overview?.organizationScore ?? {};

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveSubTab("portal");
              setShowPreview(false);
            }}
            className={`font-semibold text-body-sm pb-2 border-b-2 cursor-pointer transition-all ${
              activeSubTab === "portal" ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            Reports Portal
          </button>
          <button
            onClick={() => setActiveSubTab("builder")}
            className={`font-semibold text-body-sm pb-2 border-b-2 cursor-pointer transition-all ${
              activeSubTab === "builder" ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            Custom Report Builder
          </button>
        </div>
      </div>

      {/* 1. Reports Portal */}
      {activeSubTab === "portal" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Standard ESG Reports</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Select pre-built executive sustainability reports</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report 1 */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <AppIcon name="assessment" className="text-4xl text-primary" />
                <span className="bg-leaf-green/10 text-[#2E7D32] px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                  Quarterly
                </span>
              </div>
              <div>
                <h3 className="font-bold text-body-md text-on-surface">ESG Summary Executive Report</h3>
                <p className="text-xs text-outline mt-1 leading-relaxed">
                  Consolidated analysis of carbon emissions, CSR activity involvement, diversity distribution, and policy acknowledgements.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedReportTitle("ESG Summary Report");
                  setActiveSubTab("viewer");
                }}
                className="bg-primary hover:bg-primary-container text-on-primary w-full py-2 rounded-lg text-xs font-semibold text-center cursor-pointer transition-colors active:scale-95"
              >
                Open Report Viewer
              </button>
            </div>

            {/* Report 2 */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <AppIcon name="co2" className="text-4xl text-primary" />
                <span className="bg-[#E3F2FD] text-[#1565C0] px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                  Monthly
                </span>
              </div>
              <div>
                <h3 className="font-bold text-body-md text-on-surface">Scope 1 & 2 Emissions Audit</h3>
                <p className="text-xs text-outline mt-1 leading-relaxed">
                  Monthly breakdown of diesel, electricity, and travel carbon footprints across all operational departments.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedReportTitle("Scope 1 & 2 Emissions Audit");
                  setActiveSubTab("viewer");
                }}
                className="bg-primary hover:bg-primary-container text-on-primary w-full py-2 rounded-lg text-xs font-semibold text-center cursor-pointer transition-colors active:scale-95"
              >
                Open Report Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Report Viewer */}
      {activeSubTab === "viewer" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-subtle">
            <div>
              <button
                onClick={() => setActiveSubTab("portal")}
                className="text-primary hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer mb-2"
              >
                <AppIcon name="arrow_back" className="text-xs" />
                Back to Reports Portal
              </button>
              <h2 className="font-bold text-headline-sm text-on-surface">{selectedReportTitle}</h2>
              <p className="text-xs text-outline mt-1">Generated: July 12, 2026 | Prepared for: EcoSphere Executives</p>
            </div>
            
            <button
              onClick={triggerExport}
              disabled={isExporting}
              className="bg-primary hover:bg-primary-container text-on-primary px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <AppIcon name={isExporting ? "progress_activity" : "picture_as_pdf"} className="text-sm" />
              <span>{isExporting ? "Exporting PDF..." : "Export as PDF"}</span>
            </button>
          </div>

          {/* Report Sheet Layout */}
          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-8 shadow-sm space-y-8 max-w-3xl mx-auto text-on-surface">
            {/* Header branding */}
            <div className="flex justify-between items-center pb-6 border-b border-border-subtle/50">
              <div>
                <h3 className="font-bold text-headline-sm text-primary leading-none">EcoSphere</h3>
                <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">ESG Impact Statement</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-on-surface-variant block">Report ID: R-2026-07</span>
                <span className="text-[10px] text-outline block">Status: Signed & Verified</span>
              </div>
            </div>

            {/* Main stats block */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle/40">
                <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">E Score</span>
                <span className="text-2xl font-bold text-[#2E7D32]">{Number(orgScore.environmentalScore ?? 0).toFixed(1)} / 100</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle/40">
                <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">S Score</span>
                <span className="text-2xl font-bold text-[#1565C0]">{Number(orgScore.socialScore ?? 0).toFixed(1)} / 100</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle/40">
                <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">G Score</span>
                <span className="text-2xl font-bold text-[#F57F17]">{Number(orgScore.governanceScore ?? 0).toFixed(1)} / 100</span>
              </div>
            </div>

            {/* Narrative Sections */}
            <div className="space-y-4 text-body-sm text-on-surface-variant leading-relaxed">
              <h4 className="font-bold text-on-surface border-l-4 border-primary pl-2 text-body-md">1. Executive Overview</h4>
              <p>
                During this reporting period, EcoSphere recorded an overall ESG score of {Number(orgScore.totalScore ?? 0).toFixed(1)} across {orgScore.departmentCount ?? 0} active departments, with the latest dashboards pulling directly from operational, participation, and governance records.
              </p>

              <h4 className="font-bold text-on-surface border-l-4 border-primary pl-2 text-body-md mt-6">2. Carbon Footprint Analysis</h4>
              <p>
                Total tracked emissions for the selected period are {Number(environmentalSummary?.totalCo2eEmitted ?? 0).toLocaleString()} kg CO2e, while approved CSR participation is {socialSummary?.approvedCsrParticipations ?? 0} and the current governance acknowledgement rate stands at {Number(governanceSummary?.acknowledgementRate ?? 0).toFixed(1)}%.
              </p>
            </div>
            
            <div className="pt-6 border-t border-border-subtle/50 text-center text-[10px] text-outline">
              Confidential report for internal corporate review only. Generated automatically by EcoSphere.
            </div>
          </div>
        </div>
      )}

      {/* 3. Custom Report Builder */}
      {activeSubTab === "builder" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Custom Report Builder</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Compile personalized ESG worksheets based on filters</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filter controls */}
            <div className="lg:col-span-1 bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-body-md text-primary mb-2">Configure Metrics</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface">Department Filter</label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full bg-surface-white border border-border-subtle rounded-lg p-2 text-body-sm focus:outline-none focus:border-primary"
                >
                  <option>All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <span className="font-bold text-xs text-on-surface block">Pillar Components</span>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={metricEmissions}
                    onChange={(e) => setMetricEmissions(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded"
                  />
                  <span className="text-xs text-on-surface font-semibold">Environmental Carbon Footprints</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={metricSocial}
                    onChange={(e) => setMetricSocial(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded"
                  />
                  <span className="text-xs text-on-surface font-semibold">Social CSR Program stats</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={metricGov}
                    onChange={(e) => setMetricGov(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded"
                  />
                  <span className="text-xs text-on-surface font-semibold">Governance Audits compliance</span>
                </label>
              </div>

              <button
                onClick={() => setShowPreview(true)}
                className="bg-primary hover:bg-primary-container text-on-primary w-full py-2.5 rounded-lg text-xs font-semibold text-center cursor-pointer transition-all active:scale-95 mt-4"
              >
                Compile Custom Report
              </button>
            </div>

            {/* Compiled sheet preview */}
            <div className="lg:col-span-2">
              {showPreview ? (
                <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                    <div>
                      <h3 className="font-bold text-body-md text-on-surface">Compiled Document Preview</h3>
                      <p className="text-xs text-outline mt-0.5">Filter: {filterDept}</p>
                    </div>
                    <button
                      onClick={triggerExport}
                      className="bg-surface-container-low border border-border-subtle hover:bg-surface-container-high px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <><AppIcon name="download" className="text-sm" /> Export Sheet</>
                    </button>
                  </div>

                  <div className="space-y-4 text-body-sm text-on-surface-variant">
                    {metricEmissions && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-primary">Carbon Emissions summary</h4>
                        <div className="p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-outline font-semibold">Total Scope 1 Emissions</span>
                            <p className="font-bold text-on-surface">{Number(environmentalSummary?.totalCo2eEmitted ?? 0).toLocaleString()} kg CO2e</p>
                          </div>
                          <div>
                            <span className="text-xs text-outline font-semibold">Active Goals Tracked</span>
                            <p className="font-bold text-on-surface">{environmentalSummary?.goalsProgress?.length ?? 0}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {metricSocial && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-primary">Social CSR summaries</h4>
                        <div className="p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-outline font-semibold">Active CSR Programs</span>
                            <p className="font-bold text-on-surface">{socialSummary?.csrActivitiesCount ?? 0} active programs</p>
                          </div>
                          <div>
                            <span className="text-xs text-outline font-semibold">Volunteer Participations</span>
                            <p className="font-bold text-on-surface">{socialSummary?.approvedCsrParticipations ?? 0} approved participations</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {metricGov && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-primary">Governance Compliance logs</h4>
                        <div className="p-3 bg-surface-container-low/50 rounded-lg border border-border-subtle/50">
                          <p className="text-xs font-semibold text-on-surface italic">
                            {governanceSummary?.openIssues ?? 0} open issues and {governanceSummary?.overdueIssues ?? 0} overdue issues are currently tracked.
                          </p>
                        </div>
                      </div>
                    )}

                    {!metricEmissions && !metricSocial && !metricGov && (
                      <p className="text-outline text-center py-6">No metrics selected. Check boxes on the left to include details.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-lowest border border-border-subtle border-dashed rounded-xl p-8 text-center text-outline italic h-full flex flex-col justify-center items-center">
                  <AppIcon name="analytics" className="text-4xl mb-2" />
                  <span>Select metrics on the left and click Compile to build a preview.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
