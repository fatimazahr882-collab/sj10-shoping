import { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { Product } from "@/components/ProductCard";

// ⚡ ISR CONFIGURATION
export const revalidate = 3600; 
export const dynamicParams = true; 

const SITE_URL = "https://www.sj10.pk";
const R2_URL = "https://media.sj10.pk";

type Props = {
  params: Promise<{ slug: string }>;
};

// --- DATA FETCHING HELPERS ---

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

// ⚡ UPDATED: Fetch More From Seller (Now uses supplierId param correctly)
async function getSellerProducts(supplierId: string | number, currentId: string | number) {
  if (!supplierId) return [];
  try {
    // We utilize the explore-feed endpoint which now supports 'supplierId' logic
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/explore-feed?supplierId=${supplierId}&limit=25`,
      { next: { revalidate: 3600 } }
    );
    
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.products || []);
    
    return list.filter((p: Product) => String(p.id) !== String(currentId));
  } catch (error) {
    console.error("Seller Products Error", error);
    return [];
  }
}

// --- SEO GENERATION (UNCHANGED) ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found | SJ10", robots: { index: false } };
  }

  let mainImage = `${SITE_URL}/placeholder.jpg`;
  try {
    const imgs = typeof product.image_urls === 'string' 
      ? JSON.parse(product.image_urls) 
      : product.image_urls;
    if (Array.isArray(imgs) && imgs.length > 0) {
      const img = imgs[0];
      if (img.startsWith("http")) mainImage = img;
      else if (img.startsWith("/")) mainImage = `${SITE_URL}${img}`;
      else mainImage = `${R2_URL}/${img}`;
    }
  } catch(e) {}

  const price = parseFloat(product.discounted_price || product.price);
  const title = `${product.title} | SJ10 Shopping`;
  const canonicalUrl = `${SITE_URL}/products/${product.slug}`;

  return {
    title: title,
    description: `Buy ${product.title} at Rs. ${price.toLocaleString()}.`,
    openGraph: {
      title: title,
      images: [{ url: mainImage, width: 1200, height: 630, alt: product.title }],
      url: canonicalUrl,
    },
    alternates: { canonical: canonicalUrl },
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

  // Handle SKU redirect
  if (product.sku) {
    const decodedCurrent = decodeURIComponent(currentSlug);
    const expectedSlug = `${product.slug}-${product.sku}`;
    if (decodedCurrent !== expectedSlug && !decodedCurrent.endsWith(product.sku)) {
      permanentRedirect(`/products/${expectedSlug}`);
    }
  }

  // 2. Parallel Fetch for Related & Seller Products
  const [relatedProducts, sellerProducts] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getSellerProducts(product.supplier_id || product.supplier?.id, product.id)
  ]);

  // 3. Schema Markup
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
      priceCurrency: "PKR",
      price: product.discounted_price || product.price,
      availability: product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
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