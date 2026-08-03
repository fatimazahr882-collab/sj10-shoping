/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'media.sj10.pk' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'content.public.markaz.app' },
      { protocol: 'https', hostname: 'static.markaz.app' }
    ],
  },

  // 🚨 GLOBAL MASTER SWITCH: Force NO CACHE on Vercel for ALL pages/components!
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico|logo.mp4|logo.png).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },

  // Existing Sitemaps Rewrites
  async rewrites() {
    const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://api.sj10.pk/api";
    return [
      {
        source: '/sitemap-search.xml',
        destination: `${API_BASE}/products/sitemap-search.xml`,
      },
      {
        source: '/sitemap-search-:page.xml',
        destination: `${API_BASE}/products/sitemap-search-:page.xml`,
      },
    ];
  },
};

export default nextConfig;