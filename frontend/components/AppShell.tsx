"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEsg } from "@/context/EsgContext";
import { useAuth } from "@/context/AuthContext";
import { can } from "@/lib/rbac";

interface AppShellProps {
  children: React.ReactNode;
}

interface SidebarLink {
  name: string;
  icon: string;
  view: string;
  badge?: boolean;
}

const adminLinks: SidebarLink[] = [
  { name: "Org Dashboard", icon: "dashboard", view: "org-dashboard" },
  { name: "Environmental", icon: "eco", view: "environmental-dashboard" },
  { name: "Social Program", icon: "group", view: "social-dashboard" },
  { name: "Governance", icon: "account_balance", view: "governance-dashboard" },
  { name: "Challenges", icon: "emoji_events", view: "challenges" },
  { name: "Approvals Queue", icon: "fact_check", view: "approvals-queue", badge: true },
  { name: "Badges Registry", icon: "military_tech", view: "badges" },
  { name: "Rewards Manager", icon: "redeem", view: "rewards-catalog" },
  { name: "Leaderboard", icon: "leaderboard", view: "leaderboard" },
  { name: "ESG Reports", icon: "description", view: "reports" },
  { name: "Global Settings", icon: "settings", view: "settings-esg-config" },
];

const employeeLinks: SidebarLink[] = [
  { name: "My Dashboard", icon: "dashboard", view: "employee-dashboard" },
  { name: "CSR Activities", icon: "volunteer_activism", view: "employee-csr-activities" },
  { name: "My Challenges", icon: "emoji_events", view: "employee-challenges" },
  { name: "Badges Gallery", icon: "military_tech", view: "employee-badges" },
  { name: "Rewards Catalog", icon: "redeem", view: "employee-rewards" },
  { name: "ESG Policies", icon: "gavel", view: "employee-policies" },
  { name: "Leaderboard", icon: "leaderboard", view: "employee-leaderboard" },
];

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, logout, loading } = useAuth();
  const {
    notifications,
    clearNotification,
    clearAllNotifications,
  } = useEsg();

  if (loading || !currentUser) {
    return null;
  }

  const role = currentUser.role;
  const isEmployee = !can.manageOrg(role) && !can.manageEmployees(role);
  const currentRoleName = isEmployee ? "employee" : "admin";
  const currentView = searchParams.get("view") || (isEmployee ? "employee-dashboard" : "org-dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigateTo = (viewName: string) => {
    router.push(`/dashboard?view=${viewName}`);
  };

  const handleRoleChange = (selectedRole: "admin" | "employee") => {
    // Note: Temporary frontend switch for demo purposes, 
    // real app would re-login or change account
    const defaultView = selectedRole === "admin" ? "org-dashboard" : "employee-dashboard";
    router.push(`/dashboard?view=${defaultView}`);
    setShowProfileMenu(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const activeLinks = isEmployee ? employeeLinks : adminLinks;

  // Calculate pending submissions count for approvals queue badge
  const pendingApprovalsCount = !isEmployee
    ? notifications.length // Using notifications length as active notifications queue
    : 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-full py-6 fixed left-0 top-0 w-[260px] bg-deep-forest z-40 text-surface-white">
        {/* Branding */}
        <div className="px-6 mb-8 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-surface-white/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-surface-white">eco</span>
          </div>
          <div>
            <h1 className="font-bold text-headline-sm leading-tight">EcoSphere</h1>
            <p className="text-label-md text-leaf-green opacity-80">ESG Management</p>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1">
          {activeLinks.map((link) => {
            const isActive = currentView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => navigateTo(link.view)}
                className={`w-[calc(100%-16px)] flex items-center justify-between px-4 py-2.5 mx-2 rounded-lg text-body-sm transition-all duration-150 cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-semibold"
                    : "text-surface-variant/80 hover:text-surface-white hover:bg-surface-white/10"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                  <span>{link.name}</span>
                </div>
                {link.badge && pendingApprovalsCount > 0 && (
                  <span className="bg-error text-on-error font-semibold text-xs px-2 py-0.5 rounded-full">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Role Switcher Widget at bottom of sidebar */}
        <div className="mx-4 mt-auto p-4 bg-surface-white/10 border border-surface-white/10 rounded-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-fixed-dim/30 flex items-center justify-center text-sm font-bold text-leaf-green uppercase">
              {currentUser.fullName ? currentUser.fullName[0] : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-surface-white truncate">{currentUser.fullName}</p>
              <p className="text-xs text-surface-variant truncate capitalize">{currentRoleName} View</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleRoleChange("employee")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-[0.98] ${
                currentRole === "employee"
                  ? "bg-leaf-green text-deep-forest"
                  : "bg-surface-white/10 hover:bg-surface-white/20 text-surface-white"
              }`}
            >
              Employee
            </button>
            <button
              onClick={() => handleRoleChange("admin")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-[0.98] ${
                currentRole === "admin"
                  ? "bg-leaf-green text-deep-forest"
                  : "bg-surface-white/10 hover:bg-surface-white/20 text-surface-white"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* TopNavBar */}
      <div className="flex-1 flex flex-col md:ml-[260px]">
        <header className="flex justify-between items-center px-6 md:px-margin-desktop h-16 bg-surface-container-lowest border-b border-border-subtle shadow-sm sticky top-0 z-30">
          <div className="flex-1 flex items-center">
            {/* Quick Breadcrumbs */}
            <div className="text-body-sm text-on-surface-variant font-semibold capitalize flex items-center gap-1.5">
              <span>{currentRole}</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-primary font-bold">{currentView.replace("employee-", "").replace("-dashboard", "").replace("-", " ")}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high cursor-pointer relative"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-error text-on-error w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-surface-white border border-border-subtle rounded-xl shadow-xl z-50 p-4 max-h-[400px] overflow-y-auto">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-border-subtle/50">
                    <span className="font-semibold text-body-sm text-on-surface">Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-primary hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-body-sm text-outline">
                      No new notifications
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-colors"
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                              notif.type === "success"
                                ? "text-leaf-green"
                                : notif.type === "warning"
                                ? "text-error"
                                : "text-primary"
                            }`}
                          >
                            {notif.type === "success"
                              ? "check_circle"
                              : notif.type === "warning"
                              ? "warning"
                              : "info"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-on-surface leading-normal">{notif.text}</p>
                            <span className="text-[10px] text-outline mt-1 block">{notif.time}</span>
                          </div>
                          <button
                            onClick={() => clearNotification(notif.id)}
                            className="text-outline hover:text-on-surface shrink-0 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-surface-container-high transition-all cursor-pointer border border-border-subtle"
              >
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm uppercase">
                  {currentUser.fullName ? currentUser.fullName[0] : "?"}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-surface-white border border-border-subtle rounded-xl shadow-xl z-50 p-2">
                  <div className="px-3 py-2 border-b border-border-subtle/50 mb-2">
                    <p className="text-body-sm font-semibold text-on-surface truncate">{currentUser.fullName}</p>
                    <p className="text-xs text-outline truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-body-sm text-error hover:bg-error-container/20 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Workspace Container */}
        <main className="p-6 md:p-margin-desktop flex-1 overflow-y-auto max-w-container-max-width w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
