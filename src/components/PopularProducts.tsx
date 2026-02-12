// src/components/PopularProducts.tsx
"use client";

// NO LONGER NEEDS useEffect!
import useSWR from 'swr';
import ProductCard, { type Product } from '@/components/ProductCard';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// REMOVED the 'onLoaded' prop from the interface
export default function PopularProducts() {
  const { data, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/homepage-data`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 3000000 }
  );

  const products: Product[] = data?.popularMixed || [];

  // This component now ONLY cares about rendering its own data.
  // It no longer tells the parent when it's done.

  if (isLoading || products.length === 0) {
    return null; // Return nothing while loading or if empty. The parent handles the loader UI.
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