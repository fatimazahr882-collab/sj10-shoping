"use client";

import Link from 'next/link';
import Image from 'next/image';

type Subcategory = {
  id: string;
  name: string;
  image_url: string | null;
  slug: string;
};

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : Buffer.from(str).toString('base64');

const getOptimizedUrl = (url: string | null) => {
  if (!url) return '/placeholder.jpg';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/w_200,f_auto,q_auto:good/');
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
          alt={cat.name}
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 768px) 33vw, 150px"
          priority={priority} // Priority logic is strictly preserved!
          unoptimized={true} 
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(150, 150))}`}
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
      
      {/* Beautiful Smaller Header */}
      <div className="subcat-header">
        <div className="icon-box">
          <i className="fas fa-layer-group"></i>
        </div>
        <h2 className="subcat-title">{title}</h2>
      </div>

      {/* Grid mapping (CSS is handled globally in your app) */}
      <div className="explore-grid" id="home-subcategories">
        {subcategories.map((cat, index) => (
          <SubcategoryItem key={cat.id} cat={cat} priority={priority && index < 6} />
        ))}
      </div>

      {/* Scoped CSS for the new premium look */}
      <style jsx>{`
        .home-subcat-premium-container {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); /* Beautiful Light Orange Gradient */
          margin: 20px 15px; /* Gives it a card-like floating look */
          padding: 20px 0;
          border-radius: 20px;
          border: 1px solid #fed7aa; /* Subtle orange border */
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.05); /* Soft orange shadow */
        }

        .subcat-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px;
          margin-bottom: 18px;
        }

        .icon-box {
          width: 32px;
          height: 32px;
          background: #f97316; /* Primary Orange */
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
        }

        .subcat-title {
          font-size: 16px; /* Smaller, cleaner font size */
          font-weight: 800;
          color: #9a3412; /* Dark orange/brown text for readability */
          margin: 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* Adjusting the grid padding so it fits nicely inside our new container */
        .explore-grid {
          padding: 0 15px !important;
        }
      `}</style>
    </div>
  );
}