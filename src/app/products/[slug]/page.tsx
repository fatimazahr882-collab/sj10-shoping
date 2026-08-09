import { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { Product } from "@/components/ProductCard";

// ⚡ ISR CONFIGURATION
export const dynamic = 'force-static'; 
export const revalidate = 0;    
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
  
  let encodedSlug = slug;
  try {
    encodedSlug = encodeURIComponent(decodeURIComponent(slug));
  } catch (e) {
    encodedSlug = encodeURIComponent(slug);
  }

  try {
   const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/slug/${encodedSlug}`,
      { 
        cache: 'no-store' // Tells Vercel: Do NOT cache internally! Always ask Redis/Gateway.
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
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/explore-feed?category_id=${categoryId}&limit=7`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).filter((p: Product) => String(p.id) !== String(currentId)).slice(0, 7);
  } catch (error) {
    return [];
  }
}

async function getSellerProducts(supplierId: string | number, currentId: string | number) {
  if (!supplierId) return [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/explore-feed?supplierId=${supplierId}&limit=7`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.products || []);
    return list.filter((p: Product) => String(p.id) !== String(currentId)).slice(0, 7);
  } catch (error) {
    return [];
  }
}

// --- 2. HELPERS (Images & Text Formatting) ---
function getAllAbsoluteImageUrls(imageInput: any): string[] {
  let imageUrls: string[] = [`${SITE_URL}/placeholder.jpg`]; 
  try {
    let rawImgs = imageInput;
    if (typeof imageInput === 'string') {
      try { rawImgs = JSON.parse(imageInput); } catch(e) { rawImgs = [imageInput]; }
    }
    
    if (Array.isArray(rawImgs) && rawImgs.length > 0) {
      imageUrls = rawImgs.map(img => {
        if (!img) return `${SITE_URL}/placeholder.jpg`;
        if (img.startsWith("http")) return img;
        if (img.startsWith("/")) return `${SITE_URL}${img}`;
        return `${R2_URL}/${img}`;
      });
    }
  } catch(e) {
    console.error("Image Parse Error:", e);
  }
  return imageUrls;
}

function getStrikethroughText(text: string) {
  return text.split('').map(char => char + '\u0336').join('');
}

// --- 3. METADATA GENERATION (WhatsApp, Facebook, Twitter & Google Search) ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return { title: "Product Not Found | SJ10 Shopping", robots: { index: false } };
  }

  const allImages = getAllAbsoluteImageUrls(product.image_urls);
  const mainImage = allImages[0] || `${SITE_URL}/placeholder.jpg`;
  
  const originalPrice = parseFloat(product.price) || 0;
  const discountPrice = parseFloat(product.discounted_price || product.price) || originalPrice;
  const formatPKR = (num: number) => new Intl.NumberFormat('en-PK').format(num);

  const exactSlug = product.sku && String(product.sku).trim() !== '' 
    ? `${product.slug}-${product.sku}` 
    : product.slug;
  const fullProductUrl = `${SITE_URL}/products/${exactSlug}`;

  const hasVideo = product.video_url || (typeof product.image_urls === 'string' && product.image_urls.includes('.mp4'));
  const videoBadge = hasVideo ? '▶️ [VIDEO] ' : '';

  let priceDisplay = `💰 Rs. ${formatPKR(discountPrice)}`;
  if (discountPrice < originalPrice) {
    const oldPriceStrike = getStrikethroughText(`Rs. ${formatPKR(originalPrice)}`);
    priceDisplay = `✅ Rs. ${formatPKR(discountPrice)} | ❌ ${oldPriceStrike}`;
  }

  let starDisplay = '';
  if (product.avg_rating && product.avg_rating > 0) {
    const starCount = Math.round(product.avg_rating);
    const stars = '⭐'.repeat(starCount > 5 ? 5 : starCount);
    starDisplay = ` | ${stars} ${product.avg_rating}/5 (${product.review_count || product.total_reviews_count || 0} Reviews)`;
  }

  const socialTitle = `${videoBadge}${product.title}`;
  const seoTitle = `Buy ${product.title} Online at Best Price in Pakistan | SJ10`;
  
  const baseDesc = product.description 
    ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 150).replace(/\n/g, ' ') 
    : `Buy ${product.title} online at wholesale price in Pakistan with Cash on Delivery at SJ10.pk.`;
    
  const richSocialDescription = `${priceDisplay}${starDisplay}\n\n${baseDesc}...`;

  return {
    title: seoTitle,
    description: baseDesc, 
    alternates: { canonical: fullProductUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: socialTitle,
      description: richSocialDescription, 
      url: fullProductUrl, 
      siteName: 'SJ10 Shopping Pakistan',
      images: allImages.map(img => ({ url: img, alt: product.title })),
      locale: 'en_PK',
      type: 'article', 
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: richSocialDescription,
      images: [mainImage],
    },
  };
}

// --- 4. MAIN SERVER PAGE COMPONENT ---
export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  if (!currentSlug || currentSlug === 'undefined') notFound();

  const product = await getProduct(currentSlug);
  if (!product) notFound();

  // 🔥 CRITICAL REDIRECT FIX: Bulletproof Case-Insensitive Check
  if (product.sku && String(product.sku).trim() !== '') {
    let decodedCurrent = currentSlug.toLowerCase();
    try { decodedCurrent = decodeURIComponent(currentSlug).toLowerCase(); } catch(e) { }

    const expectedSlugEnd = `-${String(product.sku).trim().toLowerCase()}`;
    if (!decodedCurrent.endsWith(expectedSlugEnd)) {
       const exactCorrectSlug = `${product.slug}-${product.sku}`;
       permanentRedirect(`/products/${exactCorrectSlug}`);
    }
  }

  const [relatedProducts, sellerProducts] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getSellerProducts(product.supplier_id || product.supplier?.id, product.id)
  ]);

  // PREPARE GOOGLE SCHEMA (JSON-LD)
  const priceVal = parseFloat(String(product.discounted_price || product.price));
  const allImagesAbsolute = getAllAbsoluteImageUrls(product.image_urls);
  const exactSlug = product.sku && String(product.sku).trim() !== '' ? `${product.slug}-${product.sku}` : product.slug;
  const fullProductUrl = `${SITE_URL}/products/${exactSlug}`;

  // 1. BREADCRUMB SCHEMA FOR GOOGLE
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      ...(product.category_info?.parent_name ? [{
        "@type": "ListItem", "position": 2, "name": product.category_info.parent_name, "item": `${SITE_URL}/category/${product.category_info.parent_slug}`
      }] : []),
      { 
        "@type": "ListItem", 
        "position": product.category_info?.parent_name ? 3 : 2, 
        "name": product.category_info?.name || 'Category', 
        "item": `${SITE_URL}/category/${product.category_info?.slug || 'all'}`
      },
      {
        "@type": "ListItem",
        "position": product.category_info?.parent_name ? 4 : 3,
        "name": product.title,
        "item": fullProductUrl
      }
    ]
  };

  // 2. 🟢 ADVANCED GOOGLE MERCHANT & PRODUCT SCHEMA
  const productReviews = Array.isArray(product.reviews) ? product.reviews : [];
  
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": allImagesAbsolute, // 🟢 Passes ALL images to Google Image Search!
    "description": product.description ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 5000) : product.title,
    "sku": product.sku || String(product.id),
    "mpn": product.sku || String(product.id),
    "brand": { 
      "@type": "Brand", 
      "name": product.supplier?.brand_name || product.supplier?.name || "SJ10 Shopping" 
    },
    "offers": {
      "@type": "Offer",
      "url": fullProductUrl, 
      "priceCurrency": "PKR",
      "price": priceVal,
      "priceValidUntil": "2027-12-31", 
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": { 
        "@type": "Organization", 
        "name": product.supplier?.brand_name || "SJ10 Shopping Pakistan" 
      },
      // 🟢 GOOGLE MERCHANT SHIPPING DETAILS
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 165,
          "currency": "PKR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "PK"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 4, "unitCode": "DAY" }
        }
      },
      // 🟢 GOOGLE MERCHANT 7-DAY RETURN POLICY
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "PK",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    },
    // 🟢 AGGREGATE RATING SCHEMA
    ...(product.avg_rating && parseFloat(String(product.avg_rating)) > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": parseFloat(String(product.avg_rating)).toFixed(1),
        "reviewCount": parseInt(String(product.review_count || product.total_reviews_count || 1)),
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {}),
    // 🟢 INDIVIDUAL CUSTOMER REVIEWS SCHEMA
    ...(productReviews.length > 0 ? {
      "review": productReviews.slice(0, 5).map((r: any) => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": r.rating || 5,
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": r.user_name || "Verified Customer"
        },
        "reviewBody": r.comment || "Great product quality!",
        "datePublished": r.created_at || new Date().toISOString()
      }))
    } : {})
  };

  // 3. 🟢 GOOGLE FAQ PAGE SCHEMA (Long-Tail Search Boost)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Is Cash on Delivery (COD) available for ${product.title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, Cash on Delivery (COD) is available across all cities in Pakistan including Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Multan, and Quetta.`
        }
      },
      {
        "@type": "Question",
        "name": `How long will delivery take for ${product.title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Standard delivery takes 2 to 4 business days across Pakistan via courier partners like Leopards, TCS, and PostEx.`
        }
      },
      {
        "@type": "Question",
        "name": `What is the return policy for ${product.title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `SJ10 Shopping offers a 7-day hassle-free return and replacement policy for defective or damaged items.`
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedProducts} 
        sellerProducts={sellerProducts} 
      />
    </>
  );
}