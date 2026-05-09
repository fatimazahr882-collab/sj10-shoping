/** @type {import('next').NextConfig} */
const nextConfig = {
  unoptimized : true,   
  images: {
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
};

module.exports = nextConfig;