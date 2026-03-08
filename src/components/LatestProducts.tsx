"use client";

import React from 'react';
import ProductCard, { type Product } from '@/components/ProductCard';

export default function LatestProducts({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="latest-section">
      <div className="latest-header">
        <span className="new-badge">NEW</span>
        <h2 className="latest-title">Latest Arrivals</h2>
      </div>

      {/* This container uses the strict CSS grid below */}
      <div className="strict-grid">
        {products.map((p) => (
          <div key={`latest-${p.id}`} className="grid-item">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* 🔥 THE ABSOLUTE FIX: Pure CSS Grid overrides everything else */}
      <style jsx>{`
        .latest-section {
          padding: 24px 12px;
          background: linear-gradient(to bottom, #ffffff, #f9fafb);
          border-top: 8px solid #f3f4f6;
          width: 100%;
          overflow: hidden;
        }
        .latest-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-left: 4px;
        }
        .new-badge {
          background-color: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          animation: pulse 2s infinite;
        }
        .latest-title {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          margin: 0;
          border-left: 4px solid #3b82f6;
          padding-left: 8px;
        }
        
        /* --- MOBILE VIEW: EXACTLY 2 PER ROW --- */
        .strict-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important; 
          gap: 12px !important;
          width: 100% !important;
        }
        
        /* This prevents the card from stretching out of the grid */
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