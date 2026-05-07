"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';
import { Product } from '@/components/ProductCard'; 
import ProductCardLite from '@/components/ProductCardLite'; 

// --- ICONS & Fetcher ---
const FilterIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>);
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PAGE_LIMIT = 40;

export default function ExploreHomepage({ 
    initialProducts = [], 
    initialTotalCount = 0 
}: { 
    initialProducts?: Product[]; 
    initialTotalCount?: number; 
}) {
    // --- STATE MANAGEMENT ---
    const [filters, setFilters] = useState({ hasVideo: false, showVerified: false });
    
    // Header hide/show logic on scroll
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        // Adjust this value if needed based on your layout
        if (currentScrollY < 100) {
          setIsHeaderVisible(true);
        } else if (currentScrollY > lastScrollY.current + 15) { // Scrolling Down
          setIsHeaderVisible(false);
        } else if (currentScrollY < lastScrollY.current - 15) { // Scrolling Up
          setIsHeaderVisible(true);
        }
        lastScrollY.current = currentScrollY;
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // --- SWR DATA FETCHING LOGIC ---
    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.products?.length) return null;
        const params = new URLSearchParams({ 
            page: String(pageIndex + 1), 
            limit: String(PAGE_LIMIT), 
            sort: 'default', // Using default sort as requested
            hasVideo: String(filters.hasVideo), 
            showVerified: String(filters.showVerified) 
        });
        return `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/explore-feed?${params.toString()}`;
    };

    const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(getKey, fetcher, {
        fallbackData: initialProducts.length > 0 ? [{ products: initialProducts, totalCount: initialTotalCount }] : undefined,
        revalidateFirstPage: false, 
        persistSize: true, 
        revalidateOnFocus: false, 
        dedupingInterval: 60000, 
    });

    const products: Product[] = useMemo(() => data ? data.flatMap(page => page.products || []) : [], [data]);
    const totalCount = data?.[0]?.totalCount || initialTotalCount;
    const isReachingEnd = !data || (data[data.length - 1]?.products?.length ?? 0) < PAGE_LIMIT;

    const toggleFilter = (key: 'hasVideo' | 'showVerified') => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
        // Reset SWR to page 1 to fetch with new filters
        setSize(1); 
    };

    return (
        <div className="explore-container">
            <style jsx>{`
                .explore-container { background: #f9fafb; min-height: 100vh; padding-bottom: 80px; }
                .wrapper { max-width: 1440px; margin: 0 auto; padding: 0 16px; width: 100%; }
                
                /* 🟢 Main Header for the section */
                .page-header {
                    background: #fff;
                    padding: 24px 0 20px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .header-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: #111;
                    margin: 0;
                    letter-spacing: -0.8px;
                }
                .count-badge {
                    font-size: 13px;
                    color: #6b7280;
                    font-weight: 500;
                    margin-top: 4px;
                }

                /* 🟢 STICKY FILTER BAR (THE FIX for transparency) */
                .sticky-filters {
                    position: sticky;
                    z-index: 40;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    padding: 12px 0;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
                    transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    /* Top position depends on main header visibility */
                    top: ${isHeaderVisible ? '65px' : '0px'};
                }

                /* Scrollable filter chips */
                .filter-scroll {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding-bottom: 5px;
                    align-items: center;
                    scrollbar-width: none;
                }
                .filter-scroll::-webkit-scrollbar { display: none; }

                /* 🟢 BEAUTIFUL FILTER CHIPS */
                .chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 100px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1px solid #e5e7eb;
                    background: #fff;
                    white-space: nowrap;
                    color: #374151;
                    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
                }
                .chip:active { transform: scale(0.95); }
                .chip:hover { border-color: #d1d5db; background: #f9fafb; }
                .chip.active {
                    background: #111;
                    color: white;
                    border-color: #111;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                
                /* Product Grid */
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-top: 24px;
                }
                @media (min-width: 768px) { .product-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; } }
                @media (min-width: 1024px) { .product-grid { grid-template-columns: repeat(4, 1fr); } }
                @media (min-width: 1280px) { .product-grid { grid-template-columns: repeat(5, 1fr); } }

                .card-wrapper { height: 100%; min-height: 280px; }

                /* Load More Button & Spinner */
                .load-more-container {
                    display: flex;
                    justify-content: center;
                    padding: 40px 0;
                }
                .load-more-btn {
                    background: #fff;
                    color: #111;
                    border: 1px solid #e5e7eb;
                    padding: 14px 40px;
                    font-size: 15px;
                    font-weight: 700;
                    border-radius: 100px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }
                .load-more-btn:hover:not(:disabled) {
                    background: #111;
                    color: #fff;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                }
                .load-more-btn:disabled {
                    background: #f3f4f6;
                    color: #9ca3af;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid currentColor;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
            `}</style>

            <div className="page-header">
                <div className="wrapper">
                    <h1 className="header-title">Explore Daily</h1>
                    <div className="count-badge">
                        {totalCount > 0 ? `${totalCount.toLocaleString()} products available` : 'Discover new items'}
                    </div>
                </div>
            </div>

            <div className="sticky-filters">
                <div className="wrapper filter-scroll">
                    <button className={`chip ${filters.hasVideo ? 'active' : ''}`} onClick={() => toggleFilter('hasVideo')}>
                        <i className={`fas fa-video ${filters.hasVideo ? 'text-white' : 'text-blue-500'}`}></i> Video
                    </button>
                    <button className={`chip ${filters.showVerified ? 'active' : ''}`} onClick={() => toggleFilter('showVerified')}>
                        <i className={`fas fa-check-circle ${filters.showVerified ? 'text-white' : 'text-green-500'}`}></i> Verified
                    </button>
                    {/* Yahan aap mustaqbil mein mazeed filters (e.g., price range) add kar sakte hain */}
                </div>
            </div>

            <div className="wrapper">
                <div className="product-grid">
                    {products.map((p, i) => (
                        <div key={`${p.id}-${i}`} className="card-wrapper">
                            {/* Hum yahan ProductCardLite use kar rahe hain taake API se data match kare */}
                            <ProductCardLite product={{
                                id: p.id,
                                t: p.title,
                                s: p.slug,
                                sku: p.sku,
                                p: parseFloat((p.price || 0) as string),
                                dp: parseFloat((p.discounted_price || p.price || 0) as string),
                                img: typeof p.image_urls === 'string' && p.image_urls.startsWith('[') 
                                    ? JSON.parse(p.image_urls)[0] 
                                    : (Array.isArray(p.image_urls) ? p.image_urls[0] : p.image_urls),
                                v: ['verified', '1', 'true'].includes(String(p.supplier_verified || "").toLowerCase()),
                                b: (p as any).supplier?.brand_name || "SJ10",
                                r: parseFloat(String(p.avg_rating || 0)),
                                rc: parseInt(String(p.review_count || 0)),
                                hv: p.has_video || false
                            }} />
                        </div>
                    ))}
                </div>

                <div className="load-more-container">
                    {/* Loading Spinner dikhayen jab naya data aa raha ho */}
                    {isValidating && size > 1 && (
                        <button className="load-more-btn" disabled>
                            <div className="spinner"></div>
                            <span>Loading...</span>
                        </button>
                    )}
                    {/* Button dikhayen agar aur data mojood ho */}
                    {!isReachingEnd && !isValidating && (
                        <button className="load-more-btn" onClick={() => setSize(size + 1)}>Load More</button>
                    )}
                    {/* End message dikhayen jab sab data load ho jaye */}
                    {isReachingEnd && products.length > 0 && (
                        <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 600 }}>You've reached the end!</span>
                    )}
                </div>
            </div>
        </div>
    );
}