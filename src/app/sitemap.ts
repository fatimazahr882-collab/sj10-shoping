import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.sj10.pk';
// 🔴 FORCE THE LIVE URL
const API_URL = 'https://products.sj10.pk/api';

const PRODUCTS_PER_SITEMAP = 1000;

// ==================================================
// 1️⃣ Generate IDs
// ==================================================
export async function generateSitemaps() {
  try {
    const res = await fetch(`${API_URL}/products/sitemap-count`, { 
      next: { revalidate: 3600 } 
    });

    let totalProducts = 10000;

    if (res.ok) {
      const data = await res.json();
      totalProducts = data.total || totalProducts;
    }

    const numberOfSitemaps = Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP);
    return Array.from({ length: numberOfSitemaps }, (_, i) => ({ id: i }));
  } catch (error) {
    console.error('Sitemap count error:', error);
    return [{ id: 0 }];
  }
}

// ==================================================
// 2️⃣ Generate Sitemap URLs
// ==================================================
export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];
  
  const sitemapId = Number(id);
  const page = sitemapId + 1;
  const limit = PRODUCTS_PER_SITEMAP;

  console.log(`⚡ Generating Sitemap ID: ${sitemapId} (Page ${page})`);

  // --- SECTION A: STATIC PAGES & CATEGORIES (Only for ID 0) ---
  if (sitemapId === 0) {
    const staticRoutes = ['', '/explore', '/category', '/shipping-policy', '/terms', '/privacy'];
    
    staticRoutes.forEach((route) => {
      urls.push({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1.0 : 0.8,
      });
    });

    try {
      const res = await fetch(`${API_URL}/products/categories-with-subcategories`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        const mainCats = data.mainCats || [];
        mainCats.forEach((cat: any) => {
          // 🔥 FIX: Encode category slugs too
          if (cat.slug) urls.push({ url: `${BASE_URL}/category/${encodeURIComponent(cat.slug)}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
          cat.subcategories?.forEach((sub: any) => {
            if (sub.slug) urls.push({ url: `${BASE_URL}/category/${encodeURIComponent(sub.slug)}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
          });
        });
      }
    } catch (e) { console.error('Category error', e); }
  }

  // --- SECTION B: PRODUCTS ---
  try {
    const endpoint = `${API_URL}/products/sitemap-urls?limit=${limit}&page=${page}`;
    console.log(`⚡ Fetching: ${endpoint}`);

    const res = await fetch(endpoint, { 
      next: { revalidate: 3600 } // Cache enabled now
    });

    if (res.ok) {
      const data = await res.json();
      const products = data.products || [];

      console.log(`✅ Received ${products.length} products`);

      products.forEach((p: any) => {
        if (p.slug) {
          const fullSlug = p.sku ? `${p.slug}-${p.sku}` : p.slug;
          
          // 🔥 FIX: Encode the slug to handle special characters (&, %, spaces)
          // This prevents the "xmlParseEntityRef" error
          const cleanSlug = encodeURIComponent(fullSlug);

          let modDate = new Date();
          if (p.lastmod) {
             const d = new Date(p.lastmod);
             if (!isNaN(d.getTime())) modDate = d;
          }

          urls.push({
            url: `${BASE_URL}/products/${cleanSlug}`,
            lastModified: modDate,
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }
      });
    }
  } catch (e: any) {
    console.error('Fetch crashed:', e);
  }

  return urls;
}