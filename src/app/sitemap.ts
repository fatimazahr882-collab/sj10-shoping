// src/app/sitemap.ts

import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.sj10.pk';
const API_URL = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://products.sj10.pk/api';

async function fetchSitemapData(endpoint: string) {
  try {
    // MAX LIMIT ALLOWED BY GOOGLE IS 50,000
    // We set it to 50,000 to cover your 10k products + future growth
    const res = await fetch(`${API_URL}/${endpoint}?limit=50000`, {
        // 60 seconds timeout to allow downloading this large list
        signal: AbortSignal.timeout(60000) 
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.products || data.mainCats || []);
  } catch (error) {
    console.error(`Sitemap Error (${endpoint}):`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes
  const routes = [
    '',
    '/explore',
    '/category',
    '/shipping-policy',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  // 2. Categories
  const categories = await fetchSitemapData('products/categories-with-subcategories');
  const categoryUrls = categories.flatMap((cat: any) => {
    const main = {
      url: `${BASE_URL}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
    const subs = (cat.subcategories || []).map((sub: any) => ({
      url: `${BASE_URL}/category/${sub.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    return [main, ...subs];
  });

  // 3. Products
  const products = await fetchSitemapData('products/explore-feed'); 
  const productUrls = products.map((product: any) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date(product.updated_at || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.9, 
  }));

  return [...routes, ...categoryUrls, ...productUrls];
}