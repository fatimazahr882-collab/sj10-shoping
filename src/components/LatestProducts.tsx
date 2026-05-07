"use client";

import React from 'react';
import useSWR from 'swr';
import ProductCard, { type Product } from '@/components/ProductCard';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json());

// 🟢 NEW: SKELETON CARD COMPONENT (for reusability)
const SkeletonCard = () => (
    <div className="latest-item skeleton-card">
        <div className="skel-img animate-pulse"></div>
        <div className="skel-body">
            <div className="skel-line animate-pulse" style={{ width: '80%' }}></div>
            <div className="skel-line animate-pulse" style={{ width: '50%' }}></div>
        </div>
    </div>
);

export default function LatestProducts() {
    const { data: products, error, isLoading } = useSWR(
        `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/latest-realtime`,
        fetcher,
        {
            revalidateOnFocus: false, // Prevents re-fetching when tab is re-focused
            keepPreviousData: true,   // Keeps old data visible while new data is loading
            dedupingInterval: 60000   // Prevents hitting the API more than once per minute
        }
    );

    // 🟢 SMART LOADING LOGIC: Show skeleton on initial load OR if API fails
    const showSkeletons = isLoading || (!products && !error);
    const showApiError = error && !isLoading && !products;

    return (
        <section className="latest-premium-section">
            
            {/* 🟢 BEAUTIFUL HEADER WITH LIVE BADGE */}
            <div className="latest-header">
                <div className="title-wrapper">
                    <div className="icon-glow-box">
                        <span className="live-badge">LIVE</span>
                    </div>
                    <h2 className="section-title">Latest Arrivals</h2>
                </div>
                {/* Optional: Add a View All link if you have a "Newest" sort page */}
                {/* <Link href="/explore?sort=newest" className="view-all-link">View All</Link> */}
            </div>

            {/* 🟢 SMOOTH SCROLLING SLIDER */}
            <div className="latest-slider hide-scrollbar">
                
                {/* Show 5 skeletons during load or on API error */}
                {showSkeletons && (
                    [1, 2, 3, 4, 5].map((i) => <SkeletonCard key={`skel-latest-${i}`} />)
                )}

                {/* Show error message only if skeletons are not showing */}
                {showApiError && !showSkeletons && (
                    <div className="error-message">Could not load new arrivals.</div>
                )}
                
                {/* Show actual products when loaded */}
                {products && products.map((p: Product, index: number) => (
                    <div 
                        key={`latest-${p.id}`} 
                        className="latest-item fade-in-up"
                        style={{ animationDelay: `${index * 0.08}s` }}
                    >
                        <ProductCard product={p} />
                    </div>
                ))}
            </div>

            {/* 🟢 CSS STYLING (The Magic) */}
            <style jsx>{`
                /* Section Background: Beautiful Light Purple/Lavender Gradient */
                .latest-premium-section {
                    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); /* Light Purple shades */
                    padding: 24px 0 30px 0;
                    border: 1px solid #ddd6fe;
                    position: relative;
                    overflow: hidden;
                }

                /* Header Styling */
                .latest-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 20px;
                    margin-bottom: 20px;
                }
                .title-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .icon-glow-box {
                    width: 48px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .live-badge {
                    background-color: #ef4444;
                    color: white;
                    font-size: 11px;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 6px;
                    animation: pulse-red-glow 2s infinite;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                .section-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: #4c1d95; /* Dark Purple for title */
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                /* Slider & Scrolling Physics */
                .latest-slider {
                    display: flex;
                    gap: 16px;
                    padding: 5px 20px 10px 20px;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .latest-item {
                    flex: 0 0 160px;
                    scroll-snap-align: start;
                }
                @media (min-width: 768px) {
                    .latest-item { flex: 0 0 220px; }
                }

                /* Skeletons */
                .skeleton-card { background: white; border-radius: 12px; height: 260px; border: 1px solid #e2e8f0; }
                .skel-img { width: 100%; height: 160px; background: #e2e8f0; }
                .skel-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
                .skel-line { height: 12px; background: #e2e8f0; border-radius: 4px; }
                .animate-pulse { animation: pulse 1.5s infinite; }

                /* Error Message */
                .error-message {
                    padding: 20px;
                    text-align: center;
                    color: #7c3aed;
                    font-weight: 600;
                    font-size: 14px;
                }

                /* Keyframes */
                @keyframes pulse-red-glow {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .fade-in-up { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </section>
    );
}