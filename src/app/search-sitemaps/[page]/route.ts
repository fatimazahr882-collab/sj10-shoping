// src/app/search-sitemaps/[page]/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: Promise<{ page: string }> }) {
  const resolvedParams = await params;
  const rawPage = resolvedParams.page || '1';
  const pageNum = rawPage.replace('.xml', '') || '1';

  const isLocal = process.env.NODE_ENV === 'development';
  
  // Try Live Domain API first, fallback to Direct IP
  const targetUrl = isLocal 
    ? `http://localhost:4006/api/products/sitemap-search-${pageNum}.xml`
    : `https://api.sj10.pk/api/products/sitemap-search-${pageNum}.xml`;

  try {
    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: {
        'x-internal-api-key': 'Pakistanc456',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      // 🚨 LIVE DIAGNOSTIC XML ERROR OUTPUT
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><error>HTTP_STATUS_${res.status}</error><target>${targetUrl}</target><details>${errText.substring(0, 100)}</details></urlset>`, {
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
    // 🚨 LIVE DIAGNOSTIC CRASH OUTPUT
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><error>FETCH_CRASH</error><message>${error.message}</message><target>${targetUrl}</target></urlset>`, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}