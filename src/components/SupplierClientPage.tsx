"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import {
  FaCheckCircle, FaPlus, FaSearch,
  FaStar, FaExclamationTriangle, FaFire, FaClock, FaBoxOpen
} from 'react-icons/fa';

// --- CONFIG & HELPERS ---
const PRODUCT_API = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://products.sj10.pk/api';
const CART_API = process.env.NEXT_PUBLIC_CART_API_URL || 'https://sj10-cart.vercel.app/api';
const PLACEHOLDER_IMG = "https://via.placeholder.com/400x400.png?text=No+Image";

const getSafeImage = (image_urls: any) => {
  if (!image_urls) return PLACEHOLDER_IMG;
  try {
    if (typeof image_urls === 'string') {
      const parsed = JSON.parse(image_urls);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : PLACEHOLDER_IMG;
    }
    if (Array.isArray(image_urls) && image_urls.length > 0) return image_urls[0];
  } catch (e) {
    if (typeof image_urls === 'string' && image_urls.startsWith('http')) return image_urls;
  }
  return PLACEHOLDER_IMG;
};

const formatPrice = (price: any) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price || 0);

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_token') || localStorage.getItem('authToken');
};

// Safe Fetcher that guarantees an error throw on non-200 responses
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    return res.json();
};

// --- UI COMPONENTS ---
const ProductSkeleton = () => (
  <div className="skeleton-card">
    <div className="sk-img shimmer"></div>
    <div className="sk-info">
      <div className="sk-title shimmer"></div>
      <div className="sk-price shimmer"></div>
    </div>
  </div>
);

const VerificationBadge = ({ status }: { status: any }) => {
  const normalizedStatus = status ? String(status).toLowerCase().trim() : "";
  if (['verified', '1', 'true'].includes(normalizedStatus)) {
    return <div className="badge badge-verified"><FaCheckCircle /> Verified Supplier</div>;
  }
  if (['underreview', 'pending', 'under review'].includes(normalizedStatus)) {
    return <div className="badge badge-pending"><FaClock /> Under Review</div>;
  }
  return <div className="badge badge-unverified"><FaExclamationTriangle /> Unverified</div>;
};

export default function SupplierClientPage({ supplierId }: { supplierId: string }) {
  const router = useRouter();

  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [hotDealIndex, setHotDealIndex] = useState(0);

  // Follow States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- SWR FETCHING: Supplier Profile ---
  const { data: supplier, error: supError, isLoading: isSupplierLoading } = useSWR(
    supplierId ? `${PRODUCT_API}/suppliers/${supplierId}` : null,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  // --- SWR INFINITE: Chunked Lazy Loading (40 Products) ---
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.products?.length) return null; // End reached
    const params = new URLSearchParams({
        page: String(pageIndex + 1),
        limit: '40',
        sort: sortBy
    });
    if (debouncedSearch) params.append('search', debouncedSearch);
    return `${CART_API}/shops/${supplierId}/products?${params.toString()}`;
  };

  const { data: prodDataPages, size, setSize, isLoading: isProductsLoading, isValidating } = useSWRInfinite(getKey, fetcher, { 
      revalidateOnFocus: false, 
      persistSize: true 
  });

  const products = useMemo(() => {
    return prodDataPages ? prodDataPages.flatMap(page => page.products || []) : [];
  }, [prodDataPages]);

  const isReachingEnd = prodDataPages && (prodDataPages[prodDataPages.length - 1]?.products?.length || 0) < 40;

  // --- INTERSECTION OBSERVER FOR INFINITE SCROLL ---
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement) => {
      if (isProductsLoading || isValidating) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && !isReachingEnd) {
              setSize(prev => prev + 1);
          }
      }, { rootMargin: "400px" }); 
      if (node) observerRef.current.observe(node);
  }, [isProductsLoading, isValidating, isReachingEnd, setSize]);

  useEffect(() => {
    if (supplier && followerCount === 0) setFollowerCount(supplier.followers_count || 0);
  }, [supplier]);

  // --- FOLLOW STATUS CHECK ---
  useEffect(() => {
    const token = getToken();
    if (!token || !supplierId) return;
    
    fetch(`${CART_API}/social/follow/status/${supplierId}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
    })
    .then(res => res.json())
    .then(data => {
        if (data && typeof data.isFollowing === 'boolean') setIsFollowing(data.isFollowing);
    })
    .catch(e => console.error("Follow check failed", e));
  }, [supplierId]);

  // --- FOLLOW ACTION ---
  const handleFollow = async () => {
    if (!getToken()) { 
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/auth?view=login&redirect=${encodeURIComponent(currentPath)}`); 
        return; 
    }
    if (!supplierId || isFollowLoading) return;
    
    setIsFollowLoading(true);
    const previousState = isFollowing; 
    setIsFollowing(!isFollowing); 
    setFollowerCount(prev => !previousState ? prev + 1 : prev - 1);
    
    try {
        const res = await fetch(`${CART_API}/social/follow/${supplierId}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error("Action failed");
    } catch (error) { 
        setIsFollowing(previousState); 
        setFollowerCount(supplier?.followers_count || 0); 
        alert("Unable to follow at this time."); 
    } finally { setIsFollowLoading(false); }
  };

  useEffect(() => {
    if (products.length < 2) return;
    const interval = setInterval(() => {
      setHotDealIndex(prev => (prev + 1) % Math.min(products.length, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [products]);

  const hotDealProduct = products[hotDealIndex];

  if (supError) return <div className="error-screen">Failed to load store data. Please try again.</div>;

  return (
    <div className="page-wrapper">
      <style jsx global>{`
        body { margin: 0; background-color: #f7f9fc; font-family: 'Inter', 'Roboto', sans-serif; -webkit-font-smoothing: antialiased; }
        * { box-sizing: border-box; }
        .page-wrapper { padding-bottom: 60px; }
        .store-header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px; color: white; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid #e2e8f0; position: relative; overflow: hidden; }
        .header-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: flex; align-items: center; gap: 24px; position: relative; z-index: 2; }
        .profile-img { width: 100px; height: 100px; border-radius: 10px; background: white; border: 4px solid rgba(255,255,255,0.15); overflow: hidden; flex-shrink: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .profile-img img { width: 100%; height: 100%; object-fit: cover; }
        .info-col { flex: 1; }
        .brand-name { font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
        .meta { margin-top: 8px; display: flex; gap: 20px; font-size: 14px; opacity: 0.85; align-items: center; flex-wrap: wrap; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-top: 12px; }
        .badge-verified { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
        .badge-pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
        .badge-unverified { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
        .follow-btn { background: #3b82f6; color: white; border: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .follow-btn:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4); }
        .follow-btn.active { background: white; color: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .toolbar { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .toolbar-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: flex; gap: 12px; }
        .search-box { flex: 1; background: #f1f5f9; border-radius: 8px; padding: 0 16px; display: flex; align-items: center; border: 1px solid transparent; transition: 0.3s; }
        .search-box:focus-within { background: white; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .search-inp { border: none; background: transparent; padding: 12px 0; width: 100%; outline: none; font-size: 14px; margin-left: 10px; }
        .sort-select { padding: 0 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-size: 14px; outline: none; cursor: pointer; transition: 0.3s; }
        .content { max-width: 1200px; margin: 0 auto; padding: 24px 20px; }
        .section-h { font-size: 20px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (min-width: 768px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 24px; } .header-inner { flex-direction: row; } }
        @media (max-width: 767px) { .header-inner { flex-direction: column; text-align: center; } .meta { justify-content: center; } .follow-btn { width: 100%; justify-content: center; } .toolbar-inner { flex-direction: column; } }
        .card { background: white; border-radius: 10px; border: 1px solid #f1f5f9; overflow: hidden; display: flex; flex-direction: column; position: relative; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); border-color: #e2e8f0; }
        .img-box { position: relative; width: 100%; padding-top: 100%; background: #f8fafc; overflow: hidden; }
        .p-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .card:hover .p-img { transform: scale(1.05); }
        .info { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .title { font-size: 14px; color: #334155; margin-bottom: 8px; line-height: 1.5; font-weight: 500; height: 42px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .price-box { margin-top: auto; display: flex; align-items: baseline; gap: 8px; }
        .price { font-size: 18px; font-weight: 700; color: #0f172a; }
        .cut-price { font-size: 13px; color: #94a3b8; text-decoration: line-through; }
        .flash-badge { position: absolute; top: 10px; left: 10px; background: #ef4444; color: white; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3); z-index: 2; }
        .skeleton-card { background: white; border-radius: 10px; border: 1px solid #f1f5f9; overflow: hidden; height: 320px; display: flex; flex-direction: column; }
        .sk-img { width: 100%; height: 60%; background: #e2e8f0; }
        .sk-info { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
        .sk-title { height: 16px; width: 80%; background: #e2e8f0; border-radius: 4px; }
        .sk-price { height: 24px; width: 50%; background: #e2e8f0; border-radius: 4px; margin-top: auto; }
        .shimmer { position: relative; overflow: hidden; background: #1e293b;}
        .shimmer::after { content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); animation: shine 1.5s infinite; }
        @keyframes shine { 100% { left: 100%; } }
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .error-screen { text-align: center; padding: 100px 20px; color: #ef4444; font-weight: 500; font-size: 16px; }
      `}</style>

      {isSupplierLoading ? (
        <div className="store-header" style={{ height: '220px' }}>
          <div className="shimmer" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}></div>
        </div>
      ) : !supplier ? (
        <div className="error-screen">Store Not Found</div>
      ) : (
        <div className="fade-in">
          {/* HEADER */}
          <header className="store-header">
            <div className="header-inner">
              <div className="profile-img">
                <img src={getSafeImage(supplier.profile_pic)} alt={supplier.brand_name} onError={(e) => { (e.target as any).src = PLACEHOLDER_IMG; }} />
              </div>
              <div className="info-col">
                <h1 className="brand-name">{supplier.brand_name}</h1>
                <div className="meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaBoxOpen /> <strong>{supplier.total_products || 0}</strong> Products</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong>{followerCount}</strong> Followers</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                    <FaStar /> <span style={{ color: 'white' }}>{Number(supplier.average_rating || 5.0).toFixed(1)}</span>
                  </span>
                </div>
                <VerificationBadge status={supplier.verified_status} />
              </div>
              
              <button className={`follow-btn ${isFollowing ? 'active' : ''}`} onClick={handleFollow} disabled={isFollowLoading}>
                {isFollowLoading ? <FaClock className="fa-spin" /> : isFollowing ? <FaCheckCircle /> : <FaPlus />} 
                {isFollowing ? "Following" : "Follow Store"}
              </button>
            </div>
          </header>

          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="toolbar-inner">
              <div className="search-box">
                <FaSearch color="#94a3b8" />
                <input type="text" className="search-inp" placeholder="Search products in this store..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS AREA */}
      {!isSupplierLoading && supplier && (
        <div className="content">
          <div className="section-h"><FaFire color="#ef4444" /> Store Products</div>
          
          {isProductsLoading && products.length === 0 ? (
             <div className="grid">
               {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
             </div>
          ) : products.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                 <FaBoxOpen size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                 <p>No products found {debouncedSearch && `matching "${debouncedSearch}"`}</p>
             </div>
          ) : (
             <div className="grid">
               {hotDealProduct && !debouncedSearch && sortBy === 'newest' && (
                 <Link href={`/products/${hotDealProduct.slug || hotDealProduct.id}`} className="card">
                   <div className="img-box">
                     <span className="flash-badge">FLASH SALE</span>
                     <img src={getSafeImage(hotDealProduct.image_urls)} className="p-img" alt="Hot Deal" />
                   </div>
                   <div className="info">
                     <div className="title">{hotDealProduct.title}</div>
                     <div className="price-box">
                       <span className="price">{formatPrice(hotDealProduct.price)}</span>
                       <span className="cut-price">{formatPrice(parseFloat(hotDealProduct.price) * 1.2)}</span>
                     </div>
                   </div>
                 </Link>
               )}

               {products.map(p => {
                 if (!debouncedSearch && sortBy === 'newest' && p.id === hotDealProduct?.id) return null;
                 const price = parseFloat(p.price || 0);
                 const cutPrice = p.discounted_price ? price : price * 1.2;
                 const displayPrice = p.discounted_price ? parseFloat(p.discounted_price) : price;

                 return (
                   <Link href={`/products/${p.slug || p.id}`} key={p.id} className="card fade-in">
                     <div className="img-box">
                       {p.discount_label && <span className="flash-badge" style={{ background: '#3b82f6' }}>{p.discount_label}</span>}
                       <img src={getSafeImage(p.image_urls)} className="p-img" alt={p.title} onError={(e) => { (e.target as any).src = PLACEHOLDER_IMG }} />
                     </div>
                     <div className="info">
                       <div className="title">{p.title}</div>
                       <div className="price-box">
                         <span className="price">{formatPrice(displayPrice)}</span>
                         <span className="cut-price">{formatPrice(cutPrice)}</span>
                       </div>
                     </div>
                   </Link>
                 )
               })}
             </div>
          )}
          
          {/* Lazy Loading Trigger */}
          {!isProductsLoading && (
            <div ref={loadMoreRef} style={{ padding: '40px', textAlign: 'center' }}>
                 {isValidating ? <div className="shimmer" style={{height: 40, width: 40, borderRadius: '50%', margin: '0 auto', background: '#e2e8f0'}}></div> : null}
            </div>
          )}

        </div>
      )}
    </div>
  );
}