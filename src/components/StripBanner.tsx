// src/components/StripBanner.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';

const DESKTOP_STRIP_URL = "https://media.sj10.pk/banners/animated-strip-ezgif.com-video-to-webp-converter.webp";

export default function StripBanner() {
  return (
    <div className="desktop-strip-only">
      <div className="container">
        <Link href="/explore" className="block w-full" aria-label="View our latest promotions">
          <div className="desktop-strip-wrapper">
            <Image
              src={DESKTOP_STRIP_URL}
              alt="SJ10 Mega Promotions"
              width={1200}
              height={170}
              priority={false}
              loading="lazy"
              unoptimized={true} 
              className="desktop-strip-img"
            />
          </div>
        </Link>
      </div>

      <style jsx>{`
        .desktop-strip-only { display: none; }
        @media (min-width: 769px) {
          .desktop-strip-only { display: block !important; width: 100%; margin: 18px 0; }
          .desktop-strip-wrapper {
            width: 100%; aspect-ratio: 1200 / 170; position: relative;
            border-radius: 12px; overflow: hidden; background-color: #f1f5f9;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          }
          .desktop-strip-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        }
      `}</style>
    </div>
  );
}