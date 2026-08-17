// src/components/HomeSubcategories.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';

type Subcategory = {
  id: string;
  name: string;
  image_url: string | null;
  slug: string;
};

// 🟢 ULTRA-COMPRESSION: Converted to Eco-WebP with exact 80px width (Size < 1.5 KB per icon)
const getOptimizedUrl = (url: string | null) => {
  if (!url) return '/placeholder.jpg';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/w_80,c_scale,q_auto:eco,f_webp/');
  }
  return url;
};

function SubcategoryItem({ cat, priority }: { cat: Subcategory, priority: boolean }) {
  const optimizedSrc = getOptimizedUrl(cat.image_url);

  return (
    <Link href={`/category/${cat.slug}`} className="explore-item">
      <div className="img-wrapper">
        <Image
          src={optimizedSrc}
          alt="" /* 🟢 Empty alt prevents redundant screen reader announcement */
          aria-hidden="true"
          fill
          style={{ objectFit: 'contain' }}
          sizes="60px"
          priority={priority}
          unoptimized={true} 
          className="loaded"
        />
      </div>
      <p>{cat.name}</p>
    </Link>
  );
}

interface HomeSubcategoriesProps {
  subcategories: Subcategory[];
  title?: string;
  priority?: boolean;
}

export default function HomeSubcategories({ subcategories, title = "Explore Categories", priority = false }: HomeSubcategoriesProps) {
  if (!subcategories || subcategories.length === 0) return null;

  return (
    <div className="home-subcat-premium-container">
      <div className="subcat-header">
        <div className="icon-box">
          <i className="fas fa-layer-group"></i>
        </div>
        <h2 className="subcat-title">{title}</h2>
      </div>

      <div className="explore-grid" id="home-subcategories">
        {subcategories.map((cat, index) => (
          <SubcategoryItem key={cat.id} cat={cat} priority={priority && index < 4} />
        ))}
      </div>

      <style jsx>{`
        .home-subcat-premium-container {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          margin: 15px 12px;
          padding: 16px 0;
          border-radius: 16px;
          border: 1px solid #fed7aa;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.05);
          min-height: 230px; /* 🟢 Reserves exact mobile height to kill CLS */
        }

        @media (min-width: 768px) {
          .home-subcat-premium-container {
            min-height: 180px; /* 🟢 Reserves desktop height */
            margin: 20px 15px;
          }
        }

        .subcat-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          margin-bottom: 14px;
        }

        .icon-box {
          width: 28px;
          height: 28px;
          background: #f97316;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
        }

        .subcat-title {
          font-size: 14px;
          font-weight: 800;
          color: #9a3412;
          margin: 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .explore-grid {
          padding: 0 12px !important;
        }
      `}</style>
    </div>
  );
}