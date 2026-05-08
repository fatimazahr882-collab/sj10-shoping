/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ⚡ VERCEL BILLING AVOIDED ⚡
    unoptimized: true,

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
      {
        protocol: 'https',
        hostname: 'media.sj10.pk',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // 🛡️ FULLY FIXED CONTENT SECURITY POLICY (Single string to avoid copy errors)
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googleapis.com *.facebook.com *.sj10.pk https://static.cloudflareinsights.com; img-src 'self' data: blob: res.cloudinary.com media.sj10.pk content.public.markaz.app *.googleusercontent.com *.facebook.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com cdnjs.cloudflare.com; font-src 'self' fonts.gstatic.com cdnjs.cloudflare.com; connect-src 'self' *.sj10.pk *.vercel.app *.googleapis.com *.google-analytics.com https://cloudflareinsights.com; frame-src 'self' *.google.com *.facebook.com;"
          },
        ],
      },
    ];
  },
  
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://products.sj10.pk/api/:path*', 
      },
    ];
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;