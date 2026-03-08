const BASE_URL = "https://www.sj10.pk";
const API_URL = "https://products.sj10.pk/api";
const LIMIT = 1000;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {

  const page = Number(params.id) + 1;

  const res = await fetch(
    `${API_URL}/products/sitemap-urls?limit=${LIMIT}&page=${page}`
  );

  const data = await res.json();
  const products = data.products || [];

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