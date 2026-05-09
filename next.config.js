/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. External Image Domains Ko Allow Karna Zaroori Hai
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.sj10.pk' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' }
    ],
  },

  // 2. Security Headers Ko Fix Karna (Images & Icons Issue Here)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ✅ FIX 1: 'require-corp' ki jagah 'unsafe-none' kiya hai taake external images block na hon
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none', 
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups', // Google Login popups ke liye zaroori hai
          },
          // ✅ FIX 2: FontAwesome, Cloudflare Scripts aur External Images ko explicitly allow kar diya gaya hai
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://*.google.com https://*.googleapis.com https://*.facebook.com https://*.sj10.pk; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob: https://res.cloudinary.com https://media.sj10.pk https://*.googleusercontent.com https://images.unsplash.com https://via.placeholder.com https://placehold.co; media-src 'self' https://media.sj10.pk https://res.cloudinary.com; connect-src 'self' https://* wss://*;"
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;