// src/app/sitemap.ts
import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.sj10.pk';
const API_URL = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://products.sj10.pk/api';

// ⚡ NEW HELPER: This function sanitizes URLs to be XML-safe ⚡
function sanitizeUrl(slug: string): string {
  // Replace characters that are invalid in XML URLs
  return slug.replace(/&/g, '&amp;');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes
  const routes = [
    '', '/explore', '/category', '/shipping-policy', '/terms', '/privacy',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  // 2. Fetch Categories
  let categoryUrls: any[] = [];
  try {
    const catRes = await fetch(`${API_URL}/products/categories-with-subcategories`);
    if (catRes.ok) {
      const data = await catRes.json();
      categoryUrls = (data.mainCats || [])
        .flatMap((cat: any) => {
          const main = { url: `${BASE_URL}/category/${sanitizeUrl(cat.slug)}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 };
          const subs = (cat.subcategories || []).map((sub: any) => ({
            url: `${BASE_URL}/category/${sanitizeUrl(sub.slug)}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8
          }));
          return [main, ...subs];
        })
        // ⚡ SAFETY CHECK: Filter out any categories that have an invalid slug
        .filter((item: any) => item.url.endsWith(item.url.split('/').pop() || 'INVALID'));
    }
  } catch (e) {}

  // 3. Fetch Products
  let productUrls: any[] = [];
  try {
    const prodRes = await fetch(`${API_URL}/products/sitemap-urls`, { signal: AbortSignal.timeout(60000) });
    if (prodRes.ok) {
      const products = await prodRes.json();
      productUrls = products
        // ⚡ SAFETY CHECK: Filter out any products that have a null or empty slug
        .filter((product: any) => product && product.slug)
        .map((product: any) => ({
          url: `${BASE_URL}/products/${sanitizeUrl(product.slug)}`,
          lastModified: new Date(product.created_at || new Date()),
          changeFrequency: 'daily' as const,
          priority: 0.9, 
        }));
    }
  } catch (e) {}

  // 4. Fetch Suppliers
  let supplierUrls: any[] = [];
  try {
    const supRes = await fetch(`${API_URL}/suppliers/sitemap-urls`, { signal: AbortSignal.timeout(30000) });
    if (supRes.ok) {
      const supplierIds = await supRes.json();
      supplierUrls = supplierIds
        // ⚡ SAFETY CHECK: Filter out any null IDs
        .filter((id: any) => id)
        .map((id: string) => ({
          url: `${BASE_URL}/suppliers/${id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
    }
  } catch (e) {}

  return [...routes, ...categoryUrls, ...supplierUrls, ...productUrls];
}