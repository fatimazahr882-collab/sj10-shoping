// src/components/CategoryRows.tsx
import ProductCardLite from './ProductCardLite';
import Link from 'next/link';

export default function CategoryRows({ initialData }: { initialData: any[] }) {
  if (!initialData || initialData.length === 0) return null;

  return (
    <div id="home-category-rows-container">
      {initialData.map((category: any) => (
        <div key={category.category_id} className="category-product-row">
          <div className="category-row-header">
            <h2 className="section-title">{category.category_name}</h2>
            <Link href={`/category/${category.category_slug}`} className="see-all-btn">
              See All
            </Link>
          </div>
          <div className="product-grid">
            {category.products.map((product: any) => (
              <ProductCardLite key={product.id} product={{
                  id: product.id,
                  t: product.title,
                  s: product.slug,
                  sku: product.sku,
                  p: parseFloat(product.price),
                  dp: parseFloat(product.discounted_price || product.price),
                  img: Array.isArray(product.image_urls) ? product.image_urls[0] : product.image_url,
                  v: ['verified', '1', 'true'].includes(String(product.supplier_verified || "").toLowerCase()),
                  b: product.supplier?.brand_name || 'SJ10',
                  r: parseFloat(String(product.avg_rating || 0)),
                  rc: parseInt(String(product.review_count || 0)),
                  // ✅ ADDED VIDEO FLAG
                  hv: product.has_video || false
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}