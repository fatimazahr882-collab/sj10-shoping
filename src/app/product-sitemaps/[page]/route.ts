import { getServerSideSitemap, ISitemapField } from 'next-sitemap';

export async function GET(request: Request, { params }: { params: Promise<{ page: string }> }) {
  const API_URL = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://products.sj10.pk/api';
  const { page } = await params;
  const pageNum = parseInt(page, 10) || 1;
  const SITEMAP_LIMIT = 45000;

  // ⚡ AUTO-DETECT URL
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const SITE_URL = `${protocol}://${host}`;

  try {
    const res = await fetch(`${API_URL}/products/sitemap-urls?page=${pageNum}&limit=${SITEMAP_LIMIT}`);
    const data = await res.json();
    const products = data.products || [];

    const fields: ISitemapField[] = products.map((product: any) => {
      const finalSlug = product.sku ? `${product.slug}-${product.sku}` : product.slug;
      return {
        loc: `${SITE_URL}/products/${encodeURI(finalSlug)}`,
        lastmod: new Date(product.lastmod || new Date()).toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      };
    });

    // ⚡ USE getServerSideSitemap (WITHOUT 'INDEX') FOR ACTUAL LINKS
    return getServerSideSitemap(fields);
  } catch (e) {
    console.error("Product Sitemap Error:", e);
    return getServerSideSitemap([]);
  }
}