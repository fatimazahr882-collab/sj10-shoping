"use client";

import useSWR from 'swr';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/components/ProductCard';

// Re-fetch homepage data client-side to get the popular products
// Since this runs AFTER the initial load, it doesn't block the main thread.
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PopularProducts() {
  const { data, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/homepage-data`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const products: Product[] = data?.popularMixed || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

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