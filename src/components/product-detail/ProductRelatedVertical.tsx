"use client";

import React, { useState } from 'react';
import ProductCard, { type Product } from '../ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://products.sj10.pk/api";

export default function ProductRelatedVertical({ 
    categoryId, 
    currentProductId, 
    initialProducts = [] 
}: { 
    categoryId?: string | number; 
    currentProductId?: string | number; 
    initialProducts: Product[]; 
}) {
  const [items, setItems] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 🟢 REAL BACKEND FETCHING ON LOAD MORE
  const handleLoadMore = async () => {
    if (isLoading || !categoryId) return;
    setIsLoading(true);

    try {
      const nextPage = page + 1;
      const res = await fetch(`${API_BASE}/products/explore-feed?category_id=${categoryId}&page=${nextPage}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        const newProds = (data.products || []).filter((p: Product) => String(p.id) !== String(currentProductId));
        
        if (newProds.length === 0) {
          setHasMore(false);
        } else {
          setItems(prev => [...prev, ...newProds]);
          setPage(nextPage);
          if (newProds.length < 8) setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Load More Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="pdp-related-vertical-section">
        <h2 className="section-title">Related Products</h2>
        
        {/* 2 per row on Mobile, 5 per row on Desktop */}
        <div className="related-vertical-grid">
            {items.map((p, index) => (
              <div key={`${p.id}-${index}`} className="grid-card-item">
                <ProductCard product={p} />
              </div>
            ))}

            {/* 🟢 SKELETON CARDS WHILE LOADING MORE DATA FROM BACKEND */}
            {isLoading && (
              [1, 2, 3, 4].map((n) => (
                <div key={`skel-${n}`} className="grid-card-item skeleton-card">
                  <div className="skel-img animate-pulse"></div>
                  <div className="skel-body">
                    <div className="skel-line animate-pulse" style={{ width: '80%' }}></div>
                    <div className="skel-line animate-pulse" style={{ width: '50%' }}></div>
                  </div>
                </div>
              ))
            )}
        </div>

        {/* 🟢 LOAD MORE BUTTON */}
        {hasMore && (
          <div className="load-more-wrap">
            <button 
              className="load-more-related-btn" 
              onClick={handleLoadMore} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Loading More Products...</span>
                </>
              ) : (
                <>
                  <span>Load More Related Products</span>
                  <i className="fas fa-chevron-down"></i>
                </>
              )}
            </button>
          </div>
        )}

        <style jsx>{`
          .pdp-related-vertical-section { margin-top: 35px; margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: 800; color: #1a1a1a; margin-bottom: 20px; border-left: 4px solid #ff7f00; padding-left: 10px; }
          
          .related-vertical-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          @media (min-width: 768px) {
            .related-vertical-grid {
              grid-template-columns: repeat(5, 1fr);
              gap: 16px;
            }
          }

          .grid-card-item { width: 100%; }

          /* Skeletons */
          .skeleton-card { background: white; border-radius: 12px; height: 260px; border: 1px solid #e2e8f0; overflow: hidden; }
          .skel-img { width: 100%; height: 160px; background: #e2e8f0; }
          .skel-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
          .skel-line { height: 12px; background: #e2e8f0; border-radius: 4px; }
          .animate-pulse { animation: pulse 1.5s infinite; }
          @keyframes pulse { 50% { opacity: 0.5; } }

          .load-more-wrap { display: flex; justify-content: center; margin-top: 25px; }

          .load-more-related-btn {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            color: #0f172a;
            padding: 12px 28px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            transition: all 0.25s ease;
          }

          .load-more-related-btn:hover:not(:disabled) {
            background: #0f172a;
            color: #ffffff;
            border-color: #0f172a;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(15,23,42,0.15);
          }

          .load-more-related-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
        `}</style>
    </div>
  );
}