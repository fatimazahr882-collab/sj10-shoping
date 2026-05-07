"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard, { type Product } from '@/components/ProductCard';

interface DiscountSection {
    section_id: number;
    title: string;
    products: Product[];
}

export default function DynamicDiscountSections({ sections }: { sections: DiscountSection[] }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (isMounted && (!sections || sections.length === 0)) return null;

    return (
        <div className="dynamic-sections-container">
            {/* Agar component abhi load ho raha hai (net slow hai) toh Skeletons dikhao */}
            {!isMounted ? (
                <div className="discount-premium-section skeleton-mode">
                    <div className="discount-header">
                        <div className="title-wrapper">
                            <div className="skel-line" style={{ width: '220px', height: '28px' }}></div>
                        </div>
                    </div>
                    <div className="products-slider hide-scrollbar">
                        {[1, 2, 3, 4, 5].map((skel) => (
                            <div key={`skel-disc-${skel}`} className="discount-item skeleton-card">
                                <div className="skel-img animate-pulse"></div>
                                <div className="skel-body">
                                    <div className="skel-line animate-pulse" style={{ width: '80%' }}></div>
                                    <div className="skel-line animate-pulse" style={{ width: '50%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Asal Sections jab data load ho jaye */
                sections.map((section, sectionIndex) => (
                    <section 
                        key={section.section_id} 
                        className="discount-premium-section fade-in-up"
                        style={{ animationDelay: `${sectionIndex * 0.15}s` }}
                    >
                        {/* 🟢 BEAUTIFUL HEADER WITH FIRE ICON */}
                        <div className="discount-header">
                            <div className="title-wrapper">
                                <div className="icon-glow-box">
                                    <i className="fas fa-fire fire-icon"></i>
                                </div>
                                <h2 className="section-title">{section.title}</h2>
                            </div>
                            {/* 🟢 ANIMATED 'VIEW ALL' BUTTON */}
                            <Link href={`/discount/${section.section_id}`} className="view-all-btn">
                                <span>View All</span>
                                <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>

                        {/* 🟢 SMOOTH SCROLLING SLIDER */}
                        <div className="products-slider hide-scrollbar">
                            {section.products.map((p) => (
                                <div key={p.id} className="discount-item">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                            {/* Ek extra "See More" card jo slider ke end mein hoga */}
                            <div className="discount-item">
                                <Link href={`/discount/${section.section_id}`} className="see-more-card">
                                    <div className="icon-circle">
                                        <i className="fas fa-arrow-right"></i>
                                    </div>
                                    <span className="see-more-text">See All Deals</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                ))
            )}

            {/* 🟢 CSS STYLING (The Magic) */}
            <style jsx>{`
                .dynamic-sections-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    margin: 16px 0; /* Updated margin for better spacing */
                }

                /* Section Background: Beautiful Light Red/Pink Gradient */
                .discount-premium-section {
                    background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); /* Light Red shades */
                    padding: 24px 0 30px 0;
                    border: 1px solid #fecaca;
                    position: relative;
                    overflow: hidden;
                }
                .discount-premium-section.skeleton-mode {
                    margin: 0 15px;
                    border-radius: 20px;
                }

                /* Header Styling */
                .discount-header {
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
                    width: 36px;
                    height: 36px;
                    background: #ef4444; /* Red background */
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
                    animation: pulse-red-glow 2s infinite;
                }
                .fire-icon {
                    color: white;
                    font-size: 18px;
                }
                .section-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: #b91c1c; /* Darker Red for title */
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                /* Animated 'View All' Button */
                .view-all-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #fff;
                    color: #ef4444;
                    padding: 8px 16px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 700;
                    text-decoration: none;
                    border: 1px solid #fecaca;
                    transition: all 0.3s ease;
                }
                .view-all-btn:hover {
                    background: #ef4444;
                    color: white;
                    padding-right: 12px;
                    gap: 10px;
                }

                /* Slider & Scrolling Physics */
                .products-slider {
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
                .discount-item {
                    flex: 0 0 160px;
                    scroll-snap-align: start;
                }
                @media (min-width: 768px) {
                    .discount-item { flex: 0 0 220px; }
                }

                /* Special "See More" Card */
                .see-more-card {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    background: white;
                    border: 2px dashed #fca5a5;
                    border-radius: 12px;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }
                .see-more-card:hover {
                    border-color: #ef4444;
                    background: #fef2f2;
                }
                .icon-circle {
                    width: 48px;
                    height: 48px;
                    border: 1px solid #fee2e2;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ef4444;
                    font-size: 20px;
                }
                .see-more-text {
                    font-size: 14px;
                    font-weight: 700;
                    color: #991b1b;
                    text-align: center;
                }

                /* Skeletons */
                .skeleton-card { background: white; border-radius: 12px; height: 260px; border: 1px solid #e2e8f0; }
                .skel-img { width: 100%; height: 160px; background: #e2e8f0; }
                .skel-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
                .skel-line { height: 12px; background: #e2e8f0; border-radius: 4px; }
                .animate-pulse { animation: pulse 1.5s infinite; }

                /* Keyframes */
                @keyframes pulse-red-glow {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .fade-in-up { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.5s ease-out forwards; }
                @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}