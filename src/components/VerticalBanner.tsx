// src/components/VerticalBanner.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';

type VerticalBannerItem = {
    id: number;
    title: string;
    image_url: string;
    link_url?: string;
    display_order?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://products.sj10.pk/api";
const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
});

export default function VerticalBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // SWR Fetcher for Desktop Vertical Banners
    const { data: banners, isLoading } = useSWR<VerticalBannerItem[]>(
        `${API_BASE}/products/vertical-banners`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 300000, 
            keepPreviousData: true
        }
    );

    // Automatic Rotation
    useEffect(() => {
        if (!banners || banners.length <= 1) return;

        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 4000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [banners]);

    if (!banners || banners.length === 0) {
        // Fallback static structure so layout doesn't collapse
        return <div className="vertical-banner-container desktop-only-v-banner"></div>;
    }

    return (
        <div className="vertical-banner-container desktop-only-v-banner">
            <div 
                className="vertical-slider"
                style={{
                    height: `${banners.length * 100}%`,
                    transform: `translateY(-${currentIndex * (100 / banners.length)}%)`,
                    transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
            >
                {banners.map((banner, index) => (
                    <div 
                        key={banner.id || index} 
                        className="v-slide"
                        style={{ height: `${100 / banners.length}%`, position: 'relative' }}
                    >
                        <Link 
                            href={banner.link_url || '/explore'} 
                            className="block w-full h-full relative"
                            aria-label={banner.title || `Vertical promotion ${index + 1}`}
                        >
                            <Image 
                                src={banner.image_url} 
                                alt={banner.title || `Promo ${index + 1}`} 
                                fill 
                                sizes="25vw"
                                quality={70}
                                priority={index === 0}
                                unoptimized={true}
                                style={{ objectFit: 'cover' }} 
                                className="banner-fade-in"
                            />
                        </Link>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .vertical-banner-container {
                    height: 380px;
                    width: 100%;
                    background-color: #f1f5f9;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                }

                .desktop-only-v-banner {
                    display: none;
                }

                @media (min-width: 769px) {
                    .desktop-only-v-banner {
                        display: block !important;
                    }
                }

                .vertical-slider {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .v-slide {
                    width: 100%;
                    flex-shrink: 0;
                }

                .banner-fade-in {
                    animation: fadeIn 0.4s ease-in-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}