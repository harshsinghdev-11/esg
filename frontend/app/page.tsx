"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { can } from "@/lib/rbac";
import api from "@/lib/api";
import AppIcon from "@/components/AppIcon";

function LoginContent() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.data.token, data.data.employee);
      
      const userRole = data.data.employee.role;
      if (can.manageOrg(userRole) || can.manageEmployees(userRole)) {
        router.push("/dashboard?view=org-dashboard");
      } else {
        router.push("/dashboard?view=employee-dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleQuickLogin = async (role: "admin" | "employee") => {
    const defaultEmail = role === "admin" ? "admin@company.com" : "employee@company.com";
    try {
      const { data } = await api.post("/auth/login", { email: defaultEmail, password: "password123" });
      login(data.data.token, data.data.employee);
      
      const userRole = data.data.employee.role;
      if (can.manageOrg(userRole) || can.manageEmployees(userRole)) {
        router.push("/dashboard?view=org-dashboard");
      } else {
        router.push("/dashboard?view=employee-dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("Quick login failed.");
    }
  };

  return (
    <EsgProvider>
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(0,99,104,0.12),transparent_25%),linear-gradient(135deg,#f4f7fb_0%,#fcfefe_100%)] px-3 py-4 text-slate-800 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl items-center justify-center px-1 py-2 sm:px-2 sm:py-3 lg:px-4">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/80 shadow-[0_35px_90px_-30px_rgba(2,48,44,0.35)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0d3d1b_0%,#0b5c41_55%,#0b3f2d_100%)] p-6 text-white sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_28%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold tracking-[0.24em] text-emerald-50/90 uppercase">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">eco</span>
                  Climate ready operations
                </div>
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  Bring sustainability reporting into one clear operating view.
                </h1>
                <p className="mt-4 max-w-lg text-base leading-7 text-emerald-50/90">
                  Track emissions, social impact, governance tasks, and team participation with a modern workspace built for executive action.
                </p>
              </div>

      {/* Main Content Canvas */}
      <main className="w-full max-w-md relative z-10">
        <div className="glass-panel rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)] border border-surface-white p-8 md:p-10 flex flex-col items-center">
          
          {/* Logo & Brand Header */}
          <div className="flex flex-col items-center mb-6 w-full text-center">
            <div className="mb-4 transition-all active:scale-[0.98] cursor-pointer">
              <AppIcon name="eco" className="text-primary bg-surface-white shadow-sm border border-border-subtle rounded-xl p-2" size={56} />
            </div>
          </section>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-semibold text-label-md text-on-surface">
                Email Address
              </label>
              <div className="relative">
                <AppIcon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-body-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">mail</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>
              <div className="relative">
                <AppIcon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-surface-white border border-border-subtle rounded-lg text-body-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none focus:text-primary transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <AppIcon name={showPassword ? "visibility" : "visibility_off"} className="text-current" size={20} />
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                Remember me for 30 days
              </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-md py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Log In</span>
              <AppIcon name="arrow_forward" className="text-current" size={18} />
            </button>
          </form>

          {/* Quick Demo Logins (Crucial for Reviewer) */}
          <div className="w-full mt-6 pt-5 border-t border-border-subtle/50 text-center">
            <p className="text-label-md text-outline font-semibold mb-3">QUICK PROTOTYPE DEMO ACCESS</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleQuickLogin("employee")}
                className="w-full bg-surface-container-low border border-border-subtle hover:bg-surface-container-high text-primary font-semibold py-2 px-4 rounded-lg text-body-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <AppIcon name="badge" className="text-current" size={16} />
                <span>Log In as Employee (Alex)</span>
              </button>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-container"
              >
                <AppIcon name="shield_person" className="text-current" size={16} />
                <span>Log In as Admin (Sarah)</span>
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-5">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick demo access</p>
              <div className="flex flex-col gap-2.5">
                <button onClick={() => handleQuickLogin("employee")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">badge</span>
                  <span>Continue as Employee</span>
                </button>
                <button onClick={() => handleQuickLogin("admin")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-deep-forest px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">shield_person</span>
                  <span>Continue as Admin</span>
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don’t have access yet?{' '}
              <a href="#" className="font-semibold text-primary hover:underline">Request access</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}
