// src/app/search/page.tsx
import { Metadata } from 'next';
import SearchClientPage from '@/components/SearchClientPage';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://sj10-cart.vercel.app/api";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

// 🟢 1. CLEAN KEYWORD-FOCUSED SEO BROWSER TAB TITLE
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = "" } = await searchParams;
  const cleanQuery = q.trim();
  
  // Clean format: Buy {Keyword} Online at Best Price in Pakistan | SJ10.pk
  const title = cleanQuery 
    ? `Buy ${cleanQuery} Online at Best Price in Pakistan | SJ10.pk`
    : `Online Shopping in Pakistan - Best Prices | SJ10.pk`;
  
  const description = cleanQuery
    ? `Find top deals & wholesale prices on ${cleanQuery} in Pakistan at SJ10. Cash on delivery (COD) & fast shipping to Karachi, Lahore, Islamabad, Rawalpindi, Peshawar.`
    : `Search thousands of products on SJ10. Electronics, Fashion, Home Decor at wholesale rates in Pakistan.`;

  const canonicalUrl = `https://www.sj10.pk/search${cleanQuery ? `?q=${encodeURIComponent(cleanQuery)}` : ''}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "SJ10.pk",
      locale: "en_PK",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

// 🟢 2. SSR FETCHER FOR GOOGLEBOT (INSTANT FIRST 40 PRODUCTS)
async function getInitialSearchResults(query: string) {
  if (!query.trim()) return { products: [], totalCount: 0 };
  try {
    const res = await fetch(`${API_BASE}/products/search-results?q=${encodeURIComponent(query)}&page=1&limit=40`, {
      next: { revalidate: 3600 } // Cache SSR response for 1 hour
    });
    if (!res.ok) return { products: [], totalCount: 0 };
    return await res.json();
  } catch (e) {
    return { products: [], totalCount: 0 };
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const initialData = await getInitialSearchResults(q);

  // 🟢 3. GOOGLEBOT JSON-LD STRUCTURED DATA SCHEMA
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Search Results for ${q}`,
    "numberOfItems": initialData.products?.length || 0,
    "itemListElement": (initialData.products || []).slice(0, 10).map((product: any, index: number) => {
      const img = Array.isArray(product.image_urls) 
        ? product.image_urls[0] 
        : (typeof product.image_urls === 'string' && product.image_urls.startsWith('[') ? JSON.parse(product.image_urls)[0] : product.image_urls);
      
      const priceVal = parseFloat(product.discounted_price || product.price || 0);

      return {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.title,
          "image": img || "https://www.sj10.pk/placeholder.jpg",
          "url": `https://www.sj10.pk/products/${product.slug}`,
          "offers": {
            "@type": "Offer",
            "priceCurrency": "PKR",
            "price": priceVal,
            "availability": product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }
      };
    })
  };

  return (
    <>
      {/* Inject Structured Data for Googlebot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SearchClientPage 
        initialQuery={q} 
        initialProducts={initialData.products || []} 
        initialTotalCount={initialData.totalCount || 0} 
      />
    </>
  );
}