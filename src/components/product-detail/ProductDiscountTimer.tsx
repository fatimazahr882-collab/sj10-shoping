"use client";

import React, { useState, useEffect } from 'react';

type TimerProps = {
  discountName: string;
  endTime?: string | null;
};

export default function ProductDiscountTimer({ discountName, endTime }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    // 🟢 STRICT REAL-TIME CHECK: Agar Database se End Time NAHI aaya, tou Timer BILKUL NAHI dikhega!
    if (!endTime) {
      setTimeLeft(null);
      return;
    }

    const targetDate = new Date(endTime).getTime();
    
    // Agar Date Invalid hai, tab bhi Timer nahi dikhega
    if (isNaN(targetDate)) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      // 🟢 Agar Expiry Date guzar chuki hai (Time Finished), tou Timer chup jayega
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      // Real-Time Difference Calculation (Database Date - Today Date)
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  // Agar TimeLeft null hai (yaani DB mein Expiry Date nahi mili), tou Return Null
  if (!timeLeft) return null;

  return (
    <div className="discount-timer-card">
      <div className="timer-header">
        <div className="timer-title-wrap">
          <i className="fas fa-fire flame-icon"></i>
          <span className="timer-discount-name">{discountName || "Special Sale Offer"}</span>
        </div>
        <span className="timer-status-badge">Ends Soon</span>
      </div>

      <div className="timer-clock-row">
        <div className="clock-box">
          <span className="num">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="unit">Days</span>
        </div>
        <span className="colon">:</span>
        <div className="clock-box">
          <span className="num">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="unit">Hours</span>
        </div>
        <span className="colon">:</span>
        <div className="clock-box">
          <span className="num">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="unit">Mins</span>
        </div>
        <span className="colon">:</span>
        <div className="clock-box seconds-box">
          <span className="num">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="unit">Secs</span>
        </div>
      </div>

      <style jsx>{`
        .discount-timer-card {
          background: linear-gradient(135deg, #fff7ed 0%, #fef2f2 100%);
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 12px 16px;
          margin: 12px 0;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.05);
        }

        .timer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .timer-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .flame-icon {
          color: #ef4444;
          font-size: 15px;
          animation: pulseFlame 1.5s infinite ease-in-out;
        }

        @keyframes pulseFlame {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        .timer-discount-name {
          font-size: 13px;
          font-weight: 800;
          color: #991b1b;
          letter-spacing: -0.2px;
        }

        .timer-status-badge {
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .timer-clock-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .clock-box {
          background: #ffffff;
          border: 1px solid #fee2e2;
          padding: 5px 8px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .seconds-box {
          border-color: #fca5a5;
          background: #fef2f2;
        }

        .num {
          font-size: 15px;
          font-weight: 900;
          color: #1e293b;
          line-height: 1;
          font-family: monospace;
        }

        .seconds-box .num {
          color: #dc2626;
        }

        .unit {
          font-size: 8px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .colon {
          font-weight: 900;
          color: #ef4444;
          font-size: 15px;
          margin-bottom: 6px;
        }
      `}</style>
    </div>
  );
}