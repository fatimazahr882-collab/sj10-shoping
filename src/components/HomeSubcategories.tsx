"use client";

import Link from 'next/link';
import Image from 'next/image';

type Subcategory = {
  id: string;
  name: string;
  image_url: string | null;
  slug: string;
};

// --- 1. SPEED HELPERS ---

// A. Shimmer Effect (Instant visual feedback without JS loader)
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
    : window.btoa(str);

// B. AGGRESSIVE OPTIMIZER
// Reduces 2MB images to ~5KB for instant mobile loading
const getAggressiveOptimizedUrl = (url: string | null) => {
  if (!url) return '/placeholder.jpg';
  
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // w_150: Resize to 150px (Small enough for icon, big enough for retina)
    // q_auto:low: Aggressive compression. It's an icon, we don't need HD details.
    // f_auto: Force WebP/AVIF
    return url.replace('/upload/', '/upload/w_150,q_auto:low,f_auto/');
  }
  return url;
};

// --- 2. COMPONENT ---

function SubcategoryItem({ cat, priority }: { cat: Subcategory, priority: boolean }) {
  // Pre-calculate the optimized URL
  const optimizedSrc = getAggressiveOptimizedUrl(cat.image_url);

  return (
    <Link href={`/category/${cat.slug}`} className="explore-item">
      <div className="img-wrapper">
        {/* 
           REMOVED: SjLoader and useState. 
           WHY: To achieve "Daraz-like" speed, we render the image immediately 
           with a blur placeholder. No waiting for JS to load.
        */}
        
        <Image
          src={optimizedSrc}
          alt={cat.name}
          fill
          style={{ objectFit: 'contain' }}
          // Sizes: Tells browser this image is never wider than 150px
          sizes="(max-width: 768px) 150px, 150px" 
          
          // Priority: First 10 items load instantly (Preload)
          priority={priority}
          
          // Optimization: We manually optimized the URL above, so we can turn off Next.js processing
          // to save server CPU, OR keep it if we want Next.js to handle caching. 
          // Keeping unoptimized={false} allows Next.js to cache it further.
          unoptimized={true} 
          
          // Visual: Blur effect instead of spinner
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

export default function HomeSubcategories({ 
  subcategories, 
  title = "Explore More", 
  priority = false 
}: HomeSubcategoriesProps) {
  
  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  return (
    <div className="home-subcat-container" style={{ background: 'var(--background-color)' }}>
      <h2 className="section-title">{title}</h2>
      
      {/* 
         UI PRESERVATION:
         The IDs and Classes ('explore-grid', 'home-subcategories') match 
         your globals.css exactly to ensure the UI looks identical.
      */}
      <div className="explore-grid" id="home-subcategories">
        {subcategories.map((cat, index) => (
          <SubcategoryItem 
            key={cat.id} 
            cat={cat} 
            // Priority true for first 10 items to make above-the-fold instant
            priority={priority || index < 10} 
          />
        ))}
      </div>
    </div>
  );
}