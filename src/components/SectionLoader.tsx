"use client";

import React from 'react';

export default function CreativeLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="loader-container">
      <style jsx>{`
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          width: 100%;
          min-height: 250px;
          background: transparent;
        }

        /* --- The Orbiting System --- */
        .orbit-system {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 1. The Central Logo */
        .brand-logo {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: 24px;
          color: #1e293b; /* Dark Slate */
          z-index: 10;
          letter-spacing: -1px;
          animation: breathe 3s ease-in-out infinite;
          position: relative;
        }
        
        /* 2. The Inner Static Ring (Subtle Track) */
        .track-ring {
          position: absolute;
          inset: 5px;
          border-radius: 50%;
          border: 2px solid rgba(0, 0, 0, 0.05);
        }

        /* 3. The Kinetic Gradient Spinner */
        .kinetic-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          /* The magic: Transparent border with a colored top */
          border: 3px solid transparent;
          border-top-color: #FF7F00; /* Primary Orange */
          border-right-color: #ff9f43; /* Lighter Orange */
          
          /* Glow Effect */
          filter: drop-shadow(0 0 4px rgba(255, 127, 0, 0.3));
          
          /* Animation */
          animation: spin-accelerate 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }

        /* 4. The Counter-Rotating Accent (Adds complexity/beauty) */
        .accent-dot {
          position: absolute;
          inset: -6px; /* Slightly larger */
          border-radius: 50%;
          border: 2px solid transparent;
          border-bottom-color: #3b82f6; /* Subtle Blue accent for contrast */
          opacity: 0.4;
          animation: spin-reverse 2.5s linear infinite;
        }

        /* --- Typography --- */
        .loading-text {
          margin-top: 24px;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 2px;
          
          /* Elegant Gradient Text */
          background: linear-gradient(90deg, #94a3b8 0%, #334155 50%, #94a3b8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer-text 3s linear infinite;
        }

        /* --- Animations --- */
        @keyframes spin-accelerate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.95); opacity: 0.8; }
        }

        @keyframes shimmer-text {
          to { background-position: 200% center; }
        }
      `}</style>

      <div className="orbit-system">
        <div className="track-ring"></div>
        <div className="accent-dot"></div>
        <div className="kinetic-ring"></div>
        <div className="brand-logo">SJ</div>
      </div>

      <div className="loading-text">{text}</div>
    </div>
  );
}