// src/lib/home-data.ts
import { Product } from '@/components/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL;
const CART_API_BASE = process.env.NEXT_PUBLIC_CART_API_URL || 'https://sj10-cart.vercel.app/api';

export interface HomeData {
  banners: any[];
  subCatRow1: any[];
  promotedTop50: Product[]; 
  popularProducts: Product[]; 
  discountSections: any[];
  categoryRows: any[];       // ✅ NEW: Fetched on Server for SEO
  initialExploreFeed: any[]; // ✅ NEW: Fetched on Server for SEO
}

export async function getStaticHomeData(): Promise<HomeData> {
  try {
    // We fetch ALL vital SEO sections here simultaneously.
    // NOTE: 'latest-realtime' is intentionally excluded here to prevent caching.
    const [homeRes, discountRes, categoryRowsRes, exploreRes] = await Promise.all([
      fetch(`${API_BASE}/products/homepage-data`, { next: { revalidate: 3600 } }),
      fetch(`${CART_API_BASE}/discount-sections`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/products/category-rows`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/products/explore-feed?page=1&limit=40&sort=smart_ranking`, { next: { revalidate: 3600 } })
    ]);

    const fullData = homeRes.ok ? await homeRes.json() : {};
    const discountData = discountRes.ok ? await discountRes.json() : [];
    const categoryRowsData = categoryRowsRes.ok ? await categoryRowsRes.json() : [];
    const exploreData = exploreRes.ok ? await exploreRes.json() : { products: [] };

    return {
      banners: fullData.banners || [],
      subCatRow1: (fullData.subCatRow1 || []).slice(0, 18), 
      promotedTop50: fullData.promotedTop50 || [],
      popularProducts: fullData.popularMixed || [], 
      discountSections: discountData || [],
      categoryRows: categoryRowsData || [],
      initialExploreFeed: exploreData.products || []
    };
  } catch (error) {
    console.error('Static Home Data Fetch Error:', error);
    return { 
        banners: [], subCatRow1:[], promotedTop50: [], popularProducts: [], 
        discountSections:[], categoryRows: [], initialExploreFeed: [] 
    };
  }
}