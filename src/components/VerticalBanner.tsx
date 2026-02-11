// src/components/VerticalBanner.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import SjLoader from './SjLoader';

// Create a stateful inner component for each slide
function VerticalSlide({ src, alt }: { src: string; alt: string }) {
    const [isLoading, setIsLoading] = useState(true);
    return (
        <div className="v-slide">
            {isLoading && <SjLoader />}
            <Image 
                src={src} 
                alt={alt} 
                fill 
                style={{ objectFit: 'cover' }} 
                  unoptimized={true} // Keep unoptimized for GIFs if needed, otherwise remove
                priority={true} // <--- ADD THIS to the first slide for LCP optimization
                className={isLoading ? 'image-loading' : 'image-loaded'}
                onLoad={() => setIsLoading(false)}
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
            <VerticalSlide src="/vertical1.gif" alt="Vertical Banner 1" />
            <VerticalSlide src="/vertical2.gif" alt="Vertical Banner 2" />
            <VerticalSlide src="/vertical3.gif" alt="Vertical Banner 3" />
          </div>
        </div>
    );
}