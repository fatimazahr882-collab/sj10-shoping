"use client";

import useSWR from 'swr';
import ProductCard, { type Product } from './ProductCard';
import Link from 'next/link';

type CategoryRow = {
  category_id: number;
  category_name: string;
  category_slug: string;
  products: Product[];
};

// Simple fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoryRows() {
  // ✅ USE SWR: Fetches in parallel with the homepage data & caches the result
  const { data: categoryRows, error, isLoading } = useSWR<CategoryRow[]>(
    `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/category-rows`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  // Loading State (Maintains UI Layout)
  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-4 overflow-hidden">
               {[1, 2, 3, 4].map((x) => (
                 <div key={x} className="h-60 w-40 bg-gray-200 rounded-lg shrink-0"></div>
               ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If no data or error, hide section gracefully
  if (error || !categoryRows || categoryRows.length === 0) return null;

  return (
    <div id="home-category-rows-container">
      {categoryRows.map((category) => (
        <div key={category.category_id} className="category-product-row">
          <div className="category-row-header">
            <h2 className="section-title">{category.category_name}</h2>
            <Link href={`/category/${category.category_slug}`} className="see-all-btn">
              See All
            </Link>
          </div>
          <div className="product-grid">
            {category.products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}