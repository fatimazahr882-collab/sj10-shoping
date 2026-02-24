"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  FaCheckCircle, FaPlus, FaSearch,
  FaStar, FaExclamationTriangle, FaFire, FaClock, FaBoxOpen
} from 'react-icons/fa';

// --- CONFIG & HELPERS ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002';
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
  return localStorage.getItem('user_token') || localStorage.getItem('token');
};

// --- SWR FETCHER ---
const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

// ==========================================
// === MAIN PAGE COMPONENT                ===
// ==========================================
export default function SupplierShopPage() {
  const params = useParams();
  const supplierId = params?.id || params?.supplierId;
  const router = useRouter();

  // --- SWR FETCHING (Only for Public Data) ---
  const { data: supplier, error: supError } = useSWR(
    supplierId ? `${API_URL}/api/suppliers/${supplierId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: prodData, error: prodError } = useSWR(
    supplierId ? `${API_URL}/api/products/explore-feed?supplierId=${supplierId}&limit=100` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [hotDealIndex, setHotDealIndex] = useState(0);

  // Follow States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Independent Loading States (This fixes the 10-second flash bug)
  const isSupplierLoading = !supplier && !supError;
  const isProductsLoading = !prodData && !prodError;
  const products = prodData?.products || prodData?.data || [];

  // Set initial follower count once supplier loads
  useEffect(() => {
    if (supplier && followerCount === 0) {
      setFollowerCount(supplier.followers_count || 0);
    }
  }, [supplier]);

  // --- EXACT FOLLOW LOGIC FROM YOUR ProductDetailClient.tsx ---
  useEffect(() => {
    const token = getToken();
    if (!token || !supplierId) return;
    
    // Check Follow Status
    fetch(`${API_URL}/api/social/follow/status/${supplierId}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
    })
    .then(res => res.json())
    .then(data => {
        if (data && typeof data.isFollowing === 'boolean') {
            setIsFollowing(data.isFollowing);
        }
    })
    .catch(e => console.error("Follow check failed", e));
  }, [supplierId]);

  // --- FOLLOW ACTION ---
  const getLoginRedirectUrl = () => {
    // Matches your exact path: /auth/login
    const currentPath = window.location.pathname + window.location.search;
    return `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
  };

  const handleFollow = async () => {
    if (!getToken()) { router.push(getLoginRedirectUrl()); return; }
    if (!supplierId || isFollowLoading) return;
    
    setIsFollowLoading(true);
    // Optimistic UI update
    const previousState = isFollowing; 
    setIsFollowing(!isFollowing); 
    setFollowerCount(prev => !previousState ? prev + 1 : prev - 1);
    
    try {
        const res = await fetch(`${API_URL}/api/social/follow/${supplierId}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error("Action failed");
    } catch (error) { 
        // Revert on failure
        setIsFollowing(previousState); 
        setFollowerCount(supplier?.followers_count || 0); 
        alert("Unable to follow."); 
    } finally { setIsFollowLoading(false); }
  };

  // ANIMATION LOGIC (Hot Deals)
  useEffect(() => {
    if (products.length < 2) return;
    const interval = setInterval(() => {
      setHotDealIndex(prev => (prev + 1) % Math.min(products.length, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [products]);

  // DERIVED PRODUCTS (Search & Sort)
  const filteredProducts = useMemo(() => {
    let res = [...products];
    if (searchTerm) {
      res = res.filter(p => (p?.title || "").toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (sortBy === 'newest') res.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    if (sortBy === 'price_high') res.sort((a: any, b: any) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
    if (sortBy === 'price_low') res.sort((a: any, b: any) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
    return res;
  }, [products, searchTerm, sortBy]);

  const hotDealProduct = filteredProducts[hotDealIndex];
  const gridProducts = filteredProducts;

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
        .shimmer { position: relative; overflow: hidden; }
        .shimmer::after { content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shine 1.5s infinite; }
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
              
              <button className={`follow-btn ${isFollowing ? 'active' : ''}`} onClick={handleFollow}>
                {isFollowing ? <FaCheckCircle /> : <FaPlus />} 
                {isFollowing ? "Following" : "Follow"}
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
          
          {/* FIXED: Show Product Skeletons during the 10 second delay */}
          {isProductsLoading ? (
             <div className="grid">
               {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
             </div>
          ) : gridProducts.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                 <FaBoxOpen size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                 <p>No products found {searchTerm && `matching "${searchTerm}"`}</p>
             </div>
          ) : (
             <div className="grid">
               {hotDealProduct && !searchTerm && sortBy === 'newest' && (
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

               {gridProducts.map(p => {
                 if (!searchTerm && sortBy === 'newest' && p.id === hotDealProduct?.id) return null;
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
        </div>
      )}
    </div>
  );
}