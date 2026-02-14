// src/components/PopularProducts.tsx
"use client";

import React from 'react';
import ProductCard, { type Product } from '@/components/ProductCard';

// Now accepts products as props directly from the cached page data
export default function PopularProducts({ products }: { products: Product[] }) {

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-4 px-4 bg-white border-t-8 border-gray-100">
      <h2 className="section-title text-lg font-bold mb-4 text-gray-800">Popular Products</h2>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={`pop-${p.id}`} product={p} />
        ))}
      </div>
      <style jsx>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 15px;
        }
        @media (max-width: 768px) {
           .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
      `}</style>
    </section>
  );
}