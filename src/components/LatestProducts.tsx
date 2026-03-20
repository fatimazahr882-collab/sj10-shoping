// src/components/LatestProducts.tsx
"use client";

import React from 'react';
import useSWR from 'swr';
import ProductCard, { type Product } from '@/components/ProductCard';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json());

export default function LatestProducts() {
  const { data: products, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/latest-realtime`,
    fetcher,
    {
      revalidateOnFocus: true, 
      dedupingInterval: 2000 // Fixed: Replaced 0 with 2000 to prevent infinite re-render loops
    }
  );

  // Instead of hiding the section, we just show a subtle error message or empty state if it fails
  const showSkeletons = isLoading || (!products && !error);

  return (
    <section className="latest-section">
      <div className="latest-header">
        <span className="new-badge">LIVE</span>
        <h2 className="latest-title">New Arrivals</h2>
      </div>

      <div className="strict-grid">
        {showSkeletons ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={`skel-${i}`} className="grid-item">
              <div className="skeleton-box" />
            </div>
          ))
        ) : error ? (
          <div className="error-msg">Unable to load live products.</div>
        ) : (
          products?.map((p: Product) => (
            <div key={`latest-live-${p.id}`} className="grid-item">
              <ProductCard product={p} />
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .latest-section { padding: 30px 15px; background: #fff; border-top: 8px solid #f8fafc; width: 100%; overflow: hidden; }
        .latest-header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        
        .new-badge {
          background-color: #ef4444; color: white; font-size: 11px;
          font-weight: 800; padding: 4px 10px; border-radius: 20px;
          animation: pulse-red 2s infinite; letter-spacing: 0.5px;
        }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .latest-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; border-left: 4px solid #3b82f6; padding-left: 10px; line-height: 1; }
        
        .strict-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; width: 100% !important; }
        .grid-item { width: 100% !important; min-width: 0 !important; }
        
        .skeleton-box { width: 100%; aspect-ratio: 1/1.2; background: #f1f5f9; border-radius: 12px; animation: pulse-skel 1.5s infinite; border: 1px solid #e2e8f0; }
        @keyframes pulse-skel { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        .error-msg { grid-column: 1 / -1; padding: 20px; text-align: center; color: #ef4444; font-weight: 600; background: #fef2f2; border-radius: 12px; }

        @media (min-width: 640px) { .strict-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 16px !important; } }
        @media (min-width: 768px) { .strict-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (min-width: 1024px) { .strict-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 20px !important; } }
      `}</style>
    </section>
  );
}