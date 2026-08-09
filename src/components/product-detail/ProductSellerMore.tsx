"use client";

import React from 'react';
import ProductCard, { type Product } from '../ProductCard';

export default function ProductSellerMore({ sellerProducts }: { sellerProducts: Product[] }) {
  if (!sellerProducts || sellerProducts.length === 0) return null;

  return (
    <div className="pdp-related-section">
        <h2 className="section-title">More from this seller</h2>
        <div className="product-slider-container">
            {sellerProducts.map((p) => (
              <div key={p.id} className="slider-card">
                <ProductCard product={p} />
              </div>
            ))}
        </div>

        <style jsx>{`
          .pdp-related-section { margin-top: 30px; margin-bottom: 20px; padding: 0; overflow: visible; }
          .section-title { font-size: 18px; font-weight: 800; color: #1a1a1a; margin-bottom: 15px; border-left: 4px solid #ff7f00; padding-left: 10px; }
          .product-slider-container { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 15px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .slider-card { flex: 0 0 150px; scroll-snap-align: start; }
          @media (min-width: 768px) { .slider-card { flex: 0 0 220px; } }
        `}</style>
    </div>
  );
}