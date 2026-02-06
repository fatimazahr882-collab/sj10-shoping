"use client"; 

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext'; 
import NotificationBell from './NotificationBell'; 

const promoTexts = [
  "Pakistan's #1 Online Shopping Site 🇵🇰", 
  "COD All Over Pakistan 🇵🇰", 
  "Sell with SJ10 and Earn"
];

export default function Header() {
  const [currentPromoText, setCurrentPromoText] = useState(promoTexts[0]);
  const { itemCount } = useCart(); 

  // Promo Text Animation Logic
  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % promoTexts.length;
      setCurrentPromoText(promoTexts[currentIndex]);
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <>
      <header className="global-sticky-header">
        {/* LOGO */}
        <Link href="/">
          <Image 
            src="/logo.gif" 
            alt="SJ10 Logo" 
            width={65} 
            height={65} 
            className="logo" 
            priority 
            unoptimized
          />
        </Link>

        {/* PROMO TEXT */}
        <div className="header-center-promo">
          <span id="promo-text-anim" key={currentPromoText}>
            {currentPromoText}
          </span>
        </div>

        {/* ICONS SECTION */}
        <div className="header-icons">
          {/* UPDATED: Points to the new Favorites Page */}
          <Link href="/favorites" style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>
             <i className="fa-regular fa-heart text-xl hover:text-red-500 transition-colors"></i>
          </Link>

          {/* Notification System */}
          <NotificationBell />
          
          {/* CART ICON */}
          <Link href="/cart" style={{ position: 'relative', textDecoration: 'none', color: 'inherit', marginLeft: '8px' }}>
            <i className="fa-solid fa-bag-shopping" id="cart-icon"></i>
            { itemCount > 0 && (
              <span className="cart-badge">{itemCount}</span>
            )}
          </Link>
          
        </div>
      </header>
      
      {/* CSS STYLES */}
      <style jsx global>{`
        .header-icons {
          display: flex;
          align-items: center;
          gap: 15px; 
        }

        .cart-badge {
          position: absolute;
          top: -5px;
          right: -10px;
          background-color: var(--primary-orange, #ff6b00);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          border: 2px solid white;
          animation: popIn 0.3s ease-out;
          z-index: 10;
        }

        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}