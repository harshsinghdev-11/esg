"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase().includes("admin")) {
      router.push("/dashboard?role=admin&view=org-dashboard");
    } else {
      router.push("/dashboard?role=employee&view=employee-dashboard");
    }
  };

  const handleQuickLogin = (role: "admin" | "employee") => {
    router.push(role === "admin" ? "/dashboard?role=admin&view=org-dashboard" : "/dashboard?role=employee&view=employee-dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(0,99,104,0.12),transparent_25%),linear-gradient(135deg,#f4f7fb_0%,#fcfefe_100%)] px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/80 shadow-[0_35px_90px_-30px_rgba(2,48,44,0.35)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0d3d1b_0%,#0b5c41_55%,#0b3f2d_100%)] p-8 text-white sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_28%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold tracking-[0.24em] text-emerald-50/90 uppercase">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">eco</span>
                  Climate ready operations
                </div>
                <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
                  Bring sustainability reporting into one clear operating view.
                </h1>
                <p className="mt-4 max-w-lg text-base leading-7 text-emerald-50/90">
                  Track emissions, social impact, governance tasks, and team participation with a modern workspace built for executive action.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Live metrics", value: "24/7" },
                  { label: "Audit readiness", value: "98%" },
                  { label: "Team engagement", value: "+18%" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                    <p className="text-2xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-sm text-emerald-50/80">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col justify-center bg-slate-50/70 p-6 sm:p-8 lg:p-10">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-2xl font-semibold text-white shadow-sm">
                <span className="material-symbols-outlined" aria-hidden="true">eco</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">EcoSphere</h2>
                <p className="text-sm text-slate-500">Secure ESG workspace</p>
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{showPassword ? "visibility" : "visibility_off"}</span>
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                Remember me for 30 days
              </label>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-container"
              >
                <span>Log in</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick demo access</p>
              <div className="flex flex-col gap-2">
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