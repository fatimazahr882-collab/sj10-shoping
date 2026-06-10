/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // ✅ Moved inside images object (Next.js standard)
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
  
  // 🔥 FORCE HEADERS FOR CLOUDFLARE BYPASS 🔥
  async headers() {
    return [
      {
        // 1. Force Cache on Product Pages
        source: '/products/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // 2. Force Cache on Explore Page
        source: '/explore',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // 3. Force Cache on Main Categories Page
        source: '/category',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // 4. Force Cache on Specific Category Pages
        source: '/category/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      }
    ];
  },
};

module.exports = nextConfig;