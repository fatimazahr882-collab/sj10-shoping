"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SjLoader from './SjLoader';

type Subcategory = {
  id: string;
  name: string;
  image_url: string | null;
  slug: string;
};

// --- 1. SPEED HELPERS ---

// A. Shimmer Effect (The "Low Quality" Blur placeholder)
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

// B. Cloudinary Optimizer (Compresses image BEFORE it reaches the browser)
const getOptimizedUrl = (url: string | null) => {
  if (!url) return '/placeholder.jpg';
  
  // If it's a Cloudinary URL, we inject parameters for speed:
  // w_200: Resize to 200px (perfect for small thumbnails)
  // f_auto: Use WebP/AVIF automatically
  // q_auto: Intelligent quality compression
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/w_200,f_auto,q_auto:good/');
  }
  return url;
};

// --- 2. COMPONENT ---

function SubcategoryItem({ cat, priority }: { cat: Subcategory, priority: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Pre-calculate the optimized URL
  const optimizedSrc = getOptimizedUrl(cat.image_url);

  return (
    <Link href={`/category/${cat.slug}`} className="explore-item">
      <div className="img-wrapper">
        {/* Keep your existing loader as an overlay */}
        {isLoading && <SjLoader />}
        
        <Image
          src={optimizedSrc}
          alt={cat.name}
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 768px) 33vw, 150px"
          
          // 🔥 PERFORMANCE SETTINGS 🔥
          priority={priority}
          
          // We set unoptimized=true to STOP the server timeouts you were getting.
          // BUT, we used 'getOptimizedUrl' above so the image IS compressed by Cloudinary.
          unoptimized={true} 
          
          className={isLoading ? 'image-loading' : 'image-loaded'}
          onLoad={() => setIsLoading(false)} 
          
          // Instant Loading Blur Effect
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
      
      <div className="explore-grid" id="home-subcategories">
        {subcategories.map((cat, index) => (
          <SubcategoryItem 
            key={cat.id} 
            cat={cat} 
            // Only prioritize the first 6 images to save bandwidth
            priority={priority && index < 6} 
          />
        ))}
      </div>
    </div>
  );
}