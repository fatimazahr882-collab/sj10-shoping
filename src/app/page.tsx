// src/app/page.tsx
import { Metadata } from 'next';
import { getStaticHomeData } from '@/lib/home-data';
import Link from 'next/link';

// Component Imports
import Banners from '@/components/Banners';
import VerticalBanner from '@/components/VerticalBanner';
import StripBanner from '@/components/StripBanner';
import MobileStripBanner from '@/components/MobileStripBanner';
import HomeSubcategories from '@/components/HomeSubcategories';
import PromotedSection from '@/components/PromotedSection';
import PopularProducts from '@/components/PopularProducts';
import LatestProducts from '@/components/LatestProducts';
import DynamicDiscountSections from '@/components/DynamicDiscountSections';
import CategoryRows from '@/components/CategoryRows';
import ExploreHomepage from '@/components/ExploreHomepage';
import LazySection from '@/components/LazySection';
// ⚡ ISR: Cache page for 1 hour to ensure ultra-fast TTFB and performance
export const revalidate = 3600; 

const SITE_URL = "https://www.sj10.pk";

// 🚀 ADVANCED SEO METADATA
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SJ10 - Pakistan's #1 Online Shopping Marketplace",
    template: "%s | SJ10.pk" 
  },
  description: "Shop thousands of products at SJ10. Best prices for Fashion, Electronics, Home Decor, and more. Fast delivery and Cash on Delivery available across Pakistan.",
  keywords: [
    "Online Shopping in Pakistan", "Buy Online", "Cash on Delivery", 
    "SJ10", "Fashion", "Electronics", "Home Decor", "Reselling App Pakistan"
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "SJ10.pk | Online Shopping & Reselling in Pakistan",
    description: "Premium shopping experience in Pakistan with fast Cash on Delivery.",
    url: SITE_URL,
    siteName: "SJ10 Shopping",
    locale: "en_PK",
    type: "website",
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: "SJ10 Logo" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "SJ10.pk | Online Shopping & Reselling in Pakistan",
    description: "Premium shopping experience with fast COD and a huge product selection.",
    images: [`${SITE_URL}/logo.png`],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default async function HomePage() {
  // SSR Fetch occurs here. HTML is generated containing all product links for Googlebot.
  const initialData = await getStaticHomeData();

  // 🚀 ADVANCED STRUCTURED DATA (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "SJ10 Shopping",
        "url": SITE_URL,
        "logo": { "@type": "ImageObject", "url": `${SITE_URL}/logo.png` },
        "sameAs": [ 
          "https://www.instagram.com/sj10official",
          "https://www.tiktok.com/@sj10official",
          "https://youtube.com/@sj10official"
        ]
      },
      {
        "@type": "WebSite",
        "url": SITE_URL,
        "potentialAction": { 
          "@type": "SearchAction",
          "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

 
return (
    <div className="homepage-wrapper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <h1 className="sr-only">
        SJ10 Online Shopping Pakistan - Buy Fashion, Electronics, Home Decor & Groceries
      </h1>

      {/* ========================================== */}
      {/* 🟢 VIP AREA: INSTANT LOAD (Above the fold)   */}
      {/* ========================================== */}
      
      {/* Hero Banners */}
      <div className="desktop-banner-layout">
        <VerticalBanner />
        <div className="main-banner-wrapper">
          <Banners banners={initialData.banners} priority={true} />
        </div>
      </div>
      <div className="full-width-banner">
        <Banners banners={initialData.banners} priority={true} />
      </div>
      
      <div>
        <StripBanner key="desktop-banner" />
        <MobileStripBanner key="mobile-banner" />  
      </div>
      
      {/* Categories & Promoted (Googlebot loves seeing products instantly) */}
      {initialData.subCatRow1?.length > 0 && (
        <HomeSubcategories subcategories={initialData.subCatRow1} title="Explore Categories" priority={true} />
      )}
      
      <PromotedSection products={initialData.promotedTop50} />
      

      {/* ========================================== */}
      {/* 🟡 WAITING AREA: LAZY LOAD (On Scroll)       */}
      {/* ========================================== */}

      {/* Jab user thora neeche aayega toh ye load hoga */}
      <LazySection height="300px" offset="200px">
        <DynamicDiscountSections sections={initialData.discountSections} />
      </LazySection>


       {/* Latest Products real-time data fetch karta hai, isko chupana bohat faide mand hai */}
      <LazySection height="400px" offset="300px">
        <LatestProducts /> 
      </LazySection>

      
      <LazySection height="350px" offset="200px">
        {initialData.popularProducts?.length > 0 && (
          <PopularProducts products={initialData.popularProducts} />
        )}
      </LazySection>
      
     
      
      <LazySection height="500px" offset="300px">
        {initialData.categoryRows?.length > 0 && (
          <CategoryRows initialData={initialData.categoryRows} />
        )}
      </LazySection>

      {/* Explore feed sab se heavy hai, isko end mein rakhenge */}
      <LazySection height="800px" offset="400px">
        <section className="explore-feed-section" id="explore-section">
          <ExploreHomepage 
            initialProducts={initialData.initialExploreFeed} 
            initialTotalCount={initialData.totalExploreCount} 
          />
        </section>
      </LazySection>

      {/* Final SEO Text Block - Isko end mein rakhein */}
      <LazySection height="300px" offset="100px">
        <section className="seo-footer-section">
          <div className="seo-container">
            <div className="seo-quick-links">
              <Link href="/" className="seo-link-card">
                <div className="seo-icon-wrapper"><i className="fas fa-home seo-icon text-blue"></i></div>
                <div className="seo-link-text"><strong>Home</strong><span>Start Shopping</span></div>
              </Link>
              <Link href="/category" className="seo-link-card">
                <div className="seo-icon-wrapper"><i className="fas fa-th-large seo-icon text-orange"></i></div>
                <div className="seo-link-text"><strong>Category</strong><span>Browse All</span></div>
              </Link>
              <Link href="/explore" className="seo-link-card">
                <div className="seo-icon-wrapper"><i className="fas fa-fire seo-icon text-red"></i></div>
                <div className="seo-link-text"><strong>Explore</strong><span>Trending Items</span></div>
              </Link>
            </div>
            <div className="seo-text-block">
              <h2 className="seo-h2">Welcome to SJ10 – Pakistan’s Premier Online Shopping & Reselling Marketplace</h2>
              <p>SJ10.pk is transforming the landscape of <strong>online shopping in Pakistan</strong>. Whether you are searching for the latest <strong>Fashion</strong> trends, cutting-edge <strong>Electronics</strong>, elegant <strong>Home Decor</strong>, or daily essentials, our multi-vendor marketplace brings thousands of high-quality products right to your fingertips. We are dedicated to providing an unparalleled shopping experience with a focus on affordability, quality, and convenience.</p>
              <p>Shopping with SJ10 means you get the <strong>best prices in Pakistan</strong> without compromising on quality. We proudly offer nationwide delivery, ensuring that whether you live in <strong>Karachi, Lahore, Islamabad, Quetta, or Peshawar</strong>, your orders reach you swiftly and safely. To make your experience entirely risk-free, we provide a reliable <strong>Cash on Delivery (COD)</strong> service across the country, allowing you to pay only when your product arrives at your doorstep.</p>
              <p>But SJ10 is more than just an e-commerce store; it is an empowerment platform. Our unique <strong>Zero-Investment Reselling Program</strong> allows students, housewives, and entrepreneurs to start their own businesses instantly. Simply share our products on your social media, set your own profit margins, and we handle the inventory, packaging, and shipping. Your profits are deposited directly into your bank or mobile wallet (EasyPaisa/JazzCash).</p>
              <p>Experience the future of retail today. From exclusive flash sales and heavy discounts to premium wholesale supplies, SJ10.pk is your ultimate destination to <strong>buy online in Pakistan</strong>. Shop securely, earn smartly, and join thousands of satisfied customers and successful partners growing with SJ10.</p>
            </div>
          </div>
        </section>
      </LazySection>
    </div>
  );
}