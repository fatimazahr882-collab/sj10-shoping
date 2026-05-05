import Link from 'next/link';

// SEO METADATA - English mein rakha hai taake Google Bot ko samajh aaye
export const metadata = {
  title: "Ghar Bethe Paise Kamayein - Zero Investment Reselling in Pakistan | SJ10",
  description: "Learn how to make money online in Pakistan without investment. SJ10 reselling platform se JazzCash aur EasyPaisa mein profit withdraw karein.",
  keywords: "online earning in pakistan, zero investment business, ghar bethe paise kamaye, make money online jazzcash, SJ10 reseller",
};

export default function ResellingBlog() {
  return (
    <div className="reselling-blog-wrapper">
       {/* Top Navigation */}
       <div className="top-bar-nav">
          <Link href="/profile/blog" className="back-btn">
            <i className="fas fa-arrow-left"></i> Back to Blogs
          </Link>
          <span className="badge">💸 Earning Guide</span>
       </div>

       {/* Hero Banner */}
       <div className="money-hero-banner">
          <i className="fas fa-wallet fa-4x pulse-anim"></i>
          <h1 className="hero-title">Zero Investment Se Apna Business Shuru Karein!</h1>
          <p className="hero-subtitle">Bina ek rupya lagaye, ghar bethe SJ10 ke sath apna e-commerce business chalayein aur mahana hazaron kamayein.</p>
       </div>

       {/* Main Content (Roman Urdu) */}
       <div className="content-container">
          <div className="intro-card">
              <p>
                <strong>Assalam o Alaikum!</strong> Kya aap bhi internet pe "how to make money online in Pakistan" search kar kar ke thak gaye hain? Aur har jagah scam ya investment ka bola jata hai? 
                <br/><br/>
                Tension khatam! <strong>SJ10</strong> laya hai Pakistan ka sab se behtareen Reselling program jahan aapko apni pocket se ek rupya bhi nahi lagana. Products hamari, delivery hamari, aur <strong>Profit apka!</strong>
              </p>
          </div>

          <h2 className="section-heading"><i className="fas fa-rocket"></i> SJ10 Reseller Banne Ka Tarika (Step-by-Step)</h2>

          <div className="steps-grid">
             {/* Step 1 */}
             <div className="step-card">
                <div className="step-icon"><i className="fas fa-user-plus"></i></div>
                <h3>1. Account Banayein</h3>
                <p>Sab se pehle SJ10 par apna free account banayein. Apni details enter karein aur login kar lein. Koi registration fee nahi hai boss!</p>
             </div>

             {/* Step 2 */}
             <div className="step-card">
                <div className="step-icon"><i className="fab fa-whatsapp"></i></div>
                <h3>2. Products Share Karein</h3>
                <p>Hamari app/website se apni pasand ki products select karein (Fashion, Electronics, etc) aur unki pictures apne WhatsApp status, Facebook, ya Instagram par doston ke sath share karein.</p>
             </div>

             {/* Step 3 */}
             <div className="step-card">
                <div className="step-icon"><i className="fas fa-hand-holding-usd"></i></div>
                <h3>3. Apna Profit Set Karein</h3>
                <p>Jab koi customer aapse order mange, toh SJ10 pe aakar order place karein. Wholesale price mein <strong>apna profit</strong> add karein. (e.g. 1000 ki item, 1500 mein bechein = 500 apka profit!).</p>
             </div>

             {/* Step 4 */}
             <div className="step-card">
                <div className="step-icon"><i className="fas fa-truck-fast"></i></div>
                <h3>4. Hum Delivery Karenge (White Label)</h3>
                <p>Aapke customer ko parcel hum deliver karenge, wo bhi COD (Cash on Delivery) par. Parcel pe SJ10 ka naam nahi hoga, customer ko lagega aapne bheja hai!</p>
             </div>
          </div>

          <div className="profit-card">
              <h2><i className="fas fa-money-check-alt"></i> Profit Withdrawal (JazzCash / EasyPaisa / Bank)</h2>
              <p>Jaise hi customer ko order deliver hoga, apka profit seedha apke SJ10 Wallet mein aa jayega. Wahan se aap kisi bhi waqt apna paisa apne <strong>JazzCash, EasyPaisa, NayaPay ya Bank Account</strong> mein nikalwa sakte hain.</p>
              <Link href="/explore" className="cta-button">Abhi Products Share Karna Shuru Karein <i className="fas fa-arrow-right"></i></Link>
          </div>
       </div>

       {/* CSS STYLING */}
       <style dangerouslySetInnerHTML={{ __html: `
        .reselling-blog-wrapper { background: #f8fafc; min-height: 100vh; padding-bottom: 80px; font-family: 'Poppins', sans-serif; }
        .top-bar-nav { padding: 20px; background: white; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; position: sticky; top: 70px; z-index: 10; }
        .back-btn { color: #1e293b; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .badge { background: #dcfce7; color: #16a34a; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        
        .money-hero-banner { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; text-align: center; padding: 60px 20px; border-radius: 0 0 40px 40px; box-shadow: 0 10px 30px rgba(22, 163, 74, 0.3); }
        .pulse-anim { animation: pulse 2s infinite; margin-bottom: 20px; color: #fef08a; }
        .hero-title { font-size: 28px; font-weight: 800; margin: 0 0 10px 0; line-height: 1.3; }
        .hero-subtitle { font-size: 15px; opacity: 0.9; max-width: 600px; margin: 0 auto; line-height: 1.6; }
        
        .content-container { max-width: 800px; margin: -30px auto 0; padding: 0 20px; position: relative; z-index: 5; }
        .intro-card { background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 30px; font-size: 15px; color: #475569; line-height: 1.8; border-left: 5px solid #16a34a; }
        
        .section-heading { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .steps-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 40px; }
        @media(min-width: 640px){ .steps-grid { grid-template-columns: 1fr 1fr; } }
        
        .step-card { background: white; padding: 25px; border-radius: 16px; text-align: center; border: 1px solid #f1f5f9; transition: transform 0.3s; }
        .step-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .step-icon { width: 60px; height: 60px; background: #fffbeb; color: #ca8a04; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 24px; margin: 0 auto 15px; }
        .step-card h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
        .step-card p { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0; }
        
        .profit-card { background: #1e293b; color: white; padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 40px; }
        .profit-card h2 { color: #facc15; font-size: 22px; margin-bottom: 15px; }
        .profit-card p { font-size: 15px; color: #cbd5e1; line-height: 1.7; margin-bottom: 25px; }
        
        .cta-button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: #16a34a; color: white; padding: 15px 30px; border-radius: 50px; font-weight: 700; text-decoration: none; transition: 0.3s; width: 100%; max-width: 300px; }
        .cta-button:hover { background: #15803d; transform: scale(1.05); }

        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
       `}} />
    </div>
  );
}