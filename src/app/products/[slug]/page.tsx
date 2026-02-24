import { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { Product } from "@/components/ProductCard";

// ⚡ ISR CONFIGURATION
// Revalidate every hour to keep prices fresh in cache
export const revalidate = 3600; 
export const dynamicParams = true; 

// ⚡ CONSTANTS
const SITE_URL = "https://www.sj10.pk";
const R2_URL = "https://media.sj10.pk";

type Props = {
  params: Promise<{ slug: string }>;
};

// --- 1. DATA FETCHING HELPERS ---

async function getProduct(slug: string) {
  if (!slug || slug === 'undefined') return null;
  
  // Handle SKU logic in URL (e.g., product-name-SKU123)
  const encodedSlug = encodeURIComponent(decodeURIComponent(slug));
  
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/slug/${encodedSlug}`,
      { 
        next: { revalidate: 3600 }, 
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59' } 
      }
    );
    return res.ok ? await res.json() : null;
  } catch (error) {
    console.error("Product Fetch Error:", error);
    return null;
  }
}

async function getRelatedProducts(categoryId: string | number, currentId: string | number) {
  if (!categoryId) return [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/explore-feed?category_id=${categoryId}&limit=15`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).filter((p: Product) => String(p.id) !== String(currentId));
  } catch (error) {
    return [];
  }
}

async function getSellerProducts(supplierId: string | number, currentId: string | number) {
  if (!supplierId) return [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/explore-feed?supplierId=${supplierId}&limit=25`,
      { next: { revalidate: 3600 } }
    );
    
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.products || []);
    
    return list.filter((p: Product) => String(p.id) !== String(currentId));
  } catch (error) {
    return [];
  }
}

// --- 2. IMAGE URL HELPER (Critical for WhatsApp) ---
function getAbsoluteImageUrl(imageInput: any): string {
  let imageUrl = `${SITE_URL}/placeholder.jpg`; // Default fallback

  try {
    const rawImgs = typeof imageInput === 'string' 
      ? JSON.parse(imageInput) 
      : imageInput;
    
    if (Array.isArray(rawImgs) && rawImgs.length > 0) {
      const img = rawImgs[0];
      if (img.startsWith("http")) {
        imageUrl = img;
      } else if (img.startsWith("/")) {
        imageUrl = `${SITE_URL}${img}`;
      } else {
        // Assume it's a relative path on R2 if it doesn't start with / or http
        imageUrl = `${R2_URL}/${img}`;
      }
    }
  } catch(e) {
    // If parsing fails, use fallback
  }
  return imageUrl;
}

// --- 3. METADATA GENERATION (WhatsApp & Facebook Optimization) ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return { title: "Product Not Found | SJ10", robots: { index: false } };
  }

  // Optimize Data for Meta Tags
  const mainImage = getAbsoluteImageUrl(product.image_urls);
  const price = product.discounted_price || product.price;
  const currency = "PKR";
  const title = `${product.title} - Best Price in Pakistan | SJ10`;
  const description = product.description 
    ? product.description.substring(0, 160).replace(/\n/g, ' ') 
    : `Buy ${product.title} online at the best price in Pakistan. Fast shipping and cash on delivery available.`;

  return {
    title: title,
    description: description,
    // Canonical URL prevents duplicate content issues
    alternates: {
      canonical: `${SITE_URL}/products/${product.slug}`,
    },
    // Open Graph = What shows on WhatsApp/Facebook
    openGraph: {
      title: product.title,
      description: description,
      url: `${SITE_URL}/products/${product.slug}`,
      siteName: 'SJ10 Shopping',
      images: [
        {
          url: mainImage,
          width: 1200, // Standard size for social cards
          height: 630,
          alt: product.title,
        },
      ],
      locale: 'en_PK',
      type: 'website', 
    },
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: description,
      images: [mainImage],
    },
    // Extended Product Metadata (For Facebook/Instagram Catalogs)
    other: {
      "product:price:amount": price,
      "product:price:currency": currency,
      "product:brand": product.supplier?.name || "SJ10",
      "product:availability": product.quantity > 0 ? "in stock" : "out of stock",
    }
  };
}

// --- 4. MAIN PAGE COMPONENT ---
export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  if (!currentSlug || currentSlug === 'undefined') notFound();

  // A. Fetch Main Product
  const product = await getProduct(currentSlug);
  if (!product) notFound();

  // B. Handle SKU Redirect (Self-Healing URLs)
  if (product.sku) {
    const decodedCurrent = decodeURIComponent(currentSlug);
    // If slug doesn't contain SKU but product has one, redirect to SEO friendly URL
    const expectedSlugEnd = `-${product.sku}`;
    if (!decodedCurrent.endsWith(expectedSlugEnd) && !decodedCurrent.includes(product.sku)) {
       // Only redirect if completely missing. 
       // Note: Be careful with infinite loops here.
    }
  }

  // C. Parallel Fetch for Related & Seller Products
  const [relatedProducts, sellerProducts] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getSellerProducts(product.supplier_id || product.supplier?.id, product.id)
  ]);

  // D. PREPARE GOOGLE SCHEMA (JSON-LD)
  // This is what makes the Stars and Price appear in Google Search
  const priceVal = parseFloat(String(product.discounted_price || product.price));
  const mainImageAbsolute = getAbsoluteImageUrl(product.image_urls);
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": [mainImageAbsolute],
    "description": product.description ? product.description.substring(0, 5000) : product.title,
    "sku": product.sku || String(product.id),
    "mpn": String(product.id),
    "brand": {
      "@type": "Brand",
      "name": product.supplier?.name || "SJ10 Shopping"
    },
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/products/${product.slug}`,
      "priceCurrency": "PKR",
      "price": priceVal,
      "priceValidUntil": "2026-12-31", // Future date ensures price looks valid to Google
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "SJ10 Shopping"
      },
      "shippingDetails": { 
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 200, 
          "currency": "PKR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "PK"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 5,
            "unitCode": "DAY"
          }
        }
      }
    },
    ...(product.avg_rating && product.avg_rating > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.avg_rating,
        "reviewCount": product.review_count || 1,
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {})
  };

  return (
    <>
      {/* Inject Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Render Client Component */}
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedProducts} 
        sellerProducts={sellerProducts} 
      />
    </>
  );
}