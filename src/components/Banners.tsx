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
          const isFirst = index === 0; // 👈 Pehla banner check
          const isLoaded = !!loadedImages[index];

          return (
            <div key={banner.id} style={{ minWidth: '100%', position: 'relative', height: '100%' }}>
              
              {/* 🟢 LOADER: Sirf baqi slides ke liye aayega, pehli ke liye nahi (LCP fix) */}
              {!isFirst && !isLoaded && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SjLoader />
                </div>
              )}

              <Link href={banner.link_url || '#'} className="block w-full h-full relative" aria-label={`View promotion ${index + 1}`}>
                <Image 
  src={banner.image_url} 
  alt={`Promotional Banner ${index + 1}`}
  fill
  sizes="(max-width: 768px) 100vw, 1200px"
  quality={75} /* Vercel isko compress karega */
  style={{ 
    objectFit: 'cover', 
    opacity: isFirst ? 1 : (isLoaded ? 1 : 0), 
    transition: isFirst ? 'none' : 'opacity 0.4s ease-in-out' 
  }}
  priority={isFirst} 
  loading={isFirst ? "eager" : "lazy"}
  fetchPriority={isFirst ? "high" : "auto"}
  onLoad={() => {
    if (!isFirst) setLoadedImages(prev => ({ ...prev, [index]: true }));
  }} 
/>
              </Link>
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <div className="banner-dots" style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0px', zIndex: 10 }}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <span style={{
                display: 'block',
                width: currentIndex === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: currentIndex === index ? '#c2410c' : 'rgba(255, 255, 255, 0.9)', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                transition: 'all 0.3s ease'
              }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}