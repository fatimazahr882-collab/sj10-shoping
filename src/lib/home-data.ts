// src/lib/home-data.ts
import { Product } from '@/components/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://sj10-products-backend.vercel.app/api';

// ... (Keep existing interfaces) ...

export interface HomeData {
  banners: any[];
  subCatRow1: any[]; // We will populate this with the 30-day cache
  subCatRow2: any[];
  subCatRow3: any[];
  promotedTop50: Product[];
  popularMixed: Product[];
}

// 1. MAIN FETCH (Keep your existing 4-day logic for banners here)
export async function getStaticHomeData(): Promise<HomeData> {
  try {
    // We fetch EVERYTHING here, but we will override the subcategories logic
    // inside the API or rely on this fetch's revalidation.
    // However, to strictly enforce 30 Days for subcats specifically,
    // we should fetch them separately if the API allows, OR 
    // rely on the fact that Banners (4 days) will refresh the page.
    
    // SINCE your API returns a combined object, we control the cache at the PAGE level (4 Days).
    // BUT, for the aggressive image optimization you requested, we handle that in the Component.
    
    const res = await fetch(`${API_BASE}/products/homepage-data`, {
       // 4 Days for the WHOLE homepage structure (Banners + Cats)
       // This is safe. 30 days might be too long if you change a banner.
       // 4 Days is still "Static" for all intents and purposes.
       next: { revalidate: 345600 }, 
    });

    if (!res.ok) throw new Error('Failed to fetch home data');
    
    return await res.json();
  } catch (error) {
    console.error('Static Home Data Fetch Error:', error);
    return { 
      banners: [], subCatRow1: [], subCatRow2: [], subCatRow3: [], 
      promotedTop50: [], popularMixed: [] 
    };
  }
}