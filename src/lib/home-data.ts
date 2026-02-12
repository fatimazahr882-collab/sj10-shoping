// src/lib/home-data.ts
import { Product } from '@/components/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://sj10-cart.vercel.app/api';
const CART_API_BASE = process.env.NEXT_PUBLIC_CART_API_URL || 'https://sj10-cart.vercel.app/api';

// This interface now ONLY contains data for the initial, "above the fold" view.
export interface HomeData {
  banners: any[];
  subCatRow1: any[]; // ONLY row 1
  promotedTop50: Product[];
  discountSections: any[];
}

// This function now ONLY fetches the essential data needed for the initial page load.
export async function getStaticHomeData(): Promise<HomeData> {
  try {
    const [homeRes, discountRes] = await Promise.all([
      fetch(`${API_BASE}/products/homepage-data`, { next: { revalidate: 3600 } }),
      fetch(`${CART_API_BASE}/discount-sections`, { next: { revalidate: 3600 } })
    ]);

    const fullData = homeRes.ok ? await homeRes.json() : {};
    const discountData = discountRes.ok ? await discountRes.json() : [];

    // CRITICAL: We are NOT fetching subCatRow2 or subCatRow3 here anymore.
    return {
      banners: fullData.banners || [],
      subCatRow1: (fullData.subCatRow1 || []).slice(0, 18), 
      promotedTop50: fullData.promotedTop50 || [],
      discountSections: discountData || [],
    };
  } catch (error) {
    console.error('Static Home Data Fetch Error:', error);
    return { 
      banners: [], subCatRow1: [], promotedTop50: [], discountSections: [] 
    };
  }
}