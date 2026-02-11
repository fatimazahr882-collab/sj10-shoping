// src/lib/home-data.ts
import { Product } from '@/components/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://sj10-cart.vercel.app/api';

// Types
export interface HomeData {
  banners: any[];
  subCatRow1: any[];
  subCatRow2: any[];
  subCatRow3: any[];
  promotedTop50: Product[];
  popularMixed: Product[];
  categoryRows: any[];
  discountSections: any[];
}

// 🔹 1. Banners & Subcategories (10 Days Cache)
export async function getStaticHomeData() {
  try {
    const res = await fetch(`${API_BASE}/products/homepage-data`, {
      next: { revalidate: 864000 }, // 10 Days
    });
    if (!res.ok) throw new Error('Failed to fetch home data');
    return res.json();
  } catch (error) {
    console.error('Static Home Data Fetch Error:', error);
    return { banners: [], subCatRow1: [], subCatRow2: [], subCatRow3: [], promotedTop50: [], popularMixed: [] };
  }
}

// 🔹 2. Category Rows (10 Days Cache) - Was client-side, now server-side
export async function getCategoryRows() {
  try {
    const res = await fetch(`${API_BASE}/products/category-rows`, {
      next: { revalidate: 864000 }, // 10 Days
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}

// 🔹 3. Discount Sections (1 Day Cache) - Products change more often
export async function getDiscountSections() {
  try {
    const res = await fetch(`${API_BASE}/discount-sections`, {
      next: { revalidate: 86400 }, // 1 Day
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}