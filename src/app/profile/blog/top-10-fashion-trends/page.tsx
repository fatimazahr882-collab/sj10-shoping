import Link from 'next/link';
import Image from 'next/image';

// SEO METADATA
export const metadata = {
  title: "Top Fashion Trends in Pakistan 2026 | SJ10 Shopping",
  description: "Janiye Pakistan ke latest Eastern aur Western fashion trends 2026. Baggy jeans, vintage kurtis, aur smart watches SJ10 par saste daamo mein khareedein.",
  keywords: "pakistani fashion trends 2026, buy kurtis online pakistan, online shopping fashion, SJ10 clothes, baggy jeans pakistan",
};

export default function FashionBlog() {
  return (
    <div className="fashion-blog-wrapper">
      {/* Top Nav */}
      <div className="top-bar-nav">
          <Link href="/profile/blog" className="back-btn">
            <i className="fas fa-arrow-left"></i> Back to Blogs
          </Link>
          <span className="badge">👗 Fashion & Style</span>
      </div>

      {/* Hero Section */}
      <div className="fashion-hero">
        <h1 className="hero-title">Pakistan Ke Top Fashion Trends (2026)</h1>
        <p className="hero-subtitle">Kya aap bhi fashion mein sab se aagay rehna chahte hain? Check karein iss saal ke sab se hit trends!</p>
      </div>

      <main className="content-area">
        {/* Featured Image */}
        <div className="img-box">
           <Image 
             src="https://via.placeholder.com/800x400.png?text=Pakistani+Fashion+Trends+2026" 
             alt="Pakistani Fashion Trends" 
             fill 
             style={{objectFit: 'cover'}} 
             unoptimized 
           />
        </div>

        <p className="intro-text">
          <i className="fas fa-quote-left" style={{color: '#ff7f00', fontSize: '24px', marginRight: '10px'}}></i>
          Fashion game ko strong karna ab mehenga nahi raha! 2026 mein Pakistani fashion industry eastern aur western ka ek zabardast fusion experience kar rahi hai. Aur sab se achi baat? Ye sab trends <strong>SJ10</strong> par wholesale rates mein available hain!
        </p>

        <div className="trend-list">
          
          {/* Trend 1 */}
          <div className="trend-card">
            <div className="trend-number">1</div>
            <div className="trend-details">
              <h2><i className="fas fa-tshirt icon-blue"></i> Vintage Style Kurtis</h2>
              <p>90s ka fashion wapis aagaya hai! Khuli (loose) vintage kurtis jin par light embroidery ya block print ho, aaj kal har college/university janay wali larki ki pehli choice hai.</p>
              <Link href="/category/womens-stiched-23" className="shop-link">Shop Kurtis <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          {/* Trend 2 */}
          <div className="trend-card">
            <div className="trend-number">2</div>
            <div className="trend-details">
              <h2><i className="fas fa-socks icon-orange"></i> Baggy Jeans & Oversized Tees</h2>
              <p>Skinny jeans ka zamana gaya boss! Ab boys aur girls dono Baggy Cargo Jeans aur Oversized T-shirts pehen kar cool aur comfortable look pasand kar rahe hain.</p>
              <Link href="/category/mens-stiched-clothes-51" className="shop-link">Shop Western Wear <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          {/* Trend 3 */}
          <div className="trend-card">
            <div className="trend-number">3</div>
            <div className="trend-details">
              <h2><i className="fas fa-gem icon-purple"></i> Minimalist Jewelry</h2>
              <p>Bhaari aur bari jewelry ki jagah ab choti, elegant (minimalist) rings, pendants aur delicate bracelets trend mein hain. Ye casual aur formal dono looks ke sath fit baithti hain.</p>
              <Link href="/category/jewellry-26" className="shop-link">Shop Jewelry <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          {/* Trend 4 */}
          <div className="trend-card">
            <div className="trend-number">4</div>
            <div className="trend-details">
              <h2><i className="fas fa-clock icon-dark"></i> Smart Watches & Airbuds</h2>
              <p>Fashion sirf kapron ka nahi, gadgets ka bhi hai! Apni wrist pe ek premium smart watch aur kaano mein sleek wireless earbuds apke poore look ko premium bana dete hain.</p>
              <Link href="/category/electronics-61" className="shop-link">Shop Smart Gadgets <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

        </div>
        
        <div className="conclusion">
          <p>Toh intezar kis baat ka? Abhi <strong>SJ10.pk</strong> par jayen aur market se aadhi keemat par apni favorite fashion items order karein. Cash on Delivery poore Pakistan mein available hai!</p>
        </div>
      </main>

      {/* CSS STYLING */}
      <style dangerouslySetInnerHTML={{ __html: `
        .fashion-blog-wrapper { background: #f8fafc; min-height: 100vh; padding-bottom: 80px; font-family: 'Poppins', sans-serif; }
        .top-bar-nav { padding: 20px; background: white; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; position: sticky; top: 70px; z-index: 10; }
        .back-btn { color: #1e293b; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .badge { background: #fee2e2; color: #dc2626; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        
        .fashion-hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 60px 20px 80px; text-align: center; color: white; }
        .hero-title { font-size: 32px; font-weight: 800; margin-bottom: 15px; line-height: 1.3; }
        .hero-subtitle { font-size: 16px; opacity: 0.9; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #cbd5e1; }
        
        .content-area { max-width: 800px; margin: -40px auto 0; padding: 0 20px; position: relative; z-index: 5; }
        .img-box { width: 100%; height: 350px; position: relative; border-radius: 20px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 4px solid white; }
        
        .intro-text { font-size: 16px; color: #334155; font-style: italic; line-height: 1.8; background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 30px; }
        
        .trend-list { display: flex; flex-direction: column; gap: 20px; margin-bottom: 40px; }
        .trend-card { display: flex; gap: 20px; background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.3s; border: 1px solid #f1f5f9; }
        .trend-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        
        .trend-number { width: 50px; height: 50px; background: #ff7f00; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; flex-shrink: 0; }
        .trend-details h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px; }
        .trend-details p { font-size: 14px; color: #64748b; line-height: 1.7; margin: 0 0 15px 0; }
        
        .icon-blue { color: #3b82f6; } .icon-orange { color: #f97316; } .icon-purple { color: #a855f7; } .icon-dark { color: #475569; }
        
        .shop-link { font-size: 14px; font-weight: 700; color: #ff7f00; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: 0.2s; }
        .shop-link:hover { color: #ea580c; gap: 8px; }

        .conclusion { background: #fff7ed; border-left: 5px solid #ff7f00; padding: 20px; border-radius: 12px; color: #431407; font-size: 15px; font-weight: 500; line-height: 1.6; }
      `}} />
    </div>
  );
}