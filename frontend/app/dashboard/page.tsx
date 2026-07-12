"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { EsgProvider } from "@/context/EsgContext";

// Import view components
import OrgDashboardView from "@/components/views/AdminDashboard";
import EmployeeDashboardView from "@/components/views/EmployeeDashboard";
import EnvironmentalViews from "@/components/views/Environmental";
import SocialViews from "@/components/views/Social";
import GovernanceViews from "@/components/views/Governance";
import GamificationViews from "@/components/views/Gamification";
import ReportsViews from "@/components/views/Reports";
import SettingsViews from "@/components/views/Settings";

function DashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "employee";
  const view = searchParams.get("view") || (role === "admin" ? "org-dashboard" : "employee-dashboard");

  // Route rendering based on active view name
  const renderView = () => {
    // Employee Views
    if (role === "employee") {
      switch (view) {
        case "employee-dashboard":
          return <EmployeeDashboardView />;
        case "employee-csr-activities":
          return <SocialViews activeTab="employee-csr" />;
        case "employee-challenges":
          return <GamificationViews activeTab="employee-challenges" />;
        case "employee-badges":
          return <GamificationViews activeTab="employee-badges" />;
        case "employee-rewards":
          return <GamificationViews activeTab="employee-rewards" />;
        case "employee-policies":
          return <GovernanceViews activeTab="employee-policies" />;
        case "employee-leaderboard":
          return <GamificationViews activeTab="leaderboard" />;
        default:
          return <EmployeeDashboardView />;
      }
    }

    // Admin / Manager Views
    switch (view) {
      case "org-dashboard":
        return <OrgDashboardView />;
      
      // Environmental
      case "environmental-dashboard":
        return <EnvironmentalViews activeTab="dashboard" />;
      case "emission-factors":
        return <EnvironmentalViews activeTab="factors" />;
      case "sustainability-goals":
        return <EnvironmentalViews activeTab="goals" />;
      case "carbon-transactions":
        return <EnvironmentalViews activeTab="transactions" />;
      
      // Social
      case "social-dashboard":
        return <SocialViews activeTab="dashboard" />;
      case "csr-activities":
        return <SocialViews activeTab="csr-list" />;
      case "diversity-metrics":
        return <SocialViews activeTab="diversity" />;
      case "training-completion":
        return <SocialViews activeTab="training" />;
      
      // Governance
      case "governance-dashboard":
        return <GovernanceViews activeTab="dashboard" />;
      case "policies":
        return <GovernanceViews activeTab="policies" />;
      case "audits":
        return <GovernanceViews activeTab="audits" />;
      case "compliance-issues":
        return <GovernanceViews activeTab="compliance" />;
      
      // Gamification
      case "challenges":
        return <GamificationViews activeTab="challenges" />;
      case "approvals-queue":
        return <GamificationViews activeTab="approvals" />;
      case "badges":
        return <GamificationViews activeTab="badges" />;
      case "rewards-catalog":
        return <GamificationViews activeTab="rewards-admin" />;
      case "leaderboard":
        return <GamificationViews activeTab="leaderboard" />;
      
      // Reports
      case "reports":
        return <ReportsViews />;
      
      // Settings
      case "settings-departments":
        return <SettingsViews activeTab="departments" />;
      case "settings-employees":
        return <SettingsViews activeTab="employees" />;
      case "settings-categories":
        return <SettingsViews activeTab="categories" />;
      case "settings-esg-config":
        return <SettingsViews activeTab="esg-config" />;
      case "settings-notifications":
        return <SettingsViews activeTab="notifications" />;

      default:
        return <OrgDashboardView />;
    }
  };

  return <AppShell>{renderView()}</AppShell>;
}

export default function DashboardPage() {
  return (
    <EsgProvider>
      <Suspense fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-surface">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-primary text-[48px] animate-spin" aria-hidden="true">
              progress_activity
            </span>
            <p className="text-body-md text-outline font-semibold">Loading EcoSphere...</p>
          </div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </EsgProvider>
  );
}
