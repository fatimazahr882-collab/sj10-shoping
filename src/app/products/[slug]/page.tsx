// 🔥 FIX: 'OpenGraph' ko yahan se hata dein
import { Metadata, ResolvingMetadata } from "next"; 
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import ProductCard, { type Product } from "@/components/ProductCard";

// --- Configuration ---
export const revalidate = 3600; 
export const dynamicParams = true; 

type Props = {
  params: Promise<{ slug: string }>;
};

// --- Helper Functions (No Change) ---
async function getProduct(slug: string): Promise<any | null> {
  if (!slug || slug === 'undefined') return null;
  const decodedSlug = decodeURIComponent(slug);
  const encodedSlug = encodeURIComponent(decodedSlug);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/slug/${encodedSlug}`,
      { next: { revalidate: 3600 } }
    );
    return res.ok ? await res.json() : null;
  } catch (error) {
    return null;
  }
}

async function getRelatedProducts(categoryId: string | number, currentProductId: string | number) {
  if (!categoryId) return [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products?category=${categoryId}&limit=8`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.products) 
      ? data.products.filter((p: Product) => p.id !== currentProductId) 
      : [];
  } catch (error) {
    return [];
  }
}

// --- SEO: Generate Metadata ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found", robots: { index: false } };
  }

  const title = `${product.title} - ${product.sku || 'Best Price'} | SJ10`;
  const description = product.description 
    ? product.description.substring(0, 160).replace(/\n/g, ' ') 
    : `Buy ${product.title} at the best price in Pakistan.`;
  
  const mainImage = Array.isArray(product.image_urls) 
    ? product.image_urls[0] 
    : (JSON.parse(product.image_urls || '[]')[0] || '/placeholder.jpg');

  const cleanSlug = product.sku ? `${product.slug}-${product.sku}` : product.slug;
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${cleanSlug}`;

  // 🔥 YEH RAHA FINAL FIX! Humne :OpenGraph type hata di hai 🔥
  const openGraphData = {
      title: title,
      description: description,
      url: canonicalUrl,
      images: [{ url: mainImage }],
      type: "website",
      siteName: "SJ10"
  };

  return {
    title: title,
    description: description,
    openGraph: openGraphData,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}


// --- Main Page Component (No Change) ---
export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  if (!currentSlug || currentSlug === 'undefined') notFound();

  const product = await getProduct(currentSlug);
  if (!product) notFound();

  if (product.sku) {
    const decodedCurrent = decodeURIComponent(currentSlug);
    const expectedSlug = `${product.slug}-${product.sku}`;
    if (decodedCurrent !== expectedSlug && !decodedCurrent.endsWith(product.sku)) {
      permanentRedirect(`/products/${expectedSlug}`);
    }
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id);

  const mainImage = Array.isArray(product.image_urls) 
    ? product.image_urls[0] 
    : (JSON.parse(product.image_urls || '[]')[0] || '/placeholder.jpg');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: mainImage,
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
      reviewCount: product.total_reviews_count || 0
    } : undefined
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product}>
        {relatedProducts.length > 0 && relatedProducts.map((p: Product) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </ProductDetailClient>
    </>
  );
}