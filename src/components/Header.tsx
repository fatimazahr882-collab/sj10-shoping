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

  // 🟢 GPU ACCELERATED SMOOTH SCROLL
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
    <>
      {/* ⚡ INSTANT CRITICAL CSS (STOPS 1-SECOND FLASH / FOUC) */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Default state: Hide desktop elements globally BEFORE first paint */
        .desktop-header-block { display: none !important; }
        .mobile-header-block { display: flex !important; }

        @media (min-width: 769px) {
          .desktop-header-block { display: block !important; }
          .mobile-header-block { display: none !important; }
        }
      `}} />

      <header className={`global-sticky-header ${showFullHeader ? 'header-visible' : 'header-hidden'}`}>
        
        {/* ========================================== */}
        {/* MOBILE VIEW (Strictly 65px Height)         */}
        {/* ========================================== */}
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

        {/* ========================================== */}
        {/* DESKTOP VIEW (Strictly 32px Slim Bar)      */}
        {/* ========================================== */}
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
      
      <style jsx global>{`
        /* --- GLOBAL STICKY WRAPPER --- */
        .global-sticky-header { 
          position: fixed !important; top: 0 !important; left: 0; width: 100%; 
          z-index: 10000 !important; 
          background: #ffffff; border-bottom: none !important; 
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          will-change: transform;
          transform: translateZ(0); /* GPU Acceleration */
          box-sizing: border-box;
        }
        .global-sticky-header.header-visible { transform: translateY(0); }
        .global-sticky-header.header-hidden { transform: translateY(-100%); }

        /* --- MOBILE HEADER STYLES --- */
        .mobile-header-block {
          justify-content: space-between; align-items: center;
          width: 100%; height: 65px; padding: 0 15px; box-sizing: border-box;
        }
        .mobile-icons-group { display: flex; align-items: center; gap: 16px; }
        .cart-badge-mob {
          position: absolute; top: -6px; right: -10px; background-color: #ff8a00; color: white;
          border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: bold; border: 2px solid white; z-index: 10;
        }

        @media (max-width: 768px) { 
          .global-sticky-header { height: 65px !important; }
          .global-sticky-header.header-hidden { transform: translateY(-100%); }
          body { padding-top: 135px !important; } 
        }

        /* --- DESKTOP SLIM BAR STYLES (STRICT 32px LOCK) --- */
        @media (min-width: 769px) {
          .global-sticky-header {
            height: 32px !important;
            min-height: 0 !important;
            max-height: 32px !important;
            overflow: hidden !important;
            background: #ffffff !important;
            border-bottom: 1px solid #f1f5f9 !important;
          }
          
          .desktop-header-block {
            width: 100%; height: 32px !important; max-height: 32px !important;
            overflow: hidden !important;
          }

          .desktop-header-inner {
            display: flex; justify-content: space-between; align-items: center;
            width: 100%; height: 32px !important; max-width: 1400px; margin: 0 auto; padding: 0 15px;
            box-sizing: border-box;
          }

          .header-left, .header-right { display: flex; align-items: center; gap: 12px; height: 32px !important; }

          .sell-badge-top {
            background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa;
            padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 800;
            display: inline-flex; align-items: center; gap: 4px; text-decoration: none; transition: all 0.2s;
            height: 20px !important; line-height: 18px !important;
          }
          .sell-badge-top:hover { background: #ea580c; color: white; }

          .micro-link {
            font-size: 11px !important; font-weight: 600; color: #475569;
            text-decoration: none; display: flex; align-items: center; gap: 5px; transition: color 0.2s;
            height: 32px !important; line-height: 32px !important;
          }
          .micro-link:hover { color: #f85606; }
          .micro-link.highlight { color: #1e3a8a; }

          .divider { color: #cbd5e1; font-size: 11px; }

          .header-center-promo span {
            font-size: 11px !important; font-weight: 700; color: #1e293b;
            animation: slideFadeUp 3.5s infinite; display: inline-block; line-height: 32px !important;
          }

          .anim-bell-wrapper {
            animation: ringBell 2.5s infinite ease-in-out;
            transform-origin: top center;
            display: flex; align-items: center; justify-content: center;
            color: #475569; height: 32px !important;
          }

          @keyframes ringBell {
            0%, 50%, 100% { transform: rotate(0); }
            10% { transform: rotate(15deg); }
            20% { transform: rotate(-10deg); }
            30% { transform: rotate(5deg); }
            40% { transform: rotate(-5deg); }
          }
          
          @keyframes slideFadeUp {
            0% { opacity: 0; transform: translateY(6px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-6px); }
          }
        }
      `}</style>
    </>
  );
}