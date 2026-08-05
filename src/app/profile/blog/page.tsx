// src/app/profile/blog/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { blogData } from '@/lib/blogData'; // 🟢 Connected to blogData.ts

export default function BlogsListingPage() {
  return (
    <div className="blogs-page-wrapper">
      <header className="page-header-vip">
        <Link href="/profile" className="back-circle"><i className="fas fa-arrow-left"></i></Link>
        <h1 className="header-title">SJ10 Exclusive Blogs</h1>
      </header>

      <div className="blogs-grid">
        {/* 🟢 Continuous Mapping on blogData */}
        {blogData.map((blog, index) => (
          <Link href={`/profile/blog/${blog.slug}`} key={index} className="blog-card-new">
            
            {/* Thumbnail Image */}
            <div className="image-container">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            </div>

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
        .page-header-vip { background: #fff; padding: 20px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; }
        .back-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #111; text-decoration: none; }
        .header-title { font-size: 20px; font-weight: 800; margin-left: 15px; color: #0f172a; }
        .blogs-grid { max-width: 1200px; margin: 0 auto; padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .blog-card-new { background: white; border-radius: 16px; overflow: hidden; text-decoration: none; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.03); transition: all 0.3s ease; display: flex; flex-direction: column; }
        .blog-card-new:hover { transform: translateY(-8px); border-color: #ff7f00; }
        .image-container { position: relative; width: 100%; height: 200px; background: #f1f5f9; }
        .blog-content-box { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; }
        .blog-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .date-badge-new { font-size: 11px; font-weight: 700; color: #ff7f00; background: #fff7ed; padding: 4px 10px; border-radius: 20px; }
        .read-time { font-size: 11px; color: #94a3b8; font-weight: 500; }
        .blog-title-new { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 10px 0; line-height: 1.4; }
        .blog-desc-new { font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.6; }
        .read-more-link { margin-top: auto; font-size: 14px; font-weight: 700; color: #2563eb; display: flex; align-items: center; gap: 6px; }
      ` }} />
    </div>
  );
}