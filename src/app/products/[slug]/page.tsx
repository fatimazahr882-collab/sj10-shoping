import { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { Product } from "@/components/ProductCard";

// ⚡ ISR CONFIGURATION: Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600; 
export const dynamicParams = true; // Allow new products to be generated on demand

type Props = {
  params: Promise<{ slug: string }>;
};

// --- DATA FETCHING HELPERS ---

// 1. Fetch Main Product
async function getProduct(slug: string) {
  if (!slug || slug === 'undefined') return null;
  const encodedSlug = encodeURIComponent(decodeURIComponent(slug));
  
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/slug/${encodedSlug}`,
      { 
        next: { revalidate: 3600 }, // ISR Cache
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59' } 
      }
    );
    return res.ok ? await res.json() : null;
  } catch (error) {
    console.error("Product Fetch Error:", error);
    return null;
  }
}

// 2. Fetch Related Products (By Category) - Limit 15
async function getRelatedProducts(categoryId: string | number, currentId: string | number) {
  if (!categoryId) return [];
  try {
    // Attempting to use explore-feed for better ranking, fallback to standard if needed
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/explore-feed?category_id=${categoryId}&limit=15`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    // Filter out current product
    return (data.products || []).filter((p: Product) => String(p.id) !== String(currentId));
  } catch (error) {
    return [];
  }
}

// 3. Fetch More From Seller - Limit 25
async function getSellerProducts(supplierId: string | number, currentId: string | number) {
  if (!supplierId) return [];
  try {
    // Fetch specifically for this supplier
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products?supplierId=${supplierId}&limit=25`,
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

// --- SEO: GENERATE METADATA FOR WHATSAPP/GOOGLE ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found | SJ10", robots: { index: false } };
  }

  // Parse Images for Metadata
  let mainImage = '/placeholder.jpg';
  try {
    const imgs = typeof product.image_urls === 'string' 
      ? JSON.parse(product.image_urls) 
      : product.image_urls;
    if (Array.isArray(imgs) && imgs.length > 0) mainImage = imgs[0];
  } catch(e) {}

  // Calculate Price for Display
  const price = parseFloat(product.discounted_price || product.price);
  const originalPrice = parseFloat(product.price);
  const rating = product.avg_rating || 0;
  
  // 🔥 DARAZ-STYLE TITLE & DESCRIPTION 🔥
  // This format ensures Price and Rating show up in WhatsApp/FB previews
  const title = `${product.title} | SJ10 Shopping`;
  
  let description = `Rs. ${price.toLocaleString()}`;
  if (price < originalPrice) {
    description += ` (Rs. ${originalPrice.toLocaleString()})`;
  }
  if (rating > 0) {
    description += ` | ★ ${Number(rating).toFixed(1)} Rating`;
  }
  description += `. ${product.description ? product.description.substring(0, 120).replace(/\n/g, ' ') : 'Buy now at the best price in Pakistan.'}...`;

  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
      siteName: "SJ10 Online Shopping",
      images: [
        {
          url: mainImage,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      locale: "en_US",
      type: "website",
      // @ts-ignore - Custom properties for product rich pins
      product: {
        price: { amount: price, currency: 'PKR' }
      }
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [mainImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// --- MAIN PAGE COMPONENT ---
export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  if (!currentSlug || currentSlug === 'undefined') notFound();

  // 1. Fetch Main Product
  const product = await getProduct(currentSlug);
  if (!product) notFound();

  // Handle SKU redirect if URL doesn't match preferred format
  if (product.sku) {
    const decodedCurrent = decodeURIComponent(currentSlug);
    const expectedSlug = `${product.slug}-${product.sku}`;
    if (decodedCurrent !== expectedSlug && !decodedCurrent.endsWith(product.sku)) {
      permanentRedirect(`/products/${expectedSlug}`);
    }
  }

  // 2. Parallel Fetch for Related & Seller Products (Fast Server-Side Fetch)
  // This eliminates the client-side loading delay for these sections
  const [relatedProducts, sellerProducts] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getSellerProducts(product.supplier_id || product.supplier?.id, product.id)
  ]);

  // 3. Schema Markup for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: typeof product.image_urls === 'string' ? JSON.parse(product.image_urls) : product.image_urls,
    description: product.description,
    sku: product.sku || product.id,
    brand: { "@type": "Brand", name: product.supplier?.name || "SJ10 Store" },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${currentSlug}`,
      priceCurrency: "PKR",
      price: product.discounted_price || product.price,
      availability: product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating: product.avg_rating ? {
      "@type": "AggregateRating",
      ratingValue: product.avg_rating,
      reviewCount: product.total_reviews_count || 1 // Fallback to 1 to show stars if rating exists
    } : undefined
  };

  return (
    <>
      {/* Inject JSON-LD for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Pass all data to Client Component */}
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedProducts} 
        sellerProducts={sellerProducts} 
      />
    </>
  );
}