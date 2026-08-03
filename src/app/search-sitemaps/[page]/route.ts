// src/app/search-sitemaps/[page]/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: Promise<{ page: string }> }) {
  const resolvedParams = await params;
  const rawPage = resolvedParams.page || '1';
  const pageNum = rawPage.replace('.xml', '') || '1';

  // Direct hit to P1 Worker IP (Bypasses Nginx & Cloudflare completely)
  const targetUrl = `http://129.159.235.244:4006/api/products/sitemap-search-${pageNum}.xml`;

  try {
    console.log(`[Next.js Sitemap Route] Fetching from: ${targetUrl}`);
    
    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: {
        'x-internal-api-key': 'Pakistanc456',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    const responseText = await res.text();
    console.log(`[Next.js Sitemap Route] Response length: ${responseText.length} chars`);

    if (!res.ok || responseText.length < 50) {
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- ERROR: Backend returned status ${res.status} or empty body --></urlset>`, {
        status: 200,
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    return new NextResponse(responseText, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });

  } catch (error: any) {
    console.error("[Next.js Sitemap Route Crash]:", error.message);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- CRASH: ${error.message} --></urlset>`, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}