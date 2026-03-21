// src/components/ExploreHomepage.tsx
"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import ProductCard, { Product } from '@/components/ProductCard'; 

// --- ICONS & Fetcher ---
const FilterIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>);
const CloseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const ChevronDown = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>);
const CheckIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>);
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
    const [categories, setCategories] = useState<any[]>([]);
    const [filters, setFilters] = useState({ sort: 'default', hasVideo: false, showVerified: false, category_ids: [] as string[], city: 'All' });
    const [tempFilters, setTempFilters] = useState({ ...filters });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // ✅ FLICKER FIX: Self-contained scroll detection to correctly position the sticky filter bar
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 50) {
          setIsHeaderVisible(true);
        } else if (currentScrollY > lastScrollY.current + 10) {
          setIsHeaderVisible(false); // Hide on scroll down
        } else if (currentScrollY < lastScrollY.current - 10) {
          setIsHeaderVisible(true);  // Show on scroll up
        }
        lastScrollY.current = currentScrollY;
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // --- DATA FETCHING ---
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/categories-with-subcategories`)
            .then(res => res.json()).then(d => { if(d.mainCats) setCategories(d.mainCats); })
            .catch(e => console.error(e));
    }, []);

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.products?.length) return null;
        const params = new URLSearchParams({ page: String(pageIndex + 1), limit: String(PAGE_LIMIT), sort: filters.sort, hasVideo: String(filters.hasVideo), showVerified: String(filters.showVerified) });
        if (filters.category_ids.length > 0) params.append('category_id', filters.category_ids.join(','));
        if (filters.city !== 'All') params.append('city', filters.city);
        return `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/explore-feed?${params.toString()}`;
    };

    const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(getKey, fetcher, {
        fallbackData: initialProducts.length > 0 ? [{ products: initialProducts, totalCount: initialTotalCount }] : undefined,
        revalidateFirstPage: false, persistSize: true, revalidateOnFocus: false, dedupingInterval: 60000, 
    });

    const products: Product[] = useMemo(() => data ? data.flatMap(page => page.products || []) : [], [data]);
    const totalCount = data?.[0]?.totalCount || initialTotalCount;
    const isReachingEnd = !data || (data[data.length - 1]?.products?.length ?? 0) < PAGE_LIMIT;

    // --- FILTER HANDLERS ---
    const toggleTempCat = (id: string) => { setTempFilters(prev => ({...prev, category_ids: prev.category_ids.includes(id) ? prev.category_ids.filter(x => x !== id) : [...prev.category_ids, id]})); };
    const applyFilters = () => { setFilters(tempFilters); setSize(1); setIsFilterOpen(false); };
    const clearFilters = () => { const reset = { ...filters, category_ids: [], city: 'All' }; setTempFilters(reset); setFilters(reset); setSize(1); setIsFilterOpen(false); };
    const toggleChip = (key: string, value: any) => { setFilters(prev => ({ ...prev, [key]: value })); setSize(1); };
    const activeFilterCount = filters.category_ids.length + (filters.city !== 'All' ? 1 : 0);

    return (
        <div className="explore-container">
            <style jsx>{`
                /* Container and Wrapper styles */
                .explore-container { background: #f9fafb; min-height: 100vh; padding-bottom: 80px; }
                .wrapper { max-width: 1440px; margin: 0 auto; padding: 0 16px; width: 100%; }
                
                /* Header */
                .page-header { background: #fff; padding: 24px 0 20px; border-bottom: 1px solid #f0f0f0; }
                .header-title { font-size: 28px; font-weight: 800; color: #111; margin: 0; letter-spacing: -0.8px; }
                .count-badge { font-size: 13px; color: #6b7280; font-weight: 500; margin-top: 4px; }
                
                /* ✅ FLICKER FIX: Sticky filter bar with dynamic top position */
                .sticky-filters { 
                    position: sticky;
                    z-index: 40; 
                    background: rgba(255,255,255,0.85); 
                    backdrop-filter: blur(12px); 
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(0,0,0,0.05); 
                    padding: 12px 0; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02); 
                    transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                /* Filter Chip styles */
                .filter-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; align-items: center; scrollbar-width: none; width: 100%; flex-wrap: nowrap; }
                .filter-scroll::-webkit-scrollbar { display: none; }
                .chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #e5e7eb; background: #fff; white-space: nowrap; color: #374151; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .chip:active { transform: scale(0.95); }
                .chip:hover { border-color: #d1d5db; background: #f9fafb; }
                .chip.active { background: #111; color: white; border-color: #111; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
                .filter-btn-wrapper { position: relative; margin-right: 8px; }
                .filter-dot { position: absolute; top: 0; right: 0; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; border: 2px solid #fff; }
                .sort-dropdown { position: relative; }
                .sort-menu { position: absolute; top: 120%; left: 0; background: white; border: 1px solid #f0f0f0; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.12); width: 200px; overflow: hidden; z-index: 50; animation: fadeUp 0.2s ease-out; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .sort-item { padding: 12px 16px; font-size: 13px; font-weight: 500; cursor: pointer; color: #4b5563; transition: 0.1s; }
                .sort-item:hover { background: #f9fafb; color: #111; }
                .sort-item.selected { background: #f3f4f6; font-weight: 700; color: #111; }
                
                /* Product Grid */
                .product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 24px; }
                @media (min-width: 768px) { .product-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; } }
                @media (min-width: 1024px) { .product-grid { grid-template-columns: repeat(4, 1fr); } }
                @media (min-width: 1280px) { .product-grid { grid-template-columns: repeat(5, 1fr); } }
                .card-wrapper { height: 100%; min-height: 280px; }
                
                /* Filter Sheet styles */
                .sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; opacity: 0; pointer-events: none; transition: opacity 0.3s; backdrop-filter: blur(4px); }
                .sheet-overlay.open { opacity: 1; pointer-events: auto; }
                .sheet { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; z-index: 101; border-top-left-radius: 24px; border-top-right-radius: 24px; box-shadow: 0 -10px 40px rgba(0,0,0,0.2); transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); height: 85vh; display: flex; flex-direction: column; }
                .sheet.open { transform: translateY(0); }
                @media (min-width: 768px) { .sheet { width: 480px; left: 50%; margin-left: -240px; bottom: 20px; border-radius: 24px; height: 80vh; } }
                .s-header { padding: 16px 20px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: center; align-items: center; position: relative; }
                .s-title { font-size: 16px; font-weight: 700; color: #111; }
                .close-btn { position: absolute; left: 20px; background: none; border: none; cursor: pointer; color: #333; padding: 4px; }
                .s-layout { display: flex; flex: 1; overflow: hidden; }
                .s-sidebar { width: 130px; background: #f8f9fa; border-right: 1px solid #eee; padding: 20px 0; overflow-y: auto; }
                .s-content { flex: 1; padding: 20px; overflow-y: auto; background: #fff; }
                .menu-item { padding: 12px 20px; font-size: 13px; color: #6b7280; font-weight: 600; cursor: pointer; border-left: 3px solid transparent; transition: 0.2s; }
                .menu-item.active { background: #fff; color: #10b981; border-left-color: #10b981; }
                .cat-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; border-bottom: 1px solid #f9f9f9; }
                .cb-custom { width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: 0.2s; color: white; }
                .cat-row.active .cb-custom { background: #10b981; border-color: #10b981; }
                .cat-text { font-size: 14px; color: #374151; font-weight: 500; }
                .cat-row.active .cat-text { font-weight: 700; color: #111; }
                .s-footer { padding: 16px 20px; border-top: 1px solid #eee; display: flex; gap: 12px; background: #fff; }
                .btn { flex: 1; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: transform 0.1s; text-align: center; }
                .btn:active { transform: scale(0.98); }
                .btn-clear { background: #fff; border: 1px solid #e5e7eb; color: #374151; }
                .btn-apply { background: #111; color: white; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
                
                /* ✅ NEW: Beautiful "Load More" button styles */
                .load-more-container { display: flex; justify-content: center; padding: 40px 0; }
                .load-more-btn { background: #fff; color: #111; border: 1px solid #e5e7eb; padding: 14px 40px; font-size: 15px; font-weight: 700; border-radius: 100px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .load-more-btn:hover:not(:disabled) { background: #111; color: #fff; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
                .load-more-btn:disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; transform: none; box-shadow: none; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .spinner { width: 20px; height: 20px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
            `}</style>

            <div className="page-header">
                <div className="wrapper">
                    <h1 className="header-title">Explore Daily</h1>
                    <div className="count-badge">{totalCount > 0 ? `${totalCount.toLocaleString()} products available` : 'Discover new items'}</div>
                </div>
            </div>

            <div className="sticky-filters" style={{ top: isHeaderVisible ? '70px' : '0px' }}>
                <div className="wrapper filter-scroll">
                    <div className="filter-btn-wrapper">
                        <button className={`chip ${activeFilterCount > 0 ? 'active' : ''}`} onClick={() => { setIsFilterOpen(true); setTempFilters(filters); }}>
                            <FilterIcon /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                        </button>
                        {activeFilterCount > 0 && <div className="filter-dot"/>}
                    </div>
                    <button className={`chip ${filters.hasVideo ? 'active' : ''}`} onClick={() => toggleChip('hasVideo', !filters.hasVideo)}><i className="fas fa-video text-blue-500"></i> Video</button>
                    <button className={`chip ${filters.showVerified ? 'active' : ''}`} onClick={() => toggleChip('showVerified', !filters.showVerified)}><i className="fas fa-check-circle text-green-500"></i> Verified</button>
                    <div className="sort-dropdown" onMouseLeave={() => setIsSortOpen(false)}>
                        <button className="chip" onClick={() => setIsSortOpen(!isSortOpen)}>Sort By <ChevronDown/></button>
                        {isSortOpen && (
                            <div className="sort-menu">
                                {[{label: 'Recommended', val: 'default'}, {label: 'Newest Arrivals', val: 'newest'}, {label: 'Price: Low to High', val: 'price_low'}, {label: 'Price: High to Low', val: 'price_high'}].map(opt => (
                                    <div key={opt.val} className={`sort-item ${filters.sort === opt.val ? 'selected' : ''}`} onClick={() => { toggleChip('sort', opt.val); setIsSortOpen(false); }}>{opt.label}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="wrapper">
                <div className="product-grid">
                    {products.map((p, i) => (
                        <div key={`${p.id}-${i}`} className="card-wrapper"><ProductCard product={p} /></div>
                    ))}
                </div>

                {/* ✅ REPLACED: Old trigger is now the "Load More" button container */}
                <div className="load-more-container">
                    {isValidating && size > 1 ? (
                        <button className="load-more-btn" disabled>
                            <div className="spinner"></div>
                            <span>Loading...</span>
                        </button>
                    ) : !isReachingEnd ? (
                        <button className="load-more-btn" onClick={() => setSize(size + 1)}>Load More</button>
                    ) : (
                        products.length > 0 && <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 600 }}>You've reached the end!</span>
                    )}
                </div>
            </div>

            <div className={`sheet-overlay ${isFilterOpen ? 'open' : ''}`} onClick={() => setIsFilterOpen(false)} />
            <div className={`sheet ${isFilterOpen ? 'open' : ''}`}>
                <div className="s-header"><button onClick={() => setIsFilterOpen(false)} className="close-btn"><CloseIcon/></button><span className="s-title">Filters</span></div>
                <div className="s-layout">
                    <div className="s-sidebar"><div className="menu-item active">Categories</div><div className="menu-item" style={{opacity:0.4}}>Price Range</div><div className="menu-item" style={{opacity:0.4}}>Rating</div></div>
                    <div className="s-content">
                        {categories.map(cat => (
                            <div key={cat.id}>
                                <div className={`cat-row ${tempFilters.category_ids.includes(String(cat.id)) ? 'active' : ''}`} onClick={() => toggleTempCat(String(cat.id))}>
                                    <div className="cb-custom">{tempFilters.category_ids.includes(String(cat.id)) && <CheckIcon/>}</div>
                                    <span className="cat-text">{cat.name}</span>
                                </div>
                                {cat.subcategories?.map((sub: any) => (
                                    <div key={sub.id} className={`cat-row ${tempFilters.category_ids.includes(String(sub.id)) ? 'active' : ''}`} style={{paddingLeft: 34}} onClick={() => toggleTempCat(String(sub.id))}>
                                        <div className="cb-custom" style={{width: 18, height: 18}}>{tempFilters.category_ids.includes(String(sub.id)) && <CheckIcon/>}</div>
                                        <span className="cat-text" style={{fontSize: 13}}>{sub.name}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="s-footer"><button className="btn btn-clear" onClick={clearFilters}>Clear All</button><button className="btn btn-apply" onClick={applyFilters}>Show Products</button></div>
            </div>
        </div>
    );
}