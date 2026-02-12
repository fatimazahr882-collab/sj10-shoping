// src/components/Banners.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Banner = { id: number; image_url: string; link_url?: string; };
type Props = { banners: Banner[]; priority?: boolean; };

export default function Banners({ banners, priority = false }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000); 
    return () => clearInterval(intervalId);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return <div className="w-full h-full bg-gray-200 rounded-xl animate-pulse" />;
  }

  return (
    <div className="banner-container">
      <div 
        className="banner-slider"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="slide">
            <Link href={banner.link_url || '#'} className="block w-full h-full relative">
              <Image 
                src={banner.image_url} 
                alt="Promotional Banner" 
                fill
                // Sizes tells the browser which image to download based on screen width
                sizes="(max-width: 768px) 100vw, 70vw"
                style={{ objectFit: 'cover' }}
                // Priority is CRITICAL for LCP. It tells Next.js to preload this image.
                // We only set it for the very first banner in the slider.
                priority={priority && index === 0}
              />
            </Link>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}