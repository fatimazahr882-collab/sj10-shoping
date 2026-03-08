import { NextRequest } from 'next/server';

const BASE_URL = "https://www.sj10.pk";
const API_URL = "https://products.sj10.pk/api";

export async function GET(request: NextRequest) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const now = new Date().toISOString();

  const staticRoutes = ['', '/explore', '/category', '/shipping-policy', '/terms', '/privacy', '/return-policy', '/about', ];
  staticRoutes.forEach(route => {
    xml += `
    <url>
      <loc>${BASE_URL}${route}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${route === '' ? '1.0' : '0.8'}</priority>
    </url>`;
  });

  // Categories
  try {
    const res = await fetch(`${API_URL}/products/categories-with-subcategories`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      (data.mainCats || []).forEach((cat: any) => {
        if (cat.slug) xml += `<url><loc>${BASE_URL}/category/${cat.slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq></url>`;
        cat.subcategories?.forEach((sub: any) => {
          if (sub.slug) xml += `<url><loc>${BASE_URL}/category/${sub.slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq></url>`;
        });
      });
    }
  } catch (e) {}

  xml += `</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}