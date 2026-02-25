import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.sj10.pk';
const API_URL = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://products.sj10.pk/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Pages (Fixed dates to avoid "fake freshness")
  const staticPages = [
    '',
    '/explore',
    '/category',
    '/shipping-policy',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date('2026-02-01'),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Fetch Categories
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/products/categories-with-subcategories`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const mainCats = data.mainCats || [];

    categoryPages = mainCats.flatMap((cat: any) => {
      const urls = [];
      if (cat.slug) {
        urls.push({
          url: `${BASE_URL}/category/${cat.slug}`,
          lastModified: new Date('2026-02-01'),
          priority: 0.7,
        });
      }
      if (cat.subcategories) {
        cat.subcategories.forEach((sub: any) => {
          urls.push({
            url: `${BASE_URL}/category/${sub.slug}`,
            lastModified: new Date('2026-02-01'),
            priority: 0.7,
          });
        });
      }
      return urls;
    });
  } catch (e) {
    console.error("Sitemap Category Fetch Error");
  }

  // 3. Fetch Suppliers
  let supplierPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/suppliers/sitemap-urls`, { next: { revalidate: 3600 } });
    const ids = await res.json();
    supplierPages = ids.map((id: string) => ({
      url: `${BASE_URL}/suppliers/${id}`,
      lastModified: new Date('2026-02-01'),
      priority: 0.6,
    }));
  } catch (e) {
    console.error("Sitemap Supplier Fetch Error");
  }

  // 4. Fetch ALL 10,000+ Products (The Enterprise Fix)
  let productPages: MetadataRoute.Sitemap = [];
  try {
    // Calling your new backend endpoint that returns slug + sku
    const res = await fetch(`${API_URL}/products/sitemap-urls`, { 
        signal: AbortSignal.timeout(60000), // 60s timeout for large data
        next: { revalidate: 3600 } 
    });
    const products = await res.json();

    productPages = products
      .filter((p: any) => p.slug) // Security check
      .map((p: any) => {
        // 🔥 THE CANONICAL FIX: Combine Slug and SKU exactly like the live page does
        const fullSlug = p.sku ? `${p.slug}-${p.sku}` : p.slug;
        
        return {
          url: `${BASE_URL}/products/${fullSlug}`,
          // Using your backend lastmod (COALESCE of updated_at/created_at)
          lastModified: new Date(p.lastmod || p.created_at || new Date()),
          changeFrequency: 'daily' as const,
          priority: 0.9,
        };
      });
  } catch (e) {
    console.error("Sitemap Product Fetch Error", e);
  }

  // Combine everything into one single array
  return [...staticPages, ...categoryPages, ...supplierPages, ...productPages];
}