// src/components/StripBanner.tsx
"use client";

import Link from 'next/link';

export default function StripBanner() {
  return (
    <div className="desktop-strip-only">
      <Link href="/explore" className="block w-full">
        <video
          src="/banners/animated-strip.mp4" 
          width={1200}
          height={170}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-auto block"
        />
      </Link>
      <style jsx>{`
        .desktop-strip-only { display: none; }
        @media (min-width: 768px) {
          .desktop-strip-only { display: block !important; width: 100%; margin: 15px 0; }
        }
      `}</style>
    </div>
  );
}