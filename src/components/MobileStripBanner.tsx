// src/components/MobileStripBanner.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function MobileStripBanner() {
  return (
    <div className="mobile-strip-wrapper">
      <div className="mobile-strip-container">
        {/* Replace /explore with your actual link */}
        <Link href="/explore" className="block w-full h-full relative">
          <Image
            src="/banners/mobile-animated-strip.gif" // 1000x200 GIF
            alt="SJ10 Mobile Promotion"
            width={1000}
            height={200}
            className="w-full h-full object-cover"
            priority={true}
            unoptimized={true}
          />
        </Link>
      </div>

      <style jsx>{`
        /* 1. VISIBLE BY DEFAULT (MOBILE) */
        .mobile-strip-wrapper {
          display: block;
          width: 100%;
          padding: 0 15px; 
          margin-top: 10px;
          margin-bottom: 20px;
          box-sizing: border-box;
        }

        /* 2. HIDE ON DESKTOP (Screens larger than 768px) */
        @media (min-width: 768px) {
          .mobile-strip-wrapper {
            display: none !important;
          }
        }

        /* Container styles with a gray placeholder to prevent disappearing */
        .mobile-strip-container {
          width: 100%;
          aspect-ratio: 5 / 1; /* Perfect 1000x200 ratio */
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