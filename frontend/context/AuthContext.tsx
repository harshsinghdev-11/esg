"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { BackendRole } from "../lib/rbac";

export interface User {
  employeeId: string;
  fullName: string;
  email: string;
  role: BackendRole;
  totalXp: number;
  totalPointsBalance: number;
  level: number; // Computed on frontend
  department?: {
    name: string;
  };
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateLevel = (xp: number) => {
    // Simple level formula for now: level 1 = 0-100xp, level 2 = 100-300xp...
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const processUser = (backendUser: any): User => {
    return {
      ...backendUser,
      level: calculateLevel(backendUser.totalXp || 0),
    };
  };

  const refreshUser = useCallback(async () => {
    const { data } = await api.get("/auth/me");
    const nextUser = processUser(data.data);
    setCurrentUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const login = (token: string, user: any) => {
    localStorage.setItem("access_token", token);
    setCurrentUser(processUser(user));
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setCurrentUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
