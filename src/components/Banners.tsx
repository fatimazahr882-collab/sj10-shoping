// src/components/Banners.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Banner = { id: number; image_url: string; link_url?: string; };

export default function Banners({ banners, priority = false }: { banners: Banner[]; priority?: boolean; }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); 
    return () => clearInterval(intervalId);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="banner-container" style={{ position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: '21/9' }}>
      <div className="banner-slider" style={{ display: 'flex', height: '100%', transition: 'transform 0.7s ease-in-out', transform: `translateX(-${currentIndex * 100}%)` }}>
        {banners.map((banner, index) => (
          <div key={banner.id} style={{ minWidth: '100%', position: 'relative' }}>
            <Link href={banner.link_url || '#'} className="block w-full h-full relative" aria-label={`View promotion ${index + 1}`}>
              <Image 
                src={banner.image_url} 
                alt="Promotional Banner" 
                fill
                 unoptimized // <--- ADD THIS HERE
                sizes="(max-width: 768px) 100vw, 70vw"
                style={{ objectFit: 'cover' }}
                /* ✅ FIXED: Applying fetchPriority and disabling lazy load for LCP */
                priority={priority && index === 0}
                loading={priority && index === 0 ? "eager" : "lazy"}
              
                fetchPriority={priority && index === 0 ? "high" : "low"}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}