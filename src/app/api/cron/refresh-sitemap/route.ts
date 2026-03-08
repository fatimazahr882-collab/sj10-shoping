import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Security: Only allow Vercel Cron to trigger this (optional but recommended)
  // Vercel sends this header automatically
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log("🔄 CRON: Refreshing Sitemaps...");

    // We fetch the main index to trigger a revalidation
    // You can add your individual sitemaps here too if you want to be aggressive
    const urlsToWarm = [
      'https://www.sj10.pk/sitemap.xml',
      'https://www.sj10.pk/sitemap-static.xml',
      'https://www.sj10.pk/product-sitemaps/0.xml' // Warm the newest products
    ];

    const fetchPromises = urlsToWarm.map(url => 
      fetch(url, { cache: 'no-store' }) // 'no-store' forces a fresh generation
        .then(res => console.log(`✅ Warmed: ${url} - Status: ${res.status}`))
        .catch(err => console.error(`❌ Failed: ${url}`, err))
    );

    await Promise.all(fetchPromises);

    return NextResponse.json({ success: true, message: "Sitemaps refreshed" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to refresh" }, { status: 500 });
  }
}