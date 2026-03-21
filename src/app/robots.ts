// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.sj10.pk'; // Your actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Block private/action pages without trailing slashes for valid parsing
      disallow: [
        '/profile',
        '/cart',
        '/checkout',
        '/auth',
        '/orders',
        '/api',
        '/search', 
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}