"use client";

import React, { useState, useEffect } from "react";
import { useEsg } from "@/context/EsgContext";
import { useAuth } from "@/context/AuthContext";
import { can } from "@/lib/rbac";
import AppIcon from "@/components/AppIcon";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !currentUser) {
    return null;
  }

  const role = currentUser.role;
  const isEmployee = !can.manageOrg(role) && !can.manageEmployees(role);
  const currentRole = isEmployee ? "employee" : "admin";
  const currentRoleName = isEmployee ? "employee" : "admin";
  const currentView = searchParams.get("view") || (isEmployee ? "employee-dashboard" : "org-dashboard");

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
            <AppIcon name="eco" className="text-surface-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">EcoSphere</h1>
            <p className="text-sm text-emerald-200/80">ESG Operations</p>
          </div>
        </div>

        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/70">
          Workspace
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto hide-scrollbar">
          {activeLinks.map((link) => {
            const isActive = currentView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => navigateTo(link.view)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-white/15 text-white shadow-inner"
                    : "text-slate-200/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <AppIcon name={link.icon} className="text-current" />
                  <span>{link.name}</span>
                </div>
                {mounted && link.badge && pendingApprovalsCount > 0 && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
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
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                currentRole === "employee"
                  ? "bg-emerald-300 text-emerald-950"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Employee
            </button>
            <button
              onClick={() => handleRoleChange("admin")}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                currentRole === "admin"
                  ? "bg-emerald-300 text-emerald-950"
                  : "bg-white/10 text-white hover:bg-white/20"
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
              <AppIcon name="chevron_right" className="text-current" size={16} />
              <span className="text-primary font-bold">{currentView.replace("employee-", "").replace("-dashboard", "").replace("-", " ")}</span>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                aria-label="Toggle notifications menu"
                aria-expanded={showNotifications}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100"
              >
                <AppIcon name="notifications" className="text-current" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-error text-on-error w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_25px_60px_-25px_rgba(15,23,42,0.35)]">
                  <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={clearAllNotifications} className="text-xs font-semibold text-primary hover:underline">
                        Clear all
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-500">No new notifications</div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-colors"
                        >
                          <span
                            className={`shrink-0 mt-0.5 ${
                              notif.type === "success"
                                ? "text-leaf-green"
                                : notif.type === "warning"
                                ? "text-error"
                                : "text-primary"
                            }`}
                          >
                            <AppIcon
                              name={notif.type === "success" ? "check_circle" : notif.type === "warning" ? "warning" : "assessment"}
                              className="text-current"
                              size={18}
                            />
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">{notif.text}</p>
                            <span className="mt-1 block text-[11px] text-slate-400">{notif.time}</span>
                          </div>
                          <button
                            onClick={() => clearNotification(notif.id)}
                            className="text-outline hover:text-on-surface shrink-0 cursor-pointer"
                          >
                            <AppIcon name="close" className="text-current" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                aria-label="Toggle user profile menu"
                aria-expanded={showProfileMenu}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1.5 transition-colors hover:bg-slate-100"
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
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <AppIcon name="logout" className="text-current" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto flex-1 w-full max-w-7xl p-4 sm:p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
