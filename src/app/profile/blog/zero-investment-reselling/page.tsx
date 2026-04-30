// src/app/profile/blog/zero-investment-reselling/page.tsx
import Link from 'next/link';

export const metadata = {
  title: "Start Reselling with Zero Investment | SJ10",
  description: "Learn how to use SJ10 to start your reselling business from home.",
};

export default function ResellingBlog() {
  return (
    <div className="reselling-blog">
       <div className="top-bar">
          <Link href="/profile/blog" className="back"><i className="fas fa-arrow-left"></i></Link>
          <span>Business Guide</span>
       </div>

       {/* Dekho iska design pichle blog se bilkul alag hai! */}
       <div className="money-banner">
          <i className="fas fa-money-bill-wave fa-3x"></i>
          <h1>Start Earning Today!</h1>
       </div>

       <div className="steps-container">
          <div className="step">
             <div className="circle">1</div>
             <h3>Create an Account</h3>
             <p>Sign up on SJ10 as a reseller.</p>
          </div>
          <div className="step">
             <div className="circle">2</div>
             <h3>Share Products</h3>
             <p>Send pictures to your WhatsApp contacts.</p>
          </div>
       </div>

       <style jsx>{`
        .reselling-blog { background: #f0fdf4; min-height: 100vh; padding-bottom: 50px; font-family: 'Poppins', sans-serif; }
        .top-bar { padding: 20px; background: white; display: flex; gap: 15px; align-items: center; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
        .back { color: #111; text-decoration: none; }
        .money-banner { background: #16a34a; color: white; text-align: center; padding: 50px 20px; border-radius: 0 0 30px 30px; }
        .steps-container { max-width: 600px; margin: 30px auto; padding: 20px; }
        .step { background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .circle { width: 50px; height: 50px; background: #ff7f00; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 15px; }
       `}</style>
    </div>
  );
}