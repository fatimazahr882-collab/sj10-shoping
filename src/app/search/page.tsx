// src/app/search/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchClientWrapper from './SearchClientWrapper';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

const SITE_URL = "https://www.sj10.pk";
const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://api.sj10.pk/api";

// 🚀 DYNAMIC SEO METADATA
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q ? decodeURIComponent(resolvedParams.q).trim() : '';
  const displayQ = query || 'Products';

  const title = `Buy ${displayQ} Online in Pakistan at Wholesale Rates | COD | SJ10`;
  const description = `Shop best deals for ${displayQ} in Pakistan. Wholesale prices, 3-5 days fast delivery, 7-day returns & Cash on Delivery nationwide at SJ10.pk.`;

  return {
    title,
    description,
    keywords: [`${displayQ} Pakistan`, `${displayQ} online shopping`, `buy ${displayQ} wholesale`, `SJ10 ${displayQ}`],
    alternates: { canonical: `${SITE_URL}/search?q=${encodeURIComponent(query)}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/search?q=${encodeURIComponent(query)}`,
      siteName: 'SJ10 Shopping Pakistan',
      type: 'website',
    }
  };
}

async function getInitialData(query: string) {
  if (!query) return { products: [], totalCount: 0 };
  try {
    const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}&page=1&limit=40`, {
      cache: 'no-store'
    });
    return res.ok ? await res.json() : { products: [], totalCount: 0 };
  } catch (e) {
    return { products: [], totalCount: 0 };
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q ? decodeURIComponent(resolvedParams.q).trim() : '';
  const initialData = await getInitialData(query);

  // 🤖 GOOGLEBOT ITEMLIST SCHEMA FOR SEARCH INDEXING
  const googleItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Search Results for ${query} on SJ10 Pakistan`,
    "numberOfItems": initialData.products?.length || 0,
    "itemListElement": (initialData.products || []).map((p: any, idx: number) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "Product",
        "name": p.title || p.t,
        "image": p.image_url || p.img,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "PKR",
          "price": p.discounted_price || p.dp || p.price,
          "availability": "https://schema.org/InStock"
        },
        "url": `${SITE_URL}/products/${p.slug || p.s}-${p.sku}`
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(googleItemListSchema) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-bold">Loading SJ10 Search...</div>}>
        <SearchClientWrapper 
          initialQuery={query} 
          initialProducts={initialData.products || []} 
          initialTotalCount={initialData.totalCount || 0} 
        />
      </Suspense>
    </>
  );
}