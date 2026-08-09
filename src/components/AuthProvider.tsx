// src/components/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";

export type UserProfile = {
  profile_pic: string;
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  brand_name?: string | null;
  address?: string | null;
};

export type DashboardStatsType = {
  total_sales: number;
  completed_orders: number;
  total_profit: number;
};

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (token: string, shouldRedirect?: boolean) => Promise<void>;
  signOut: () => void;
  dashboardStats: DashboardStatsType | null;
  isStatsLoading: boolean;
  refreshDashboardStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsType | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const router = useRouter();

  const fetchAndSetUser = useCallback(async () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('user_token');
    if (!token) {
      setIsLoading(false);
      setUser(null);
      setDashboardStats(null);
      setIsStatsLoading(false);
      return;
    }

    try {
      const profileData = await apiClient('user/profile', 'GET');
      setUser(profileData);
    } catch (error) {
      console.error("Failed to fetch profile.", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshDashboardStats = useCallback(async () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('user_token');
    if (!token) {
      setDashboardStats(null);
      setIsStatsLoading(false);
      return;
    }

    try {
      const stats = await apiClient('orders/stats/dashboard', 'GET');
      setDashboardStats(stats || { total_sales: 0, completed_orders: 0, total_profit: 0 });
    } catch (error) {
      setDashboardStats({ total_sales: 0, completed_orders: 0, total_profit: 0 });
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetUser();
    refreshDashboardStats();
  }, [fetchAndSetUser, refreshDashboardStats]);

  // 🟢 ALLOW STAYING ON CURRENT PAGE (shouldRedirect = false)
  const login = async (token: string, shouldRedirect: boolean = true) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user_token', token);
    await fetchAndSetUser();
    await refreshDashboardStats();
    if (shouldRedirect) {
      router.push('/profile');
    }
  };

  const signOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_token');
    setUser(null);
    setDashboardStats(null);
    router.push('/auth');
  };

  const value = {
    user,
    isLoading,
    login,
    signOut,
    dashboardStats,
    isStatsLoading,
    refreshDashboardStats
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};