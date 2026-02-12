// src/lib/home-data.ts
import { Product } from '@/components/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://sj10-cart.vercel.app/api';
const CART_API_BASE = process.env.NEXT_PUBLIC_CART_API_URL || 'https://sj10-cart.vercel.app/api';

// 1. Define the Structure (Fixed the Type Error here)
export interface HomeData {
  banners: any[];
  subCatRow1: any[];
  subCatRow2: any[];
  subCatRow3: any[];
  promotedTop50: Product[];
  discountSections: any[]; // <--- Added this to fix the Build Error
  popularMixed: Product[];
}

// 2. Main Server Fetcher
export async function getStaticHomeData(): Promise<HomeData> {
  try {
    // Parallel Fetch: Get Homepage content AND Discounts at the same time
    const [homeRes, discountRes] = await Promise.all([
      fetch(`${API_BASE}/products/homepage-data`, { next: { revalidate: 345600 } }), // 4 Days
      fetch(`${CART_API_BASE}/discount-sections`, { next: { revalidate: 345600 } })  // 4 Days
    ]);

    const fullData = homeRes.ok ? await homeRes.json() : {};
    const discountData = discountRes.ok ? await discountRes.json() : [];

    return {
      banners: fullData.banners || [],
      // Slicing subcategories to ensure instant HTML painting
      subCatRow1: (fullData.subCatRow1 || []).slice(0, 18), 
      subCatRow2: (fullData.subCatRow2 || []).slice(0, 15),
      subCatRow3: (fullData.subCatRow3 || []).slice(0, 15),
      promotedTop50: fullData.promotedTop50 || [],
      discountSections: discountData || [], // <--- Now populated correctly
      popularMixed: [], // Intentionally empty (Client will fetch this on scroll)
    };
  } catch (error) {
    console.error('Static Home Data Fetch Error:', error);
    // Return safe empty object to prevent crashes
    return { 
      banners: [], subCatRow1: [], subCatRow2: [], subCatRow3: [], 
      promotedTop50: [], discountSections: [], popularMixed: [] 
    };
  }
}