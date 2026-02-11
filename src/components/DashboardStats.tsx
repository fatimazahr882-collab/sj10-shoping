"use client";

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalSales: 0,
    completedOrders: 0,
    totalProfit: 0,
    totalBonus: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient('/dashboard');
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // --- STYLES (Matching your Screenshot) ---
  const s = {
    card: {
      background: 'linear-gradient(135deg, #01126d 0%, #cc9d01 100%)', // Brand Green
      borderRadius: '16px',
      padding: '20px',
      color: '#fff',
      margin: '15px',
      boxShadow: '0 8px 20px -5px rgba(0, 184, 98, 0.4)',
      position: 'relative' as 'relative',
      overflow: 'hidden'
    },
    // The Big Number at Top (Total Sales / Revenue)
    mainStat: {
      textAlign: 'center' as 'center',
      marginBottom: '20px',
      position: 'relative' as 'relative',
      zIndex: 2
    },
    mainValue: {
      fontSize: '32px',
      fontWeight: '800',
      marginBottom: '5px'
    },
    mainLabel: {
      fontSize: '12px',
      fontWeight: '600',
      opacity: 0.9,
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '1px'
    },
    // Grid for 3 Bottom Stats
    grid: {
      display: 'flex',
      justifyContent: 'space-between',
      borderTop: '1px solid rgba(255,255,255,0.2)',
      paddingTop: '15px',
      position: 'relative' as 'relative',
      zIndex: 2
    },
    statItem: {
      textAlign: 'center' as 'center',
      flex: 1
    },
    subLabel: {
      fontSize: '11px',
      opacity: 0.9,
      marginBottom: '4px'
    },
    subValue: {
      fontSize: '16px',
      fontWeight: '700'
    },
    // Refresh Icon
    refreshBtn: {
      position: 'absolute' as 'absolute',
      top: '15px',
      right: '15px',
      background: 'rgba(255,255,255,0.2)',
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '12px',
      zIndex: 10,
      backdropFilter: 'blur(5px)'
    },
    // Decoration Circles
    circle1: {
      position: 'absolute' as 'absolute',
      top: '-20px',
      left: '-20px',
      width: '100px',
      height: '100px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '50%',
      zIndex: 1
    },
    circle2: {
      position: 'absolute' as 'absolute',
      bottom: '-30px',
      right: '-10px',
      width: '120px',
      height: '120px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '50%',
      zIndex: 1
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    apiClient('/dashboard').then(data => {
      setStats(data);
      setLoading(false);
    });
  };

  return (
    <div style={s.card}>
      {/* Decorative Background */}
      <div style={s.circle1}></div>
      <div style={s.circle2}></div>

      {/* Refresh Button */}
      <div style={s.refreshBtn} onClick={handleRefresh}>
        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
      </div>

      {/* Main Big Stat (Total Sales Value) */}
      <div style={s.mainStat}>
        <div style={s.mainValue}>
          {loading ? '...' : `Rs. ${stats.totalSales.toLocaleString()}`}
        </div>
        <div style={s.mainLabel}>Total Sales Value</div>
      </div>

      {/* Bottom 3 Stats */}
      <div style={s.grid}>
        {/* 1. Orders */}
        <div style={s.statItem}>
          <div style={s.subLabel}>Completed Orders</div>
          <div style={s.subValue}>{loading ? '-' : stats.completedOrders}</div>
        </div>

        {/* 2. Profit */}
        <div style={s.statItem}>
          <div style={s.subLabel}>Total Profit</div>
          <div style={s.subValue}>{loading ? '-' : `Rs. ${stats.totalProfit.toLocaleString()}`}</div>
        </div>

        {/* 3. Bonus */}
        <div style={s.statItem}>
          <div style={s.subLabel}>Total Bonus</div>
          <div style={s.subValue}>{loading ? '-' : `Rs. ${stats.totalBonus.toLocaleString()}`}</div>
        </div>
      </div>
    </div>
  );
}