import { Product } from '@/components/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL;
const CART_API_BASE = process.env.NEXT_PUBLIC_CART_API_URL || 'https://sj10-cart.vercel.app/api';

export interface HomeData {
  banners: any[];
  subCatRow1: any[];
  promotedTop50: Product[]; 
  popularProducts: Product[]; 
  latestProducts: Product[]; // ✅ ADDED THIS
  discountSections: any[];
}

export async function getStaticHomeData(): Promise<HomeData> {
  try {
    const [homeRes, discountRes] = await Promise.all([
      fetch(`${API_BASE}/products/homepage-data`, { 
        next: { revalidate: 3600 } 
      }),
      fetch(`${CART_API_BASE}/discount-sections`, { 
        next: { revalidate: 3600 } 
      })
    ]);

    const fullData = homeRes.ok ? await homeRes.json() : {};
    const discountData = discountRes.ok ? await discountRes.json() : [];

    return {
      banners: fullData.banners ||[],
      subCatRow1: (fullData.subCatRow1 ||[]).slice(0, 18), 
      promotedTop50: fullData.promotedTop50 ||[],
      popularProducts: fullData.popularMixed || [], 
      latestProducts: fullData.latestProducts ||[], // ✅ CAPTURING NEWEST 50 HERE
      discountSections: discountData ||[],
    };
  } catch (error) {
    console.error('Static Home Data Fetch Error:', error);
    return { banners: [], subCatRow1:[], promotedTop50: [], popularProducts: [], latestProducts: [], discountSections:[] };
  }
}