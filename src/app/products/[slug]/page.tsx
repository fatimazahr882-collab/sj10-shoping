import { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { Product } from "@/components/ProductCard";

// ⚡ ISR CONFIGURATION
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

// --- 2. IMAGE URL HELPER ---
function getAbsoluteImageUrl(imageInput: any): string {
  let imageUrl = `${SITE_URL}/placeholder.jpg`; 
  try {
    const rawImgs = typeof imageInput === 'string' ? JSON.parse(imageInput) : imageInput;
    if (Array.isArray(rawImgs) && rawImgs.length > 0) {
      const img = rawImgs[0];
      if (img.startsWith("http")) imageUrl = img;
      else if (img.startsWith("/")) imageUrl = `${SITE_URL}${img}`;
      else imageUrl = `${R2_URL}/${img}`;
    }
  } catch(e) {}
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

  // A. Core Data Extraction
  const mainImage = getAbsoluteImageUrl(product.image_urls);
  const price = product.discounted_price || product.price;
  const formattedPrice = new Intl.NumberFormat('en-PK').format(price);
  const currency = "PKR";
  
  // SEO Exact URL (slug-sku)
  const exactSlug = product.sku && String(product.sku).trim() !== '' 
    ? `${product.slug}-${product.sku}` 
    : product.slug;
  const fullProductUrl = `${SITE_URL}/products/${exactSlug}`;

  // B. Google SEO Description (Clean text, no emojis)
  const seoTitle = `${product.title} - Best Price in Pakistan | SJ10`;
  const baseDescription = product.description 
    ? product.description.substring(0, 150).replace(/\n/g, ' ') 
    : `Buy ${product.title} online at the best price in Pakistan. Fast shipping and cash on delivery available.`;

  // 🔥 C. Social Media Rich Description (Injects Stars & Price for WhatsApp/FB)
  let socialStats = `💰 Rs. ${formattedPrice}`;
  if (product.avg_rating && product.avg_rating > 0) {
    // Generates stars: e.g., 4.5 rating -> ⭐⭐⭐⭐⭐ (Rounds up for visual impact)
    const starCount = Math.round(product.avg_rating);
    const stars = '⭐'.repeat(starCount > 5 ? 5 : starCount);
    socialStats += ` | ${stars} ${product.avg_rating}/5 (${product.review_count || 0} Reviews)`;
  }
  const richSocialDescription = `${socialStats} | ${baseDescription}`;

  return {
    title: seoTitle,
    description: baseDescription, // Clean text for Google Bot
    alternates: {
      canonical: fullProductUrl, 
    },
    // Open Graph = What shows on WhatsApp/Facebook
    openGraph: {
      title: product.title,
      description: richSocialDescription, // 🔥 Shows Stars + Price in WhatsApp preview
      url: fullProductUrl, 
      siteName: 'SJ10 Shopping',
      images: [
        {
          url: mainImage,
          width: 1200, 
          height: 630,
          alt: product.title,
        },
      ],
      locale: 'en_PK',
      type: 'website', 
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: richSocialDescription, // 🔥 Shows Stars + Price in Twitter/X preview
      images: [mainImage],
    },
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

  const product = await getProduct(currentSlug);
  if (!product) notFound();

  // 🔥 CRITICAL BUG FIX: Case-Insensitive Redirect Logic
  // This prevents the infinite redirect loop that crashed the WhatsApp/FB Bots
  if (product.sku && String(product.sku).trim() !== '') {
    const decodedCurrent = decodeURIComponent(currentSlug).toLowerCase();
    const expectedSlugEnd = `-${String(product.sku).trim().toLowerCase()}`;
    
    // If it doesn't end with the SKU (ignoring case), fix it!
    if (!decodedCurrent.endsWith(expectedSlugEnd)) {
       const exactCorrectSlug = `${product.slug}-${product.sku}`;
       permanentRedirect(`/products/${exactCorrectSlug}`);
    }
  }

  // Parallel Fetch for Related & Seller Products
  const [relatedProducts, sellerProducts] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getSellerProducts(product.supplier_id || product.supplier?.id, product.id)
  ]);

  // PREPARE GOOGLE SCHEMA (JSON-LD)
  const priceVal = parseFloat(String(product.discounted_price || product.price));
  const mainImageAbsolute = getAbsoluteImageUrl(product.image_urls);
  
  const exactSlug = product.sku && String(product.sku).trim() !== '' 
    ? `${product.slug}-${product.sku}` 
    : product.slug;
  const fullProductUrl = `${SITE_URL}/products/${exactSlug}`;

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
      "url": fullProductUrl, 
      "priceCurrency": "PKR",
      "price": priceVal,
      "priceValidUntil": "2026-12-31", 
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedProducts} 
        sellerProducts={sellerProducts} 
      />
    </>
  );
}