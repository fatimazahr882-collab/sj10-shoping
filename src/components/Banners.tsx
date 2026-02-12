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

const getSpeedOptimizedUrl = (url: string) => {
  if (!url) return '/placeholder.jpg';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
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
    }, 4000); 
    return () => clearInterval(intervalId);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse" />;
  }

  return (
    <div className="banner-container relative w-full h-full overflow-hidden rounded-xl bg-gray-50">
      <div 
        className="banner-slider flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => {
          const isLCP = priority && index === 0;
          const optimizedSrc = getSpeedOptimizedUrl(banner.image_url);

          return (
            <div key={banner.id} className="slide relative min-w-full h-full">
              {banner.link_url ? (
                <Link href={banner.link_url} className="block w-full h-full relative">
                  <Image 
                    src={optimizedSrc} 
                    alt="Offer" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                    priority={isLCP}
                    // 🔥 CRITICAL FIX: Bypass Next.js server processing
                    unoptimized={true}
                  />
                </Link>
              ) : (
                <Image 
                  src={optimizedSrc} 
                  alt="Offer" 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority={isLCP}
                  // 🔥 CRITICAL FIX: Bypass Next.js server processing
                  unoptimized={true}
                />
              )}
            </div>
          );
        })}
      </div>

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