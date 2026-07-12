import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface text-on-surface">
      <div className="glass-panel border border-border-subtle rounded-xl p-8 max-w-md shadow-lg space-y-4">
        <span className="material-symbols-outlined text-primary text-[48px]">
          folder_off
        </span>
        <h2 className="font-bold text-headline-sm text-primary">Page Not Found</h2>
        <p className="text-body-sm text-on-surface-variant leading-relaxed">
          The requested page could not be located on the EcoSphere portal.
        </p>
        <a
          href="/"
          className="w-full bg-primary hover:bg-primary-container text-on-primary py-2 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all block text-center animate-pulse"
        >
          Return to Login
        </a>
      </div>
    </div>
  );
}
