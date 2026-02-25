import { getServerSideSitemap, ISitemapField } from 'next-sitemap';

export async function GET(request: Request) {
  const API_URL = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://products.sj10.pk/api';
  
  // ⚡ AUTO-DETECT URL
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const SITE_URL = `${protocol}://${host}`;

  const staticRoutes: ISitemapField[] = [
    '/', '/explore', '/category', '/shipping-policy', '/terms', '/privacy',
  ].map((route) => ({
    loc: `${SITE_URL}${route}`,
    lastmod: new Date('2026-02-01').toISOString(),
    priority: route === '/' ? 1.0 : 0.8,
  }));

  try {
    const [catRes, supRes] = await Promise.all([
      fetch(`${API_URL}/products/categories-with-subcategories`),
      fetch(`${API_URL}/suppliers/sitemap-urls`),
    ]);

    const fields = [...staticRoutes];

    if (catRes.ok) {
      const data = await catRes.json();
      (data.mainCats || []).forEach((cat: any) => {
        fields.push({ loc: `${SITE_URL}/category/${cat.slug}`, lastmod: '2026-02-01' });
        (cat.subcategories || []).forEach((sub: any) => {
          fields.push({ loc: `${SITE_URL}/category/${sub.slug}`, lastmod: '2026-02-01' });
        });
      });
    }

    if (supRes.ok) {
      const supplierIds = await supRes.json();
      supplierIds.forEach((id: string) => {
        fields.push({ loc: `${SITE_URL}/suppliers/${id}`, lastmod: '2026-02-01' });
      });
    }

    return getServerSideSitemap(fields);
  } catch (e) {
    return getServerSideSitemap(staticRoutes);
  }
}