"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // ✅ Import Next.js Link

type Banner = {
  id: number;
  image_url: string;
  link_url?: string; // This will now be used
};

type Props = {
  banners: Banner[];
  priority?: boolean;
};

// --- SPEED HELPER ---
// This function creates a tiny, blurred placeholder from the original image URL.
const getLowQualityPlaceholder = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) {
    // A fallback pixel if the image isn't from Cloudinary
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgchljQYAAAAASUVORK5CYII=';
  }
  return url.replace('/upload/', '/upload/w_20,q_10,e_blur:1000/');
};

// --- SKELETON LOADER ---
// A shimmer skeleton that perfectly matches the banner's shape.
const BannerSkeleton = () => (
    <div className="banner-container">
        <div className="w-full h-full bg-gray-200 relative overflow-hidden">
            <div 
                className="shimmer-effect" 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    animation: 'shimmer 1.5s infinite'
                }}
            />
        </div>
        <style jsx>{`
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `}</style>
    </div>
);


export default function Banners({ banners, priority = false }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return <BannerSkeleton />;
  }

  return (
    <div className="banner-container">
      <div 
        className="banner-slider"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          // ✅ THIS IS THE FIX: Replaced the 'Wrapper' variable with a direct ternary operator.
          // If banner.link_url exists, it renders a <Link>. Otherwise, it renders a <div>.
          banner.link_url ? (
            <Link key={banner.id} href={banner.link_url} className="slide">
              <Image 
                src={banner.image_url} 
                alt="Promotional Banner" 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                priority={priority && index === 0}
                quality={75}
                placeholder="blur"
                blurDataURL={getLowQualityPlaceholder(banner.image_url)}
              />
            </Link>
          ) : (
            <div key={banner.id} className="slide">
              <Image 
                src={banner.image_url} 
                alt="Promotional Banner" 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                priority={priority && index === 0}
                quality={75}
                placeholder="blur"
                blurDataURL={getLowQualityPlaceholder(banner.image_url)}
              />
            </div>
          )
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