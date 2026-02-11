"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // For programmatic navigation
import useSWRInfinite from 'swr/infinite';
import ProductCard from '@/components/ProductCard'; 

// --- CONFIGURATION ---
const API_BASE = "https://sj10-cart.vercel.app/api";
const PRODUCTS_PER_PAGE = 30;

// Shard Categories
const SHARD_CATEGORIES = [
    { label: "Women's", key: "shard_women_fashion" },
    { label: "Men's", key: "shard_men_fashion" },
    { label: "Electronics", key: "shard_electronics" },
    { label: "Beauty", key: "shard_beauty" },
    { label: "Home", key: "shard_home" },
    { label: "Kids", key: "shard_kids" },
    { label: "Footwear", key: "shard_footwear" },
    { label: "Bags", key: "shard_bags_acc" },
    { label: "Jewelry", key: "shard_jewelry_watch" },
    { label: "Kitchen", key: "shard_kitchen" },
    { label: "Sports", key: "shard_auto_sports" },
    { label: "General", key: "shard_general" }
];

// Quick tags to make header look "full" and useful
const TRENDING_TAGS = ["Summer Sale", "Wireless", "Nike", "Vintage", "Watches", "Skincare"];

const fetcher = (url: string) => fetch(url).then(res => res.json());

// --- DEBOUNCE HOOK ---
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export default function ExploreClientPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);
    
    // Default sort is 'smart_ranking' (Promoted > Reviewed > Viewed)
    const [sort, setSort] = useState('smart_ranking'); 
    const [filterVideo, setFilterVideo] = useState(false);
    const [filterVerified, setFilterVerified] = useState(false);
    const [selectedShard, setSelectedShard] = useState("all");
    const [totalCount, setTotalCount] = useState<number>(0);
    
    // Navigation Loading State
    const [isNavigating, setIsNavigating] = useState(false);

    // --- SCROLL ENGINE ---
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isHovered = useRef(false);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        let animationFrameId: number;
        const autoScroll = () => {
            if (scrollContainer && !isHovered.current) {
                if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth - 1)) {
                    scrollContainer.scrollLeft = 0;
                } else {
                    scrollContainer.scrollLeft += 0.8; // Smooth slow scroll
                }
            }
            animationFrameId = requestAnimationFrame(autoScroll);
        };
        animationFrameId = requestAnimationFrame(autoScroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // --- DATA FETCHING ---
    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.products?.length) return null;
        
        // Logic: Map frontend "Sort" state to API parameters
        const params = new URLSearchParams({
            page: (pageIndex + 1).toString(), 
            limit: PRODUCTS_PER_PAGE.toString(), 
            search: debouncedSearch,
            // Pass the sort strategy to backend
            sortStrategy: sort 
        });

        if (filterVideo) params.append('hasVideo', 'true');
        if (filterVerified) params.append('showVerified', 'true');
        if (selectedShard !== "all") params.append('shard', selectedShard);
        
        return `${API_BASE}/explore?${params.toString()}`;
    };

    const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(getKey, fetcher, {
        revalidateFirstPage: false, revalidateOnFocus: false, persistSize: true,
        onSuccess: (data) => {
            if (data?.[0]?.totalCount !== undefined) setTotalCount(data[0].totalCount);
        }
    });

    const products = data ? data.flatMap(page => page.products) : [];
    const isReachingEnd = data && data[data.length - 1]?.products?.length < PRODUCTS_PER_PAGE;

    // Infinite Scroll Observer
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useCallback((node: HTMLDivElement) => {
        if (isLoading || isValidating) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !isReachingEnd) setSize(prev => prev + 1);
        });
        if (node) observerRef.current.observe(node);
    }, [isLoading, isValidating, isReachingEnd, setSize]);

    // --- INSTANT NAVIGATION HANDLER ---
    const handleProductClick = (slugOrId: string) => {
        // 1. Show overlay immediately
        setIsNavigating(true);
        // 2. Prefetch programmatically (optional, Next.js does this automatically on Link viewport usually)
        router.prefetch(`/products/${slugOrId}`);
        // 3. Navigate
        router.push(`/products/${slugOrId}`);
    };

    return (
        <div className="explore-container">
            {/* Global Fonts */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                body { font-family: 'Poppins', sans-serif; background-color: #f8fafc; margin: 0; }
            `}</style>

            {/* --- INSTANT LOADER OVERLAY --- */}
            {isNavigating && (
                <div className="instant-loader">
                    <div className="spinner-large"></div>
                    <p>Opening...</p>
                </div>
            )}

            {/* --- ANIMATED HEADER --- */}
            <header className="explore-header animated-aurora">
                <div className="header-glass-content">
                    
                    {/* 1. Top Section: Title & Count */}
                    <div className="header-top">
                        <div className="title-wrapper">
                            <h2>Discover Collections</h2>
                            <div className="live-badge">
                                <span className="dot"></span>
                                {totalCount > 0 ? `${totalCount.toLocaleString()} Live Items` : 'Loading...'}
                            </div>
                        </div>
                    </div>

                    {/* 2. Hero Search Section */}
                    <div className="search-hero">
                        <div className="search-box-wrapper">
                            <svg className="search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input 
                                type="text" 
                                placeholder="Search for products, brands, styles..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                            />
                        </div>
                        {/* Quick Tags to fill space */}
                        <div className="quick-tags">
                            <span>Trending:</span>
                            {TRENDING_TAGS.map(tag => (
                                <button key={tag} onClick={() => setSearchQuery(tag)}>{tag}</button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Categories Rail (Sticky Illusion) */}
                    <div 
                        className="shard-rail-container"
                        onMouseEnter={() => isHovered.current = true}
                        onMouseLeave={() => isHovered.current = false}
                        onTouchStart={() => isHovered.current = true}
                        onTouchEnd={() => isHovered.current = false}
                    >
                        <div className="shard-rail" ref={scrollContainerRef}>
                            {[...SHARD_CATEGORIES, ...SHARD_CATEGORIES, ...SHARD_CATEGORIES].map((cat, index) => (
                                <button key={`${cat.key}-${index}`} className="shard-icon" onClick={() => setSelectedShard(cat.key)}>
                                    <div className={`neon-ring-wrapper ${selectedShard === cat.key ? 'active' : ''}`}>
                                        <div className="neon-spinner"></div>
                                        <div className="image-container">
                                            <Image src={`/categories/${cat.key}.png`} alt={cat.label} width={64} height={64} loading="lazy" />
                                        </div>
                                    </div>
                                    <span className="label">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Smart Filters */}
                    <div className="controls-bar">
                        <div className="tabs-container">
                             {/* Toggles between 'All' (Smart Logic) and 'Newest' */}
                            <button 
                                className={`tab-btn ${sort === 'smart_ranking' ? 'active' : ''}`} 
                                onClick={() => setSort('smart_ranking')}
                            >
                                All Recommended
                            </button>
                            <button 
                                className={`tab-btn ${sort === 'newest' ? 'active' : ''}`} 
                                onClick={() => setSort('newest')}
                            >
                                Newest Arrivals
                            </button>
                        </div>

                        <div className="right-controls">
                            <button className={`filter-chip ${filterVideo ? 'active' : ''}`} onClick={() => setFilterVideo(!filterVideo)}>
                                📺 Has Video
                            </button>
                            <button className={`filter-chip ${filterVerified ? 'active' : ''}`} onClick={() => setFilterVerified(!filterVerified)}>
                                ✅ Verified
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="explore-main-content">
                {isLoading && products.length === 0 ? (
                    <div className="products-grid">
                        {[...Array(12)].map((_, i) => <div key={i} className="skeleton-card" />)}
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product, index) => (
                            <div 
                                key={`${product.id}-${index}`} 
                                onClick={() => handleProductClick(product.slug || product.id)}
                                className="product-card-wrapper"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
                
                <div ref={loadMoreRef} className="loader-trigger">
                    {(isLoading || isValidating) && products.length > 0 && <div className="spinner-small" />}
                </div>
            </main>

            <style jsx>{`
                /* --- FULL SCREEN NAV LOADER --- */
                .instant-loader {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(255, 255, 255, 0.95);
                    z-index: 9999;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    backdrop-filter: blur(5px);
                }
                .instant-loader p { margin-top: 15px; font-weight: 600; color: #1e293b; }
                .spinner-large {
                    width: 50px; height: 50px;
                    border: 4px solid #e2e8f0; border-top-color: #3b82f6;
                    border-radius: 50%; animation: spin 0.8s linear infinite;
                }

                /* --- CONTAINER --- */
                .explore-container { min-height: 100vh; background-color: #f8fafc; }

                /* --- ANIMATED AURORA HEADER --- */
                .explore-header {
                    position: relative;
                    width: 100%;
                    overflow: hidden;
                    margin-bottom: 24px;
                    /* Animated Gradient Background */
                    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
                    background-size: 400% 400%;
                    animation: gradientBG 15s ease infinite;
                }
                @keyframes gradientBG {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* Glass overlay to calm the gradient */
                .header-glass-content {
                    background: rgba(255, 255, 255, 0.92); /* High opacity for readability */
                    backdrop-filter: blur(20px);
                    padding: 24px 0 10px;
                    display: flex; flex-direction: column; gap: 20px;
                }

                .header-top { display: flex; justify-content: center; align-items: center; }
                .title-wrapper { text-align: center; }
                .title-wrapper h2 { 
                    font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px;
                }
                .live-badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    font-size: 13px; font-weight: 600; color: #16a34a;
                    margin-top: 4px;
                }
                .dot { width: 8px; height: 8px; background: #16a34a; border-radius: 50%; animation: pulse-green 2s infinite; }
                @keyframes pulse-green { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

                /* --- HERO SEARCH --- */
                .search-hero {
                    display: flex; flex-direction: column; align-items: center; gap: 12px;
                }
                .search-box-wrapper {
                    position: relative; width: 100%; max-width: 650px;
                    transform: translateZ(0); /* Hardware accel */
                }
                .search-icon {
                    position: absolute; left: 18px; top: 50%; transform: translateY(-50%);
                    color: #64748b; z-index: 2;
                }
                .search-box-wrapper input {
                    width: 100%; height: 56px;
                    padding: 0 20px 0 54px;
                    border-radius: 16px;
                    border: 2px solid transparent;
                    background: #fff;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); /* Float effect */
                    font-size: 16px; font-weight: 500; color: #1e293b;
                    transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .search-box-wrapper input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
                    transform: translateY(-2px);
                }

                .quick-tags {
                    display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
                    font-size: 13px; color: #64748b;
                }
                .quick-tags span { font-weight: 600; }
                .quick-tags button {
                    background: rgba(0,0,0,0.03); border: none; padding: 4px 10px;
                    border-radius: 20px; color: #334155; cursor: pointer;
                    transition: all 0.2s; font-size: 12px;
                }
                .quick-tags button:hover { background: #e2e8f0; color: #000; }

                /* --- CATEGORY RAIL --- */
                .shard-rail-container { width: 100%; overflow: hidden; padding: 10px 0; }
                .shard-rail { display: flex; gap: 24px; overflow-x: auto; padding: 0 20px; cursor: grab; }
                .shard-rail::-webkit-scrollbar { display: none; }
                
                .shard-icon {
                    flex-shrink: 0; width: 84px;
                    display: flex; flex-direction: column; align-items: center; gap: 8px;
                    background: none; border: none; cursor: pointer;
                }
                .neon-ring-wrapper {
                    position: relative; width: 72px; height: 72px;
                    display: flex; align-items: center; justify-content: center;
                }
                .neon-spinner {
                    position: absolute; inset: 0; border-radius: 50%; padding: 3px;
                    background: conic-gradient(from 0deg, transparent 0%, #38bdf8 50%, transparent 100%);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask-composite: exclude; animation: spin 2s linear infinite;
                    opacity: 0.6;
                }
                .neon-ring-wrapper.active .neon-spinner {
                    background: conic-gradient(from 0deg, #ec4899 0%, #8b5cf6 100%);
                    opacity: 1; padding: 4px;
                }
                .image-container {
                    width: 62px; height: 62px; border-radius: 50%;
                    background: #fff; overflow: hidden; position: relative; z-index: 2;
                    border: 3px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .image-container img { object-fit: cover; }
                .label { font-size: 13px; font-weight: 500; color: #475569; }

                /* --- FILTERS --- */
                .controls-bar {
                    max-width: 1400px; margin: 0 auto; width: 100%;
                    padding: 0 20px;
                    display: flex; justify-content: space-between; align-items: center;
                    border-top: 1px solid rgba(0,0,0,0.05); padding-top: 16px;
                }
                .tabs-container { display: flex; gap: 20px; }
                .tab-btn {
                    background: none; border: none; font-size: 15px; font-weight: 600;
                    color: #94a3b8; cursor: pointer; position: relative; padding-bottom: 6px;
                    transition: color 0.3s;
                }
                .tab-btn.active { color: #0f172a; }
                .tab-btn.active::after {
                    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px;
                    background: #0f172a; border-radius: 2px;
                }

                .right-controls { display: flex; gap: 10px; }
                .filter-chip {
                    padding: 8px 16px; border-radius: 30px; border: 1px solid #e2e8f0;
                    background: #fff; color: #475569; font-weight: 500; font-size: 13px;
                    cursor: pointer; transition: all 0.2s;
                }
                .filter-chip:hover { border-color: #cbd5e1; background: #f8fafc; }
                .filter-chip.active { background: #0f172a; color: #fff; border-color: #0f172a; }

                /* --- GRID --- */
                .explore-main-content { max-width: 1600px; margin: 0 auto; padding: 0 20px 40px; }
                .products-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px;
                }
                .product-card-wrapper { cursor: pointer; transition: transform 0.2s; }
                .product-card-wrapper:hover { transform: translateY(-5px); }
                
                .skeleton-card { aspect-ratio: 3/4; background: #e2e8f0; border-radius: 16px; animation: pulse 1.5s infinite; }
                @keyframes pulse { 50% { opacity: 0.5; } }
                @keyframes spin { to { transform: rotate(360deg); } }

                .loader-trigger { padding: 40px; display: flex; justify-content: center; }
                .spinner-small { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #0f172a; border-radius: 50%; animation: spin 0.8s linear infinite; }

                /* --- MOBILE --- */
                @media (max-width: 768px) {
                    .controls-bar { flex-direction: column; gap: 16px; align-items: flex-start; }
                    .tabs-container { width: 100%; justify-content: space-between; }
                    .right-controls { width: 100%; overflow-x: auto; padding-bottom: 5px; }
                    .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
                    .header-glass-content { padding-bottom: 16px; }
                    .search-box-wrapper input { height: 48px; font-size: 14px; }
                }
            `}</style>
        </div>
    );
}