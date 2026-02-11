"use client";

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import ProductCard, { type Product } from '@/components/ProductCard';

const CART_API_BASE = 'https://sj10-cart.vercel.app/api';

interface DiscountSection {
    section_id: number;
    title: string;
    products: Product[];
}

// Faster Fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DynamicDiscountSections() {
    // SWR Magic: Handles caching, revalidation, and loading states automatically
    const { data: sections, error } = useSWR<DiscountSection[]>(
        `${CART_API_BASE}/discount-sections`,
        fetcher,
        {
            revalidateOnFocus: false, // Don't re-fetch just because user clicked window
            revalidateIfStale: false, // Keep data fresh for longer
            dedupingInterval: 60000,  // Cache for 1 minute minimum
        }
    );

    if (error) return null;
    // Show a small skeleton ONLY if we have no data at all
    if (!sections) {
        return (
            <div className="px-4 mt-6 space-y-4">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-[180px] h-[260px] bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }
    
    if (sections.length === 0) return null;

    const sliderStyle: React.CSSProperties = {
        display: 'flex',
        overflowX: 'auto',
        gap: '16px',
        padding: '12px 4px 20px 4px',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    };

    const itemStyle: React.CSSProperties = {
        flex: '0 0 auto',
        width: '180px',
        scrollSnapAlign: 'start',
    };

    return (
        <div className="dynamic-sections-container">
            {sections.map((section) => (
                <section key={section.section_id} className="discount-section">
                    <div className="section-header">
                        <div className="title-container">
                            <div className="title-marker"></div>
                            <h2 className="section-title">{section.title}</h2>
                        </div>
                        <Link href={`/discount/${section.section_id}`} className="view-all-link">
                            View All
                        </Link>
                    </div>

                    <div className="products-slider" style={sliderStyle}>
                        {section.products.map((p) => (
                            <div key={p.id} style={itemStyle}>
                                <ProductCard product={p} />
                            </div>
                        ))}
                        
                        <div style={itemStyle} className="see-more-container">
                            <Link href={`/discount/${section.section_id}`} className="see-more-card">
                                <div className="icon-circle">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                                <span className="see-more-text">View All</span>
                            </Link>
                        </div>
                    </div>
                </section>
            ))}

            <style jsx>{`
                .dynamic-sections-container { display: flex; flex-direction: column; gap: 24px; margin-top: 16px; margin-bottom: 24px; }
                .discount-section { position: relative; z-index: 0; }
                .section-header { display: flex; justify-content: space-between; align-items: center; padding: 0 16px 12px 16px; }
                .title-container { display: flex; align-items: center; gap: 10px; }
                .title-marker { width: 4px; height: 24px; background-color: #007bff; border-radius: 2px; }
                .section-title { font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 700; color: #1e293b; letter-spacing: -0.3px; margin: 0; }
                .view-all-link { font-size: 13px; font-weight: 600; color: #64748b; text-decoration: none; transition: color 0.2s ease; }
                .view-all-link:hover { color: #007bff; text-decoration: underline; }
                .products-slider::-webkit-scrollbar { display: none; }
                .see-more-container { display: flex; flex-direction: column; height: 100%; min-height: 280px; }
                .see-more-card { height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background-color: #fff; border: 1px solid #e2e8f0; border-radius: 12px; text-decoration: none; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
                .see-more-card:hover { border-color: #007bff; transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0, 123, 255, 0.1); }
                .icon-circle { width: 48px; height: 48px; background-color: #f0f9ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }
                .see-more-card:hover .icon-circle { transform: scale(1.1); background-color: #e0f2fe; }
                .see-more-text { font-size: 14px; font-weight: 600; color: #334155; }
                .see-more-card:hover .see-more-text { color: #007bff; }
            `}</style>
        </div>
    );
}