// next.config.js
const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', 
      },
      {
        protocol: 'https',
        hostname: 'media.sj10.pk',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/products/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=59', 
          },
        ],
      },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

// This line wraps your config with the next-intl plugin
module.exports = withNextIntl(nextConfig);