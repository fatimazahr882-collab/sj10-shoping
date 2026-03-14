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
  
  let encodedSlug = slug;
  try {
    // Safely decode and re-encode to prevent 500 crashes on malformed URLs
    encodedSlug = encodeURIComponent(decodeURIComponent(slug));
  } catch (e) {
    encodedSlug = encodeURIComponent(slug);
  }

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

// --- 2. HELPERS (Images & Text Formatting) ---

// Guarantees a high-quality absolute image URL without crashing
function getAbsoluteImageUrl(imageInput: any): string {
  let imageUrl = `${SITE_URL}/placeholder.jpg`; 
  try {
    let rawImgs = imageInput;
    if (typeof imageInput === 'string') {
      try { rawImgs = JSON.parse(imageInput); } catch(e) { rawImgs = [imageInput]; }
    }
    
    if (Array.isArray(rawImgs) && rawImgs.length > 0 && rawImgs[0]) {
      const img = rawImgs[0];
      if (img.startsWith("http")) imageUrl = img;
      else if (img.startsWith("/")) imageUrl = `${SITE_URL}${img}`;
      else imageUrl = `${R2_URL}/${img}`;
    }
  } catch(e) {
    console.error("Image Parse Error:", e);
  }
  return imageUrl;
}

// Generates a Unicode Cut-Mark (Strikethrough) for Facebook & WhatsApp
function getStrikethroughText(text: string) {
  return text.split('').map(char => char + '\u0336').join('');
}

// --- 3. METADATA GENERATION (The Core Social Media Fix) ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return { title: "Product Not Found | SJ10", robots: { index: false } };
  }

  // A. Image & Basic Data
  const mainImage = getAbsoluteImageUrl(product.image_urls);
  const price = parseFloat(product.price) || 0;
  const discountPrice = parseFloat(product.discounted_price || product.price) || 0;
  const formatPKR = (num: number) => new Intl.NumberFormat('en-PK').format(num);

  // B. Exact URL Logic
  const exactSlug = product.sku && String(product.sku).trim() !== '' 
    ? `${product.slug}-${product.sku}` 
    : product.slug;
  const fullProductUrl = `${SITE_URL}/products/${exactSlug}`;

  // C. Video Indicator Logic
  const hasVideo = product.video_url || (typeof product.image_urls === 'string' && product.image_urls.includes('.mp4'));
  const videoBadge = hasVideo ? '▶️ [VIDEO] ' : '';

  // D. Strikethrough Price Logic
  let priceDisplay = `💰 Rs. ${formatPKR(discountPrice)}`;
  if (discountPrice < price) {
    const oldPriceStrike = getStrikethroughText(`Rs. ${formatPKR(price)}`);
    priceDisplay = `✅ Rs. ${formatPKR(discountPrice)} | ❌ ${oldPriceStrike}`;
  }

  // E. Review Stars Logic
  let starDisplay = '';
  if (product.avg_rating && product.avg_rating > 0) {
    const starCount = Math.round(product.avg_rating);
    const stars = '⭐'.repeat(starCount > 5 ? 5 : starCount);
    starDisplay = ` | ${stars} ${product.avg_rating}/5 (${product.review_count || 0} Reviews)`;
  }

  // F. Constructing Final Strings
  const socialTitle = `${videoBadge}${product.title}`;
  const seoTitle = `${product.title} - Best Price in Pakistan | SJ10`;
  
  const baseDesc = product.description 
    ? product.description.substring(0, 140).replace(/\n/g, ' ') 
    : `Buy ${product.title} online in Pakistan.`;
    
  // This is what WhatsApp and Facebook users will see
  const richSocialDescription = `${priceDisplay}${starDisplay}\n\n${baseDesc}...`;

  return {
    title: seoTitle,
    description: baseDesc, // Keep clean for Google Bot
    alternates: { canonical: fullProductUrl },
    openGraph: {
      title: socialTitle,
      description: richSocialDescription, 
      url: fullProductUrl, 
      siteName: 'SJ10 Shopping',
      images: [
        {
          url: mainImage,
          alt: product.title,
          // ⚠️ NOTICE: Width & Height have been INTENTIONALLY REMOVED here. 
          // This prevents Facebook from chopping off vertical product images.
        },
      ],
      locale: 'en_PK',
      type: 'website', 
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: richSocialDescription,
      images: [mainImage],
    },
  };
}

// --- 4. MAIN PAGE COMPONENT ---
export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  if (!currentSlug || currentSlug === 'undefined') notFound();

  const product = await getProduct(currentSlug);
  if (!product) notFound();

  // 🔥 CRITICAL REDIRECT FIX: Bulletproof Case-Insensitive Check
  if (product.sku && String(product.sku).trim() !== '') {
    let decodedCurrent = currentSlug.toLowerCase();
    try {
      decodedCurrent = decodeURIComponent(currentSlug).toLowerCase();
    } catch(e) { /* Ignore decode errors */ }

    const expectedSlugEnd = `-${String(product.sku).trim().toLowerCase()}`;
    
    // Redirect cleanly without causing infinite bot loops
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

  // PREPARE GOOGLE SCHEMA (JSON-LD) for SEO
  const priceVal = parseFloat(String(product.discounted_price || product.price));
  const mainImageAbsolute = getAbsoluteImageUrl(product.image_urls);
  const exactSlug = product.sku && String(product.sku).trim() !== '' ? `${product.slug}-${product.sku}` : product.slug;
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
      }
    },
    // 🔥 GOOGLE SEO STARS & REVIEWS: This ensures stars appear in Google Search Results
    ...(product.avg_rating && parseFloat(String(product.avg_rating)) > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": parseFloat(String(product.avg_rating)),
        "reviewCount": parseInt(String(product.review_count)) || 1,
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