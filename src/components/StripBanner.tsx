// src/components/StripBanner.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function StripBanner() {
  return (
    <div className="desktop-strip-wrapper">
      <div className="desktop-strip-container">
        <Link href="/explore" className="block w-full h-full relative">
          <Image
            src="/banners/animated-strip.gif" // 1200x120 GIF
            alt="SJ10 Animated Promotion"
            width={1200}
            height={120}
            className="w-full h-full object-cover"
            priority={true}
            unoptimized={true}
          />
        </Link>
      </div>

      <style jsx>{`
        /* 1. HIDDEN BY DEFAULT (MOBILE) */
        .desktop-strip-wrapper {
          display: none;
        }

        /* 2. VISIBLE ON DESKTOP (Screens larger than 768px) */
        @media (min-width: 768px) {
          .desktop-strip-wrapper {
            display: block !important;
            width: 100%;
            padding: 0 15px;
            margin-top: 10px;
            margin-bottom: 20px;
            box-sizing: border-box;
          }
        }

        .desktop-strip-container {
          max-width: 1200px;
          margin: 0 auto;
          aspect-ratio: 10 / 1; /* Perfect 1200x120 ratio */
          background-color: #e5e7eb; /* Shows gray box if GIF is missing */
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          position: relative;
        }
      `}</style>
    </div>
  );
}