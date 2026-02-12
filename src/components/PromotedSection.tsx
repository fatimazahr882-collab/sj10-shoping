// src/components/PromotedSection.tsx
"use client";

import React from 'react';
import ProductCard, { type Product } from '@/components/ProductCard';

// This component is now "dumb". It only knows how to display the products it's given.
// It does NOT fetch its own data.
export default function PromotedSection({ products }: { products: Product[] }) {
    
    // If the server provides no promoted products, render nothing.
    if (!products || products.length === 0) {
        return null;
    }

    // Styles for the horizontal slider
    const sliderStyle: React.CSSProperties = {
        display: 'flex',
        overflowX: 'auto',
        gap: '12px',
        padding: '10px 15px 25px 15px',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none', // Hides scrollbar for Firefox
    };

    const sliderItemStyle: React.CSSProperties = {
        flex: '0 0 160px', // Mobile width
        scrollSnapAlign: 'start',
    };

    return (
        <section className="bg-white my-4 py-4 border-t-8 border-gray-100 relative z-0">
            <div className="flex justify-between items-center px-4 mb-2">
                <h2 className="section-title text-lg font-bold text-gray-800">Promoted Products</h2>
                {/* You can add a "See All" link here if you have a dedicated page */}
            </div>

            <div className="hide-scrollbar" style={sliderStyle}>
                {products.map((p) => (
                    <div key={`promo-${p.id}`} style={sliderItemStyle} className="md:w-[220px]">
                        <ProductCard product={p} />
                    </div>
                ))}
            </div>
            
            {/* Style to hide scrollbar for Chrome/Safari */}
            <style jsx>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </section>
    );
}