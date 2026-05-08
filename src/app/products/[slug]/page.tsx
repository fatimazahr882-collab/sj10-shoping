import { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { Product } from "@/components/ProductCard";

// ⚡ ISR CONFIGURATION (Fresh data every 1 hour)
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

// RELATED/SELLER FETCH (Kept same for logic flow)
async function getRelatedProducts(categoryId: string | number, currentId: string | number) {
  if (!categoryId) return [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/explore-feed?category_id=${categoryId}&limit=7`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).filter((p: Product) => String(p.id) !== String(currentId)).slice(0, 7);
  } catch (error) { return []; }
}

async function getSellerProducts(supplierId: string | number, currentId: string | number) {
  if (!supplierId) return [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/explore-feed?supplierId=${supplierId}&limit=7`);
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : (data.products || [])).filter((p: Product) => String(p.id) !== String(currentId)).slice(0, 7);
  } catch (error) { return []; }
}

// --- 2. HELPERS (Absolute URLs for AI Bots) ---
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
  } catch(e) {}
  return imageUrl;
}

// --- 3. METADATA GENERATION (The AI & SEO Secret Sauce) ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return { title: "Product Not Found | SJ10", robots: { index: false } };
  }

  const mainImage = getAbsoluteImageUrl(product.image_urls);
  const price = parseFloat(product.discounted_price || product.price) || 0;
  const originalPrice = parseFloat(product.price) || 0;
  const brandName = product.supplier?.name || product.supplier?.brand_name || "SJ10";
  const stockStatus = product.quantity > 0 ? "In Stock" : "Out of Stock";

  // SEO Friendly Title and Rich Description for AI Summaries
  const seoTitle = `${product.title} - Rs. ${price.toLocaleString()} Best Price in Pakistan | SJ10`;
  const seoDescription = `Buy ${product.title} by ${brandName} online at SJ10. Price: Rs. ${price.toLocaleString()}. Status: ${stockStatus}. 7-day return policy and cash on delivery available nationwide.`;

  const exactSlug = product.sku && String(product.sku).trim() !== '' ? `${product.slug}-${product.sku}` : product.slug;
  const fullProductUrl = `${SITE_URL}/products/${exactSlug}`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: fullProductUrl },
    openGraph: {
      title: product.title,
      description: seoDescription,
      url: fullProductUrl,
      siteName: 'SJ10 Shopping & Reselling Pakistan',
      images: [{ url: mainImage, alt: product.title }],
      locale: 'en_PK',
      type: 'website',
    },
    // AI Bot specific meta tags (AEO)
    other: {
        'product:price:amount': price,
        'product:price:currency': 'PKR',
        'product:availability': product.quantity > 0 ? 'instock' : 'oos',
        'product:brand': brandName,
        'product:condition': 'new',
        'product:retailer_item_id': product.sku || String(product.id)
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
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

  // Bulletproof Case-Insensitive SKU Redirect
  if (product.sku && String(product.sku).trim() !== '') {
    let decodedCurrent = currentSlug.toLowerCase();
    try { decodedCurrent = decodeURIComponent(currentSlug).toLowerCase(); } catch(e) { }
    const expectedSlugEnd = `-${String(product.sku).trim().toLowerCase()}`;
    if (!decodedCurrent.endsWith(expectedSlugEnd)) {
       permanentRedirect(`/products/${product.slug}-${product.sku}`);
    }
  }

  const [relatedProducts, sellerProducts] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getSellerProducts(product.supplier_id || product.supplier?.id, product.id)
  ]);

  const priceVal = parseFloat(String(product.discounted_price || product.price));
  const mainImageAbsolute = getAbsoluteImageUrl(product.image_urls);
  const exactSlug = product.sku ? `${product.slug}-${product.sku}` : product.slug;
  const fullProductUrl = `${SITE_URL}/products/${exactSlug}`;

  // ✅ 1. JSON-LD FOR AI SEARCH (Product Schema)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": [mainImageAbsolute],
    "description": product.description || product.title,
    "sku": product.sku || String(product.id),
    "mpn": String(product.id),
    "brand": { "@type": "Brand", "name": product.supplier?.name || "SJ10" },
    "offers": {
      "@type": "Offer",
      "url": fullProductUrl,
      "priceCurrency": "PKR",
      "price": priceVal,
      "priceValidUntil": "2026-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": { "@type": "Organization", "name": "SJ10 Shopping" }
    },
    ...(product.avg_rating && parseFloat(String(product.avg_rating)) > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": parseFloat(String(product.avg_rating)),
        "reviewCount": parseInt(String(product.review_count)) || 1
      }
    } : {})
  };

  // ✅ 2. JSON-LD FOR BREADCRUMBS (Helps AI understand site hierarchy)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { 
        "@type": "ListItem", 
        "position": 2, 
        "name": product.category_info?.name || 'Category', 
        "item": `${SITE_URL}/category/${product.category_info?.slug || 'all'}`
      },
      { "@type": "ListItem", "position": 3, "name": product.title, "item": fullProductUrl }
    ]
  };

  return (
    <>
      {/* Robot Food (Schema) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedProducts} 
        sellerProducts={sellerProducts} 
      />
    </>
  );
}