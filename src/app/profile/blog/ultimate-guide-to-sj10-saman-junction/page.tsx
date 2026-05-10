import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: "Saman Junction (SJ10) Full Guide | Earn Money Online Pakistan",
  description: "Complete guide on What is SJ10 (Saman Junction). Detailed overview of Home, Explore, Categories, Orders, and Profit withdrawal by Aoun Abbas.",
  keywords: "What is SJ10, Saman Junction Pakistan, Aoun Abbas, Online Business Guide, Reselling App Pakistan, JazzCash Earning, EasyPaisa Earning, PostEx Tracking",
};

export default function SJ10MasterGuide() {
  return (
    <div className="sj-master-container pdp-font">
      <style dangerouslySetInnerHTML={{ __html: `
        .sj-master-container { background: #fdfdfd; min-height: 100vh; padding-bottom: 100px; color: #1f2937; }
        .hero-section { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #f85606 100%); padding: 100px 20px; text-align: center; color: white; }
        .hero-section h1 { font-size: 38px; font-weight: 900; margin-bottom: 20px; letter-spacing: -1px; }
        
        .main-content-wrap { max-width: 950px; margin: -60px auto 0; background: white; padding: 50px; border-radius: 30px; box-shadow: 0 25px 60px rgba(0,0,0,0.1); position: relative; z-index: 10; }
        
        .founder-strip { display: flex; align-items: center; gap: 15px; background: #fff7ed; padding: 15px 25px; border-radius: 50px; width: fit-content; margin-bottom: 35px; border: 1px solid #ffedd5; }
        .founder-img { width: 45px; height: 45px; border-radius: 50%; border: 2px solid #f85606; }
        
        .internal-link { color: #2563eb; font-weight: 700; text-decoration: underline; cursor: pointer; transition: 0.2s; }
        .internal-link:hover { color: #f85606; }
        
        .page-detail-section { margin-top: 50px; padding-bottom: 30px; border-bottom: 1px solid #f1f5f9; }
        .page-detail-section h2 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .page-detail-section h2 i { color: #f85606; }
        
        .advantage-box { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .adv-card { background: #f8fafc; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0; }
        .adv-card h5 { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #1e3a8a; }
        
        .hashtags-vault { background: #f1f5f9; padding: 30px; border-radius: 20px; margin-top: 60px; font-family: monospace; font-size: 13px; color: #64748b; line-height: 1.8; }
        .seo-cluster { margin-top: 20px; font-size: 14px; font-weight: 600; color: #334155; }
        
        @media (max-width: 768px) { .main-content-wrap { padding: 25px; margin-top: -30px; } .hero-section h1 { font-size: 26px; } }
      `}} />

      <div className="hero-section">
         <h1>Saman Junction (SJ10): Pakistan Ki No. 1 Digital Marketplace</h1>
         <p>Bina investment apna karobar shuru karne ki mukammal guide.</p>
      </div>

      <div className="main-content-wrap">
         <div className="founder-strip">
            <Image src="https://media.sj10.pk/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp" alt="Aoun Abbas" width={45} height={45} className="founder-img" unoptimized />
            <span style={{fontSize:'14px', color:'#9a3412'}}>Founded by <strong>Aoun Abbas</strong></span>
         </div>

         <section className="intro">
            <p>Saman Junction, jisay short form mein <strong>SJ10</strong> kaha jata hai, Pakistan ka sab se tezi se barhta hua multi-vendor platform hai. Iska vision asaan hai: Har Pakistani ko financial freedom dena. Chahe aap larka hon ya larki, student hon ya housewife, aap <Link href="/auth?view=signup" className="internal-link">SJ10 par Register</Link> ho kar aaj hi apni kamayi shuru kar sakte hain.</p>
         </section>

         {/* --- HOME PAGE SECTION --- */}
         <section className="page-detail-section">
            <h2><i className="fas fa-home"></i> 1. Home Page & Trending Section</h2>
            <p>SJ10 ka <Link href="/" className="internal-link">Home Page</Link> hamari website ka dimagh hai. Yahan aapko sab se pehle "Promoted Products" nazar aati hain jo market mein hit hain. </p>
            <ul>
               <li><strong>Banners:</strong> Rozana naye sales aur discounts ke banners yahan update hotay hain.</li>
               <li><strong>Newest Products:</strong> Har ghantay baad naya stock yahan show hota hai.</li>
               <li><strong>Search Bar:</strong> Agar aapko kuch khas chahiye, toh upar diye gaye search bar mein sirf naam likhein.</li>
            </ul>
         </section>

         {/* --- CATEGORY SECTION --- */}
         <section className="page-detail-section">
            <h2><i className="fas fa-th-large"></i> 2. Categories: Sahi Product Dhundiye</h2>
            <p>Hum ne hazaron products ko <Link href="/category" className="internal-link">Categories Section</Link> mein divide kiya hai. Left side par aapko Main Categories (Fashion, Electronics, Home Decor) milengi aur right side par unki Sub-categories.</p>
            <p>Misaal ke taur par, agar aap <Link href="/category/womens-stiched-23" className="internal-link">Women's Stitched</Link> suits dhund rahe hain, toh sirf ek click mein aapko poora wholesale bazar mil jayega.</p>
         </section>

         {/* --- EXPLORE SECTION --- */}
         <section className="page-detail-section">
            <h2><i className="fas fa-compass"></i> 3. Explore Page: Smart Shopping</h2>
            <p><Link href="/explore" className="internal-link">Explore Page</Link> un logon ke liye hai jo "Trending" items dekhna chahte hain. Hamara <strong>Smart Ranking System</strong> khud-ba-khud un products ko upar lata hai jo log sab se zyada pasand kar rahe hain. Yahan aap Video filter laga kar un products ki real unboxing videos bhi dekh sakte hain.</p>
         </section>

         {/* --- ORDERS & TRACKING --- */}
         <section className="page-detail-section">
            <h2><i className="fas fa-truck"></i> 4. Orders & Real-time Tracking</h2>
            <p>Customer ka sab se bara dar hota hai: "Mera parcel kahan hai?". SJ10 ke <Link href="/orders" className="internal-link">Orders Page</Link> par aap har order ka status live dekh sakte hain. Hamari <strong>PostEx integration</strong> ki wajah se aapko tracking ID copy-paste karne ki zaroorat nahi, status khud update hota hai.</p>
         </section>

         {/* --- PROFILE & WALLET --- */}
         <section className="page-detail-section">
            <h2><i className="fas fa-wallet"></i> 5. My Earnings & Profit Account</h2>
            <p>Resellers ke liye sab se important do pages hain. Pehla <Link href="/profile/my-earnings" className="internal-link">My Earnings Page</Link>, jahan aap apna balance aur history dekh sakte hain. Dusra <Link href="/profile/profit-account" className="internal-link">Profit Account Page</Link>, jahan aap apna JazzCash ya Bank account attach karte hain.</p>
            <p><strong>Note:</strong> Aapka profit order deliver hone ke baad foran wallet mein aa jata hai aur aap <Link href="/profile/my-earnings" className="internal-link">Withdraw</Link> kar sakte hain.</p>
         </section>

         {/* --- ADVANTAGES --- */}
         <section className="advantages">
            <h2 style={{fontSize:'22px', fontWeight:'800', marginBottom:'20px'}}>SJ10 Join Karne Ke Fawaid (Advantages)</h2>
            <div className="advantage-box">
               <div className="adv-card">
                  <h5>💰 Zero Investment</h5>
                  <p>Aapko dukan kholne ya stock khareedne ke liye ek rupya bhi nahi chahiye.</p>
               </div>
               <div className="adv-card">
                  <h5>📦 White-Label Shipping</h5>
                  <p>Customer ko parcel jayega toh us par apka naam hoga, SJ10 ka nahi.</p>
               </div>
               <div className="adv-card">
                  <h5>✅ Verified Suppliers</h5>
                  <p>Hum sirf un vendors ke sath kaam karte hain jin ki quality 100% check hoti hai.</p>
               </div>
            </div>
         </section>

         {/* --- SEO & HASHTAGS --- */}
         <div className="hashtags-vault">
            <p><strong>SEO Keyword Cluster:</strong> Saman Junction (SJ10) is Pakistan's premier e-commerce platform for reselling and shopping. Founded by Aoun Abbas, it offers zero investment business opportunities. Keywords: Online earning in Pakistan, earn 50000 monthly, best reselling app Pakistan, Saman Junction profit withdrawal, SJ10 PostEx tracking, wholesale rates Pakistan, buy online clothes Karachi Lahore Islamabad, smart shopping guide.</p>
            
            <div className="seo-cluster">
               #SJ10 #SamanJunction #AounAbbas #OnlineEarning #ResellingApp #PakistanEcommerce #EarnFromHome #ZeroInvestment #JazzCash #EasyPaisa #BusinessGuide #OnlineShoppingPakistan #ShopSmart #DropshippingPakistan
            </div>
         </div>

         <div style={{textAlign:'center', marginTop:'50px'}}>
            <h3 style={{fontWeight:900, fontSize:'24px'}}>Batein Khatam, Kaam Shuru!</h3>
            <p>Ab aapko SJ10 ki har bariki ka pata hai. Abhi <Link href="/explore" className="internal-link">Explore Karein</Link> aur apni pehli sale nikalye!</p>
            <Link href="/auth?view=signup" style={{display:'inline-block', background:'#f85606', color:'#fff', padding:'18px 50px', borderRadius:'50px', fontWeight:800, textDecoration:'none', marginTop:'20px', boxShadow:'0 10px 25px rgba(248, 86, 6, 0.3)'}}>Create Free Reseller Account</Link>
         </div>
      </div>
    </div>
  );
}