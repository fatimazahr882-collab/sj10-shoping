import { NextRequest } from 'next/server';

const BASE_URL = "https://www.sj10.pk";
const API_URL = "https://products.sj10.pk/api"; // Or your env var
const PRODUCTS_PER_SITEMAP = 1000;

export async function GET(request: NextRequest) {
  // 1. Get total product count
  const res = await fetch(`${API_URL}/products/sitemap-count`, { 
      cache: 'no-store' 
  });
  const data = await res.json();
  const totalProducts = data.total || 0;

  // 2. Calculate how many sitemap files we need
  const numberOfProductSitemaps = Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 3. Add Static Sitemap
  xml += `
  <sitemap>
    <loc>${BASE_URL}/sitemap-static.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;

  // 4. Add Product Sitemaps (0, 1, 2...)
  for (let i = 0; i < numberOfProductSitemaps; i++) {
    xml += `
  <sitemap>
    <loc>${BASE_URL}/product-sitemaps/${i}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
  }

  xml += `</sitemapindex>`;

  return new Response(xml, {
    headers: { 
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600"
    },
  });
}