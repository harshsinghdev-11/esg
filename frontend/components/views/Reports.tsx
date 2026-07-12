"use client";

import React, { useMemo, useState } from "react";
import { useEsg } from "@/context/EsgContext";
import api from "@/lib/api";
import AppIcon from "@/components/AppIcon";

type StoredReport = {
  reportId: string;
  reportType: string;
  generatedAt: string;
  filters: Record<string, unknown>;
  content: any;
};

type ExportPayload = {
  fileName: string;
  mimeType: string;
  content: string;
};

const reportCards = [
  {
    key: "esg-summary",
    title: "ESG Summary Executive Report",
    endpoint: "/reports/esg-summary",
    icon: "assessment",
    cadence: "Quarterly",
    cadenceStyle: "bg-leaf-green/10 text-[#2E7D32]",
    description:
      "Combined organization scorecard with department contribution details and live ESG rollups.",
  },
  {
    key: "environmental",
    title: "Environmental Impact Report",
    endpoint: "/reports/environmental",
    icon: "co2",
    cadence: "Monthly",
    cadenceStyle: "bg-[#E3F2FD] text-[#1565C0]",
    description:
      "Tracked emissions, source mix, and active environmental goals from operational and carbon records.",
  },
  {
    key: "social",
    title: "Social Engagement Report",
    endpoint: "/reports/social",
    icon: "group",
    cadence: "Monthly",
    cadenceStyle: "bg-primary-container/10 text-primary-container",
    description:
      "CSR participation, social engagement, and employee activity indicators for the current period.",
  },
  {
    key: "governance",
    title: "Governance Compliance Report",
    endpoint: "/reports/governance",
    icon: "gavel",
    cadence: "Monthly",
    cadenceStyle: "bg-[#FFF8E1] text-[#F57F17]",
    description:
      "Policy acknowledgement, audit status, and compliance issue metrics prepared for review meetings.",
  },
];

function formatGeneratedAt(value?: string) {
  if (!value) {
    return "Not generated yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function downloadExport(payload: ExportPayload) {
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = payload.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ReportsViews() {
  const { departments } = useEsg();
  const [activeSubTab, setActiveSubTab] = useState<"portal" | "viewer" | "builder">("portal");
  const [selectedReportTitle, setSelectedReportTitle] = useState("ESG Summary Executive Report");
  const [activeReport, setActiveReport] = useState<StoredReport | null>(null);
  const [customReport, setCustomReport] = useState<StoredReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [filterDept, setFilterDept] = useState("All Departments");
  const [metricEmissions, setMetricEmissions] = useState(true);
  const [metricSocial, setMetricSocial] = useState(true);
  const [metricGov, setMetricGov] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const selectedDepartmentId = useMemo(() => {
    const department = departments.find((entry) => entry.name === filterDept);
    return department?.id;
  }, [departments, filterDept]);

  const loadStandardReport = async (card: (typeof reportCards)[number]) => {
    setReportLoading(true);
    setErrorText("");

    try {
      const { data } = await api.get(card.endpoint);
      setActiveReport(data.data);
      setSelectedReportTitle(card.title);
      setActiveSubTab("viewer");
    } catch (error: any) {
      console.error(error);
      setErrorText(error?.response?.data?.error?.message || "Failed to generate report.");
    } finally {
      setReportLoading(false);
    }
  };

  const compileCustomReport = async () => {
    if (!metricEmissions && !metricSocial && !metricGov) {
      setErrorText("Select at least one report area before compiling.");
      setShowPreview(false);
      return;
    }

    const selectedModules = [
      metricEmissions ? "environmental" : null,
      metricSocial ? "social" : null,
      metricGov ? "governance" : null,
    ].filter(Boolean) as Array<"environmental" | "social" | "governance">;

    const payload: Record<string, unknown> = {};
    if (selectedDepartmentId) {
      payload.department_id = selectedDepartmentId;
    }
    if (selectedModules.length === 1) {
      payload.module = selectedModules[0];
    }

    setReportLoading(true);
    setErrorText("");

    try {
      const { data } = await api.post("/reports/custom", payload);
      setCustomReport(data.data);
      setSelectedReportTitle("Custom ESG Report");
      setShowPreview(true);
    } catch (error: any) {
      console.error(error);
      setErrorText(error?.response?.data?.error?.message || "Failed to compile custom report.");
      setShowPreview(false);
    } finally {
      setReportLoading(false);
    }
  };

  const exportReport = async (report: StoredReport | null, format: "pdf" | "csv" | "excel" = "pdf") => {
    if (!report) {
      return;
    }

    setExportLoading(true);
    setErrorText("");

    try {
      const { data } = await api.get(`/reports/${report.reportId}/export?format=${format}`);
      downloadExport(data.data);
    } catch (error: any) {
      console.error(error);
      setErrorText(error?.response?.data?.error?.message || "Failed to export report.");
    } finally {
      setExportLoading(false);
    }
  };

  const reportToDisplay = activeSubTab === "builder" ? customReport : activeReport;
  const reportContent = reportToDisplay?.content ?? null;
  const isEsgSummary = reportToDisplay?.reportType === "esg-summary";
  const isEnvironmental = reportToDisplay?.reportType === "environmental";
  const isSocial = reportToDisplay?.reportType === "social";
  const isGovernance = reportToDisplay?.reportType === "governance";
  const isCustom = reportToDisplay?.reportType === "custom";

  const overviewScore = reportContent?.overview?.organizationScore ?? reportContent?.organizationScore ?? {};
  const environmentalContent = isEnvironmental ? reportContent : reportContent?.environmental ?? reportContent?.overview?.environmental;
  const socialContent = isSocial ? reportContent : reportContent?.social ?? reportContent?.overview?.social;
  const governanceContent = isGovernance ? reportContent : reportContent?.governance ?? reportContent?.overview?.governance;
  const departmentScores = reportContent?.departmentScores ?? [];
  const customEnvironmental =
    customReport?.reportType === "environmental" ? customReport.content : customReport?.content?.environmental;
  const customSocial = customReport?.reportType === "social" ? customReport.content : customReport?.content?.social;
  const customGovernance =
    customReport?.reportType === "governance" ? customReport.content : customReport?.content?.governance;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveSubTab("portal");
              setShowPreview(false);
              setErrorText("");
            }}
            className={`font-semibold text-body-sm pb-2 border-b-2 cursor-pointer transition-all ${
              activeSubTab === "portal" ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            Reports Portal
          </button>
          <button
            onClick={() => {
              setActiveSubTab("builder");
              setErrorText("");
            }}
            className={`font-semibold text-body-sm pb-2 border-b-2 cursor-pointer transition-all ${
              activeSubTab === "builder" ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            Custom Report Builder
          </button>
        </div>
      </div>

      {errorText && (
        <div className="rounded-xl border border-error-container bg-error-container/10 px-4 py-3 text-sm text-on-surface">
          {errorText}
        </div>
      )}

      {activeSubTab === "portal" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Standard ESG Reports</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Generate live reports directly from the backend reporting APIs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportCards.map((card) => (
              <div key={card.key} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <AppIcon name={card.icon} className="text-4xl text-primary" />
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${card.cadenceStyle}`}>
                    {card.cadence}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-body-md text-on-surface">{card.title}</h3>
                  <p className="text-xs text-outline mt-1 leading-relaxed">{card.description}</p>
                </div>
                <button
                  onClick={() => loadStandardReport(card)}
                  disabled={reportLoading}
                  className="bg-primary hover:bg-primary-container disabled:bg-surface-container-high disabled:text-outline text-on-primary w-full py-2 rounded-lg text-xs font-semibold text-center cursor-pointer transition-colors active:scale-95"
                >
                  {reportLoading ? "Generating..." : "Open Report Viewer"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <p className="text-xs text-outline mt-1">
                Generated: {formatGeneratedAt(reportToDisplay?.generatedAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => exportReport(reportToDisplay, "pdf")}
                disabled={!reportToDisplay || exportLoading}
                className="bg-primary hover:bg-primary-container disabled:bg-surface-container-high disabled:text-outline text-on-primary px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <AppIcon name={exportLoading ? "progress_activity" : "picture_as_pdf"} className="text-sm" />
                <span>{exportLoading ? "Exporting..." : "Export PDF"}</span>
              </button>
              <button
                onClick={() => exportReport(reportToDisplay, "csv")}
                disabled={!reportToDisplay || exportLoading}
                className="border border-border-subtle hover:bg-surface-container-low disabled:text-outline px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <AppIcon name="download" className="text-sm" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {reportLoading && (
            <div className="rounded-xl border border-border-subtle bg-surface-container-lowest p-8 text-center text-on-surface-variant">
              Generating report...
            </div>
          )}

          {!reportLoading && !reportToDisplay && (
            <div className="rounded-xl border border-border-subtle border-dashed bg-surface-container-lowest p-8 text-center text-outline italic">
              Generate a report from the portal to view it here.
            </div>
          )}

          {!reportLoading && reportToDisplay && (
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-8 shadow-sm space-y-8 max-w-4xl mx-auto text-on-surface">
              <div className="flex justify-between items-center pb-6 border-b border-border-subtle/50">
                <div>
                  <h3 className="font-bold text-headline-sm text-primary leading-none">EcoSphere</h3>
                  <span className="text-[10px] text-outline font-semibold uppercase tracking-wider">Live ESG Reporting</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-on-surface-variant block">Report ID: {reportToDisplay.reportId.slice(0, 8)}</span>
                  <span className="text-[10px] text-outline block">Type: {reportToDisplay.reportType}</span>
                </div>
              </div>

              {(isEsgSummary || isCustom) && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle/40">
                      <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">Overall</span>
                      <span className="text-2xl font-bold text-primary">{Number(overviewScore.totalScore ?? 0).toFixed(1)}</span>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle/40">
                      <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">E Score</span>
                      <span className="text-2xl font-bold text-[#2E7D32]">{Number(overviewScore.environmentalScore ?? 0).toFixed(1)}</span>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle/40">
                      <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">S Score</span>
                      <span className="text-2xl font-bold text-[#1565C0]">{Number(overviewScore.socialScore ?? 0).toFixed(1)}</span>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-xl border border-border-subtle/40">
                      <span className="text-[10px] text-outline font-semibold uppercase tracking-wider block mb-1">G Score</span>
                      <span className="text-2xl font-bold text-[#F57F17]">{Number(overviewScore.governanceScore ?? 0).toFixed(1)}</span>
                    </div>
                  </div>

                  {departmentScores.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-on-surface border-l-4 border-primary pl-2 text-body-md">Department Contribution Snapshot</h4>
                      <div className="overflow-x-auto rounded-xl border border-border-subtle">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
                            <tr>
                              <th className="p-3">Department</th>
                              <th className="p-3 text-center">E</th>
                              <th className="p-3 text-center">S</th>
                              <th className="p-3 text-center">G</th>
                              <th className="p-3 text-center">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-subtle text-body-sm">
                            {departmentScores.slice(0, 5).map((row: any) => (
                              <tr key={row.departmentId}>
                                <td className="p-3 font-semibold">{row.department?.name ?? row.departmentName ?? "Department"}</td>
                                <td className="p-3 text-center">{Number(row.environmentalScore ?? 0).toFixed(1)}</td>
                                <td className="p-3 text-center">{Number(row.socialScore ?? 0).toFixed(1)}</td>
                                <td className="p-3 text-center">{Number(row.governanceScore ?? 0).toFixed(1)}</td>
                                <td className="p-3 text-center font-bold text-primary">{Number(row.totalScore ?? 0).toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {(isEnvironmental || isCustom) && environmentalContent && (
                <div className="space-y-4 text-body-sm text-on-surface-variant">
                  <h4 className="font-bold text-on-surface border-l-4 border-primary pl-2 text-body-md">Environmental Highlights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                      <p className="text-xs uppercase font-semibold text-outline">Tracked Emissions</p>
                      <p className="mt-2 text-xl font-bold text-on-surface">
                        {Number(environmentalContent.totalCo2eEmitted ?? 0).toLocaleString()} kg CO2e
                      </p>
                    </div>
                    <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                      <p className="text-xs uppercase font-semibold text-outline">Active Goals</p>
                      <p className="mt-2 text-xl font-bold text-on-surface">{environmentalContent.goalsProgress?.length ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                      <p className="text-xs uppercase font-semibold text-outline">Source Groups</p>
                      <p className="mt-2 text-xl font-bold text-on-surface">{environmentalContent.emissionsBySource?.length ?? 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {(isSocial || isCustom) && socialContent && (
                <div className="space-y-4 text-body-sm text-on-surface-variant">
                  <h4 className="font-bold text-on-surface border-l-4 border-primary pl-2 text-body-md">Social Highlights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                      <p className="text-xs uppercase font-semibold text-outline">CSR Programs</p>
                      <p className="mt-2 text-xl font-bold text-on-surface">{socialContent.csrActivitiesCount ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                      <p className="text-xs uppercase font-semibold text-outline">Approved CSR</p>
                      <p className="mt-2 text-xl font-bold text-on-surface">{socialContent.approvedCsrParticipations ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                      <p className="text-xs uppercase font-semibold text-outline">Engagement Rate</p>
                      <p className="mt-2 text-xl font-bold text-on-surface">{Number(socialContent.combinedSocialEngagementRate ?? 0).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}

              {(isGovernance || isCustom) && governanceContent && (
                <div className="space-y-4 text-body-sm text-on-surface-variant">
                  <h4 className="font-bold text-on-surface border-l-4 border-primary pl-2 text-body-md">Governance Highlights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                      <p className="text-xs uppercase font-semibold text-outline">Ack Rate</p>
                      <p className="mt-2 text-xl font-bold text-on-surface">{Number(governanceContent.acknowledgementRate ?? 0).toFixed(1)}%</p>
                    </div>
                    <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                      <p className="text-xs uppercase font-semibold text-outline">Open Issues</p>
                      <p className="mt-2 text-xl font-bold text-on-surface">{governanceContent.openIssues ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                      <p className="text-xs uppercase font-semibold text-outline">Overdue Issues</p>
                      <p className="mt-2 text-xl font-bold text-on-surface">{governanceContent.overdueIssues ?? 0}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-border-subtle/50 text-center text-[10px] text-outline">
                Confidential report generated directly from EcoSphere backend reporting services.
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "builder" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-headline-sm md:text-headline-md text-on-surface">Custom Report Builder</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Compile a live report from the backend using selected ESG areas.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  {departments.map((department) => (
                    <option key={department.id} value={department.name}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <span className="font-bold text-xs text-on-surface block">Include ESG Areas</span>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={metricEmissions}
                    onChange={(e) => setMetricEmissions(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded"
                  />
                  <span className="text-xs text-on-surface font-semibold">Environmental</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={metricSocial}
                    onChange={(e) => setMetricSocial(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded"
                  />
                  <span className="text-xs text-on-surface font-semibold">Social</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={metricGov}
                    onChange={(e) => setMetricGov(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded"
                  />
                  <span className="text-xs text-on-surface font-semibold">Governance</span>
                </label>
              </div>

              <button
                onClick={compileCustomReport}
                disabled={reportLoading}
                className="bg-primary hover:bg-primary-container disabled:bg-surface-container-high disabled:text-outline text-on-primary w-full py-2.5 rounded-lg text-xs font-semibold text-center cursor-pointer transition-all active:scale-95 mt-4"
              >
                {reportLoading ? "Compiling..." : "Compile Custom Report"}
              </button>
            </div>

            <div className="lg:col-span-2">
              {showPreview && customReport ? (
                <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                    <div>
                      <h3 className="font-bold text-body-md text-on-surface">Compiled Document Preview</h3>
                      <p className="text-xs text-outline mt-0.5">Generated: {formatGeneratedAt(customReport.generatedAt)}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => exportReport(customReport, "pdf")}
                        className="bg-primary hover:bg-primary-container text-on-primary px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <AppIcon name="picture_as_pdf" className="text-sm" />
                        Export PDF
                      </button>
                      <button
                        onClick={() => {
                          setActiveReport(customReport);
                          setSelectedReportTitle("Custom ESG Report");
                          setActiveSubTab("viewer");
                        }}
                        className="border border-border-subtle hover:bg-surface-container-low px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <AppIcon name="visibility" className="text-sm" />
                        Open Viewer
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {metricEmissions && (
                      <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                        <p className="text-xs uppercase font-semibold text-outline">Environmental</p>
                        <p className="mt-2 text-xl font-bold text-on-surface">
                          {Number(customEnvironmental?.totalCo2eEmitted ?? 0).toLocaleString()} kg CO2e
                        </p>
                      </div>
                    )}
                    {metricSocial && (
                      <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                        <p className="text-xs uppercase font-semibold text-outline">Social</p>
                        <p className="mt-2 text-xl font-bold text-on-surface">
                          {customSocial?.approvedCsrParticipations ?? 0} approved CSR entries
                        </p>
                      </div>
                    )}
                    {metricGov && (
                      <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
                        <p className="text-xs uppercase font-semibold text-outline">Governance</p>
                        <p className="mt-2 text-xl font-bold text-on-surface">
                          {customGovernance?.openIssues ?? 0} open issues
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-surface-container-low/40 p-4 text-body-sm text-on-surface-variant leading-relaxed">
                    This preview is backed by `POST /reports/custom` and can be exported directly for your demo.
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-lowest border border-border-subtle border-dashed rounded-xl p-8 text-center text-outline italic h-full flex flex-col justify-center items-center">
                  <AppIcon name="analytics" className="text-4xl mb-2" />
                  <span>Select the ESG areas you want to include, then compile a backend-driven custom report.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
