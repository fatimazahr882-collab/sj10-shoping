// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // These sizes help Next.js generate the best image for different devices
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Serve modern formats like AVIF and WebP which are much smaller
    formats: ['image/avif', 'image/webp'],
    
    // Allow images from your specific cloud storage domains
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
      {
        protocol: 'https',
        hostname: 'media.sj10.pk',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // ⚡ FOR CLOUDFLARE CDN CACHING ⚡
  async headers() {
    return [
      {
        source: '/products/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=59', // 1 Hour CDN Cache
          },
        ],
      },
    ];
  },

  // ⚡ ADDED: THIS BYPASSES THE CORS ERROR ON LOCALHOST ⚡
  async rewrites() {
    return [
      {
        // When your frontend asks for /api-proxy/...
        source: '/api-proxy/:path*',
        // Next.js will secretly fetch it from your backend...
        destination: 'http://products.sj10.pk/api/:path*', 
      },
    ];
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;