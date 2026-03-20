// src/components/CategoryRows.tsx
import ProductCard, { type Product } from './ProductCard';
import Link from 'next/link';

// We now accept the data directly from the server (page.tsx)
export default function CategoryRows({ initialData }: { initialData: any[] }) {
  
  if (!initialData || initialData.length === 0) {
    return null;
  }

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
            {category.products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}