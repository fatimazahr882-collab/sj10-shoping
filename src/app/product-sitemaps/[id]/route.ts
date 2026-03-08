import { NextRequest } from 'next/server';

const BASE_URL = "https://www.sj10.pk";
const API_URL = "https://products.sj10.pk/api";
const LIMIT = 1000;

// 🔥 HELPER FUNCTION: This cleans the text so XML doesn't crash
function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
    return c;
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Clean the ID (remove .xml if present)
  const cleanId = id.replace('.xml', '');
  const page = Number(cleanId) + 1;

  // Fetch Products
  const res = await fetch(
    `${API_URL}/products/sitemap-urls?limit=${LIMIT}&page=${page}`,
    { cache: 'no-store' }
  );

  const data = await res.json();
  const products = data.products || [];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  products.forEach((p: any) => {
    // 1. Slug handling (URLs handle & differently, so we use encodeURIComponent)
    const rawSlug = p.sku ? `${p.slug}-${p.sku}` : p.slug;
    const cleanUrl = `${BASE_URL}/products/${encodeURIComponent(rawSlug)}`;

    // 2. Image Logic
    let imageUrl = "";
    try {
        if (p.image_urls) {
            if (typeof p.image_urls === 'string') {
                if (p.image_urls.startsWith('[')) {
                    const parsed = JSON.parse(p.image_urls);
                    imageUrl = parsed[0];
                } else {
                    imageUrl = p.image_urls;
                }
            } else if (Array.isArray(p.image_urls) && p.image_urls.length > 0) {
                imageUrl = p.image_urls[0];
            }
        }
    } catch(e) { /* Ignore */ }

    // 🔥 3. ESCAPE XML CHARACTERS (The Fix)
    // We clean the image URL and the Title to remove raw '&' symbols
    const safeImageUrl = escapeXml(imageUrl);
    const safeTitle = escapeXml(p.slug); 

    xml += `
    <url>
      <loc>${cleanUrl}</loc>
      <lastmod>${p.lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
      ${safeImageUrl ? `
      <image:image>
        <image:loc>${safeImageUrl}</image:loc>
        <image:title>${safeTitle}</image:title>
      </image:image>` : ''}
    </url>`;
  });

  xml += `</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}