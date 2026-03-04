"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ==============================================================
// 🔧 CONFIGURATION AREA
// ==============================================================

// 1. MOBILE BOTTOM NAV ITEMS
const navItems = [
  { href: '/', label: 'Home', icon: 'fas fa-home' },
  { href: '/category', label: 'Category', icon: 'fas fa-th-large' },
  { href: '/explore', label: 'Explore', icon: 'fas fa-compass' },
  { href: '/orders', label: 'Orders', icon: 'fas fa-box' },
  { href: '/profile', label: 'Profile', icon: 'fas fa-user' },
];

// 2. DESKTOP RICH LINK DATA
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
  { name: "💥 Under Rs. 999", href: "/explore", badge: "Hot" },
  { name: "🚚 Free Shipping Deals", href: "/explore" },
];

// ⭐ 3. EXTERNAL PROMOTIONAL LINKS (Add your links here!) ⭐
// Leave empty [] to hide the section.
// Example: { name: "My Other Shop", url: "https://google.com" }
const externalPromos = [
   { name: "Visit Our Partner Site", url: "https://example.com" }, 
   { name: "Aoun Abbas Portfolio", url: "https://linkedin.com" },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <>
      {/* ============================================================== */}
      {/*  DESKTOP FOOTER (Hidden on Mobile, Rich on Desktop)            */}
      {/* ============================================================== */}
      <footer className="desktop-footer">
        
        {/* Top Decorative Strip */}
        <div className="footer-strip"></div>

        <div className="footer-content">
          <div className="footer-container">
            
            {/* --- SECTION A: GRAND NAVIGATION (4 MAIN BUTTONS) --- */}
            <div className="grand-nav-row">
                <Link href="/" className="grand-link-item home">
                  <div className="grand-icon"><i className="fas fa-home"></i></div>
                  <div className="grand-text">
                    <strong>Home</strong>
                    <span>Start Shopping</span>
                  </div>
                </Link>

                <Link href="/category" className="grand-link-item category">
                  <div className="grand-icon"><i className="fas fa-th-large"></i></div>
                  <div className="grand-text">
                    <strong>Category</strong>
                    <span>Browse All</span>
                  </div>
                </Link>

                <Link href="/explore" className="grand-link-item explore">
                  <div className="grand-icon"><i className="fas fa-rocket"></i></div>
                  <div className="grand-text">
                    <strong>Explore</strong>
                    <span>Trending Items</span>
                  </div>
                </Link>

                <Link href="/profile" className="grand-link-item profile">
                  <div className="grand-icon"><i className="fas fa-user-circle"></i></div>
                  <div className="grand-text">
                    <strong>My Profile</strong>
                    <span>Account & Orders</span>
                  </div>
                </Link>
            </div>

            <div className="divider-line"></div>

            {/* --- SECTION B: RICH LINKS GRID --- */}
            <div className="rich-links-grid">
                
                {/* Column 1: Brand & Local SEO */}
                <div className="footer-col brand-col">
                    <h2 className="footer-logo">
                        <span className="text-white">SJ</span><span className="text-orange">10</span>
                    </h2>
                    <p className="footer-desc">
                        Pakistan's premium multi-vendor marketplace. Fast delivery, secure payments, and zero-investment reselling opportunities.
                    </p>
                    <div className="local-seo">
                        <strong>Serving:</strong> Karachi, Lahore, Islamabad, Quetta, Peshawar & all over Pakistan.
                    </div>
                    <div className="social-row">
                        <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                        <a href="#" className="social-icon"><i className="fab fa-tiktok"></i></a>
                        <a href="#" className="social-icon"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>

                {/* Column 2: Categories */}
                <div className="footer-col">
                    <h4 className="footer-heading">Top Categories</h4>
                    <ul className="footer-list">
                        {topCategories.map(cat => (
                        <li key={cat.slug}>
                            <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                        </li>
                        ))}
                    </ul>
                </div>

                {/* Column 3: Discounts & ⭐ EXTERNAL PROMOS ⭐ */}
                <div className="footer-col">
                    <h4 className="footer-heading">Deals & Offers</h4>
                    <ul className="footer-list">
                        {activeDiscounts.map((deal, idx) => (
                        <li key={idx}>
                            <Link href={deal.href} className="deal-link">
                                {deal.name}
                                {deal.badge && <span className="deal-badge">{deal.badge}</span>}
                            </Link>
                        </li>
                        ))}
                    </ul>

                    {/* --- DYNAMIC PROMO SECTION --- */}
                    {/* This only appears if you add items to the 'externalPromos' array */}
                    {externalPromos.length > 0 && (
                      <div className="external-promo-section">
                        <h4 className="footer-heading" style={{marginTop: '25px', marginBottom: '15px'}}>Our Partners</h4>
                        <ul className="footer-list">
                          {externalPromos.map((link, idx) => (
                            <li key={idx}>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="external-link">
                                {link.name} <i className="fas fa-external-link-alt" style={{ fontSize: 10, marginLeft: 6, opacity: 0.7 }}></i>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Column 4: Customer Care & Policies */}
                <div className="footer-col">
                    <h4 className="footer-heading">Customer Care</h4>
                    <ul className="footer-list">
                        <li><Link href="/shipping-policy">Shipping Policy</Link></li>
                        <li><Link href="/return-policy">Return Policy</Link></li>
                        <li><Link href="/terms">Terms & Conditions</Link></li>
                        <li><Link href="/privacy">Privacy Policy</Link></li>
                        <li><Link href="/about-us">About Us</Link></li>
                    </ul>
                    
                    <div className="sell-box">
                        <a href="https://sj10suppliers.netlify.app/" target="_blank" className="sell-btn">
                            Become a Supplier
                        </a>
                    </div>
                </div>

            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SJ10.pk. All Rights Reserved.</p>
        </div>
      </footer>

      {/* ============================================================== */}
      {/*  MOBILE BOTTOM NAV (Glassmorphic)                              */}
      {/* ============================================================== */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              href={item.href} 
              key={item.label} 
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="icon-container">
                <i className={item.icon}></i>
              </div>
              <span className="label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ============================================================== */}
      {/*  STYLES                                                        */}
      {/* ============================================================== */}
      <style jsx>{`
        :global(:root) {
          --primary-orange: #ff7f00;
          --dark-blue: #0A1E40;
          --light-text: #cbd5e1;
        }

        /* --- MOBILE NAVIGATION CSS --- */
        .mobile-bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          height: 65px; background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          display: flex; justify-content: space-around; alignItems: center;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.05); z-index: 9999;
          padding-bottom: env(safe-area-inset-bottom);
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .nav-item {
          display: flex; flexDirection: column; alignItems: center;
          justify-content: center; text-decoration: none;
          color: #94a3b8; font-size: 10px; font-weight: 500;
          width: 20%; height: 100%; transition: all 0.25s ease;
          position: relative; -webkit-tap-highlight-color: transparent;
        }
        .icon-container {
          font-size: 20px; margin-bottom: 3px;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex; alignItems: center; justify-content: center; height: 24px;
        }
        .nav-item.active { color: var(--primary-orange); }
        .nav-item.active .icon-container { transform: translateY(-2px) scale(1.1); }
        .nav-item.active .label { font-weight: 700; color: var(--primary-orange); }

        /* --- DESKTOP FOOTER CSS --- */
        .desktop-footer { display: none; }

        @media (min-width: 1024px) {
          .mobile-bottom-nav { display: none !important; }
          .desktop-footer {
            display: block; background-color: var(--dark-blue);
            color: #fff; margin-top: 60px;
          }
          .footer-strip { height: 6px; width: 100%; background: linear-gradient(90deg, #ff7f00, #ffae00, #ff7f00); }
          .footer-content { padding: 50px 0; }
          .footer-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

          .grand-nav-row { display: flex; gap: 20px; justify-content: space-between; margin-bottom: 40px; }
          .grand-link-item {
            flex: 1; display: flex; align-items: center; gap: 15px;
            background: rgba(255,255,255,0.05); padding: 20px;
            border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
            text-decoration: none; transition: all 0.3s ease;
          }
          .grand-link-item:hover { background: rgba(255,255,255,0.1); border-color: var(--primary-orange); transform: translateY(-3px); }
          .grand-icon { font-size: 28px; color: var(--primary-orange); width: 50px; text-align: center; }
          .grand-text { display: flex; flexDirection: column; }
          .grand-text strong { color: #fff; font-size: 17px; }
          .grand-text span { color: #94a3b8; font-size: 13px; }

          .divider-line { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 40px; }

          .rich-links-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; }
          .footer-logo { font-size: 32px; font-weight: 900; margin-bottom: 15px; letter-spacing: -1px; }
          .text-white { color: #fff; } .text-orange { color: var(--primary-orange); }
          .footer-desc { color: var(--light-text); font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
          .local-seo { font-size: 12px; color: #64748b; margin-bottom: 20px; }
          .local-seo strong { color: #94a3b8; }
          .social-row { display: flex; gap: 12px; }
          .social-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border-radius: 50%; color: #fff; transition: 0.3s; }
          .social-icon:hover { background: var(--primary-orange); transform: translateY(-3px); }

          .footer-heading { font-size: 17px; font-weight: 700; margin-bottom: 20px; color: #fff; position: relative; display: inline-block; }
          .footer-heading::after { content: ''; position: absolute; left: 0; bottom: -8px; width: 30px; height: 3px; background: var(--primary-orange); border-radius: 2px; }

          .footer-list { list-style: none; padding: 0; margin: 0; }
          .footer-list li { margin-bottom: 12px; }
          .footer-list a { color: var(--light-text); text-decoration: none; font-size: 14px; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
          .footer-list a:hover { color: var(--primary-orange); padding-left: 5px; }
          .footer-list a::before { content: '›'; color: var(--primary-orange); font-size: 16px; }
          
          /* External Link Specific Style */
          .external-link { color: #93c5fd !important; }
          .external-link:hover { color: #fff !important; }

          .deal-badge { background: var(--primary-orange); color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: 700; text-transform: uppercase; }
          .sell-box { margin-top: 20px; }
          .sell-btn { display: block; text-align: center; background: var(--primary-orange); color: #fff; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; transition: 0.3s; }
          .sell-btn:hover { background: #e67300; }
          .footer-bottom { background: rgba(0,0,0,0.2); padding: 20px; text-align: center; color: #64748b; font-size: 13px; }
        }
      `}</style>
    </>
  );
}