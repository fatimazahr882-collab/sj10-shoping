import { NextRequest } from 'next/server'

const BASE_URL = "https://www.sj10.pk"
const API_URL = "https://products.sj10.pk/api"
const LIMIT = 1000

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Await the params (Required for Next.js 16+)
  const { id } = await params;

  // 2. Remove '.xml' so "2.xml" cleanly becomes "2"
  const cleanId = id.replace('.xml', '');
  const page = Number(cleanId) + 1;

  // 3. Fetch with cache: 'no-store' to break old cache
  const res = await fetch(
    `${API_URL}/products/sitemap-urls?limit=${LIMIT}&page=${page}`,
    { cache: 'no-store' }
  );

  const data = await res.json();
  
  // 🔥 THIS IS THE FIXED LINE. It now has `|| []` at the end.
  const products = data.products || [];

  // --- XML Generation Starts Here ---

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  products.forEach((p: any) => {

    const slug = p.sku
      ? `${p.slug}-${p.sku}`
      : p.slug;

    xml += `
<url>
<loc>${BASE_URL}/products/${encodeURIComponent(slug)}</loc>
<lastmod>${p.lastmod}</lastmod>
</url>`;
  });

  xml += `</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
// --- END OF FILE ---