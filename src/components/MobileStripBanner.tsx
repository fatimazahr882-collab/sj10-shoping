// src/components/MobileStripBanner.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';

const MOBILE_STRIP_URL = "https://media.sj10.pk/banners/mobile-animated-strip.webp";

export default function MobileStripBanner() {
  return (
    <div className="mobile-strip-only">
      <Link href="/explore" className="block w-full" aria-label="View our latest promotions">
        <div className="mobile-strip-wrapper">
          <Image
            src={MOBILE_STRIP_URL}
            alt="SJ10 Special Deals"
            width={1000}
            height={280}
            priority={true}
            unoptimized={true} 
            className="mobile-strip-img"
          />
        </div>
      </Link>

      <style jsx>{`
        .mobile-strip-only { 
          display: block; width: 100%; margin: 10px 0; padding: 0 12px; box-sizing: border-box; 
        }
        .mobile-strip-wrapper {
          width: 100%; aspect-ratio: 1000 / 280; position: relative;
          border-radius: 12px; overflow: hidden; background-color: #f1f5f9;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .mobile-strip-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (min-width: 769px) { .mobile-strip-only { display: none !important; } }
      `}</style>
    </div>
  );
}