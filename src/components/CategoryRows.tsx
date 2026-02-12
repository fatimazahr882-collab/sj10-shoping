// src/components/CategoryRows.tsx
"use client";

// NO LONGER NEEDS useEffect!
import useSWR from 'swr';
import ProductCard, { type Product } from './ProductCard';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// REMOVED the 'onLoaded' prop
export default function CategoryRows() {
  const { data: categoryRows, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/category-rows`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  if (isLoading || error || !categoryRows || categoryRows.length === 0) {
    return null;
  }

  return (
    <div id="home-category-rows-container">
      {categoryRows.map((category: any) => (
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