import { NextRequest } from 'next/server';

const BASE_URL = "https://www.sj10.pk";
const API_URL = "https://products.sj10.pk/api";
const LIMIT = 1000;

// Helper to clean text for XML
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
  const cleanId = id.replace('.xml', '');
  const page = Number(cleanId) + 1;

  // Fetch Rich Data from Backend
  const res = await fetch(
    `${API_URL}/products/shopping-feed?limit=${LIMIT}&page=${page}`,
    { cache: 'no-store' }
  );

  const data = await res.json();
  const products = data.products || [];

  // 1. XML Header (RSS 2.0 + Google Namespace)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>SJ10.pk Product Feed ${page}</title>
<link>${BASE_URL}</link>
<description>Best Online Shopping in Pakistan</description>`;

  // 2. Loop Products
  products.forEach((p: any) => {
    // Construct URL
    const slug = p.id ? `${p.link}-${p.id}` : p.link; // Assuming link is slug and id is SKU/ID
    const fullLink = `${BASE_URL}/products/${encodeURIComponent(slug)}`;

    // Price Logic (PKR)
    // If sale price is lower, show both. If not, just show price.
    const priceStr = `${p.price} PKR`;
    let salePriceNode = "";
    
    if (p.sale_price < p.price) {
        salePriceNode = `<g:sale_price>${p.sale_price} PKR</g:sale_price>`;
    }

    // Clean Text
    const safeTitle = escapeXml(p.title);
    const safeDesc = escapeXml(p.description);
    const safeImage = escapeXml(p.image_link);

    xml += `
<item>
  <g:id>${escapeXml(p.id)}</g:id>
  <g:title>${safeTitle}</g:title>
  <g:description>${safeDesc}</g:description>
  <g:link>${fullLink}</g:link>
  <g:image_link>${safeImage}</g:image_link>
  <g:condition>new</g:condition>
  <g:availability>in stock</g:availability>
  <g:price>${priceStr}</g:price>
  ${salePriceNode}
  <g:brand>SJ10</g:brand>
  <g:identifier_exists>no</g:identifier_exists>
</item>`;
  });

  xml += `
</channel>
</rss>`;

  return new Response(xml, {
    headers: { 
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59"
    },
  });
}