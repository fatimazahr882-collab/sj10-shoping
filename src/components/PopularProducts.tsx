"use client";

import React from 'react';
import ProductCard, { type Product } from '@/components/ProductCard';

export default function PopularProducts({ products }: { products: Product[] }) {
  
  const sortedProducts = [...(products || [])].sort((a: any, b: any) => {
    const reviewsA = a.review_count || 0;
    const reviewsB = b.review_count || 0;
    if (reviewsB !== reviewsA) return reviewsB - reviewsA; 
    
    const viewsA = a.views || 0;
    const viewsB = b.views || 0;
    if (viewsB !== viewsA) return viewsB - viewsA; 
    
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });

  if (!sortedProducts || sortedProducts.length === 0) return null;

  return (
    <section className="popular-section">
      <div className="popular-header">
        <span className="hot-badge">HOT</span>
        <h2 className="popular-title">Popular Products</h2>
      </div>

      <div className="strict-grid">
        {sortedProducts.map((p) => (
          <div key={`pop-${p.id}`} className="grid-item">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .popular-section { padding: 24px 12px; background: #ffffff; border-top: 8px solid #f3f4f6; width: 100%; overflow: hidden; }
        .popular-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-left: 4px; }
        .hot-badge { background-color: #f97316; color: white; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 20px; animation: pulse-orange 2s infinite; }
        @keyframes pulse-orange { 0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); } 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); } }
        .popular-title { font-size: 20px; font-weight: 800; color: #111827; margin: 0; border-left: 4px solid #10b981; padding-left: 8px; }
        .strict-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; width: 100% !important; }
        .grid-item { width: 100% !important; min-width: 0 !important; }
        @media (min-width: 640px) { .strict-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 16px !important; } }
        @media (min-width: 768px) { .strict-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (min-width: 1024px) { .strict-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 20px !important; } }
      `}</style>
    </section>
  );
}