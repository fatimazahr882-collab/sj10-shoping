"use client"; 

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useCart } from '@/context/CartContext'; 
import NotificationBell from './NotificationBell'; 
import ClientOnly from './ClientOnly';

const promoTexts =[
  "🚀 Pakistan's #1 Online Shopping Site", 
  "📦 Cash On Delivery All Over Pakistan", 
  "💸 Zero Investment Reselling Business"
];

export default function Header() {
  const [currentPromoText, setCurrentPromoText] = useState(promoTexts[0]);
  const { itemCount } = useCart(); 
  const [showFullHeader, setShowFullHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY < 50) {
            setShowFullHeader(true);
          } else if (currentScrollY > lastScrollY.current + 15) {
            setShowFullHeader(false); 
          } else if (currentScrollY < lastScrollY.current - 15) {
            setShowFullHeader(true);  
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  },[]);

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % promoTexts.length;
      setCurrentPromoText(promoTexts[currentIndex]);
    }, 3500);
    return () => clearInterval(intervalId);
  },[]);
  
  return (
    <header className={`global-sticky-header ${showFullHeader ? 'header-visible' : 'header-hidden'}`}>
      
      {/* MOBILE VIEW */}
      <div className="mobile-header-block">
        <Link href="/" aria-label="Go to SJ10 Homepage">
          <video src="/logo.mp4" width={55} height={55} autoPlay muted loop playsInline className="mobile-logo-vid" style={{mixBlendMode: 'multiply'}} aria-hidden="true" />
        </Link>
        <div className="mobile-icons-group">
           <Link href="/favorites" aria-label="View Favorites"><i className="fa-regular fa-heart text-xl text-gray-700"></i></Link>
           <NotificationBell />
           <Link href="/cart" aria-label="Open Shopping Cart" style={{ position: 'relative' }}>
             <i className="fa-solid fa-bag-shopping text-gray-700 text-xl"></i>
             <ClientOnly>
               {itemCount > 0 && <span className="cart-badge-mob">{itemCount}</span>}
             </ClientOnly>
           </Link>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="desktop-header-block">
        <div className="desktop-header-inner">
          <div className="header-left">
            <a href="https://sj10seller.online" target="_blank" rel="noreferrer" className="sell-badge-top">
              <i className="fas fa-store-alt"></i> Sell on SJ10 & Earn
            </a>
            <span className="divider">|</span>
            <Link href="/orders" className="micro-link highlight">
              <i className="fas fa-truck-fast"></i> Track Order
            </Link>
          </div>

          <div className="header-center-promo" aria-live="polite">
            <span id="promo-text-anim" key={currentPromoText}>
              {currentPromoText}
            </span>
          </div>

          <div className="header-right">
             <Link href="/help" className="micro-link">
               <i className="fas fa-headset"></i> Help & Support
             </Link>
             <div className="anim-bell-wrapper">
                <NotificationBell />
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}