"use client";

import React, { useMemo } from 'react';
import ProductCard, { type Product } from '@/components/ProductCard';

export default function PopularProducts({ products }: { products: Product[] }) {
  
  // 🔥 THE ULTIMATE SORTING FIX: Forces accurate sequence on the frontend
  const sortedProducts = useMemo(() => {
    if (!products) return [];
    
   return [...products].sort((a: any, b: any) => {
      // 1st Priority: Most Reviews
      const reviewsA = a.review_count || 0;
      const reviewsB = b.review_count || 0;
      if (reviewsB !== reviewsA) return reviewsB - reviewsA; 
      
      // 2nd Priority: Most Views
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;
      if (viewsB !== viewsA) return viewsB - viewsA; 
      
      // 3rd Priority: Newest
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [products]);

  if (!sortedProducts || sortedProducts.length === 0) return null;

  return (
    <section className="popular-section">
      
      {/* Attractive Header */}
      <div className="popular-header">
        <span className="hot-badge">HOT</span>
        <h2 className="popular-title">Popular Products</h2>
      </div>

      {/* Strict CSS Grid Container */}
      <div className="strict-grid">
        {sortedProducts.map((p) => (
          <div key={`pop-${p.id}`} className="grid-item">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* 🔥 THE ABSOLUTE LAYOUT FIX: Pure CSS Grid overrides everything else */}
      <style jsx>{`
        .popular-section {
          padding: 24px 12px;
          background: #ffffff;
          border-top: 8px solid #f3f4f6;
          width: 100%;
          overflow: hidden;
        }
        
        .popular-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-left: 4px;
        }
        
        .hot-badge {
          background-color: #f97316; /* Bright Orange */
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          animation: pulse-orange 2s infinite;
        }

        @keyframes pulse-orange {
          0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); }
          100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }

        .popular-title {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          margin: 0;
          border-left: 4px solid #10b981; /* Green line */
          padding-left: 8px;
        }
        
        /* --- MOBILE VIEW: EXACTLY 2 PER ROW --- */
        .strict-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important; 
          gap: 12px !important;
          width: 100% !important;
        }
        
        /* Prevents the card from stretching out of the grid */
        .grid-item {
          width: 100% !important;
          min-width: 0 !important;
        }

        /* --- TABLET VIEW: 3 or 4 PER ROW --- */
        @media (min-width: 640px) {
          .strict-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 16px !important;
          }
        }
        @media (min-width: 768px) {
          .strict-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        
        /* --- DESKTOP VIEW: EXACTLY 5 PER ROW --- */
        @media (min-width: 1024px) {
          .strict-grid {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}