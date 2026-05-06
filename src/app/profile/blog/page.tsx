"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blogList } from '@/lib/blogList';

// --- BEAUTIFUL SHIMMER COMPONENT ---
// Ye component chamakta hua loader dikhayega
const ImageLoader = () => (
  <div className="shimmer-wrapper">
    <div className="shimmer-box"></div>
    <style jsx>{`
      .shimmer-wrapper {
        width: 100%;
        height: 100%;
        background: #f1f5f9;
        overflow: hidden;
        position: relative;
      }
      .shimmer-box {
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          #f1f5f9 25%,
          #e2e8f0 50%,
          #f1f5f9 75%
        );
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

// --- REUSABLE SMART IMAGE COMPONENT ---
const OptimizedBlogImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="image-container">
      {!isLoaded && <ImageLoader />}
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'cover', opacity: isLoaded ? 1 : 0 }}
        className="transition-opacity duration-500 ease-in-out"
        onLoad={() => setIsLoaded(true)}
        // Priority true karne se pehli 2 images instantly load hongi
        priority={true} 
        unoptimized={true} // Kyunke hum public folder se use kar rahe hain
      />
      <style jsx>{`
        .image-container {
          position: relative;
          width: 100%;
          height: 200px; /* Fixed height for list view */
          background: #f1f5f9;
          border-radius: 12px 12px 0 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default function BlogsListingPage() {
  return (
    <div className="blogs-page-wrapper">
      <header className="page-header-vip">
        <Link href="/profile" className="back-circle"><i className="fas fa-arrow-left"></i></Link>
        <h1 className="header-title">SJ10 Exclusive Blogs</h1>
      </header>

      <div className="blogs-grid">
        {blogList.map((blog, index) => (
          <Link href={`/profile/blog/${blog.slug}`} key={index} className="blog-card-new">
            
            {/* Optimized Image with Loader */}
            <OptimizedBlogImage src={blog.image} alt={blog.title} />

            <div className="blog-content-box">
              <div className="blog-meta">
                <span className="date-badge-new">{blog.date}</span>
                <span className="read-time">5 min read</span>
              </div>
              <h2 className="blog-title-new">{blog.title}</h2>
              <p className="blog-desc-new">{blog.shortDesc}</p>
              <div className="read-more-link">
                Read Article <i className="fas fa-chevron-right"></i>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .blogs-page-wrapper { background: #f8fafc; min-height: 100vh; padding-bottom: 100px; font-family: 'Poppins', sans-serif; }
        
        .page-header-vip { background: #fff; padding: 20px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .back-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #111; text-decoration: none; transition: 0.2s; }
        .back-circle:hover { background: #000; color: #fff; }
        .header-title { font-size: 20px; font-weight: 800; margin-left: 15px; color: #0f172a; }

        .blogs-grid { max-width: 1200px; margin: 0 auto; padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        
        .blog-card-new { background: white; border-radius: 16px; overflow: hidden; text-decoration: none; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.03); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; }
        .blog-card-new:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0,0,0,0.1); border-color: #ff7f00; }

        .blog-content-box { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; }
        .blog-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .date-badge-new { font-size: 11px; font-weight: 700; color: #ff7f00; background: #fff7ed; padding: 4px 10px; border-radius: 20px; }
        .read-time { font-size: 11px; color: #94a3b8; font-weight: 500; }

        .blog-title-new { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 10px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-desc-new { font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

        .read-more-link { margin-top: auto; font-size: 14px; font-weight: 700; color: #2563eb; display: flex; align-items: center; gap: 6px; }
        
        @media (max-width: 640px) {
          .blogs-grid { grid-template-columns: 1fr; }
          .header-title { font-size: 18px; }
        }
      `}} />
    </div>
  );
}