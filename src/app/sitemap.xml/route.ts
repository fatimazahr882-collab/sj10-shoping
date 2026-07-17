import { NextRequest } from 'next/server';

const BASE_URL = "https://www.sj10.pk";
const API_URL = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://api.sj10.pk/api";
const PRODUCTS_PER_SITEMAP = 1000;

export async function GET(request: NextRequest) {
  // ⚡ FIX 1: Cache the total count for 3 days (259200 seconds)
  const res = await fetch(`${API_URL}/products/sitemap-count`, { 
      next: { revalidate: 259200 } 
  });
  const data = await res.json();
  const totalProducts = data.total || 0;

  const numberOfProductSitemaps = Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  xml += `
  <sitemap>
    <loc>${BASE_URL}/sitemap-static.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;

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
        // ⚡ FIX 2: Tell Cloudflare/CDN to cache this for 3 days
        "Cache-Control": "public, s-maxage=259200, stale-while-revalidate=86400"
    },
  });
}