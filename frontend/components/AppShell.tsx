"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEsg } from "@/context/EsgContext";

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
  const {
    currentUser,
    switchRole,
    notifications,
    clearNotification,
    clearAllNotifications,
  } = useEsg();

  const currentRole = searchParams.get("role") || currentUser.role;
  const currentView = searchParams.get("view") || (currentRole === "admin" ? "org-dashboard" : "employee-dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigateTo = (viewName: string) => {
    router.push(`/dashboard?role=${currentRole}&view=${viewName}`);
  };

  const handleRoleChange = (role: "admin" | "employee") => {
    switchRole(role);
    const defaultView = role === "admin" ? "org-dashboard" : "employee-dashboard";
    router.push(`/dashboard?role=${role}&view=${defaultView}`);
    setShowProfileMenu(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeLinks = currentRole === "admin" ? adminLinks : employeeLinks;
  const pendingApprovalsCount = currentRole === "admin" ? notifications.length : 0;
  const currentLabel = currentView.replace("employee-", "").replace("-dashboard", "").replace(/-/g, " ");

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="fixed left-0 top-0 hidden h-full w-[270px] flex-col border-r border-emerald-950/20 bg-[linear-gradient(180deg,#0d3d1b_0%,#0b2f16_100%)] p-5 text-slate-100 shadow-[18px_0_60px_-24px_rgba(2,48,44,0.45)] md:flex">
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl">
            <span className="material-symbols-outlined" aria-hidden="true">eco</span>
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
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{link.icon}</span>
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

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/20 text-sm font-semibold text-emerald-100">
              {currentUser.name[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{currentUser.name}</p>
              <p className="truncate text-xs text-emerald-100/80 capitalize">{currentRole} view</p>
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

      <div className="flex min-h-screen flex-col md:ml-[270px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">route</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{currentRole === "admin" ? "Executive workspace" : "Employee workspace"}</p>
              <p className="text-xs text-slate-500">{currentLabel || "overview"}</p>
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
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">notifications</span>
                {mounted && unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
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
                        <div key={notif.id} className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5">
                          <span className={`material-symbols-outlined mt-0.5 text-[18px] ${notif.type === "success" ? "text-emerald-600" : notif.type === "warning" ? "text-rose-600" : "text-primary"}`}>
                            {notif.type === "success" ? "check_circle" : notif.type === "warning" ? "warning" : "info"}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">{notif.text}</p>
                            <span className="mt-1 block text-[11px] text-slate-400">{notif.time}</span>
                          </div>
                          <button onClick={() => clearNotification(notif.id)} className="text-slate-400 hover:text-slate-700">
                            <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
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
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-white">
                  {currentUser.name[0]}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_25px_60px_-25px_rgba(15,23,42,0.35)]">
                  <div className="mb-2 border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">logout</span>
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto flex-1 w-full max-w-7xl p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
