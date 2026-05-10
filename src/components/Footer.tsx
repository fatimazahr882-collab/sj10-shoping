// src/components/Footer.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: 'fas fa-home' },
  { href: '/category', label: 'Category', icon: 'fas fa-th-large' },
  { href: '/explore', label: 'Explore', icon: 'fas fa-compass' },
  { href: '/orders', label: 'Orders', icon: 'fas fa-box' },
  { href: '/profile', label: 'Profile', icon: 'fas fa-user' },


];

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

const externalPromos = [
   { name: "Housewives Ke Liye Top 5 Online Business Ideas", url: "https://www.sj10.pk/profile/blog/housewife-business-ideas" },
   { name: "WhatsApp Status Se Mahana 30,000 Kaise Kamayein?", url: "https://www.sj10.pk/profile/blog/whatsapp-status-earning-guide" },
   { name: "Ghar Bethe Mahana 50,000 Kaise Kamayein? (Ultimate Guide)", url: "https://www.sj10.pk/profile/blog/mahana-50000-kaise-kamayein" },
   { name: "Start Reselling with Zero Investment", url: "https://www.sj10.pk/profile/blog/zero-investment-reselling" },
];

export default function Footer() {
  const pathname = usePathname();
  const [showGoTop, setShowGoTop] = useState(false);

  // Scroll event listener for "Go To Top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowGoTop(true);
      } else {
        setShowGoTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="desktop-footer">
        <div className="footer-strip"></div>
        <div className="footer-content">
          <div className="footer-container">
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
            <div className="rich-links-grid">
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
                        <a href="https://www.facebook.com/share/1Bq48JrhYK/" target="_blank" rel="noreferrer" className="social-icon" aria-label="Visit our Facebook page">
                          <i className="fab fa-facebook-f" aria-hidden="true"></i>
                        </a>
                        <a href="https://www.instagram.com/sj10official" target="_blank" rel="noreferrer" className="social-icon" aria-label="Visit our Instagram page">
                          <i className="fab fa-instagram" aria-hidden="true"></i>
                        </a>
                        <a href="https://www.tiktok.com/@sj10official" target="_blank" rel="noreferrer" className="social-icon" aria-label="Visit our TikTok page">
                          <i className="fab fa-tiktok" aria-hidden="true"></i>
                        </a>
                        <a href="https://youtube.com/@sj10official" target="_blank" rel="noreferrer" className="social-icon" aria-label="Visit our YouTube channel">
                          <i className="fab fa-youtube" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
                <div className="footer-col">
                    <h4 className="footer-heading">Top Categories</h4>
                    <ul className="footer-list">
                        {topCategories.map(cat => (<li key={cat.slug}><Link href={`/category/${cat.slug}`}>{cat.name}</Link></li>))}
                    </ul>
                </div>
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
                    {externalPromos.length > 0 && (
                      <div className="external-promo-section" style={{marginTop: '30px'}}>
                        <h4 className="footer-heading" style={{marginBottom: '15px'}}>Our Partners</h4>
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
                        <a href="https://sj10seller.online/" target="_blank" className="sell-btn">
                            Become a Supplier
                        </a>
                    </div>
                </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SJ10.pk. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
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

      {/* 🚀 Beautiful Animated Go To Top Button */}
      <button 
        onClick={scrollToTop} 
        className={`go-top-btn ${showGoTop ? 'visible' : ''}`}
        aria-label="Scroll to top"
      >
        <i className="fas fa-arrow-up"></i>
      </button>

      {/* Scoped CSS for the Go To Top Button */}
      <style jsx>{`
        .go-top-btn {
          position: fixed;
          right: 20px;
          /* Mobile par bottom nav bar (65px) ke upar rakhne ke liye 85px diya hai */
          bottom: 85px; 
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #f85606, #ff8a00);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 15px rgba(248, 86, 6, 0.4);
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 9998; /* Bottom nav se theek peechay, lekin content se upar */
        }
        
        .go-top-btn.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .go-top-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(248, 86, 6, 0.6);
        }

        .go-top-btn:active {
          transform: translateY(0);
        }

        /* Desktop view adjustments */
        @media (min-width: 1024px) {
          .go-top-btn {
            bottom: 40px; /* Desktop par bottom nav nahi hoti, isliye neeche kar diya */
            right: 40px;
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
}