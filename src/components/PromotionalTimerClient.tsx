// src/components/PromotionalTimerClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type TimerData = {
  name: string;
  end_date: string; // ISO string expected from server (e.g. "2025-11-20T12:00:00Z")
  logo_url?: string | null;
};

const calculateTimeLeft = (endDate: string) => {
  const diff = +new Date(endDate) - +new Date();
  if (diff <= 0) return {};
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  } as Record<string, number>;
};

export default function PromotionalTimerClient({ initialTimerData }: { initialTimerData: TimerData | null }) {
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>(() =>
    initialTimerData ? calculateTimeLeft(initialTimerData.end_date) : {}
  );
  const [visible, setVisible] = useState<boolean>(!!initialTimerData);

  useEffect(() => {
    if (!initialTimerData) return;

    // sync on mount immediately then every second
    const tick = () => {
      const tl = calculateTimeLeft(initialTimerData.end_date);
      if (Object.keys(tl).length === 0) {
        setTimeLeft({});
        setVisible(false);
        return;
      }
      setTimeLeft(tl);
      setVisible(true);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [initialTimerData]);

  if (!initialTimerData || !visible || Object.keys(timeLeft).length === 0) return null;

  const order: Array<"days" | "hours" | "minutes" | "seconds"> = ["days", "hours", "minutes", "seconds"];

  return (
    <div className="promotional-timer-banner" role="region" aria-label={`Promotion: ${initialTimerData.name}`}>
      <div className="timer-content" style={{ alignItems: "center", display: "flex", gap: 12, width: "100%", maxWidth: 1200, margin: "0 auto" }}>
        {initialTimerData.logo_url && (
          <div className="timer-logo-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 40 }}>
            <Image src={initialTimerData.logo_url} alt={`${initialTimerData.name} logo`} width={32} height={32} unoptimized />
          </div>
        )}

        <div className="timer-text" style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <div className="timer-title" style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{initialTimerData.name}</div>
          <div className="timer-countdown" aria-live="polite" style={{ display: "flex", gap: 8, marginTop: 2 }}>
            {order.map((k) =>
              timeLeft[k] !== undefined ? (
                <span key={k} className="timer-segment" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", padding: "6px 8px", borderRadius: 6, minWidth: 48, background: "rgba(15,23,42,0.04)" }}>
                  <span className="timer-value" style={{ fontWeight: 700, fontSize: 14 }}>{String(timeLeft[k]).padStart(2, "0")}</span>
                  <span className="timer-label" style={{ fontSize: 11, opacity: 0.7 }}>{k[0]}</span>
                </span>
              ) : null
            )}
          </div>
        </div>

        <button
          className="timer-close-btn"
          onClick={() => setVisible(false)}
          aria-label="Dismiss promotion"
          style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#334155", padding: 6 }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
