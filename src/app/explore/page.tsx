// src/app/explore/page.tsx
import { Metadata } from 'next';
import ExploreClientPage from '@/components/ExploreClientPage';

// ✅ ISR: Cache this page for 1 hour to ensure fast loading + fresh SEO
export const revalidate = 3600;

// ✅ ADVANCED SEO METADATA FOR EXPLORE PAGE
export const metadata: Metadata = {
  title: "Explore Trending Products & Flash Sales in Pakistan | SJ10",
  description: "Discover thousands of trending products, hot deals, and flash sales on SJ10. Shop fashion, electronics, and beauty with cash on delivery anywhere in Pakistan.",
  alternates: {
    canonical: "https://www.sj10.pk/explore",
  },
  openGraph: {
    title: "Explore Trending Products & Flash Sales | SJ10",
    description: "Discover thousands of trending products, hot deals, and flash sales on SJ10. Cash on delivery anywhere in Pakistan.",
    url: "https://www.sj10.pk/explore",
    type: "website",
    siteName: "SJ10 Shopping",
    locale: "en_PK",
  }
};

export default function ExplorePage() {
  return (
    <>
      {/* 
        ✅ SEMANTIC H1 for SEO
        This is visually hidden by your global `sr-only` class but tells Google
        exactly what the page is about.
      */}
      <h1 className="sr-only">Explore All Products: Fashion, Electronics, and More with Cash on Delivery in Pakistan</h1>
      
      {/* 
        ✅ CLIENT COMPONENT
        This handles all the interactive UI, filters, and infinite scroll.
        It has been optimized to use the new Lite Card.
      */}
      <ExploreClientPage />
    </>
  );
}