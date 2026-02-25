import { getServerSideSitemapIndex } from 'next-sitemap';

export async function GET(request: Request) {
  const API_URL = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://products.sj10.pk/api';
  
  // ⚡ AUTO-DETECT URL: Works for both Localhost and Production
  const { searchParams } = new URL(request.url);
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const SITE_URL = `${protocol}://${host}`;

  try {
    const res = await fetch(`${API_URL}/products/sitemap-count`);
    const productData = await res.json();
    const totalProducts = productData.total || 0;
    const SITEMAP_LIMIT = 45000; 

    const amountOfProductSitemaps = Math.ceil(totalProducts / SITEMAP_LIMIT);

    // List of sub-sitemaps
    const sitemaps = [
      `${SITE_URL}/server-sitemap-static.xml`,
    ];

    for (let i = 1; i <= amountOfProductSitemaps; i++) {
      sitemaps.push(`${SITE_URL}/product-sitemaps/${i}`);
    }

    return getServerSideSitemapIndex(sitemaps);
  } catch (e) {
    return getServerSideSitemapIndex([`${SITE_URL}/server-sitemap-static.xml`]);
  }
}