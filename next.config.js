// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ⚡ FIX: THIS STOPS VERCEL FROM PROCESSING IMAGES & CHARGING YOU ⚡
    // It tells Next.js to let the browser download directly from Cloudflare.
    unoptimized: true,

    // These sizes help Next.js generate the best image for different devices
    // (Note: With unoptimized: true, Vercel ignores these, but we can safely leave them here)
    deviceSizes:[640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes:[16, 32, 48, 64, 96, 128, 256, 384],
    
    // Serve modern formats like AVIF and WebP which are much smaller
    formats: ['image/avif', 'image/webp'],
    
    // Allow images from your specific cloud storage domains
    remotePatterns:[
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
  
 // next.config.js headers hamesha aisi honi chahiye:
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
        // 🛡️ UPDATED CONTENT SECURITY POLICY (MARKAZ & CDNJS ALLOWED)
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; " +
                 "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googleapis.com *.facebook.com *.sj10.pk; " +
                 // 📸 MARKAZ aur Cloudinary dono allow kiye hain
                 "img-src 'self' data: blob: res.cloudinary.com media.sj10.pk content.public.markaz.app *.googleusercontent.com *.facebook.com; " +
                 // 🎨 FONT AWESOME (cdnjs) allow kiya hai
                 "style-src 'self' 'unsafe-inline' fonts.googleapis.com cdnjs.cloudflare.com; " +
                 "font-src 'self' fonts.gstatic.com cdnjs.cloudflare.com; " +
                 "connect-src 'self' *.sj10.pk *.vercel.app *.googleapis.com *.google-analytics.com; " +
                 "frame-src 'self' *.google.com *.facebook.com;"
        },
      ],
    },
  ];
},
  // ⚡ ADDED: THIS BYPASSES THE CORS ERROR ON LOCALHOST ⚡
  async rewrites() {
    return[
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