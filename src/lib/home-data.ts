// src/lib/home-data.ts
import { Product } from '@/components/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://sj10-cart.vercel.app/api';

export interface HomeData {
  banners: any[];
  subCatRow1: any[];
  subCatRow2: any[];
  subCatRow3: any[];
  promotedTop50: Product[];
  popularMixed: Product[]; // We will keep this empty initially
}

// 1. MAIN FETCH: Caches "Above the Fold" Data for 4 Days
export async function getStaticHomeData(): Promise<HomeData> {
  try {
    const res = await fetch(`${API_BASE}/products/homepage-data`, {
      next: { revalidate: 345600 }, // 4 Days
    });

    if (!res.ok) throw new Error('Failed to fetch home data');
    
    const fullData = await res.json();

    // PERFORMANCE HACK: 
    // We purposefully STRIP OUT heavy data for the initial HTML payload.
    // This makes the initial page load ultra-fast.
    // The client will fetch these later on scroll.
    return {
      banners: fullData.banners || [],
      // Only send the first 18 subcats to keep HTML small. 
      // The rest can be accessed via "View All" or a separate page.
      subCatRow1: (fullData.subCatRow1 || []).slice(0, 18), 
      subCatRow2: (fullData.subCatRow2 || []).slice(0, 15),
      subCatRow3: (fullData.subCatRow3 || []).slice(0, 15),
      promotedTop50: fullData.promotedTop50 || [],
      // EMPTY INITIAL ARRAY - Will fetch on client scroll
      popularMixed: [], 
    };
  } catch (error) {
    console.error('Static Home Data Fetch Error:', error);
    return { 
      banners: [], subCatRow1: [], subCatRow2: [], subCatRow3: [], 
      promotedTop50: [], popularMixed: [] 
    };
  }
}