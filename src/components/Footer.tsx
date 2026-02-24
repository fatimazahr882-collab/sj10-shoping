// src/components/Footer.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- MOBILE BOTTOM NAV ITEMS ---
const navItems = [
  { href: '/', label: 'Home', icon: 'fas fa-home' },
  { href: '/category', label: 'Category', icon: 'fas fa-th-large' },
  { href: '/explore', label: 'Explore', icon: 'fas fa-search' },
  { href: '/orders', label: 'Orders', icon: 'fas fa-box' },
  { href: '/profile', label: 'Profile', icon: 'fas fa-user' },
];

// --- DESKTOP FOOTER LINK DATA ---
const topCategories = [
  { name: "Women's Clothing", slug: "womens-stiched-23" },
  { name: "Men's Fashion", slug: "mens-stiched-clothes-51" },
  { name: "Electronics & Tech", slug: "electronics-61" },
  { name: "Health & Beauty", slug: "cosmetics-21" },
  { name: "Home & Decor", slug: "home-decore-48" },
  { name: "Kids & Toys", slug: "kid-s-accessories-69" },
];

const activeDiscounts = [
  { name: "🔥 Flash Sales", href: "/explore", badge: "Live" },
  { name: "🎉 Ramadan Bazaar", href: "/category/festive-collections-41" },
  { name: "💥 Clearance: Under Rs. 999", href: "/explore", badge: "Hot" },
  { name: "🚚 Free Shipping Deals", href: "/explore" },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <>
      {/* ========================================== */}
      {/*         SEO-RICH DESKTOP FOOTER            */}
      {/* ========================================== */}
      <footer className="sj-desktop-footer">
        {/* Top Orange Decorative Strip */}
        <div className="footer-top-strip"></div>

        <div className="footer-main">
          <div className="footer-container">
            
            {/* COLUMN 1: Brand, Home Link & Local SEO */}
            <div className="footer-col brand-col">
              <h2 className="footer-logo">
                <span className="text-white">SJ</span><span className="text-orange">10</span>
              </h2>
              <p className="footer-desc">
                Pakistan's premium multi-vendor marketplace. Experience the best quality, prices, and fast delivery right to your doorstep.
              </p>
              
              {/* Home Navigation Button */}
              <Link href="/" className="home-nav-btn">
                <i className="fas fa-home"></i> Return to Homepage
              </Link>

              <div className="local-seo">
                <strong>Serving:</strong> Karachi, Lahore, Islamabad, Quetta, Peshawar & all over Pakistan.
              </div>
            </div>

            {/* COLUMN 2: Categories */}
            <div className="footer-col">
              <h4 className="footer-heading">Top Categories</h4>
              <ul className="footer-links">
                {topCategories.map(cat => (
                  <li key={cat.slug}>
                    <Link href={`/category/${cat.slug}`}>
                      <i className="fas fa-angle-right link-icon"></i> {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: Discounts & Deals */}
            <div className="footer-col">
              <h4 className="footer-heading">Active Discounts</h4>
              <ul className="footer-links">
                {activeDiscounts.map((deal, idx) => (
                  <li key={idx}>
                    <Link href={deal.href} className="deal-link">
                      <i className="fas fa-angle-right link-icon"></i> {deal.name}
                      {deal.badge && <span className="deal-badge">{deal.badge}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 4: Customer Care & Sell */}
            <div className="footer-col">
              <h4 className="footer-heading">Customer Care</h4>
              <ul className="footer-links">
                <li><Link href="/profile"><i className="fas fa-angle-right link-icon"></i> My Account</Link></li>
                <li><Link href="/orders"><i className="fas fa-angle-right link-icon"></i> Track Order</Link></li>
                <li><Link href="/shipping-policy"><i className="fas fa-angle-right link-icon"></i> Shipping Policy</Link></li>
                <li><Link href="/terms"><i className="fas fa-angle-right link-icon"></i> Terms & Conditions</Link></li>
                <li><Link href="/privacy"><i className="fas fa-angle-right link-icon"></i> Privacy Policy</Link></li>
              </ul>
              
              <div className="sell-with-us-box">
                <h5>Want to earn with us?</h5>
                <a href="https://sj10suppliers.netlify.app/" target="_blank" rel="noopener noreferrer" className="sell-btn">
                  Become a Supplier
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright & Socials */}
        <div className="footer-bottom">
          <div className="footer-container bottom-flex">
            <p className="copyright">&copy; {new Date().getFullYear()} SJ10.pk. All rights reserved.</p>
            <div className="social-icons">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/aounstore.shop" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              <a href="https://www.tiktok.com/@aounstoreshop" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a>
              <a href="https://whatsapp.com/channel/0029Vb6PEhOLNSa6Z6OtPS1U" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================== */}
      {/*         MOBILE BOTTOM NAV (Your UI)        */}
      {/* ========================================== */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <Link 
            href={item.href} 
            key={item.label} 
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ========================================== */}
      {/*                  STYLES                    */}
      {/* ========================================== */}
      <style jsx>{`
        /* --- MAIN FOOTER WRAPPER --- */
        .sj-desktop-footer {
          background-color: #0A1E40; /* Deep Navy Blue */
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          margin-top: 40px;
          /* Margin bottom ensures it doesn't get hidden behind mobile nav on small screens */
          padding-bottom: 75px; 
          position: relative;
        }

        @media (min-width: 1024px) {
          .sj-desktop-footer { padding-bottom: 0; }
        }

        /* Top Orange Strip */
        .footer-top-strip {
          height: 6px;
          width: 100%;
          background: linear-gradient(90deg, #FF7F00, #FFA500, #FF7F00);
        }

        .footer-main {
          padding: 60px 20px 40px 20px;
        }

        .footer-container {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }

        @media (min-width: 640px) {
          .footer-container { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
          .footer-container { grid-template-columns: 2fr 1fr 1.5fr 1.2fr; gap: 30px; }
        }

        /* --- COLUMNS & TYPOGRAPHY --- */
        .footer-logo {
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 15px 0;
          letter-spacing: -1px;
        }
        .text-white { color: #ffffff; }
        .text-orange { color: #FF7F00; }

        .footer-desc {
          font-size: 14px;
          color: #93C5FD; /* Light Blue/White tint */
          line-height: 1.6;
          margin-bottom: 20px;
          max-width: 90%;
        }

        /* Home Button inside Footer */
        .home-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }
        .home-nav-btn:hover {
          background-color: #FF7F00;
          border-color: #FF7F00;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 127, 0, 0.3);
        }

        .local-seo {
          font-size: 12px;
          color: #64748B;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 15px;
        }
        .local-seo strong { color: #93C5FD; }

        .footer-heading {
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 25px;
          position: relative;
          display: inline-block;
        }
        /* Orange underline under headings */
        .footer-heading::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -8px;
          width: 40px;
          height: 3px;
          background-color: #FF7F00;
          border-radius: 2px;
        }

        /* --- LINKS --- */
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-links li {
          margin-bottom: 14px;
        }
        .footer-links a {
          color: #93C5FD;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
        }
        .link-icon {
          font-size: 10px;
          margin-right: 8px;
          color: #FF7F00;
          transition: transform 0.2s;
        }
        .footer-links a:hover {
          color: #ffffff;
        }
        .footer-links a:hover .link-icon {
          transform: translateX(4px);
        }

        /* Deals & Badges */
        .deal-link { position: relative; }
        .deal-badge {
          background-color: #FF7F00;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
          text-transform: uppercase;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 127, 0, 0.7); }
          70% { box-shadow: 0 0 0 5px rgba(255, 127, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 127, 0, 0); }
        }

        /* Sell with us box */
        .sell-with-us-box {
          margin-top: 25px;
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .sell-with-us-box h5 {
          margin: 0 0 10px 0;
          font-size: 13px;
          color: #E5E7EB;
        }
        .sell-btn {
          display: block;
          text-align: center;
          background: #FF7F00;
          color: #fff;
          text-decoration: none;
          padding: 10px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 13px;
          transition: background 0.3s;
        }
        .sell-btn:hover { background: #e67300; }

        /* --- FOOTER BOTTOM --- */
        .footer-bottom {
          background-color: #06142B; /* Even darker blue for contrast */
          padding: 20px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .bottom-flex {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        @media (min-width: 768px) {
          .bottom-flex {
            flex-direction: row;
            justify-content: space-between;
          }
        }
        
        .copyright {
          margin: 0;
          font-size: 13px;
          color: #64748B;
        }

        .social-icons {
          display: flex;
          gap: 12px;
        }
        .social-icons a {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .social-icons a:hover {
          background-color: #FF7F00;
          transform: translateY(-3px);
        }

        /* --- HIDE BOTTOM NAV ON DESKTOP --- */
        @media (min-width: 1024px) {
          .bottom-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}