// src/components/StripBanner.tsx
"use client";
import Image from 'next/image';
import Link from 'next/link';

export default function StripBanner() {
  return (
    <div className="desktop-strip-wrapper">
      <Link href="/explore" className="strip-link">
        <Image
          src="/banners/animated-strip.gif"
          alt="SJ10 Grand Sale"
          width={1200}
          height={170}
          className="banner-img"
          priority={true}
          unoptimized={true}
        />
      </Link>

      <style jsx>{`
        /* 1. HIDE ON MOBILE, SHOW ON DESKTOP */
        .desktop-strip-wrapper { display: none; }

        @media (min-width: 768px) {
          .desktop-strip-wrapper {
            display: block !important;
            width: 100%;
            margin-bottom: 20px;
          }
        }

        .strip-link {
          display: block;
          width: 100%;
          border-radius: 0; /* Changed to 0 if you want it full edge-to-edge */
          overflow: hidden;
        }

        .banner-img {
          width: 100%;
          height: auto;
          display: block;
        }
      `}</style>
    </div>
  );
}