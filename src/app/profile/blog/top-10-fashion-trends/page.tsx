// src/app/profile/blog/top-10-fashion-trends/page.tsx
import Link from 'next/link';
import Image from 'next/image';

// 1. Google SEO for this specific blog
export const metadata = {
  title: "Top 10 Fashion Trends in Pakistan (2026) | SJ10",
  description: "Discover the latest eastern and western fusion fashion trends hitting Pakistan in 2026.",
  openGraph: {
    title: "Top 10 Fashion Trends in Pakistan (2026)",
    description: "Read about the latest fashion hits in Pakistan.",
    images: [{ url: "https://via.placeholder.com/800x400.png?text=Fashion" }],
  }
};

export default function FashionBlog() {
  return (
    <div className="custom-blog-wrapper">
      {/* Tumhari marzi ka custom Header */}
      <div className="hero-section">
        <Link href="/profile/blog" className="back-btn"><i className="fas fa-arrow-left"></i> Back</Link>
        <h1 className="hero-title">Top 10 Fashion Trends</h1>
        <p className="hero-subtitle">What Pakistan is wearing in 2026</p>
      </div>

      <main className="content">
        {/* Custom Image Placement */}
        <div className="img-box">
           <Image src="https://via.placeholder.com/800x400.png?text=Fashion" alt="Fashion" fill style={{objectFit: 'cover'}} unoptimized />
        </div>

        {/* Custom Layout & Icons */}
        <p className="intro-text">
          <i className="fas fa-quote-left" style={{color: '#ff7f00', fontSize: '24px', marginRight: '10px'}}></i>
          The fashion industry in Pakistan is taking a massive leap this year...
        </p>

        <div className="custom-card">
          <h2><i className="fas fa-tshirt" style={{color: '#2563eb'}}></i> 1. Vintage Kurti Designs</h2>
          <p>Vintage is back! Designers are bringing 90s style back into the market.</p>
        </div>

      </main>

      {/* Tumhari marzi ka completely custom CSS sirf is page ke liye */}
      <style jsx>{`
        .custom-blog-wrapper { background: #fff; min-height: 100vh; padding-bottom: 80px; font-family: 'Poppins', sans-serif; }
        .hero-section { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 60px 20px; text-align: center; color: white; position: relative; }
        .back-btn { position: absolute; top: 20px; left: 20px; color: white; text-decoration: none; font-weight: 600; }
        .hero-title { font-size: 32px; font-weight: 800; margin-bottom: 10px; }
        .content { max-width: 800px; margin: -30px auto 0; padding: 20px; position: relative; z-index: 10; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .img-box { width: 100%; height: 300px; position: relative; border-radius: 16px; overflow: hidden; margin-bottom: 30px; }
        .intro-text { font-size: 18px; color: #475569; font-style: italic; line-height: 1.8; }
        .custom-card { background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 5px solid #2563eb; margin-top: 30px; }
      `}</style>
    </div>
  );
}