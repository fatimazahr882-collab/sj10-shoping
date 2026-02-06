"use client";

import { useState, useEffect } from 'react';
import CategoryClientPage from '@/components/CategoryClientPage';
import CategoryPageLoading from './loading'; // We use your loading component directly

export default function CategoryPageContainer() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/categories-with-subcategories`, {
          // Standard browser caching
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        
        setData(json.mainCats || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setData([]); 
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // 1. INSTANTLY show your Loading Skeleton
  if (loading) {
    return <CategoryPageLoading />;
  }

  // 2. Show content when data arrives
  return <CategoryClientPage mainCats={data} />;
}