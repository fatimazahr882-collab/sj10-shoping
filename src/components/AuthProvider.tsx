// src/components/AuthProvider.tsx (FINAL, CORRECTED VERSION)
"use client"; // This entire file is for the client

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";

// Define the shape of your user profile
export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
};

// Define the shape of dashboard stats
export type DashboardStatsType = {
  total_sales: number;
  completed_orders: number;
  total_profit: number;
};

// Define the shape of the context's value
interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  signOut: () => void;
  // Dashboard Stats
  dashboardStats: DashboardStatsType | null;
  isStatsLoading: boolean;
  refreshDashboardStats: () => Promise<void>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Create the Provider Component ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stats State
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsType | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const router = useRouter();

  const fetchAndSetUser = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      setUser(null);
      // Also reset stats if no user
      setDashboardStats(null);
      setIsStatsLoading(false);
      return;
    }

    try {
      const profileData = await apiClient('user/profile', 'GET');
      setUser(profileData);
    } catch (error) {
      console.error("Failed to fetch profile. Token might be invalid.", error);
      localStorage.removeItem('authToken'); // Clean up bad token
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Separate function to fetch stats so it doesn't block the main user load
  const refreshDashboardStats = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setDashboardStats(null);
      setIsStatsLoading(false);
      return;
    }

    try {
      // NOTE: Ensure your backend has this endpoint 'orders/stats/dashboard'
      // If not, you may need to adjust the endpoint path.
      const stats = await apiClient('orders/stats/dashboard', 'GET');

      // Basic validation/fallback
      setDashboardStats(stats || { total_sales: 0, completed_orders: 0, total_profit: 0 });
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
      // Fallback to zeros on error so UI doesn't crash
      setDashboardStats({ total_sales: 0, completed_orders: 0, total_profit: 0 });
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    // 1. Fetch User
    fetchAndSetUser();
    // 2. Fetch Stats (simultaneously)
    refreshDashboardStats();
  }, [fetchAndSetUser, refreshDashboardStats]);


  const login = async (token: string) => {
    localStorage.setItem('authToken', token);
    await fetchAndSetUser(); // Re-fetch the user profile after logging in
    await refreshDashboardStats(); // Also fetch stats
    router.push('/profile'); // Redirect after successful login and profile fetch
  };

  const signOut = () => {
    localStorage.removeItem('authToken');
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

// --- Create the Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};