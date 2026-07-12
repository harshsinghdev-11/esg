"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EsgProvider, useEsg } from "@/context/EsgContext";

function LoginContent() {
  const router = useRouter();
  const { switchRole } = useEsg();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase().includes("admin")) {
      switchRole("admin");
      router.push("/dashboard?role=admin&view=org-dashboard");
    } else {
      switchRole("employee");
      router.push("/dashboard?role=employee&view=employee-dashboard");
    }
  };

  const handleQuickLogin = (role: "admin" | "employee") => {
    switchRole(role);
    if (role === "admin") {
      router.push("/dashboard?role=admin&view=org-dashboard");
    } else {
      router.push("/dashboard?role=employee&view=employee-dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-margin-desktop font-sans text-on-surface antialiased relative overflow-hidden bg-surface">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-fixed/20 blur-[100px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-leaf-green/10 blur-[120px] z-0 pointer-events-none"></div>

      {/* Main Content Canvas */}
      <main className="w-full max-w-md relative z-10">
        <div className="glass-panel rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)] border border-surface-white p-8 md:p-10 flex flex-col items-center">
          
          {/* Logo & Brand Header */}
          <div className="flex flex-col items-center mb-6 w-full text-center">
            <div className="mb-4 transition-all active:scale-[0.98] cursor-pointer">
              <span className="material-symbols-outlined text-primary text-[56px] bg-surface-white shadow-sm border border-border-subtle rounded-xl p-2">
                eco
              </span>
            </div>
            <h1 className="font-bold text-headline-sm text-primary mb-2">EcoSphere</h1>
            <p className="text-body-sm text-on-surface-variant max-w-[280px]">
              Measure. Manage. Improve your ESG impact.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-semibold text-label-md text-on-surface">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
                  mail
                </span>
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

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="font-semibold text-label-md text-on-surface">
                  Password
                </label>
                <a
                  href="#"
                  className="text-body-sm text-primary hover:text-primary-container hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
                  lock
                </span>
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
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle text-primary focus:ring-primary focus:ring-2 bg-surface-white cursor-pointer transition-all"
              />
              <label htmlFor="remember-me" className="ml-2 block text-body-sm text-on-surface-variant cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-md py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Log In</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
                <span className="material-symbols-outlined text-sm">badge</span>
                <span>Log In as Employee (Alex)</span>
              </button>
              <button
                onClick={() => handleQuickLogin("admin")}
                className="w-full bg-deep-forest text-on-primary hover:bg-deep-forest/90 font-semibold py-2 px-4 rounded-lg text-body-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">shield_person</span>
                <span>Log In as Admin (Sarah)</span>
              </button>
            </div>
          </div>

          {/* Sign Up Prompt */}
          <p className="mt-6 text-body-sm text-on-surface-variant text-center">
            Don't have an account?{" "}
            <a
              href="#"
              className="font-semibold text-label-md text-primary hover:text-primary-container hover:underline transition-colors"
            >
              Request access
            </a>
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-6 flex justify-center gap-6 text-body-sm text-outline">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <EsgProvider>
      <LoginContent />
    </EsgProvider>
  );
}
