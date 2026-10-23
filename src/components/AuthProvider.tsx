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

  // 🟢 SILENT REFRESH TOKEN MECHANISM (Keeps user logged in for 30 days)
  const refreshAuthToken = async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const res = await apiClient('auth/user/refresh-token', 'POST', { refreshToken });
      if (res && (res.token || res.accessToken)) {
        const newToken = res.token || res.accessToken;
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('user_token', newToken);
        if (res.refreshToken) {
          localStorage.setItem('refreshToken', res.refreshToken);
        }
        return newToken;
      }
    } catch (e) {
      console.warn("Refresh token expired or invalid. Logging out.");
      signOut();
    }
    return null;
  };

  const fetchAndSetUser = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const appToken = urlParams.get('app_token') || urlParams.get('authToken') || urlParams.get('token');
      
      if (appToken && appToken.length > 10) {
        localStorage.setItem('authToken', appToken);
        localStorage.setItem('user_token', appToken);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    let token = localStorage.getItem('authToken') || localStorage.getItem('user_token');
    if (!token) {
      // Try refreshing if access token is missing but refresh token exists
      token = await refreshAuthToken();
      if (!token) {
        setIsLoading(false);
        setUser(null);
        setDashboardStats(null);
        setIsStatsLoading(false);
        return;
      }
    }

    try {
      const profileData = await apiClient('user/profile', 'GET');
      setUser(profileData);
    } catch (error: any) {
      // If 401 Unauthorized, try refreshing token once
      if (error?.message?.includes('401') || error?.status === 401) {
        const newToken = await refreshAuthToken();
        if (newToken) {
          try {
            const profileData = await apiClient('user/profile', 'GET');
            setUser(profileData);
            setIsLoading(false);
            return;
          } catch (innerErr) {}
        }
      }
      console.error("Failed to fetch profile.", error);
      signOut();
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
      // 🟢 FIXED: Correct route pointing to GET /api/dashboard
      const stats = await apiClient('dashboard', 'GET');
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
    localStorage.removeItem('refreshToken');
    setUser(null);
    setDashboardStats(null);
    router.push('/auth/login');
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