import { generateSitemaps } from '../sitemap';

export async function GET() {
  const BASE_URL = 'https://www.sj10.pk';
  
  // 1. Get the exact number of sitemaps from your existing logic
  const sitemaps = await generateSitemaps();
  
  // 2. Create the XML Index format dynamically
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps.map((s) => `
  <sitemap>
    <loc>${BASE_URL}/sitemap/${s.id}.xml</loc>
  </sitemap>`).join('')}
</sitemapindex>`;

  // 3. Return as a valid XML response
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      // Cache for 1 hour, exactly like your product fetches!
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', 
    },
  });
}