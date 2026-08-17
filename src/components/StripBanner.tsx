// src/components/StripBanner.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DESKTOP_STRIP_URL = "https://media.sj10.pk/banners/animated-strip-ezgif.com-video-to-webp-converter.webp";

export default function StripBanner() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 769) {
      setIsDesktop(true);
    }
  }, []);

  // 🟢 Mobile par 0 KB download hoga
  if (!isDesktop) return null;

  return (
    <div className="desktop-strip-only">
      <div className="container">
        <Link href="/explore" className="block w-full" aria-label="View our latest promotions">
          <div className="desktop-strip-wrapper">
            <img
              src={DESKTOP_STRIP_URL}
              alt="SJ10 Mega Promotions"
              width="1200"
              height="170"
              className="desktop-strip-img"
              loading="lazy"
            />
          </div>
        </Link>
      </div>

      <style jsx>{`
        .desktop-strip-only { 
          display: block; 
          width: 100%; 
          margin: 18px 0; 
        }
        .desktop-strip-wrapper {
          width: 100%;
          aspect-ratio: 1200 / 170;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background-color: #f1f5f9;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .desktop-strip-img { 
          width: 100%; 
          height: auto; 
          aspect-ratio: 1200 / 170; 
          object-fit: cover; 
          display: block; 
        }
      `}</style>
    </div>
  );
}