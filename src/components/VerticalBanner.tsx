// src/components/VerticalBanner.tsx
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import SjLoader from './SjLoader';

// Passed priority as a prop so we only apply it to the FIRST image
function VerticalSlide({ src, alt, isPriority = false }: { src: string; alt: string; isPriority?: boolean }) {
    const [isLoading, setIsLoading] = useState(true);
    
    return (
        <div className="v-slide" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {isLoading && <SjLoader />}
            <Image 
                src={src} 
                alt={alt} 
                fill 
                sizes="(max-width: 768px) 0vw, 33vw" // Tells browser it takes up 1/3 of desktop screen
                style={{ objectFit: 'cover' }} 
                priority={isPriority} // ONLY true for the first image
                className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}
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
            {/* We only give priority to the first slide because it's the one the user sees immediately */}
            <VerticalSlide src="/vertical1.webp" alt="Vertical Banner 1" isPriority={true} />
            <VerticalSlide src="/vertical2.webp" alt="Vertical Banner 2" />
            <VerticalSlide src="/vertical3.webp" alt="Vertical Banner 3" />
          </div>
        </div>
    );
}