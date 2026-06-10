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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cleanId = id.replace('.xml', '');
  const page = Number(cleanId) + 1;

  // ⚡ NEXT.JS FETCH CACHE: 7 Days (604800 Seconds)
  const res = await fetch(
    `${API_URL}/products/shopping-feed?limit=${LIMIT}&page=${page}`,
    { next: { revalidate: 604800 } } 
  );

  const data = await res.json();
  const products = data.products || [];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>SJ10.pk Product Feed</title>
<link>${BASE_URL}</link>
<description>Best Online Shopping in Pakistan</description>`;

  products.forEach((p: any) => {
    const slug = p.link || ""; 
    const fullLink = `${BASE_URL}/products/${encodeURIComponent(slug)}`;

    const images = Array.isArray(p.image_links) ? p.image_links : [p.image_link];
    const mainImage = escapeXml(images[0] || "");
    const additionalImages = images.slice(1, 10).map((img: string) => 
        `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`
    ).join('');

    const brand = p.brand && p.brand.trim() !== "" ? p.brand : "SJ10";

    const priceStr = `${p.price} PKR`;
    let salePriceNode = "";
    if (p.sale_price < p.price) {
        salePriceNode = `<g:sale_price>${p.sale_price} PKR</g:sale_price>`;
    }

    xml += `
<item>
  <g:id>${escapeXml(p.id)}</g:id>
  <g:title>${escapeXml(p.title)}</g:title>
  <g:description>${escapeXml(p.description)}</g:description>
  <g:link>${fullLink}</g:link>
  <g:image_link>${mainImage}</g:image_link>
  ${additionalImages}
  <g:brand>${escapeXml(brand)}</g:brand>
  <g:condition>new</g:condition>
  <g:availability>in stock</g:availability>
  <g:price>${priceStr}</g:price>
  ${salePriceNode}
  <g:identifier_exists>no</g:identifier_exists>
</item>`;
  });

  xml += `
</channel>
</rss>`;

  return new Response(xml, {
    headers: { 
        "Content-Type": "application/xml",
        // ⚡ CLOUDFLARE CDN CACHE: 7 Days (604800 Seconds)
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400"
    },
  });
}