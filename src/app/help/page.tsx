// src/app/help/page.tsx
import '../styles/PolicyPages.css';

export default function HelpPage() {
  return (
    <div className="policy-container">
      <title>Help & Support | SJ10 Customer Care</title>
      
      <div className="policy-hero fade-in-down">
        <h1 className="policy-title">Help & Support</h1>
        <p className="policy-subtitle">We are here to help! Find answers to common questions below.</p>
      </div>

      <div className="policy-content-wrapper" style={{ display: 'block' }}>
        <main className="policy-text-area">
          <section className="policy-section">
            <h2 className="section-title"><span className="section-icon">❓</span> F.A.Q</h2>
            <p><strong>How do I track my order?</strong><br/>You can track your order status from the "My Orders" page in your profile section after logging in.</p>
            <p><strong>What is the delivery time?</strong><br/>Our standard delivery time is 3 to 7 business days for all locations in Pakistan.</p>
          </section>

          <section className="policy-section">
            <h2 className="section-title"><span className="section-icon">🔄</span> Returns & Refunds</h2>
            <p>If you received a damaged or incorrect item, you can request a return within 7 days of delivery. Please make sure to record an unboxing video as proof. For more details, please read our full <a href="/return-policy" style={{color: '#00b862', fontWeight: 'bold'}}>Return Policy</a>.</p>
          </section>

          <section className="policy-section">
            <h2 className="section-title"><span className="section-icon">💼</span> Reselling Program</h2>
            <p>To start reselling, simply share products from our website and set your own price. When you get an order, place it on our site with your customer's details and your profit. We will handle the rest! Your profit is sent to your wallet after delivery.</p>
          </section>

        </main>
      </div>
    </div>
  );
}