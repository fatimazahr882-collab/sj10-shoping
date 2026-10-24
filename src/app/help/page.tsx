// src/app/help/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  {
    q: "How can I track my order delivery?",
    a: "You can track your parcel in real-time from the 'My Orders' section in your account. Click 'Track Parcel' to see the live courier status (TCS, Leopards, PostEx)."
  },
  {
    q: "What is the standard delivery timeline across Pakistan?",
    a: "Our standard doorstep delivery takes 2 to 4 business days in major cities (Lahore, Karachi, Islamabad) and 3 to 6 days for remote areas."
  },
  {
    q: "How does the 7-day return policy work?",
    a: "If you received a defective, damaged, or incorrect item, you can request an instant return within 7 days directly from your Orders page with a photo/video proof."
  },
  {
    q: "How do resellers earn profit with zero investment?",
    a: "Simply browse products on SJ10, set your customer price, and share product images to WhatsApp or Facebook. When an order is delivered, your profit is credited to your wallet immediately!"
  },
  {
    q: "How can I withdraw my earnings?",
    a: "Go to Profile > Profit Account to add your JazzCash, EasyPaisa, or Bank Account. Payouts are transferred within 24 hours."
  }
];

export default function HelpCenterPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchTopic, setSearchTopic] = useState('');

  const filteredFaqs = FAQS.filter(f => 
    f.q.toLowerCase().includes(searchTopic.toLowerCase()) || 
    f.a.toLowerCase().includes(searchTopic.toLowerCase())
  );

  return (
    <div className="help-center-root">
      
      {/* Hero Banner */}
      <div className="help-hero">
        <span className="help-badge">24/7 CUSTOMER CARE</span>
        <h2>How can we help you today?</h2>
        <p>Find answers to common questions or reach out to our dedicated support team.</p>
        
        <div className="help-search-box">
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search help topics (e.g., return, tracking, wallet)..." 
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
          />
        </div>
      </div>

      <div className="help-content-wrapper">
        {/* Quick Action Tiles */}
        <div className="quick-action-grid">
          <Link href="/orders" className="action-card">
            <div className="action-icon-circle blue">📦</div>
            <h3>Track Parcel</h3>
            <p>Check courier status and estimated delivery time.</p>
          </Link>

          <Link href="/return-policy" className="action-card">
            <div className="action-icon-circle green">🛡️</div>
            <h3>Return Policy</h3>
            <p>7-day hassle-free replacement & refund process.</p>
          </Link>

          <Link href="/profile/my-earnings" className="action-card">
            <div className="action-icon-circle orange">💰</div>
            <h3>Profit Wallet</h3>
            <p>Withdraw reseller profits to JazzCash / EasyPaisa.</p>
          </Link>

          <a 
            href="https://wa.me/923368361990?text=Assalam-o-Alaikum%20SJ10%20Support!%20I%20need%20help%20with%20my%20order." 
            target="_blank" 
            rel="noopener noreferrer" 
            className="action-card whatsapp-card"
          >
            <div className="action-icon-circle emerald">💬</div>
            <h3>WhatsApp Care</h3>
            <p>Talk directly with our live customer representative.</p>
          </a>
        </div>

        {/* FAQs Section */}
        <div className="faq-section-box">
          <h3 className="section-title">Frequently Asked Questions</h3>

          <div className="faq-list">
            {filteredFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="faq-item" onClick={() => setOpenFaq(isOpen ? null : i)}>
                  <div className="faq-question">
                    <span>{faq.q}</span>
                    <span className={`faq-chevron ${isOpen ? 'rotate' : ''}`}>▾</span>
                  </div>
                  {isOpen && (
                    <div className="faq-answer">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Direct WhatsApp Callout Banner */}
        <div className="support-banner">
          <div>
            <h3>Still have questions?</h3>
            <p>Our support team is available Monday to Saturday (9 AM - 9 PM).</p>
          </div>
          <a 
            href="https://wa.me/923368361990?text=Assalam-o-Alaikum%20SJ10%20Help%20Center!" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="support-btn"
          >
            Chat on WhatsApp →
          </a>
        </div>
      </div>

      <style jsx>{`
        .help-center-root { min-height: 100vh; background: #f8fafc; font-family: 'Poppins', sans-serif; padding-bottom: 80px; }

        .help-hero {
          background: linear-gradient(135deg, #0b192c 0%, #1e3a8a 100%);
          padding: 45px 20px 55px; text-align: center; color: white;
        }
        .help-badge { background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }
        .help-hero h2 { font-size: 26px; font-weight: 900; margin: 12px 0 6px; }
        .help-hero p { font-size: 13.5px; color: #bfdbfe; margin: 0 auto 24px; max-width: 500px; }

        .help-search-box {
          max-width: 550px; margin: 0 auto; display: flex; align-items: center;
          background: white; border-radius: 50px; padding: 6px 18px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .help-search-box input { flex: 1; border: none; outline: none; padding: 10px; font-size: 14px; color: #1e293b; }

        .help-content-wrapper { max-width: 1000px; margin: -25px auto 0; padding: 0 16px; }

        .quick-action-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 30px; }
        @media(min-width: 768px) { .quick-action-grid { grid-template-columns: repeat(4, 1fr); } }

        .action-card {
          background: white; border-radius: 16px; padding: 20px; border: 1px solid #f1f5f9;
          text-decoration: none; display: flex; flex-direction: column; align-items: center; text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: all 0.2s;
        }
        .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
        .action-icon-circle { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 12px; }
        .action-icon-circle.blue { background: #eff6ff; }
        .action-icon-circle.green { background: #f0fdf4; }
        .action-icon-circle.orange { background: #fff7ed; }
        .action-icon-circle.emerald { background: #ecfdf5; }
        .action-card h3 { font-size: 14.5px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
        .action-card p { font-size: 11.5px; color: #64748b; margin: 0; line-height: 1.4; }

        .faq-section-box { background: white; border-radius: 20px; padding: 25px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 16px; }

        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; cursor: pointer; }
        .faq-question { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 700; color: #1e293b; }
        .faq-chevron { font-size: 16px; transition: transform 0.2s; }
        .faq-chevron.rotate { transform: rotate(180deg); }
        .faq-answer { font-size: 13px; color: #475569; line-height: 1.6; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; }

        .support-banner {
          background: #fff7ed; border: 1.5px dashed #fed7aa; border-radius: 18px;
          padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
        }
        .support-banner h3 { margin: 0 0 4px; font-size: 16px; font-weight: 800; color: #9a3412; }
        .support-banner p { margin: 0; font-size: 12.5px; color: #c2410c; }
        .support-btn { background: #25d366; color: white; padding: 12px 22px; border-radius: 50px; font-weight: 800; font-size: 13px; text-decoration: none; box-shadow: 0 4px 12px rgba(37,211,102,0.35); }
      `}</style>
    </div>
  );
}