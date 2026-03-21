// src/components/MobileStripBanner.tsx
"use client";

import Link from 'next/link';

export default function MobileStripBanner() {
  return (
    <div className="mobile-strip-only">
      <Link href="/explore" className="block w-full">
        <video
          src="/banners/mobile-animated-strip.mp4" 
          width={1000}
          height={280}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-auto block"
        />
      </Link>
      <style jsx>{`
        .mobile-strip-only { display: block; width: 100%; margin: 10px 0; }
        @media (min-width: 768px) { .mobile-strip-only { display: none !important; } }
      `}</style>
    </div>
  );
}