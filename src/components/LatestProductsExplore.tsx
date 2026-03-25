// src/components/LatestProductsExplore.tsx
"use client";

import React, { useMemo } from 'react';
import useSWR from 'swr';
import ProductCard, { type Product } from '@/components/ProductCard';

const PRODUCT_API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://products.sj10.pk/api";
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Props {
  searchQuery: string;
  filterVideo: boolean;
  filterVerified: boolean;
}

const ProductSkeleton = () => (
    <div className="w-full h-full bg-white rounded-lg p-2 animate-pulse">
        <div className="aspect-[3/4] bg-gray-200 rounded-md"></div>
    </div>
);

export default function LatestProductsExplore({ searchQuery, filterVideo, filterVerified }: Props) {
  // 1. Fetches real-time data from your Product Backend.
  const { data, isLoading, error } = useSWR(
    `${PRODUCT_API_BASE}/products/latest-realtime`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  // 2. Applies filters from the parent page on the client-side.
  const filteredProducts = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.filter((p: Product) => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterVideo && !p.has_video) return false;
      const isVerified = ['verified', '1', 'true'].includes(String(p.supplier_verified || "").toLowerCase());
      if (filterVerified && !isVerified) return false;
      return true;
    });
  }, [data, searchQuery, filterVideo, filterVerified]);

  if (isLoading) {
    return (
      <>
        {[...Array(10)].map((_, i) => <ProductSkeleton key={i} />)}
      </>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 col-span-full">Failed to load latest products.</div>;
  }

  if (filteredProducts.length === 0) {
    return <div className="text-center py-20 text-gray-500 col-span-full">No products match your current filters.</div>;
  }

  // 3. 🔥 IMPORTANT: Renders only the product cards inside a React Fragment.
  // The parent component will provide the grid container.
  return (
    <>
      {filteredProducts.map((product: Product, index: number) => (
        <div key={`${product.id}-${index}`} className="product-card-wrapper">
          <ProductCard product={product} />
        </div>
      ))}
    </>
  );
}