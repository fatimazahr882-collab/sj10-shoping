// src/components/DynamicDiscountSections.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import ProductCard, { type Product } from '@/components/ProductCard';

// Define the shape of the data this component expects
interface DiscountSection {
    section_id: number;
    title: string;
    products: Product[];
}

// This component is now also "dumb" and only displays the data it's given.
export default function DynamicDiscountSections({ sections }: { sections: DiscountSection[] }) {
    
    // If no sections are passed from the server, render nothing.
    if (!sections || sections.length === 0) {
        return null;
    }

    const sliderStyle: React.CSSProperties = {
        display: 'flex', overflowX: 'auto', gap: '16px', padding: '12px 4px 20px 16px',
        scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
    };

    const itemStyle: React.CSSProperties = {
        flex: '0 0 180px', scrollSnapAlign: 'start',
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
                        
                        {/* "See More" card at the end of the slider */}
                        <div style={itemStyle} className="see-more-container">
                            <Link href={`/discount/${section.section_id}`} className="see-more-card">
                                <div className="icon-circle">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </div>
                                <span className="see-more-text">View All Products</span>
                            </Link>
                        </div>
                    </div>
                </section>
            ))}

            <style jsx>{`
                .dynamic-sections-container { display: flex; flex-direction: column; gap: 24px; margin-top: 16px; margin-bottom: 24px; }
                .discount-section { position: relative; background: #fff; padding-top: 16px; border-top: 8px solid #f3f4f6; }
                .section-header { display: flex; justify-content: space-between; align-items: center; padding: 0 16px 12px 16px; }
                .title-container { display: flex; align-items: center; gap: 10px; }
                .title-marker { width: 4px; height: 24px; background-color: #f97316; border-radius: 2px; }
                .section-title { font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 700; color: #1e293b; letter-spacing: -0.3px; margin: 0; }
                .view-all-link { font-size: 13px; font-weight: 600; color: #64748b; text-decoration: none; }
                .products-slider::-webkit-scrollbar { display: none; }
                .see-more-container { display: flex; }
                .see-more-card { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; border: 1px dashed #d1d5db; border-radius: 12px; text-decoration: none; transition: all 0.2s; }
                .see-more-card:hover { border-color: #f97316; background-color: #fff7ed; }
                .icon-circle { width: 48px; height: 48px; background-color: #fff; border: 1px solid #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .see-more-text { font-size: 14px; font-weight: 600; color: #334155; }
            `}</style>
        </div>
    );
}