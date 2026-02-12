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
        hostname: 'pub-1390981b409c46698da5dc6c45e08eaa.r2.dev',
        pathname: '/**',
      },
    ],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;