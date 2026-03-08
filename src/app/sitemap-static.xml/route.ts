import { NextRequest } from 'next/server';

const BASE_URL = "https://www.sj10.pk";
const API_URL = "https://products.sj10.pk/api";

export async function GET(request: NextRequest) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 1. Static Pages
  const staticRoutes = ['', '/explore', '/category', '/shipping-policy', '/terms', '/privacy'];
  staticRoutes.forEach(route => {
    xml += `
    <url>
      <loc>${BASE_URL}${route}</loc>
      <changefreq>daily</changefreq>
      <priority>${route === '' ? '1.0' : '0.8'}</priority>
    </url>`;
  });

  // 2. Categories
  try {
    const res = await fetch(`${API_URL}/products/categories-with-subcategories`, { 
        next: { revalidate: 3600 } 
    });
    
    if (res.ok) {
      const data = await res.json();
      const mainCats = data.mainCats || [];

      mainCats.forEach((cat: any) => {
        if (cat.slug) {
          xml += `
          <url>
            <loc>${BASE_URL}/category/${cat.slug}</loc>
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
          </url>`;
        }
        cat.subcategories?.forEach((sub: any) => {
          if (sub.slug) {
            xml += `
            <url>
              <loc>${BASE_URL}/category/${sub.slug}</loc>
              <changefreq>weekly</changefreq>
              <priority>0.7</priority>
            </url>`;
          }
        });
      });
    }
  } catch (e) {
    console.error("Static Sitemap Error:", e);
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}