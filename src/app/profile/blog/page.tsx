import Link from 'next/link';
import Image from 'next/image';
import { blogList } from '@/lib/blogList';

export const metadata = {
  title: "SJ10 Blogs - Shopping Tips & Fashion Trends",
  description: "Read the latest updates, fashion trends, and business tips from SJ10.",
};

export default function BlogsListingPage() {
  return (
    <div className="blogs-page-wrapper">
      <header className="page-header">
        <Link href="/profile" className="back-button"><i className="fas fa-arrow-left"></i></Link>
        <h3 className="header-title">SJ10 Blogs</h3>
      </header>

      <div className="blogs-container">
        {blogList.map((blog, index) => (
          <Link href={`/profile/blog/${blog.slug}`} key={index} className="blog-card fade-in">
            <div className="blog-image">
              <Image src={blog.image} alt={blog.title} fill style={{objectFit: 'cover'}} unoptimized />
            </div>
            <div className="blog-info">
              <span className="blog-date">{blog.date}</span>
              <h2 className="blog-title">{blog.title}</h2>
              <p className="blog-desc">{blog.shortDesc}</p>
              <span className="read-more">Read Full Article <i className="fas fa-arrow-right"></i></span>
            </div>
          </Link>
        ))}
      </div>

      {/* FIXED STYLE TAG FOR SERVER COMPONENTS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blogs-page-wrapper { background: #f8fafc; min-height: 100vh; padding-bottom: 80px; }
        .page-header { background: #fff; padding: 15px 20px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; position: sticky; top: 70px; z-index: 10; }
        .header-title { font-size: 18px; font-weight: 700; color: #1e293b; margin-left: 15px; margin-bottom: 0; }
        .back-button { color: #1e293b; font-size: 18px; text-decoration: none; }
        
        .blogs-container { max-width: 1200px; margin: 0 auto; padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .blog-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); text-decoration: none; display: flex; flex-direction: column; transition: transform 0.3s, box-shadow 0.3s; }
        .blog-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .blog-image { width: 100%; height: 200px; position: relative; background: #e2e8f0; }
        .blog-info { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; }
        .blog-date { font-size: 12px; color: #ff7f00; font-weight: 700; margin-bottom: 8px; }
        .blog-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; line-height: 1.4; }
        .blog-desc { font-size: 14px; color: #64748b; margin-bottom: 15px; line-height: 1.5; }
        .read-more { margin-top: auto; font-size: 14px; font-weight: 700; color: #2563eb; display: flex; align-items: center; gap: 5px; }
        .fade-in { animation: fadeIn 0.5s ease-out backwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}