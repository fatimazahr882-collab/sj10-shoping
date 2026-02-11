// next.config.js (FINAL & CORRECTED)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // You can keep your formats and sizes, they are good optimizations
    formats: ['image/avif', 'image/webp'],
    
    // The critical fix is in remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // ✅ CORRECTED: Allow any image path from your Cloudinary account.
        // This is the most robust and common configuration.
        pathname: '/**', 
      },
      {
        // This pattern for your other host is also correct.
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