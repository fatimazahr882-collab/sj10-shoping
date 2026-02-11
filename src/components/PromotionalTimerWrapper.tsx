// src/components/PromotionalTimerWrapper.tsx
"use client";

import { useEffect, useState } from 'react';
import PromotionalTimerClient from '@/components/PromotionalTimerClient';

export default function PromotionalTimerWrapper() {
  const [timerData, setTimerData] = useState<any>(null);

  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/active-timer`);
        if (res.ok) {
          const data = await res.json();
          // Check if timer is valid and in the future
          if (data && new Date(data.end_time) > new Date()) {
            setTimerData(data);
          }
        }
      } catch (error) {
        // Silently fail on client side - won't crash the app
        console.warn("Timer fetch failed:", error);
      }
    };

    fetchTimer();
  }, []);

  if (!timerData) return null;

  return <PromotionalTimerClient initialTimerData={timerData} />;
}