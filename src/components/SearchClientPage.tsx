// src/components/SearchClientPage.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import ProductCardLite from '@/components/ProductCardLite';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://sj10-cart.vercel.app/api";

type Props = {
  initialQuery: string;
  initialProducts: any[];
  initialTotalCount: number;
};

// 🟢 SILVER SHIMMER SKELETON CARD WITH "SJ10" WATERMARK
const SilverSkeletonCard = () => (
  <div className="skeleton-card-container">
    <div className="skeleton-img-box">
      <div className="silver-shimmer-sweep"></div>
      <span className="sj10-watermark">SJ10</span>
    </div>
    <div className="skeleton-text-box">
      <div className="skeleton-line w-90"></div>
      <div className="skeleton-line w-60"></div>
      <div className="skeleton-line w-40 h-price"></div>
    </div>
  </div>
);

// Helper to truncate long keywords for button
const truncateKeyword = (text: string, maxLen: number = 18) => {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.substring(0, maxLen) + "...";
};

export default function SearchClientPage({ initialQuery, initialProducts, initialTotalCount }: Props) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length >= 40);

  // Truncate keyword for clean Load More button UI
  const displayKeyword = useMemo(() => truncateKeyword(initialQuery, 18), [initialQuery]);

  // Sync state when URL query changes
  useEffect(() => {
    setProducts(initialProducts);
    setTotalCount(initialTotalCount);
    setPage(1);
    setHasMore(initialProducts.length >= 40);
    setLoading(false);
  }, [initialQuery, initialProducts, initialTotalCount]);

  // 🟢 MANUAL "LOAD MORE" ACTION (FETCHES NEXT 40 PRODUCTS)
  const handleLoadMore = async () => {
    if (loadingNextPage || !hasMore) return;

    const nextPage = page + 1;
    setLoadingNextPage(true);

    try {
      const res = await fetch(`${API_BASE}/products/search-results?q=${encodeURIComponent(initialQuery)}&page=${nextPage}&limit=40`);
      if (!res.ok) throw new Error("Failed to load more");
      const data = await res.json();

      const newProducts = data.products || [];
      setProducts(prev => [...prev, ...newProducts]);
      setPage(nextPage);

      if (newProducts.length < 40) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Load More Error:", error);
    } finally {
      setLoadingNextPage(false);
    }
  };

  return (
    <div className="sj10-search-page-root">
      <style jsx global>{`
        /* 🟢 STRICT VERTICAL PAGE LAYOUT WITH GENERATED TOP SPACING */
        .sj10-search-page-root {
          min-height: 100vh;
          background-color: #f8fafc;
          font-family: 'Poppins', sans-serif;
          padding-bottom: 100px;
          width: 100% !important;
          display: block !important;
        }

        .sj10-search-inner-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 25px 16px 40px !important; /* 🟢 Top padding 25px ensures no overlap! */
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        /* 1. ANIMATED TITLE BANNER (Sits comfortably under header) */
        .sj10-results-banner {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
          margin-bottom: 24px !important;
          flex-wrap: wrap;
          gap: 12px;
          animation: slideInDown 0.3s ease-out;
        }
        .results-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .keyword-highlight {
          background: linear-gradient(135deg, #f85606, #ea580c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
        }
        .results-count-badge {
          background: #fff7ed;
          color: #ea580c;
          border: 1px solid #fed7aa;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(248, 86, 6, 0.08);
        }

        /* 2. RESPONSIVE PRODUCT GRID (2 ON MOBILE, 5 ON DESKTOP) */
        .sj10-search-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
          width: 100% !important;
          margin-bottom: 30px !important;
        }
        @media (min-width: 640px) { .sj10-search-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 16px !important; } }
        @media (min-width: 1024px) { .sj10-search-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 20px !important; } }
        @media (min-width: 1280px) { .sj10-search-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 24px !important; } }

        /* 3. SILVER SHIMMER SKELETON CARD STYLING */
        .skeleton-card-container {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 280px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .skeleton-img-box {
          width: 100%;
          aspect-ratio: 1 / 1;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .silver-shimmer-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.75) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: silverSweep 1.6s infinite linear;
        }
        @keyframes silverSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .sj10-watermark {
          font-size: 32px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.75);
          letter-spacing: 3px;
          text-shadow: 0 2px 6px rgba(0,0,0,0.08);
          z-index: 2;
          user-select: none;
        }
        .skeleton-text-box {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .skeleton-line {
          height: 12px;
          background: #e2e8f0;
          border-radius: 4px;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .w-90 { width: 90%; }
        .w-60 { width: 60%; }
        .w-40 { width: 40%; }
        .h-price { height: 18px; background: #fed7aa; }

        /* 4. CENTERED DYNAMIC "LOAD MORE" BUTTON */
        .sj10-load-more-center {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
          margin: 40px 0 50px !important;
        }
        .animated-load-more-btn {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          border: none;
          padding: 16px 44px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          letter-spacing: 0.3px;
        }
        .animated-load-more-btn:hover {
          background: linear-gradient(135deg, #f85606 0%, #ea580c 100%);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 35px rgba(248, 86, 6, 0.35);
        }
        .animated-load-more-btn:active { transform: scale(0.97); }

        /* 5. COLORFUL RICH SEO TEXT BLOCK AT THE VERY BOTTOM */
        .sj10-seo-block {
          width: 100% !important;
          background: #ffffff;
          border-radius: 24px;
          padding: 35px;
          margin-top: 50px !important;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          position: relative;
          overflow: hidden;
          box-sizing: border-box !important;
        }
        .sj10-seo-block::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 6px;
          background: linear-gradient(90deg, #f85606, #3b82f6, #10b981);
        }
        .seo-h2 {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 16px;
        }
        .seo-p {
          font-size: 14.5px;
          color: #475569;
          line-height: 1.8;
          margin-bottom: 16px;
          text-align: justify;
        }
        .seo-p strong { color: #0f172a; font-weight: 700; }
        
        .seo-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }
        .seo-badge-chip {
          background: #f1f5f9;
          color: #334155;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #cbd5e1;
        }

        @keyframes slideInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* 🟢 VERTICAL STACKED CONTAINER */}
      <div className="sj10-search-inner-wrapper">

        {/* 1. ANIMATED TITLE BANNER */}
        <div className="sj10-results-banner">
          <h1 className="results-title">
            <i className="fas fa-search" style={{ color: '#f85606', fontSize: '20px' }}></i>
            Results for <span className="keyword-highlight">"{initialQuery}"</span>
          </h1>
          <span className="results-count-badge">
            <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>
            {totalCount.toLocaleString()} Products Available
          </span>
        </div>

        {/* 2. INITIAL SHIMMER LOADING */}
        {loading && (
          <div className="sj10-search-grid">
            {[...Array(10)].map((_, i) => (
              <SilverSkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* 3. NO RESULTS EMPTY STATE */}
        {!loading && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px', margin: '20px 0', border: '1px solid #f1f5f9' }}>
            <i className="fas fa-search-minus" style={{ fontSize: '56px', color: '#cbd5e1', marginBottom: '16px' }}></i>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>No products found</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>We couldn't find any match for "{initialQuery}". Check your spelling or try another search term.</p>
          </div>
        )}

        {/* 4. PRODUCT GRID (2 ON MOBILE, 5 ON DESKTOP) */}
        {!loading && products.length > 0 && (
          <div className="sj10-search-grid">
            {products.map((p, i) => (
              <div key={`${p.id}-${i}`}>
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
                  b: p.supplier?.brand_name || "SJ10",
                  r: parseFloat(String(p.avg_rating || 0)),
                  rc: parseInt(String(p.review_count || 0)),
                  hv: p.has_video || false
                }} />
              </div>
            ))}

            {/* APPEND SHIMMER CARDS WHILE LOADING NEXT 40 PRODUCTS */}
            {loadingNextPage && (
              [...Array(10)].map((_, i) => (
                <SilverSkeletonCard key={`next-skel-${i}`} />
              ))
            )}
          </div>
        )}

        {/* 5. CENTERED DYNAMIC "LOAD MORE" BUTTON */}
        {!loading && hasMore && products.length > 0 && (
          <div className="sj10-load-more-center">
            <button className="animated-load-more-btn" onClick={handleLoadMore} disabled={loadingNextPage}>
              {loadingNextPage ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i> Loading Next 40 Products...
                </>
              ) : (
                <>
                  <span>Load More {displayKeyword ? `"${displayKeyword}"` : "Products"}</span>
                  <i className="fas fa-arrow-down"></i>
                </>
              )}
            </button>
          </div>
        )}

        {/* 6. COLORFUL RICH SEO TEXT BLOCK AT THE VERY BOTTOM */}
        <div className="sj10-seo-block">
          <h2 className="seo-h2">Buy {initialQuery || "Products"} Online at Best Price in Pakistan</h2>
          <p className="seo-p">
            Welcome to <strong>SJ10 Shopping</strong>, Pakistan's leading multi-vendor online marketplace. Are you looking to buy <strong>{initialQuery}</strong> at genuine wholesale prices? You are in the right place! We bring you thousands of verified items from top Pakistani suppliers across Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, and Peshawar.
          </p>
          <p className="seo-p">
            Enjoy 100% risk-free shopping with our trusted <strong>Cash on Delivery (COD)</strong> service nationwide. Every order comes with fast 3-7 day delivery, guaranteed product quality, and a hassle-free 7-day return policy. Start exploring today and get the best deals delivered straight to your doorstep!
          </p>

          <div className="seo-badge-row">
            <span className="seo-badge-chip">🇵🇰 Cash on Delivery Nationwide</span>
            <span className="seo-badge-chip">⚡ Fast 3-5 Days Shipping</span>
            <span className="seo-badge-chip">🛡️ 7-Day Replacement Guarantee</span>
            <span className="seo-badge-chip">🏷️ Wholesale Rates Guaranteed</span>
          </div>
        </div>

      </div>
    </div>
  );
}