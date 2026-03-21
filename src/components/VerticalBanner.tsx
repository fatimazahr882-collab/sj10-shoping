// src/components/VerticalBanner.tsx
"use client";

import { useEffect } from 'react';
import Image from 'next/image';

function VerticalSlide({ src, alt, isPriority = false }: { src: string; alt: string; isPriority?: boolean }) {
    return (
        <div className="v-slide" style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#f1f5f9' }}>
            <Image 
                src={src} 
                alt={alt} 
                fill 
                /* ✅ NEXT.JS OPTIMIZATION: Instant loading */
                priority={isPriority} 
                quality={60} /* ✅ Aggressive compression for speed */
                sizes="(max-width: 768px) 0vw, 25vw" /* Only loads what is needed for the side column */
                style={{ objectFit: 'cover' }} 
                className="banner-fade-in"
            />
        </div>
    );
}

export default function VerticalBanner() {
    useEffect(() => {
        const slider = document.querySelector('.vertical-slider') as HTMLDivElement | null;
        if (!slider) return;
        const slidesCount = slider.children.length;
        if (slidesCount <= 1) return;

        let currentIndex = 0;
        const intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % slidesCount;
            slider.style.transform = `translateY(-${currentIndex * (100 / slidesCount)}%)`;
        }, 4000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="vertical-banner-container">
          <div className="vertical-slider">
            {/* ✅ Using .webp images with priority on the first one */}
            <VerticalSlide src="/vertical1.webp" alt="Promo 1" isPriority={true} />
            <VerticalSlide src="/vertical2.webp" alt="Promo 2" />
            <VerticalSlide src="/vertical3.webp" alt="Promo 3" />
          </div>
        </div>
    );
}