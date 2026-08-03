// src/app/search-sitemaps/[page]/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: Promise<{ page: string }> }) {
  const resolvedParams = await params;
  const rawPage = resolvedParams.page || '1';
  const pageNum = rawPage.replace('.xml', '') || '1';

  const isLocal = process.env.NODE_ENV === 'development';
  
  // 🚨 DIRECT VPS IP BYPASS (Bypasses Cloudflare WAF Bot Shield Completely!)
  const targetUrl = isLocal 
    ? `http://localhost:4006/api/products/sitemap-search-${pageNum}.xml`
    : `http://129.154.42.80/api/products/sitemap-search-${pageNum}.xml`;

  try {
    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: {
        'Host': 'api.sj10.pk', // 🚨 Tells Nginx Gateway which domain to route to
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- DEBUG: Status ${res.status} | Body: ${errText.substring(0, 50)} --></urlset>`, {
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
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- DEBUG CRASH: ${error.message} --></urlset>`, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}