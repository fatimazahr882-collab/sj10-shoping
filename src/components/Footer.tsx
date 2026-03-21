// src/components/Footer.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
   { name: "Visit Our Partner Site", url: "https://example.com" }, 
   { name: "Aoun Abbas Portfolio", url: "https://linkedin.com" },
];

export default function Footer() {
  const pathname = usePathname();

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
                        {/* ✅ FIX: Added aria-label to all icon links */}
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
    </>
  );
}