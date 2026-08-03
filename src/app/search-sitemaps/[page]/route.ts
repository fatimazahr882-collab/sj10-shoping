// src/app/search-sitemaps/[page]/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: Promise<{ page: string }> }) {
  const resolvedParams = await params;
  const rawPage = resolvedParams.page || '1';
  const pageNum = rawPage.replace('.xml', '') || '1';

  const isLocal = process.env.NODE_ENV === 'development';
  
  // 🚨 DIRECT P1 WORKER IP CALL (Bypasses Nginx 301 Redirects & Cloudflare WAF!)
  const targetUrl = isLocal 
    ? `http://localhost:4006/api/products/sitemap-search-${pageNum}.xml`
    : `http://129.159.235.244:4006/api/products/sitemap-search-${pageNum}.xml`;

  try {
    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: {
        'x-internal-api-key': 'Pakistanc456',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    if (!res.ok) {
      console.error(`🔴 Vercel Fetch to ${targetUrl} failed with status: ${res.status}`);
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        status: 200,
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    const xmlText = await res.text();

    return new NextResponse(xmlText, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });

  } catch (error: any) {
    console.error("🔴 Vercel Sitemap Fetch Crash:", error.message);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}