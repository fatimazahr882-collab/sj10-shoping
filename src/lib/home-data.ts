// src/lib/home-data.ts
import { Product } from '@/components/ProductCard';

// ⚡ SERVER-SIDE FIX: Servers do not have CORS. 
// We hardcode the absolute live URLs here so SSR never fails on relative '/api-proxy' paths.
const SERVER_API_BASE = "https://products.sj10.pk/api";
const SERVER_CART_API_BASE = "https://sj10-cart.vercel.app/api";

export interface HomeData {
  banners: any[];
  subCatRow1: any[];
  promotedTop50: Product[]; 
  popularProducts: Product[]; 
  discountSections: any[];
  categoryRows: any[];       
  initialExploreFeed: any[]; 
  totalExploreCount: number;
}

// Timeout wrapper to prevent Vercel/Server crashes if the database is slow
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    console.warn(`[Timeout or Network Error] SSR Fetch failed for: ${url}`);
    return { ok: false, json: async () => ({}) } as Response; 
  }
};

export async function getStaticHomeData(): Promise<HomeData> {
  try {
    // 🚀 SSR + ISR (Cache for 1 hour).
    const [homeRes, discountRes, categoryRowsRes, exploreRes] = await Promise.all([
      fetchWithTimeout(`${SERVER_API_BASE}/products/homepage-data`, { next: { revalidate: 3600 } }),
      fetchWithTimeout(`${SERVER_CART_API_BASE}/discount-sections`, { next: { revalidate: 3600 } }),
      fetchWithTimeout(`${SERVER_API_BASE}/products/category-rows`, { next: { revalidate: 3600 } }),
      fetchWithTimeout(`${SERVER_API_BASE}/products/explore-feed?page=1&limit=40&sort=smart_ranking`, { next: { revalidate: 3600 } })
    ]);

    const fullData = homeRes.ok ? await homeRes.json() : {};
    const discountData = discountRes.ok ? await discountRes.json() : [];
    const categoryRowsData = categoryRowsRes.ok ? await categoryRowsRes.json() : [];
    const exploreData = exploreRes.ok ? await exploreRes.json() : { products: [], totalCount: 0 };

    return {
      banners: fullData.banners || [],
      subCatRow1: (fullData.subCatRow1 || []).slice(0, 18), 
      promotedTop50: fullData.promotedTop50 || [],
      // Check both keys to ensure popular products load
      popularProducts: fullData.popularProducts || fullData.popularMixed || [], 
      discountSections: discountData || [],
      categoryRows: categoryRowsData || [],
      initialExploreFeed: exploreData.products || [],
      totalExploreCount: exploreData.totalCount || 0
    };
  } catch (error) {
    console.error('Static Home Data Fetch Error:', error);
    return { 
        banners: [], subCatRow1:[], promotedTop50: [], popularProducts: [], 
        discountSections:[], categoryRows: [], initialExploreFeed: [], totalExploreCount: 0 
    };
  }
}