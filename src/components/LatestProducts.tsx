"use client";

import React from 'react';
import useSWR from 'swr';
import ProductCard, { type Product } from '@/components/ProductCard';
import SjLoader from './SjLoader';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json());

export default function LatestProducts() {
  // 1. Fetch real-time data from the new non-cached route
  const { data: products, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/latest-realtime`,
    fetcher,
    {
      revalidateOnFocus: true, // Refresh when user switches back to the tab
      dedupingInterval: 0      // Ensure we don't serve a cached SWR response
    }
  );

  if (error) return null; // Hide section if API fails

  return (
    <section className="latest-section">
      <div className="latest-header">
        <span className="new-badge">LIVE</span>
        <h2 className="latest-title">New Arrivals</h2>
      </div>

      <div className="strict-grid">
        {isLoading ? (
          // Show 8 skeletons while loading the 40 items
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid-item animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-xl" />
            </div>
          ))
        ) : (
          products?.map((p: Product) => (
            <div key={`latest-live-${p.id}`} className="grid-item">
              <ProductCard product={p} />
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .latest-section { padding: 24px 12px; background: #fff; border-top: 8px solid #f3f4f6; width: 100%; }
        .latest-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .new-badge {
          background-color: #ef4444; color: white; font-size: 10px;
          font-weight: 800; padding: 4px 10px; border-radius: 20px;
          animation: pulse 2s infinite;
        }
        .latest-title { font-size: 20px; font-weight: 800; color: #111827; margin: 0; border-left: 4px solid #3b82f6; padding-left: 8px; }
        .strict-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; width: 100% !important; }
        .grid-item { width: 100% !important; min-width: 0 !important; }
        @media (min-width: 768px) { .strict-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (min-width: 1024px) { .strict-grid { grid-template-columns: repeat(5, 1fr) !important; } }
      `}</style>
    </section>
  );
}