import { NextRequest } from 'next/server';

const BASE_URL = "https://www.sj10.pk";
const API_URL = "https://products.sj10.pk/api";
const LIMIT = 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Clean the ID (remove .xml if present)
  const cleanId = id.replace('.xml', '');
  const page = Number(cleanId) + 1;

  // Fetch Products with no cache to ensure fresh pagination
  const res = await fetch(
    `${API_URL}/products/sitemap-urls?limit=${LIMIT}&page=${page}`,
    { cache: 'no-store' }
  );

  const data = await res.json();
  const products = data.products || [];

  // 🔥 IMPORTANT: Add the xmlns:image namespace here
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  products.forEach((p: any) => {
    // Construct the correct Slug (Slug + SKU)
    const slug = p.sku ? `${p.slug}-${p.sku}` : p.slug;
    
    // Logic to extract the main image from JSON or String
    let imageUrl = "";
    try {
        if (p.image_urls) {
            if (typeof p.image_urls === 'string') {
                // If it's a JSON string like '["url1", "url2"]'
                if (p.image_urls.startsWith('[')) {
                    const parsed = JSON.parse(p.image_urls);
                    imageUrl = parsed[0];
                } else {
                    // Plain string
                    imageUrl = p.image_urls;
                }
            } else if (Array.isArray(p.image_urls) && p.image_urls.length > 0) {
                // Already an array
                imageUrl = p.image_urls[0];
            }
        }
    } catch(e) { /* Ignore parsing errors */ }

    xml += `
    <url>
      <loc>${BASE_URL}/products/${encodeURIComponent(slug)}</loc>
      <lastmod>${p.lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
      ${imageUrl ? `
      <image:image>
        <image:loc>${imageUrl}</image:loc>
        <image:title>${p.slug}</image:title>
      </image:image>` : ''}
    </url>`;
  });

  xml += `</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}