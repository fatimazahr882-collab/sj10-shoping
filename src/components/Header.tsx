// src/components/Header.tsx
"use client"; 

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useCart } from '@/context/CartContext'; 
import NotificationBell from './NotificationBell'; 

const promoTexts =[
  "Pakistan's #1 Online Shopping Site 🇵🇰", 
  "COD All Over Pakistan 🇵🇰", 
  "Sell with SJ10 and Earn"
];

export default function Header() {
  const[currentPromoText, setCurrentPromoText] = useState(promoTexts[0]);
  const { itemCount } = useCart(); 
  const [showFullHeader, setShowFullHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setShowFullHeader(true);
      } else if (currentScrollY > lastScrollY.current + 10) {
        setShowFullHeader(false); 
      } else if (currentScrollY < lastScrollY.current - 10) {
        setShowFullHeader(true);  
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  },[]);

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % promoTexts.length;
      setCurrentPromoText(promoTexts[currentIndex]);
    }, 4000);
    return () => clearInterval(intervalId);
  },[]);
  
  return (
    <>
      <header className={`global-sticky-header ${showFullHeader ? 'header-visible' : 'header-hidden'}`}>
        <Link href="/" aria-label="Go to SJ10 Homepage">
          <video
            src="/logo.mp4" 
            width={65} 
            height={65}
            autoPlay
            muted
            loop
            playsInline
            className="logo"
            aria-hidden="true" /* ✅ FIX: Tells Lighthouse to ignore missing captions for decorative video */
            // @ts-expect-error
            fetchPriority="low" 
          />
        </Link>

        <div className="header-center-promo" aria-live="polite">
          <span id="promo-text-anim" key={currentPromoText}>
            {currentPromoText}
          </span>
        </div>

        <div className="header-icons">
          {/* ✅ FIX: Added aria-labels to all icon links so screen readers know what they do */}
          <Link href="/favorites" aria-label="View Favorites" style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>
             <i className="fa-regular fa-heart text-xl hover:text-red-500 transition-colors" aria-hidden="true"></i>
          </Link>

          <NotificationBell />
          
          <Link href="/cart" aria-label={`View Cart, ${itemCount} items`} style={{ position: 'relative', textDecoration: 'none', color: 'inherit', marginLeft: '8px' }}>
            <i className="fa-solid fa-bag-shopping" id="cart-icon" aria-hidden="true"></i>
            { itemCount > 0 && (
              <span className="cart-badge">{itemCount}</span>
            )}
          </Link>
        </div>
      </header>
      
      <style jsx global>{`
        .global-sticky-header { 
          position: fixed !important; top: 0 !important; left: 0; width: 100%; height: 70px !important; z-index: 9999 !important; 
          background: #ffffff; border-bottom: none !important; display: flex; justify-content: space-between; align-items: center; padding: 5px 15px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .global-sticky-header.header-visible { transform: translateY(0); }
        .global-sticky-header.header-hidden { transform: translateY(-100%); }
        .header-icons { display: flex; align-items: center; gap: 15px; }
        .cart-badge {
          position: absolute; top: -5px; right: -10px; background-color: #ff8a00; color: white;
          border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: bold; border: 2px solid white; z-index: 10;
        }
      `}</style>
    </>
  );
}