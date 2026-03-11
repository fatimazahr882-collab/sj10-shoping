// src/components/MobileStripBanner.tsx
"use client";
import Image from 'next/image';
import Link from 'next/link';

export default function MobileStripBanner() {
  return (
    <div className="mobile-strip-wrapper">
      <Link href="/explore" className="strip-link">
        <Image
          src="/banners/mobile-animated-strip.gif"
          alt="SJ10 Mobile Sale"
          width={1000}
          height={280}
          className="banner-img"
          priority={true}
          unoptimized={true}
        />
      </Link>

      <style jsx>{`
        /* 1. SHOW ON MOBILE, HIDE ON DESKTOP */
        .mobile-strip-wrapper {
          display: block;
          width: 100%;
          margin-bottom: 20px;
        }

        @media (min-width: 768px) {
          .mobile-strip-wrapper { display: none !important; }
        }

        .strip-link {
          display: block;
          width: 100%;
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