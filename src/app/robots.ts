import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.sj10.pk'; // Your actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Don't let Google waste time scanning private user pages
      disallow: [
        '/profile/',
        '/cart/',
        '/checkout/',
        '/auth/',
        '/orders/',
        '/api/',
        '/search', // Prevent indexing search results pages to save crawl budget
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}