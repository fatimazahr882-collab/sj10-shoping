// src/app/search-sitemaps/[page]/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ page: string }> }) {
  const resolvedParams = await params;
  const rawPage = resolvedParams.page || '1';
  const pageNum = rawPage.replace('.xml', '') || '1';

  // 🚨 SMART DYNAMIC HOST DETECTOR (Auto-detects Localhost 4006 vs Live Server)
  const isLocal = process.env.NODE_ENV === 'development';
  const API_BASE = isLocal 
    ? "http://localhost:4006/api" 
    : (process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://api.sj10.pk/api");

  try {
    const res = await fetch(`${API_BASE}/products/sitemap-search-${pageNum}.xml`, {
      cache: 'no-store' // Local testing par Vercel fetch cache bypass karein!
    });

    if (!res.ok) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
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

  } catch (error) {
    console.error("Sitemap Route Error:", error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}