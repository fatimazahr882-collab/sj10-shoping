const BASE_URL = "https://www.sj10.pk";
const PRODUCTS_PER_SITEMAP = 1000;

export async function GET() {

  const res = await fetch(
    "https://products.sj10.pk/api/products/sitemap-count"
  );

  const data = await res.json();
  const totalProducts = data.total;

  const sitemapCount = Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (let i = 0; i < sitemapCount; i++) {
    xml += `
<sitemap>
<loc>${BASE_URL}/sitemap/${i}.xml</loc>
</sitemap>`;
  }

  xml += `</sitemapindex>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}