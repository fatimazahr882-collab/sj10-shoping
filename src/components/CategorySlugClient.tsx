// src/components/CategorySlugClient.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
    IoArrowBack, IoSearchOutline, IoClose, IoOptionsOutline, 
    IoCheckmarkCircle, IoPlayCircle, IoPricetag, 
    IoRadioButtonOff, IoRadioButtonOn 
} from "react-icons/io5";

import ProductCardLite from "@/components/ProductCardLite"; // ✅ NEW: Imported the fast Lite Card

const API_URL = process.env.NEXT_PUBLIC_PRODUCT_API_URL;
type SortOption = 'default' | 'price_low' | 'price_high';

// Accept initial data from the Server Page
export default function CategorySlugClient({ slug }: { slug: string }) {
    // --- STATE ---
    const [products, setProducts] = useState<any[]>([]); // Changed type to any[] to easily map to Lite card
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeSort, setActiveSort] = useState<SortOption>('default');
    const [activeMaxPrice, setActiveMaxPrice] = useState<string>("");
    const [isVerified, setIsVerified] = useState(false);
    const [hasVideo, setHasVideo] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 400); 
        return () => clearTimeout(handler);
    }, [search]);

    const fetchData = useCallback(async (pageNum: number, isRefresh: boolean) => {
        if (!slug) return;
        try {
            if (isRefresh) setLoading(true); else setLoadingMore(true);

            const query = new URLSearchParams();
            query.append("page", pageNum.toString());
            query.append("limit", "40");
            query.append("sort", activeSort); 
            
            if (debouncedSearch) query.append("search", debouncedSearch);
            if (activeMaxPrice) query.append("maxPrice", activeMaxPrice);

            const res = await fetch(`${API_URL}/products/category/${slug}?${query.toString()}`);
            if (!res.ok) throw new Error("API Error");
            const data = await res.json();

            setCategory(data.category);
            let fetchedProducts: any[] = data.products || [];

            if (isVerified) {
                fetchedProducts = fetchedProducts.filter(p => 
                    p.supplier_verified === true || 
                    String(p.supplier?.verified_status).toLowerCase() === 'verified'
                );
            }
            if (hasVideo) {
                fetchedProducts = fetchedProducts.filter(p => p.has_video);
            }

            if (isRefresh) {
                setProducts(fetchedProducts);
                // Only scroll to top on explicit filter change, not initial load
                if(pageNum === 1) window.scrollTo(0, 0); 
            } else {
                setProducts(prev => [...prev, ...fetchedProducts]);
            }
            
            setHasMore(pageNum < (data.totalPages || 1) && fetchedProducts.length > 0);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [slug, activeSort, debouncedSearch, activeMaxPrice, isVerified, hasVideo]);

    useEffect(() => {
        setPage(1);
        fetchData(1, true);
    }, [fetchData]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            const next = page + 1;
            setPage(next);
            fetchData(next, false);
        }
    };

    const resetFilters = () => {
        setActiveSort('default');
        setActiveMaxPrice("");
        setIsVerified(false);
        setHasVideo(false);
        setShowFilterModal(false);
    };

    const activeCount = (activeMaxPrice ? 1 : 0) + (isVerified ? 1 : 0) + (hasVideo ? 1 : 0) + (activeSort !== 'default' ? 1 : 0);

    return (
        <div className="page-wrapper">
             <style jsx>{`
                .page-wrapper { background-color: #f8fafc; min-height: 100vh; padding-bottom: 80px; font-family: sans-serif; }
                .header-sticky { position: sticky; top: 0; z-index: 50; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid transparent; }
                .header-sticky.scrolled { background: rgba(255, 255, 255, 0.98); border-bottom: 1px solid rgba(0,0,0,0.06); box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
                .nav-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; max-width: 1400px; margin: 0 auto; }
                .btn-icon { width: 40px; height: 40px; border-radius: 50%; background: #fff; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #1e293b; font-size: 20px; cursor: pointer; }
                .search-box { flex: 1; position: relative; }
                .search-input { width: 100%; height: 44px; padding: 0 40px 0 44px; border-radius: 99px; background: #f1f5f9; border: 1px solid transparent; outline: none; }
                .search-input:focus { background: #fff; border-color: #cbd5e1; box-shadow: 0 0 0 3px rgba(226, 232, 240, 0.6); }
                .icon-left { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 18px; pointer-events: none; }
                .icon-right { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 18px; cursor: pointer; padding: 2px; }
                .filters-scroll { display: flex; align-items: center; gap: 8px; padding: 0 16px 14px 16px; overflow-x: auto; scrollbar-width: none; }
                .btn-main-filter { display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 16px; background: #0f172a; color: #fff; border-radius: 99px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }
                .chip { height: 36px; padding: 0 14px; border-radius: 99px; background: #fff; border: 1px solid #e2e8f0; color: #475569; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap; }
                .chip.active-blue { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; font-weight: 600; }
                .chip.active-gold { background: #fffbeb; border-color: #f59e0b; color: #b45309; font-weight: 600; }
                .chip.active-gray { background: #f1f5f9; border-color: #94a3b8; color: #0f172a; font-weight: 600; }
                .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px; max-width: 1400px; margin: 0 auto; }
                @media(min-width: 640px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
                @media(min-width: 1024px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
                .skel { background: #fff; border-radius: 12px; height: 280px; border: 1px solid #f1f5f9; overflow: hidden; }
                .skel-img { height: 70%; background: #f1f5f9; animation: pulse 1.5s infinite; }
                .skel-txt { padding: 12px; }
                .skel-ln { height: 10px; background: #f1f5f9; margin-bottom: 8px; border-radius: 4px; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
                .lm-box { text-align: center; margin: 40px 0; }
                .btn-lm { padding: 12px 36px; background: #0f172a; color: #fff; border-radius: 99px; font-weight: 600; border: none; cursor: pointer; }
                .modal-bg { position: fixed; inset: 0; z-index: 9999; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: flex-end; }
                @media(min-width: 768px) { .modal-bg { align-items: center; } }
                .modal-panel { background: #fff; width: 100%; max-width: 440px; border-radius: 24px 24px 0 0; max-height: 90dvh; display: flex; flex-direction: column; animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
                @media(min-width: 768px) { .modal-panel { border-radius: 20px; max-height: 80vh; animation: zoomIn 0.2s ease; } }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .m-head { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
                .m-title { font-size: 18px; font-weight: 700; color: #1e293b; }
                .m-scroll-content { padding: 24px; overflow-y: auto; flex: 1; min-height: 0; }
                .m-foot { padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; gap: 12px; background: #fff; flex-shrink: 0; padding-bottom: max(16px, env(safe-area-inset-bottom)); }
                .lbl { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px; display: block; }
                .opt-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 10px; cursor: pointer; transition: 0.2s; background: #fff; }
                .opt-row.active { border-color: #0f172a; background: #f8fafc; box-shadow: 0 0 0 1px #0f172a inset; }
                .opt-txt { font-size: 15px; font-weight: 500; color: #334155; }
                .opt-row.active .opt-txt { color: #0f172a; font-weight: 600; }
                .price-chips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .p-chip { padding: 12px; text-align: center; border: 1px solid #e2e8f0; border-radius: 50px; font-size: 13px; font-weight: 500; color: #475569; cursor: pointer; transition: 0.2s; }
                .p-chip.active { background: #0f172a; color: #fff; border-color: #0f172a; }
                .btn-action { flex: 1; height: 48px; border-radius: 12px; font-weight: 600; cursor: pointer; border: none; font-size: 15px; }
                .btn-action.reset { background: #fff; border: 1px solid #cbd5e1; color: #475569; }
                .btn-action.apply { background: #0f172a; color: #fff; }
            `}</style>

            <header className={`header-sticky ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-row">
                    <Link href="/category" className="btn-icon" aria-label="Back">
                        <IoArrowBack />
                    </Link>
                    <div className="search-box">
                        <IoSearchOutline className="icon-left" />
                        <input 
                            className="search-input"
                            placeholder={category ? `Search in ${category.name}...` : "Search products..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && <IoClose className="icon-right" onClick={() => setSearch("")} />}
                    </div>
                </div>

                <div className="filters-scroll">
                    <button className="btn-main-filter" onClick={() => setShowFilterModal(true)}>
                        <IoOptionsOutline size={18} /> 
                        Filters 
                        {activeCount > 0 && <span style={{marginLeft:6, background:'#fff', color:'#000', fontSize:11, padding:'1px 6px', borderRadius:4}}>{activeCount}</span>}
                    </button>

                    <button 
                        className={`chip ${isVerified ? 'active-blue' : ''}`}
                        onClick={() => setIsVerified(!isVerified)}
                    >
                        <IoCheckmarkCircle size={14} color={isVerified ? '#2563eb' : '#94a3b8'} /> Verified
                    </button>

                    <button 
                        className={`chip ${hasVideo ? 'active-gold' : ''}`}
                        onClick={() => setHasVideo(!hasVideo)}
                    >
                        <IoPlayCircle size={14} color={hasVideo ? '#d97706' : '#94a3b8'} /> Video
                    </button>

                    <button 
                        className={`chip ${activeMaxPrice === '2500' ? 'active-gray' : ''}`}
                        onClick={() => setActiveMaxPrice(activeMaxPrice === '2500' ? '' : '2500')}
                    >
                        <IoPricetag size={13} style={{opacity:0.7}} /> &lt; 2500
                    </button>
                </div>
            </header>

            <main>
                <div className="grid">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="skel">
                                <div className="skel-img"></div>
                                <div className="skel-txt">
                                    <div className="skel-ln" style={{width:'85%'}}></div>
                                    <div className="skel-ln" style={{width:'50%'}}></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // ✅ THIS IS THE FIX: Properly mapping the data to the new Lite Card!
                        products.map((item, index) => (
                            <div key={item.id} className="anim-item" style={{animationDelay: `${index * 0.05}s`}}>
                                <ProductCardLite product={{
                                    id: item.id,
                                    t: item.title,
                                    s: item.slug,
                                    sku: item.sku,
                                    p: parseFloat((item.price || 0) as string),
                                    dp: parseFloat((item.discounted_price || item.price || 0) as string),
                                    img: typeof item.image_urls === 'string' && item.image_urls.startsWith('[') 
                                        ? JSON.parse(item.image_urls)[0] 
                                        : (Array.isArray(item.image_urls) ? item.image_urls[0] : item.image_urls),
                                    v: ['verified', '1', 'true'].includes(String(item.supplier_verified || "").toLowerCase()),
                                    // @ts-ignore
                                    b: item.supplier?.brand_name || "SJ10",
                                    r: parseFloat(String(item.avg_rating || 0)),
                                    rc: parseInt(String(item.review_count || 0)),
                                    hv: item.has_video || false
                                }} />
                            </div>
                        ))
                    )}
                </div>

                {!loading && products.length === 0 && (
                    <div style={{textAlign:'center', padding:'60px 20px', color:'#64748b'}}>
                        <IoSearchOutline size={48} style={{opacity:0.2}} />
                        <h3 style={{marginTop:16, fontSize:18, color:'#1e293b'}}>No results found</h3>
                        <p style={{marginBottom:20}}>Try changing filters or search terms.</p>
                        <button onClick={resetFilters} style={{color:'#2563eb', background:'none', border:'none', fontWeight:600, cursor:'pointer'}}>Clear Filters</button>
                    </div>
                )}

                {hasMore && !loading && products.length > 0 && (
                    <div className="lm-box">
                        <button className="btn-lm" onClick={handleLoadMore} disabled={loadingMore}>
                            {loadingMore ? 'Loading...' : 'Load More Products'}
                        </button>
                    </div>
                )}
            </main>

            {showFilterModal && (
                <div className="modal-bg" onClick={() => setShowFilterModal(false)}>
                    <div className="modal-panel" onClick={e => e.stopPropagation()}>
                        <div className="m-head">
                            <span className="m-title">Refine Results</span>
                            <button className="btn-icon" onClick={() => setShowFilterModal(false)} style={{border:'none', background:'#f1f5f9', width:32, height:32}}>
                                <IoClose />
                            </button>
                        </div>
                        <div className="m-scroll-content">
                            <div style={{marginBottom:24}}>
                                <span className="lbl">Sort By</span>
                                <div className={`opt-row ${activeSort === 'default' ? 'active' : ''}`} onClick={() => setActiveSort('default')}>
                                    <span className="opt-txt">Recommended</span>
                                    {activeSort === 'default' ? <IoRadioButtonOn size={22} color="#0f172a"/> : <IoRadioButtonOff size={22} color="#cbd5e1"/>}
                                </div>
                                <div className={`opt-row ${activeSort === 'price_low' ? 'active' : ''}`} onClick={() => setActiveSort('price_low')}>
                                    <span className="opt-txt">Price: Low to High</span>
                                    {activeSort === 'price_low' ? <IoRadioButtonOn size={22} color="#0f172a"/> : <IoRadioButtonOff size={22} color="#cbd5e1"/>}
                                </div>
                                <div className={`opt-row ${activeSort === 'price_high' ? 'active' : ''}`} onClick={() => setActiveSort('price_high')}>
                                    <span className="opt-txt">Price: High to Low</span>
                                    {activeSort === 'price_high' ? <IoRadioButtonOn size={22} color="#0f172a"/> : <IoRadioButtonOff size={22} color="#cbd5e1"/>}
                                </div>
                            </div>
                            <div>
                                <span className="lbl">Max Price</span>
                                <div className="price-chips">
                                    {['1000', '2500', '5000'].map(price => (
                                        <div key={price} className={`p-chip ${activeMaxPrice === price ? 'active' : ''}`} onClick={() => setActiveMaxPrice(activeMaxPrice === price ? '' : price)}>
                                            &lt; {price}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="m-foot">
                            <button className="btn-action reset" onClick={resetFilters}>Reset</button>
                            <button className="btn-action apply" onClick={() => setShowFilterModal(false)}>Apply Filters</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}