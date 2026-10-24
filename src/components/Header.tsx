// src/components/Header.tsx
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
      
      {/* MOBILE TOP BAR (65px) */}
      <div className="mobile-header-block">
        <Link href="/" aria-label="Go to SJ10 Homepage">
          <video src="/logo.mp4" width={55} height={55} autoPlay muted loop playsInline className="mobile-logo-vid" style={{mixBlendMode: 'multiply'}} aria-hidden="true" />
        </Link>
        <div className="mobile-icons-group">
           <Link href="/favorites" aria-label="View Favorites" style={{ display: 'flex', alignItems: 'center' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
           </Link>
           <NotificationBell />
           <Link href="/cart" aria-label="Open Shopping Cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
             <ClientOnly>
               {itemCount > 0 && <span className="cart-badge-mob">{itemCount}</span>}
             </ClientOnly>
           </Link>
        </div>
      </div>

      {/* DESKTOP TOP BAR (32px Slim) */}
      <div className="desktop-header-block">
        <div className="desktop-header-inner">
          <div className="header-left">
            <a href="https://sj10seller.online" target="_blank" rel="noreferrer" className="sell-badge-top">
              🏪 Sell on SJ10 & Earn
            </a>
            <span className="divider">|</span>
            <Link href="/orders" className="micro-link highlight">
              🚚 Track Order
            </Link>
          </div>

          <div className="header-center-promo" aria-live="polite">
            <span id="promo-text-anim" key={currentPromoText}>
              {currentPromoText}
            </span>
          </div>

          <div className="header-right">
             {/* 🟢 BEAUTIFUL HELP & SUPPORT LINK (DIRECT LINK TO /help) */}
             <Link href="/help" className="micro-link help-support-pill">
               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
               <span>Help & Support</span>
             </Link>
             
             {/* Bell Icon */}
             <div className="anim-bell-wrapper">
                <NotificationBell />
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}