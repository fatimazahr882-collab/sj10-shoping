"use client";

import React, { useState, useEffect } from 'react';
import ProductCard, { type Product } from '@/components/ProductCard';
import Link from 'next/link';

export default function PromotedSection({ products }: { products: Product[] }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (isMounted && (!products || products.length === 0)) {
        return null;
    }

    return (
        <section className="sponsored-section">
            
            {/* 🟢 HEADER MATCHING SCREENSHOT */}
            <div className="sponsored-header">
                <h2 className="section-title">
                    Sponsored 🛒
                </h2>
                {/* Right side 'View All' or 'Share' placeholder like Daraz */}
                <Link href="/explore" className="share-all-btn">
                    <i className="fas fa-share" style={{ marginRight: '6px' }}></i> Share All
                </Link>
            </div>

            {/* 🟢 SLIDER MATCHING SCREENSHOT */}
            <div className="sponsored-slider hide-scrollbar">
                {!isMounted ? (
                    [1, 2, 3, 4, 5].map((skel) => (
                        <div key={`skel-${skel}`} className="sponsored-item skeleton-card">
                            <div className="skel-img animate-pulse"></div>
                            <div className="skel-body">
                                <div className="skel-line animate-pulse" style={{ width: '80%' }}></div>
                                <div className="skel-line animate-pulse" style={{ width: '50%' }}></div>
                            </div>
                        </div>
                    ))
                ) : (
                    products.map((p) => (
                        <div key={`promo-${p.id}`} className="sponsored-item">
                            {/* ProductCard component use ho raha hai */}
                            <ProductCard product={p} />
                        </div>
                    ))
                )}
            </div>

            {/* 🟢 EXACT CSS FOR THE SCREENSHOT UI */}
            <style jsx>{`
                /* Background matching the light green from Daraz screenshot */
                .sponsored-section {
                    background-color: #d1fae5; /* Tailwind's green-100 */
                    padding: 16px 0 20px 0;
                    margin-bottom: 24px;
                    border-top: 8px solid #f3f4f6; /* Subtle separator from above section */
                }

                /* Header Layout */
                .sponsored-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 16px;
                    margin-bottom: 12px;
                }

                .section-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .share-all-btn {
                    font-size: 14px;
                    font-weight: 600;
                    color: #10b981; /* Darker green matching Daraz share button */
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                }

                /* Slider & Card Sizes */
                .sponsored-slider {
                    display: flex;
                    gap: 12px;
                    padding: 0 16px 10px 16px;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                /* 
                   Mobile: Show 1 full card and half of the next card 
                   (approx 160px width is standard for this look)
                */
                .sponsored-item {
                    flex: 0 0 150px;
                    scroll-snap-align: start;
                }

                @media (min-width: 768px) {
                    .sponsored-item { flex: 0 0 200px; }
                    .section-title { font-size: 22px; }
                }

                /* Skeletons */
                .skeleton-card {
                    background: white;
                    border-radius: 12px;
                    height: 240px;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }
                .skel-img {
                    width: 100%;
                    height: 150px;
                    background: #e2e8f0;
                }
                .skel-body {
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .skel-line {
                    height: 12px;
                    background: #e2e8f0;
                    border-radius: 4px;
                }
            `}</style>
        </section>
    );
}