"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SjLoader from './SjLoader'; 

type Banner = { id: number; image_url: string; link_url?: string; };

export default function Banners({ banners, priority = false }: { banners: Banner[]; priority?: boolean; }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (!banners || banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
  }, [banners]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  }, [startTimer]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    resetTimer(); 
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  if (!banners || banners.length === 0) return null;

  return (
    <div 
      className="banner-container" 
      style={{ position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: '21/9', backgroundColor: '#f8fafc', borderRadius: '12px' }}
    >
      <div 
        className="banner-slider" 
        style={{ display: 'flex', height: '100%', transition: 'transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)', transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => {
          const isLoaded = !!loadedImages[index];

          return (
            <div key={banner.id} style={{ minWidth: '100%', position: 'relative', height: '100%' }}>
              {!isLoaded && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SjLoader />
                </div>
              )}

              <Link href={banner.link_url || '#'} className="block w-full h-full relative" aria-label={`View promotion ${index + 1}`}>
                <Image 
                  src={banner.image_url} 
                  alt={`Promotional Banner ${index + 1}`}
                  fill
                  unoptimized={true} 
                  sizes="(max-width: 768px) 100vw, 1200px"
                  style={{ objectFit: 'cover', opacity: isLoaded ? 1 : 0, transition: 'opacity 0.4s ease-in-out' }}
                  
                  // ⚡ THE VIP PROTOCOL FIX FOR LCP ⚡
                  priority={priority && index === 0}
                  loading={priority && index === 0 ? "eager" : "lazy"}
                  fetchPriority={priority && index === 0 ? "high" : "auto"}
                  
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [index]: true }))} 
                />
              </Link>
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <div className="banner-dots" style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              style={{
                width: currentIndex === index ? '24px' : '8px',
                height: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0,
                backgroundColor: currentIndex === index ? '#f85606' : 'rgba(255, 255, 255, 0.6)', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}