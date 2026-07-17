// src/lib/home-data.ts
import { Product } from '@/components/ProductCard';

// ⚡ Vercel par fail hone se bachanay ke liye Fallback URLs lazmi hain
const SERVER_API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://products.sj10.pk/api";
const SERVER_CART_API_BASE = process.env.NEXT_PUBLIC_CART_API_URL || "https://sj10-cart.vercel.app/api";

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

// 🛑 THE MAIN FIX: Timeout ko 8000ms (8 sec) se barha kar 20000ms (20 sec) kar diya hai.
// Is se heavy data aane mein aasaani hogi aur connection katega nahi.
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 20000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    console.error(`🔴 [SSR Fetch Failed] URL: ${url} | ERROR:`, err);
    return { ok: false, json: async () => ({}) } as Response; 
  }
};

export async function getStaticHomeData(): Promise<HomeData> {
  try {
    // ⚡ Cache ko completely bypass karein taake hamesha fresh data aaye
    const fetchOptions = { cache: 'no-store' as RequestCache };

    const [homeRes, discountRes, categoryRowsRes, exploreRes] = await Promise.all([
      fetchWithTimeout(`${SERVER_API_BASE}/products/homepage-data`, fetchOptions),
      fetchWithTimeout(`${SERVER_CART_API_BASE}/discount-sections`, fetchOptions),
      fetchWithTimeout(`${SERVER_API_BASE}/products/category-rows`, fetchOptions),
      fetchWithTimeout(`${SERVER_API_BASE}/products/explore-feed?page=1&limit=40&sort=smart_ranking`, fetchOptions)
    ]);

    const fullData = homeRes.ok ? await homeRes.json() : {};
    const discountData = discountRes.ok ? await discountRes.json() : [];
    const categoryRowsData = categoryRowsRes.ok ? await categoryRowsRes.json() : [];
    const exploreData = exploreRes.ok ? await exploreRes.json() : { products: [], totalCount: 0 };

    return {
      banners: fullData.banners || [],
      subCatRow1: (fullData.subCatRow1 || []).slice(0, 18), 
      promotedTop50: fullData.promotedTop50 || [],
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