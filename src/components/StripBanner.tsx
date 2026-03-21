// src/components/StripBanner.tsx
"use client";

import Link from 'next/link';

export default function StripBanner() {
  return (
    <div className="desktop-strip-only">
      <Link href="/explore" className="block w-full" aria-label="View our latest promotions">
        <video
          src="/banners/animated-strip.mp4" 
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true" /* Fixes the 'missing captions' accessibility error */
          className="strip-video"
        />
      </Link>
      <style jsx>{`
        .desktop-strip-only { display: none; }
        .strip-video {
          width: 100%;
          height: auto;
          display: block;
          /* ✅ FIX CLS: Reserves exact space before video loads to stop page jumping */
          aspect-ratio: 1200 / 170;
          background-color: #f1f5f9; /* Soft placeholder color */
          border-radius: 8px;
        }
        @media (min-width: 768px) {
          .desktop-strip-only { display: block !important; width: 100%; margin: 15px 0; }
        }
      `}</style>
    </div>
  );
}