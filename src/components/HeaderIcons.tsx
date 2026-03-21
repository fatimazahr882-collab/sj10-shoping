// src/components/HeaderIcons.tsx
"use client";

import Link from 'next/link';
import { useCart } from '@/context/CartContext'; 
import NotificationBell from './NotificationBell'; 

export default function HeaderIcons() {
  const { itemCount } = useCart(); 

  return (
    <div className="header-icons">
      <Link href="/favorites" style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>
         <i className="fa-regular fa-heart text-xl hover:text-red-500 transition-colors"></i>
      </Link>

      <NotificationBell />
      
      <Link href="/cart" style={{ position: 'relative', textDecoration: 'none', color: 'inherit', marginLeft: '8px' }}>
        <i className="fa-solid fa-bag-shopping" id="cart-icon"></i>
        {itemCount > 0 && (
          <span className="cart-badge">{itemCount}</span>
        )}
      </Link>
    </div>
  );
}