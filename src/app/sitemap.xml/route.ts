// src/app/sitemap.xml/route.ts
import { NextRequest } from 'next/server';

const BASE_URL = "https://www.sj10.pk";
const API_URL = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://api.sj10.pk/api";
const PRODUCTS_PER_SITEMAP = 1000;
const KEYWORDS_PER_SITEMAP = 1000;

export async function GET(request: NextRequest) {
  // 1. Fetch Product Count & Search Keywords Count in Parallel
  const [productRes, searchRes] = await Promise.all([
    fetch(`${API_URL}/products/sitemap-count`, { next: { revalidate: 259200 } }),
    fetch(`${API_URL}/products/sitemap-search-count`, { next: { revalidate: 86400 } }).catch(() => null)
  ]);

  const productData = productRes.ok ? await productRes.json() : { total: 0 };
  const searchData = (searchRes && searchRes.ok) ? await searchRes.json() : { total: 254 };

  const totalProducts = productData.total || 0;
  const totalKeywords = searchData.total || 254;

  const numberOfProductSitemaps = Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP);
  const numberOfSearchSitemaps = Math.ceil(totalKeywords / KEYWORDS_PER_SITEMAP);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static Sitemap
  xml += `
  <sitemap>
    <loc>${BASE_URL}/sitemap-static.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;

  // Product Sitemaps
  for (let i = 0; i < numberOfProductSitemaps; i++) {
    xml += `
  <sitemap>
    <loc>${BASE_URL}/product-sitemaps/${i}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
  }

  // 🚨 SEARCH KEYWORDS SITEMAPS (New Addition!)
  for (let i = 1; i <= numberOfSearchSitemaps; i++) {
    xml += `
  <sitemap>
    <loc>${BASE_URL}/search-sitemaps/${i}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
  }

  xml += `\n</sitemapindex>`;

  return new Response(xml, {
    headers: { 
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
    },
  });
}