"use client";

import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { EsgProvider } from "../context/EsgContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EsgProvider>
        {children}
      </EsgProvider>
    </AuthProvider>
  );
}
