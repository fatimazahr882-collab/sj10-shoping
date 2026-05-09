import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: "What is SJ10 Saman Junction? Full Feature & Business Guide by Aoun Abbas",
  description: "Explore Saman Junction (SJ10), Pakistan's premier reselling and shopping platform. Detailed guide on every page, profit withdrawal, and zero investment business model.",
  keywords: "What is SJ10, Saman Junction Pakistan, Aoun Abbas SJ10, online earning pakistan, reselling business guide, SJ10 features, earn money from home pakistan",
};

export default function SJ10FullGuide() {
  return (
    <div className="sj-guide-wrapper pdp-font">
      <style dangerouslySetInnerHTML={{ __html: `
        .sj-guide-wrapper { background: #fff; min-height: 100vh; padding-bottom: 100px; color: #334155; }
        .hero-sj { background: linear-gradient(135deg, #1e3a8a 0%, #f85606 100%); padding: 80px 20px; text-align: center; color: white; }
        .hero-sj h1 { font-size: 36px; font-weight: 900; margin-bottom: 15px; letter-spacing: -1px; }
        .main-container { max-width: 900px; margin: -50px auto 0; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); position: relative; z-index: 10; }
        .founder-box { background: #f8fafc; padding: 20px; border-radius: 16px; border-left: 5px solid #1e3a8a; margin-bottom: 30px; display: flex; align-items: center; gap: 15px; }
        .founder-img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }
        
        .feature-grid { display: grid; grid-template-columns: 1fr; gap: 25px; margin: 40px 0; }
        @media(min-width: 640px) { .feature-grid { grid-template-columns: 1fr 1fr; } }
        
        .page-card { border: 1px solid #f1f5f9; padding: 25px; border-radius: 18px; transition: 0.3s; background: #fff; text-decoration: none; color: inherit; display: block; }
        .page-card:hover { border-color: #f85606; transform: translateY(-5px); box-shadow: 0 10px 30px rgba(248, 86, 6, 0.1); }
        .page-card i { font-size: 24px; color: #f85606; margin-bottom: 15px; }
        .page-card h4 { font-size: 18px; font-weight: 800; margin-bottom: 10px; color: #1e293b; }
        
        .advantage-pill { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; margin: 5px; }
        .hashtags { margin-top: 50px; font-size: 14px; color: #94a3b8; line-height: 2; font-weight: 600; }
      `}} />

      <header className="page-header" style={{position:'sticky', top:70, zIndex:100}}>
          <Link href="/profile/blog" style={{color:'#111', fontSize:'20px'}}><i className="fas fa-arrow-left"></i></Link>
          <h3 className="header-title">The SJ10 Encyclopedia</h3>
      </header>

      <div className="hero-sj">
         <h1>Saman Junction (SJ10) Kya Hai?</h1>
         <p>Pakistan ki No. 1 Marketplace ki mukammal maloomat yahan parhein.</p>
      </div>

      <div className="main-container">
         <div className="founder-box">
            <Image src="https://media.sj10.pk/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp" alt="Aoun Abbas" width={60} height={60} className="founder-img" unoptimized/>
            <div>
               <p style={{margin:0, fontSize:'14px', color:'#64748b'}}>Founded by</p>
               <strong style={{fontSize:'18px'}}>Aoun Abbas</strong>
            </div>
         </div>

         <p><strong>SJ10 (Saman Junction)</strong> sirf ek shopping website nahi hai, balkay ye Pakistan ka wo digital ecosystem hai jo har Pakistani ko apna business shuru karne ka moka deta hai. Chahe aap customer hon ya reseller, SJ10 aapki har zaroorat ko pura karta hai.</p>

         <h2 style={{marginTop: '40px'}}>Har Page Aur Function Ki Guide:</h2>

         <div className="feature-grid">
            {/* 1. Explore Page */}
            <Link href="/explore" className="page-card">
               <i className="fas fa-compass"></i>
               <h4>Explore Page</h4>
               <p>Yahan aapko SJ10 ki har category ki trending products milengi. Naye items aur verified sellers ki list dekhne ke liye ye best jagah hai.</p>
            </Link>

            {/* 2. Business Details */}
            <Link href="/profile/business-details" className="page-card">
               <i className="fas fa-store"></i>
               <h4>Business Details</h4>
               <p>Resellers yahan apna "Brand Name" aur profile pic set kar sakte hain. Jab hum parcel bhejte hain, toh aapka brand name hi customer ko dikhta hai.</p>
            </Link>

            {/* 3. My Earnings */}
            <Link href="/profile/my-earnings" className="page-card">
               <i className="fas fa-coins"></i>
               <h4>My Earnings</h4>
               <p>Aap ne kitna profit kamaya aur kitna withdraw kiya, uska pura hisaab yahan live update hota hai.</p>
            </Link>

            {/* 4. Profit Account */}
            <Link href="/profile/profit-account" className="page-card">
               <i className="fas fa-wallet"></i>
               <h4>Profit Account</h4>
               <p>Apna JazzCash, EasyPaisa ya Bank Account link karein taake apka kamaya hua profit seedha aap tak pahunch jaye.</p>
            </Link>

            {/* 5. My Favorites */}
            <Link href="/favorites" className="page-card">
               <i className="fas fa-heart"></i>
               <h4>Favorites (Wishlist)</h4>
               <p>Jo products aapko pasand aayen unhe save kar lein taake baad mein asani se share ya order kar sakein.</p>
            </Link>

            {/* 6. Orders Tracking */}
            <Link href="/orders" className="page-card">
               <i className="fas fa-box"></i>
               <h4>Orders & Tracking</h4>
               <p>Apne orders ka status check karein: Processing se lekar Delivery tak ka pura rasta track karein.</p>
            </Link>
         </div>

         <h2>SJ10 Ke Be-misaal Fawaid (Advantages):</h2>
         <p>Hamari website baqi tamam platforms se mukhtalif kyun hai? In fawaid ko dekhein:</p>
         <div style={{margin: '20px 0'}}>
            <span className="advantage-pill">Bina kisi Investment ke Malik banien</span>
            <span className="advantage-pill">Wholesale Rates for Everyone</span>
            <span className="advantage-pill">Fast Cash on Delivery (COD)</span>
            <span className="advantage-pill">Verified Suppliers Only</span>
            <span className="advantage-pill">Profit in JazzCash/EasyPaisa</span>
            <span className="advantage-pill">White-Label Shipping</span>
         </div>

         <h2>AEO & Search Optimization:</h2>
         <p>Hum ne SJ10 ko is tarah design kiya hai ke har Pakistani asani se samajh sakay. Hamara mission digital literacy aur financial freedom hai. Saman Junction (SJ10) par har product ki quality check ki jati hai.</p>

         <div className="hashtags">
            #WhatIsSJ10 #SamanJunction #AounAbbas #OnlineShoppingPakistan #ResellingGuide #EarnMoneyOnline #JazzCash #EasyPaisa #ZeroInvestmentBusiness #PakistanEcommerce #SJ10Features #SJ10MobileApp #SmartShopping #BusinessFromHome
         </div>

         <div style={{textAlign:'center', marginTop:'40px', padding:'30px', background:'#fff7ed', borderRadius:'20px', border:'2px dashed #f85606'}}>
            <h3 style={{color:'#f85606', fontWeight:900}}>Abhi Shuru Karein!</h3>
            <p>Saman Junction (SJ10) ka hissa banien aur Pakistan ki digital economy mein apna naam banayein.</p>
            <Link href="/auth?view=signup" style={{display:'inline-block', background:'#f85606', color:'#fff', padding:'15px 40px', borderRadius:'50px', fontWeight:800, textDecoration:'none', marginTop:'15px'}}>Create My Free Account</Link>
         </div>
      </div>
    </div>
  );
}