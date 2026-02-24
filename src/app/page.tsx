import { Metadata } from 'next';
import { getStaticHomeData } from '@/lib/home-data';
import HomeClientPage from '@/components/HomeClientPage';

// ⚡ ISR: Cache Home Page for 1 hour (3600 seconds)
export const revalidate = 3600; 

const SITE_URL = "https://www.sj10.pk";

// 1. HOME PAGE METADATA
export const metadata: Metadata = {
  title: "SJ10 - Pakistan's #1 Online Shopping Marketplace",
  description: "Shop thousands of products at SJ10. Best prices for Fashion, Electronics, Home Decor, and more. Fast delivery and Cash on Delivery available across Pakistan.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "SJ10 - Pakistan's #1 Online Shopping Marketplace",
    description: "Discover best prices for Fashion, Electronics, and Home Decor. COD available nationwide.",
    url: SITE_URL,
    siteName: "SJ10 Shopping",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo.gif`, // Using your logo as the main OG image
        width: 800,
        height: 600,
        alt: "SJ10 Shopping Logo",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default async function HomePage() {
  // 1. Fetch data on the server
  const initialData = await getStaticHomeData();

  // 2. ADVANCED SCHEMA: Organization & WebSite (Search Box)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "SJ10 Shopping",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/logo.gif`,
          "width": 112,
          "height": 112
        },
        // Links your site to your real social profiles (Extracted from your code)
        "sameAs": [
          "https://www.instagram.com/sj10official?igsh=MTM2bDRpcGJmc2EyMw==",
          "https://www.tiktok.com/@sj10official",
          "https://youtube.com/@sj10official?si=AJaR4Cy6gNAhTQh2",
          "https://whatsapp.com/channel/0029Vb6PEhOLNSa6Z6OtPS1U"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+92-334-8846378", // ⚠️ REPLACE with your actual support number
          "contactType": "customer service",
          "areaServed": "PK",
          "availableLanguage": ["en", "ur"]
        }
      },
      {
        "@type": "WebSite",
        "url": SITE_URL,
        "potentialAction": {
          "@type": "SearchAction",
          // Tells Google: "Use this URL to search my site"
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 
         3. SEMANTIC H1 (Vital for SEO)
         This is visually hidden ("sr-only") but read by Google bots 
         to understand the primary purpose of the site immediately.
      */}
      <h1 className="sr-only">
        SJ10 Online Shopping Pakistan - Fashion, Electronics, Home Decor & Groceries
      </h1>

      {/* Render the UI */}
      <HomeClientPage initialData={initialData} />
    </>
  );
}