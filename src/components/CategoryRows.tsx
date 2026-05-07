"use client"; // File pehle se client component hai, just for confirmation

import React from 'react';
import ProductCard from './ProductCard'; // Hum full ProductCard use karenge yahan
import Link from 'next/link';

// Component ab 'use client' hai toh Product type yahan define kar sakte hain
export type Product = {
    id: number | string;
    slug: string;
    sku?: string;
    title: string;
    price: number | string;
    discounted_price?: number | string | null;
    image_urls: any;
    image_url?: any;
    avg_rating?: number;
    review_count?: number;
    supplier_verified?: boolean | string | number;
    supplier?: { verified_status?: string };
    has_video?: boolean;
    video_url?: string;
};

export default function CategoryRows({ initialData }: { initialData: any[] }) {
    if (!initialData || initialData.length === 0) return null;

    return (
        <div className="category-rows-container">
            {initialData.map((category: any, index: number) => (
                <div 
                    key={category.category_id} 
                    className="category-row-wrapper fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    {/* 🟢 BEAUTIFUL HEADER WITH ANIMATED BUTTON */}
                    <div className="category-row-header">
                        <div className="title-wrapper">
                            <div className="title-marker"></div>
                            <h2 className="section-title">{category.category_name}</h2>
                        </div>
                        <Link href={`/category/${category.category_slug}`} className="view-all-btn">
                            <span>See All</span>
                            <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>

                    {/* 🟢 SMOOTH SCROLLING SLIDER (STRETCHING FIXED) */}
                    <div className="product-slider hide-scrollbar">
                        {category.products.map((product: Product) => (
                            <div key={product.id} className="slider-item">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* 🟢 CSS STYLING (The Magic) */}
            <style jsx>{`
                .category-rows-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin: 20px 0;
                }

                /* Main Section Card: Sophisticated Light Grey Background */
                .category-row-wrapper {
                    background: #ffffff;
                    padding: 20px 0;
                    border-top: 1px solid #f1f5f9;
                    border-bottom: 1px solid #f1f5f9;
                }

                /* Header Styling */
                .category-row-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 16px;
                    margin-bottom: 16px;
                }
                .title-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .title-marker {
                    width: 4px;
                    height: 20px;
                    background: #4f46e5; /* A nice, modern purple */
                    border-radius: 4px;
                }
                .section-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                /* Animated 'View All' Button */
                .view-all-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #f1f5f9;
                    color: #475569;
                    padding: 8px 16px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                    border: 1px solid #e2e8f0;
                    transition: all 0.3s ease;
                }
                .view-all-btn:hover {
                    background: #4f46e5;
                    color: white;
                    border-color: #4f46e5;
                    gap: 10px;
                    padding-right: 12px;
                }

                /* Slider & Scrolling Physics */
                .product-slider {
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
                
                /* 🟢 STRETCHING FIX: This is the most important part */
                .slider-item {
                    flex: 0 0 160px; /* Fixes the width, prevents stretching */
                    scroll-snap-align: start;
                    width: 160px; /* Explicit width */
                }
                @media (min-width: 768px) {
                    .slider-item { 
                        flex: 0 0 200px;
                        width: 200px;
                     }
                    .product-slider { gap: 16px; }
                }

                /* Staggered Fade-in Animation */
                .fade-in-up {
                    opacity: 0;
                    transform: translateY(20px);
                    animation: fadeInUp 0.5s ease-out forwards;
                }
                @keyframes fadeInUp {
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}