// src/app/search-sitemaps/[...slug]/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slugParts = resolvedParams.slug || ['1.xml'];
  const rawFileName = slugParts.join('/');
  const pageNum = rawFileName.replace('.xml', '') || '1';

  const isLocal = process.env.NODE_ENV === 'development';
  
  // 🚨 MASTER NGINX GATEWAY ENDPOINT (Optimized for Cloudflare Edge Caching)
  const targetUrl = isLocal 
    ? `http://localhost:4006/api/products/sitemap-search-${pageNum}.xml`
    : `https://api.sj10.pk/api/products/sitemap-search-${pageNum}.xml`;

  console.log(`📡 [SITEMAP PROXY] Requesting: ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      cache: 'no-store', // Always ask Nginx Gateway for fresh or CDN-cached XML
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    if (!res.ok) {
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- ERROR: Status ${res.status} --></urlset>`, {
        status: 200,
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    const xmlText = await res.text();

    return new NextResponse(xmlText, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        // ⚡ CLOUDFLARE EDGE CDN CACHING: Cache sitemaps for 24 Hours globally!
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    });

  } catch (error: any) {
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- CRASH: ${error.message} --></urlset>`, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}