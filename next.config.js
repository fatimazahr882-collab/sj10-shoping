/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel Image Optimization ko Globally Band (Kill) kar diya
  images: {
    unoptimized: true, // <--- YE WOH JADOO HAI JO BILL ZERO RAKHEGA
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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;