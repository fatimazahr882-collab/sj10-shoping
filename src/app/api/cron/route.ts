import { NextResponse } from 'next/server';

export async function GET() {
  const urls = [
    'https://www.sj10.pk/sitemap.xml',
    'https://www.sj10.pk/sitemap-static.xml',
    'https://www.sj10.pk/product-sitemaps/0.xml'
  ];

  console.log("⏰ Cron Job: Warming Sitemaps...");

  // Fetch all URLs in parallel to trigger re-generation
  await Promise.all(urls.map(url => fetch(url, { cache: 'no-store' })));

  return NextResponse.json({ success: true, message: "Sitemaps Warmed" });
}