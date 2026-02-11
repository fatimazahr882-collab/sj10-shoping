// src/components/Footer.tsx
"use client"; // This component needs browser interactivity to know the current page

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define the navigation items in an array for cleaner code
const navItems = [
  { href: '/', label: 'Home', icon: 'fas fa-home' },
  { href: '/category', label: 'Category', icon: 'fas fa-th-large' },
  { href: '/explore', label: 'Explore', icon: 'fas fa-search' },
  { href: '/orders', label: 'Orders', icon: 'fas fa-box' },
  { href: '/profile', label: 'Profile', icon: 'fas fa-user' },
];

export default function Footer() {
  // This hook gets the current URL path (e.g., '/', '/category')
  const pathname = usePathname();

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <Link 
          href={item.href} 
          key={item.label} 
          // This dynamically adds the 'active' class if the link matches the current page
          className={`nav-item ${pathname === item.href ? 'active' : ''}`}
        >
          <i className={item.icon}></i>
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}