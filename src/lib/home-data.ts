// src/lib/home-data.ts
import { Product } from '@/components/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL;
const CART_API_BASE = process.env.NEXT_PUBLIC_CART_API_URL || 'https://sj10-cart.vercel.app/api';

export interface HomeData {
  banners: any[];
  subCatRow1: any[];
  promotedTop50: Product[]; // Already handled correctly
  popularProducts: Product[]; // <--- ADD THIS
  discountSections: any[];
}

export async function getStaticHomeData(): Promise<HomeData> {
  try {
    // We request the homepage-data endpoint which already calculates 
    // Promoted (Active Only) and Popular products on the backend.
    const [homeRes, discountRes] = await Promise.all([
      fetch(`${API_BASE}/products/homepage-data`, { 
        next: { revalidate: 21600 } // 6 Hour Cache at Fetch level
      }),
      fetch(`${CART_API_BASE}/discount-sections`, { 
        next: { revalidate: 21600 } 
      })
    ]);

    const fullData = homeRes.ok ? await homeRes.json() : {};
    const discountData = discountRes.ok ? await discountRes.json() : [];

    return {
      banners: fullData.banners || [],
      subCatRow1: (fullData.subCatRow1 || []).slice(0, 18), 
      // Backend logic ensures these are only ACTIVE promotions
      promotedTop50: fullData.promotedTop50 || [],
      // Grab popularMixed from backend and assign it here
      popularProducts: fullData.popularMixed || [], 
      discountSections: discountData || [],
    };
  } catch (error) {
    console.error('Static Home Data Fetch Error:', error);
    return { 
      banners: [], 
      subCatRow1: [], 
      promotedTop50: [], 
      popularProducts: [], 
      discountSections: [] 
    };
  }
}