"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWRInfinite from 'swr/infinite';
import ProductCardLite, { type ProductLite } from '@/components/ProductCardLite'; 
import SjLoader from '@/components/SjLoader';
import LatestProductsExplore from '@/components/LatestProductsExplore'; // ✅ IMPORT THE NEW COMPONENT

// --- CONFIGURATION ---
const CART_API_BASE = "https://sj10-cart.vercel.app/api";
const PRODUCTS_PER_PAGE = 50;

const SHARD_CATEGORIES = [
    { label: "Women's", key: "shard_women_fashion" }, { label: "Men's", key: "shard_men_fashion" },
    { label: "Electronics", key: "shard_electronics" }, { label: "Beauty", key: "shard_beauty" },
    { label: "Home", key: "shard_home" }, { label: "Kids", key: "shard_kids" },
    { label: "Footwear", key: "shard_footwear" }, { label: "Bags", key: "shard_bags_acc" },
    { label: "Jewelry", key: "shard_jewelry_watch" }, { label: "Kitchen", key: "shard_kitchen" },
    { label: "Sports", key: "shard_auto_sports" }, { label: "General", key: "shard_general" }
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

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
    const debouncedSearch = useDebounce(searchQuery, 400); 
    
    const [sort, setSort] = useState('smart_ranking'); 
    const [filterVideo, setFilterVideo] = useState(false);
    const [filterVerified, setFilterVerified] = useState(false);
    const [selectedShard, setSelectedShard] = useState("all");
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isNavigating, setIsNavigating] = useState(false);

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
                    scrollContainer.scrollLeft += 0.8; 
                }
            }
            animationFrameId = requestAnimationFrame(autoScroll);
        };
        animationFrameId = requestAnimationFrame(autoScroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (sort === 'newest') return null; // SWR will not fetch if "Newest" is selected
        if (previousPageData && !previousPageData.products?.length) return null;
        
        const params = new URLSearchParams({
            page: (pageIndex + 1).toString(), 
            limit: PRODUCTS_PER_PAGE.toString(), 
            sort: 'smart_ranking'
        });

        if (debouncedSearch) params.append('search', debouncedSearch);
        if (filterVideo) params.append('hasVideo', 'true');
        if (filterVerified) params.append('showVerified', 'true');
        if (selectedShard !== "all") params.append('shard', selectedShard);
        
        return `${CART_API_BASE}/explore?${params.toString()}`;
    };

    const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(getKey, fetcher, {
        revalidateFirstPage: false, revalidateOnFocus: false, persistSize: true,
        onSuccess: (data) => {
            if (data?.[0]?.totalCount !== undefined) setTotalCount(data[0].totalCount);
        }
    });

    const products: ProductLite[] = data ? data.flatMap(page => page.products || []) : [];
    const isReachingEnd = data && (data[data.length - 1]?.products?.length || 0) < PRODUCTS_PER_PAGE;

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useCallback((node: HTMLDivElement) => {
        if (isLoading || isValidating) return;
        if (observerRef.current) observerRef.current.disconnect();
        
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !isReachingEnd) setSize(prev => prev + 1);
        }, { rootMargin: "400px" }); 
        
        if (node) observerRef.current.observe(node);
    }, [isLoading, isValidating, isReachingEnd, setSize]);

    const handleProductClick = (slugOrId: string) => {
        setIsNavigating(true);
        router.push(`/products/${slugOrId}`);
    };

    return (
        <main className="explore-container">
            <style jsx>{`
                .instant-loader { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.95); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
                .explore-container { min-height: 100vh; background-color: #f8fafc; }
                .explore-header { position: relative; width: 100%; overflow: hidden; margin-bottom: 24px; background: linear-gradient(-45deg, #0f172a, #1e3a8a, #3b82f6, #0f172a); background-size: 400% 400%; animation: gradientBG 15s ease infinite; }
                @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                .header-glass-content { background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(20px); padding: 24px 0 10px; display: flex; flex-direction: column; gap: 20px; }
                .header-top { display: flex; justify-content: center; align-items: center; }
                .title-wrapper { text-align: center; }
                .title-wrapper h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
                .live-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #16a34a; margin-top: 4px; }
                .dot { width: 8px; height: 8px; background: #16a34a; border-radius: 50%; animation: pulse-green 2s infinite; }
                @keyframes pulse-green { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                .search-container-wrap { display: flex; justify-content: center; padding: 0 20px; }
                .search-box-wrapper { position: relative; width: 100%; max-width: 650px; }
                .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #64748b; z-index: 2; }
                .search-box-wrapper input { width: 100%; height: 56px; padding: 0 20px 0 54px; border-radius: 16px; border: 2px solid transparent; background: #fff; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); font-size: 16px; font-weight: 500; color: #1e293b; transition: all 0.25s; }
                .search-box-wrapper input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2); }
                .shard-rail-container { width: 100%; overflow: hidden; padding: 10px 0; }
                .shard-rail { display: flex; gap: 24px; overflow-x: auto; padding: 0 20px; cursor: grab; }
                .shard-rail::-webkit-scrollbar { display: none; }
                .shard-icon { flex-shrink: 0; width: 84px; display: flex; flex-direction: column; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; }
                .neon-ring-wrapper { position: relative; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; }
                .neon-spinner { position: absolute; inset: 0; border-radius: 50%; padding: 3px; background: conic-gradient(from 0deg, transparent 0%, #38bdf8 50%, transparent 100%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude; animation: spin 2s linear infinite; opacity: 0.6; }
                .neon-ring-wrapper.active .neon-spinner { background: conic-gradient(from 0deg, #f97316 0%, #fbbf24 100%); opacity: 1; padding: 4px; }
                .image-container { width: 62px; height: 62px; border-radius: 50%; background: #fff; overflow: hidden; position: relative; z-index: 2; border: 3px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .image-container img { object-fit: cover; }
                .label { font-size: 13px; font-weight: 500; color: #475569; }
                .controls-bar { max-width: 1400px; margin: 0 auto; width: 100%; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 16px; }
                .tabs-container { display: flex; gap: 10px; }
                .tab-btn { background: #f1f5f9; border: 1px solid transparent; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; padding: 10px 20px; border-radius: 12px; transition: all 0.3s; display: flex; align-items: center; justify-content: center;}
                .tab-btn.active { background: #0f172a; color: #ffffff; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2); }
                .right-controls { display: flex; gap: 10px; }
                .filter-chip { padding: 8px 16px; border-radius: 30px; border: 1px solid #e2e8f0; background: #fff; color: #475569; font-weight: 500; font-size: 13px; cursor: pointer; transition: all 0.2s; }
                .filter-chip:hover { border-color: #cbd5e1; background: #f8fafc; }
                .filter-chip.active { background: #0f172a; color: #fff; border-color: #0f172a; }
                .explore-main-content { max-width: 1600px; margin: 0 auto; padding: 0 20px 40px; }
                .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                @media (min-width: 640px) { .products-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
                @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
                @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(5, 1fr); gap: 24px; } }
                .product-card-wrapper { cursor: pointer; transition: transform 0.2s; height: 100%; display: block; }
                .product-card-wrapper:hover { transform: translateY(-3px); }
                .skeleton-card { aspect-ratio: 3/4; background: #e2e8f0; border-radius: 16px; animation: pulse 1.5s infinite; }
                @keyframes pulse { 50% { opacity: 0.5; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .loader-trigger { padding: 40px; display: flex; justify-content: center; }
                @media (max-width: 768px) {
                    .controls-bar { flex-direction: column; gap: 16px; align-items: flex-start; }
                    .tabs-container { width: 100%; display: grid; grid-template-columns: 1fr 1fr; }
                    .right-controls { width: 100%; overflow-x: auto; padding-bottom: 5px; }
                    .search-box-wrapper input { height: 48px; font-size: 14px; }
                }
            `}</style>
            
            {isNavigating && <div className="instant-loader"><div style={{ position: 'relative', width: '120px', height: '120px' }}><SjLoader /></div></div>}

            <header className="explore-header">
                <div className="header-glass-content">
                    <div className="header-top">
                        <div className="title-wrapper">
                            <h1 style={{fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px'}}>Discover Collections</h1>
                            <div className="live-badge">
                                <span className="dot"></span>
                                {sort === 'newest' ? 'Live Latest Updates' : (totalCount > 0 ? `${totalCount.toLocaleString()} Live Items` : 'Loading...')}
                            </div>
                        </div>
                    </div>
                    <div className="search-container-wrap">
                        <div className="search-box-wrapper">
                            <i className="fas fa-search search-icon"></i>
                            <input type="text" placeholder="Search millions of items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="shard-rail-container" onMouseEnter={() => isHovered.current = true} onMouseLeave={() => isHovered.current = false} onTouchStart={() => isHovered.current = true} onTouchEnd={() => isHovered.current = false}>
                        <div className="shard-rail" ref={scrollContainerRef}>
                            {[...SHARD_CATEGORIES, ...SHARD_CATEGORIES, ...SHARD_CATEGORIES].map((cat, index) => (
                                <button key={`${cat.key}-${index}`} className="shard-icon" onClick={() => setSelectedShard(cat.key)}>
                                    <div className={`neon-ring-wrapper ${selectedShard === cat.key ? 'active' : ''}`}>
                                        <div className="neon-spinner"></div>
                                        <div className="image-container"><Image src={`/categories/${cat.key}.png`} alt={cat.label} width={64} height={64} loading="lazy" /></div>
                                    </div>
                                    <span className="label">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="controls-bar">
                        <div className="tabs-container">
                            <button className={`tab-btn ${sort === 'smart_ranking' ? 'active' : ''}`} onClick={() => setSort('smart_ranking')}>All Recommended</button>
                            <button className={`tab-btn ${sort === 'newest' ? 'active' : ''}`} onClick={() => setSort('newest')}>
                                <span style={{ color: sort === 'newest' ? '#f87171' : 'inherit', marginRight: '4px' }}>●</span> Newest Arrivals
                            </button>
                        </div>
                        <div className="right-controls">
                            <button className={`filter-chip ${filterVideo ? 'active' : ''}`} onClick={() => setFilterVideo(!filterVideo)}>📺 Has Video</button>
                            <button className={`filter-chip ${filterVerified ? 'active' : ''}`} onClick={() => setFilterVerified(!filterVerified)}>✅ Verified</button>
                        </div>
                    </div>
                </div>
            </header>

            <section className="explore-main-content">
                <div className="products-grid">
                    {/* ✅ 3. CONDITIONAL RENDERING LOGIC (The Main Fix) */}
                    {sort === 'newest' ? (
                        <LatestProductsExplore 
                            searchQuery={debouncedSearch}
                            filterVideo={filterVideo}
                            filterVerified={filterVerified}
                        />
                    ) : (
                        <>
                            {isLoading && products.length === 0 ? (
                                [...Array(15)].map((_, i) => <div key={i} className="skeleton-card" />)
                            ) : (
                                products.map((product, index) => (
                                    <div key={`${product.id}-${index}`} onClick={() => handleProductClick(product.s || String(product.id))} className="product-card-wrapper">
                                        <ProductCardLite product={product} />
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
                
                {/* Loader / End of list message */}
                <div ref={loadMoreRef} className="loader-trigger">
                    {sort === 'newest' ? (
                        <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 600 }}>Showing top latest items.</span>
                    ) : (
                        <>
                            {(isLoading || isValidating) && products.length > 0 && (
                                <div style={{ position: 'relative', width: '80px', height: '80px' }}><SjLoader /></div>
                            )}
                            {isReachingEnd && products.length > 0 && (
                                <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 600 }}>You've reached the end!</span>
                            )}
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}