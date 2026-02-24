import { Metadata } from 'next';
import ExploreClientPage from '@/components/ExploreClientPage';

// 1. ADVANCED METADATA FOR EXPLORE PAGE
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
        2. SEMANTIC H1
        This is visually hidden by the 'sr-only' class we added to globals.css earlier.
        It tells Google exactly what the page is about instantly.
      */}
      <h1 className="sr-only">Explore Trending Products, Hot Deals, and Discounts in Pakistan</h1>
      
      {/* 3. CLIENT COMPONENT (Handles the interactive UI, filters, and infinite scroll) */}
      <ExploreClientPage />
    </>
  );
}