// src/components/Banners.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Banner = {
  id: number;
  image_url: string;
  link_url?: string;
};

type Props = {
  banners: Banner[];
  priority?: boolean;
};

// SPEED OPTIMIZER: Forces Cloudinary to send a lightweight version
const getSpeedOptimizedUrl = (url: string) => {
  if (!url) return '/placeholder.jpg';
  // If your images are hosted on Cloudinary, this drastically reduces file size
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // w_800: Resize width (mobile/tablet friendly)
    // q_auto:low: Aggressive quality reduction for speed
    // f_auto: Best format (WebP/AVIF)
    return url.replace('/upload/', '/upload/w_800,q_auto:low,f_auto/');
  }
  return url;
};

export default function Banners({ banners, priority = true }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000); // 4 seconds rotation
    return () => clearInterval(intervalId);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    // Return a lightweight gray box instead of a heavy shimmer component
    return <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse" />;
  }

  return (
    <div className="banner-container relative w-full h-full overflow-hidden rounded-xl bg-gray-50">
      <div 
        className="banner-slider flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => {
          // LCP OPTIMIZATION: Only the first banner gets priority loading
          const isLCP = index === 0;
          const optimizedSrc = getSpeedOptimizedUrl(banner.image_url);

          return (
            <div key={banner.id} className="slide relative min-w-full h-full">
              {banner.link_url ? (
                <Link href={banner.link_url} className="block w-full h-full relative">
                  <Image 
                    src={optimizedSrc} 
                    alt="Offer" 
                    fill
                    // Very aggressive sizing to prevent loading 4k images on mobile
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    priority={isLCP} // Forces browser to load this FIRST
                    quality={60} // Lower quality for speed
                    loading={isLCP ? "eager" : "lazy"}
                  />
                </Link>
              ) : (
                <Image 
                  src={optimizedSrc} 
                  alt="Offer" 
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  priority={isLCP}
                  quality={60}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 shadow-sm cursor-pointer ${
                currentIndex === index ? 'bg-white w-6' : 'bg-white/60 hover:bg-white/80'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}