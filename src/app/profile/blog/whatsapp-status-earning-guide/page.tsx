import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: "WhatsApp Status Se Paise Kaise Kamayein? | SJ10 Reselling Guide",
  description: "Janiye WhatsApp status par products share karke mahana 30,000 kamane ka tarika. SJ10 reselling app se products wholesale pe lein aur apna profit kamaein.",
  keywords: "WhatsApp earning Pakistan, SJ10 reselling, online earning without investment, earn money status, pakistani suit reselling",
};

export default function WhatsAppEarningBlog() {
  return (
    <div className="whatsapp-blog-container">
      {/* Navbar Overlay */}
      <div className="top-nav-glass">
        <Link href="/profile/blog" className="back-btn"><i className="fas fa-arrow-left"></i> Back</Link>
        <span className="live-tag">🔥 VIRAL TIPS</span>
      </div>

      {/* Hero Banner */}
      <div className="hero-whatsapp">
         <div className="hero-overlay">
            <h1 className="hero-h1">WhatsApp Status: Ab Time Pass Nahi, Kamai Ka Zariya!</h1>
            <p className="hero-p">Kya aap jante hain ke aapke contacts mein mojood log hi aapke asli customers hain? Chalein sikhate hain kaise!</p>
         </div>
      </div>

      {/* Article Content */}
      <main className="main-content">
        <div className="paisa-card">
           <div className="icon-box"><i className="fas fa-money-bill-trend-up"></i></div>
           <div className="text-box">
              <h3>Monthly Target: Rs. 30,000</h3>
              <p>Agar aap rozana sirf 2 suits bhi bechte hain aur har suit par 500 profit rakhte hain, toh mahine ke 30,000 pakkay!</p>
           </div>
        </div>

        <section className="guide-section">
          <h2>1. SJ10 Se Link Kaise Copy Karein? 🔗</h2>
          <p>Bhai jan, sab se pehle hamari website pe jayen aur koi bhi hot-selling product kholen. Maslan aaj kal <strong>"Azuritta 2-Piece Embroidered"</strong> suits aag laga rahe hain.</p>
          
          {/* Internal Link to Product */}
          <Link href="/products/azure-itta-2piece-embroidered" className="product-link-card">
             <div className="p-img-box">
                <Image src="https://media.sj10.pk/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp" alt="Azuritta 2pc" fill style={{objectFit:'cover'}} unoptimized />
             </div>
             <div className="p-info">
                <h4>Azuritta 2-Piece Embroidered</h4>
                <p>Wholesale Rate: Check Now</p>
                <span className="btn-small">Copy Link <i className="fas fa-copy"></i></span>
             </div>
          </Link>

          <h2>2. WhatsApp Par Magic Preview Kaise Ayega? ✨</h2>
          <p>Aapne bas hamari website se product ka link copy karna hai aur WhatsApp Status par paste karna hai. Hamara system itna fast hai ke **WhatsApp khud-ba-khud us product ki photo aur description nikal lega**.</p>
          <div className="tip-box">
             <i className="fas fa-lightbulb"></i>
             <p><strong>Pro Tip:</strong> Status lagate waqt "Price" mat likhein. Jab log aapse inbox mein rate pochenge, toh unka "Interest" barhega aur sale ke chances 200% barh jayenge!</p>
          </div>

          <h2>3. SJ10 Explore Page Ka Faida 🧭</h2>
          <p>Agar aap confuse hain ke kya share karein, toh hamare <strong>Explore Page</strong> par jayen. Wahan aapko "Trending" aur "Verified" products milengi jo log sab se zyada khareed rahe hain.</p>
          
          <Link href="/explore" className="explore-cta">
             Explore Trending Products <i className="fas fa-compass"></i>
          </Link>

          <h2>4. Order Kaise Place Karein? 🛒</h2>
          <p>Jab customer kahe "Haan bhai, order kar do", toh aap ne SJ10 par aana hai, product select karni hai aur **"Customer Price"** mein wo rate dalna hai jo aapne customer ko bataya hai. </p>
          <ul className="check-list">
             <li><i className="fas fa-check-circle"></i> Customer ka address sahi dalen.</li>
             <li><i className="fas fa-check-circle"></i> Hum aapke naam se parcel bhejenge.</li>
             <li><i className="fas fa-check-circle"></i> Profit apke account mein deliver hone ke baad aa jayega.</li>
          </ul>
        </section>

        <div className="final-motivation">
           <h3>Ab Intezar Kis Baat Ka?</h3>
           <p>Apne doston ke fazool status dekhne ke bajaye, apna status lagayein aur paise kamana shuru karein. Aaj hi apna pehla link share karein!</p>
           <Link href="/" className="start-btn">Start Earning Now</Link>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .whatsapp-blog-container { background: #fff; min-height: 100vh; padding-bottom: 80px; font-family: 'Poppins', sans-serif; }
        .top-nav-glass { position: fixed; top: 70px; left: 0; right: 0; padding: 15px 20px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); display: flex; justify-content: space-between; align-items: center; z-index: 100; border-bottom: 1px solid #eee; }
        .back-btn { color: #111; text-decoration: none; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .live-tag { background: #ff4757; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; animation: pulse 1.5s infinite; }
        
        .hero-whatsapp { height: 40vh; background: url('https://images.unsplash.com/photo-1614680376593-902f74cc0d41?auto=format&fit=crop&w=1000&q=80'); background-size: cover; background-position: center; position: relative; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, #000); display: flex; flex-direction: column; justify-content: flex-end; padding: 30px 20px; text-align: center; }
        .hero-h1 { color: white; font-size: 26px; font-weight: 800; line-height: 1.2; margin-bottom: 10px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .hero-p { color: #ccc; font-size: 14px; }

        .main-content { max-width: 800px; margin: 0 auto; padding: 20px; }
        .paisa-card { display: flex; align-items: center; gap: 20px; background: #f0fdf4; border: 2px solid #bbf7d0; padding: 20px; border-radius: 20px; margin-top: -50px; position: relative; z-index: 5; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .icon-box { width: 60px; height: 60px; background: #16a34a; color: white; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
        .text-box h3 { margin: 0; color: #16a34a; font-weight: 800; }
        .text-box p { margin: 0; color: #15803d; font-size: 13px; font-weight: 600; }

        .guide-section { margin-top: 40px; }
        .guide-section h2 { font-size: 20px; font-weight: 800; color: #111; margin-bottom: 15px; border-left: 5px solid #16a34a; padding-left: 12px; }
        .guide-section p { line-height: 1.8; color: #444; margin-bottom: 20px; }

        .product-link-card { display: flex; gap: 15px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 15px; text-decoration: none; color: inherit; margin-bottom: 30px; transition: transform 0.2s; }
        .product-link-card:hover { transform: scale(1.02); border-color: #16a34a; }
        .p-img-box { position: relative; width: 80px; height: 80px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
        .p-info h4 { margin: 0 0 5px; font-size: 15px; font-weight: 800; color: #111; }
        .p-info p { margin: 0 0 8px; font-size: 12px; color: #666; }
        .btn-small { background: #16a34a; color: white; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; }

        .tip-box { background: #fffbeb; border: 1px solid #fde68a; padding: 15px; border-radius: 12px; display: flex; gap: 12px; margin-bottom: 30px; }
        .tip-box i { color: #d97706; font-size: 20px; }
        .tip-box p { margin: 0; font-size: 13px; color: #92400e; }

        .explore-cta { display: block; text-align: center; background: #1e3a8a; color: white; padding: 15px; border-radius: 12px; font-weight: 800; text-decoration: none; margin-bottom: 40px; box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3); }
        .start-btn { display: inline-block; background: #16a34a; color: white; padding: 18px 40px; border-radius: 50px; font-weight: 800; text-decoration: none; font-size: 18px; box-shadow: 0 8px 25px rgba(22, 163, 74, 0.4); margin-top: 15px; }

        .check-list { list-style: none; padding: 0; margin-bottom: 40px; }
        .check-list li { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-weight: 600; color: #333; font-size: 14px; }
        .check-list i { color: #16a34a; }

        .final-motivation { text-align: center; background: #fafafa; padding: 40px 20px; border-radius: 30px; border: 2px dashed #ddd; }

        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
      `}} />
    </div>
  );
}