// src/components/MobileStripBanner.tsx
"use client";

import Link from 'next/link';

export default function MobileStripBanner() {
  return (
    <div className="mobile-strip-only">
      <Link href="/explore" className="block w-full" aria-label="View our latest promotions">
        <video
          src="/banners/mobile-animated-strip.mp4" 
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true" /* Fixes the 'missing captions' accessibility error */
          className="mobile-strip-video"
        />
      </Link>
      <style jsx>{`
        .mobile-strip-only { display: block; width: 100%; margin: 10px 0; }
        .mobile-strip-video {
          width: 100%;
          height: auto;
          display: block;
          /* ✅ FIX CLS: Reserves exact space before video loads to stop page jumping */
          aspect-ratio: 1000 / 280;
          background-color: #f1f5f9;
          border-radius: 8px;
        }
        @media (min-width: 768px) { 
          .mobile-strip-only { display: none !important; } 
        }
      `}</style>
    </div>
  );
}