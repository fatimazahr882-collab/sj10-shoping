import { NextRequest } from 'next/server';

const BASE_URL = "https://www.sj10.pk";
const API_URL = "https://products.sj10.pk/api";
const LIMIT = 1000;

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
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

// 🔥 FIX: Ensures dates are always valid ISO 8601 format
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cleanId = id.replace('.xml', '');
  const page = Number(cleanId) + 1;

  const res = await fetch(`${API_URL}/products/sitemap-urls?limit=${LIMIT}&page=${page}`, { cache: 'no-store' });
  const data = await res.json();
  const products = data.products || [];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

  products.forEach((p: any) => {
    const slug = p.sku ? `${p.slug}-${p.sku}` : p.slug;
    const productUrl = `${BASE_URL}/products/${encodeURIComponent(slug)}`;
    
    let imageUrl = "";
    try {
        if (p.image_urls) {
            const parsed = typeof p.image_urls === 'string' && p.image_urls.startsWith('[') ? JSON.parse(p.image_urls) : p.image_urls;
            imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
        }
    } catch(e) {}

    const safeImage = escapeXml(imageUrl);
    const safeTitle = escapeXml(p.title || p.slug);
    const safeDesc = escapeXml(p.short_desc || p.title || "Product video");

    xml += `
    <url>
      <loc>${productUrl}</loc>
      <lastmod>${formatDate(p.lastmod)}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
      ${safeImage ? `<image:image><image:loc>${safeImage}</image:loc><image:title>${safeTitle}</image:title></image:image>` : ''}
      ${p.video_url && p.video_url.length > 5 ? `
      <video:video>
        <video:thumbnail_loc>${safeImage || "https://www.sj10.pk/default-thumb.jpg"}</video:thumbnail_loc>
        <video:title>${safeTitle}</video:title>
        <video:description>${safeDesc}</video:description>
        <video:content_loc>${escapeXml(p.video_url)}</video:content_loc>
      </video:video>` : ''}
    </url>`;
  });

  xml += `</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}