"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ThemeSwitcher from './ThemeSwitcher';
import AuthModal from './AuthModal';

const DEFAULT_DP = "https://pub-1390981b409c46698da5dc6c45e08eaa.r2.dev/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp";

// 50+ Viral Keywords for the Daraz-style Animation
const SEARCH_KEYWORDS =[
  "Women's Fashion", "Men's Collection", "Electronics", "Hair Care", "Books", 
  "Chairs", "SJ10 Collection", "Ramzan Sale", "Eid Sale", "Smart Watches", 
  "Wireless Earbuds", "Sneakers", "Perfumes", "Makeup Kits", "Home Decor", 
  "Kitchen Appliances", "Gaming Accessories", "Laptops", "Mobile Phones", 
  "Skin Care", "Girls' Fashion", "Boys' Fashion", "Bags & Wallets", "Jewelry", 
  "Sunglasses", "Winter Wear", "Summer Collection", "SJ10 Rupees Deal", 
  "Baby Toys", "Fitness Gear", "Yoga Mats", "Headphones", "Power Banks", 
  "Tripods", "Ring Lights", "Bed Sheets", "Wall Art", "Office Supplies", 
  "Water Bottles", "Travel Bags", "Men's Watches", "Hair Straighteners", 
  "Mens Shoes", "Ladies Kurti", "Tracksuits", "Table Lamps", "Air Fryers",
  "Face Wash", "Formal Shirts", "Casual Tees"
];

export default function TopBar() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const[mounted, setMounted] = useState(false);
  const[isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const[searchQuery, setSearchQuery] = useState('');
  
  // Search Suggestions & Animation State
  const[suggestions, setSuggestions] = useState<any[]>([]);
  const[showSuggestions, setShowSuggestions] = useState(false);
  const[placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- SMART SCROLL LOGIC ---
  const [showFullHeader, setShowFullHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setShowFullHeader(true);
      } else if (currentScrollY > lastScrollY.current + 10) {
        setShowFullHeader(false); // Hide on scroll down
      } else if (currentScrollY < lastScrollY.current - 10) {
        setShowFullHeader(true);  // Show on scroll up
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  },[]);

  // Hydration fix
  useEffect(() => { setMounted(true); },[]);

  // Animated Placeholder Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_KEYWORDS.length);
    }, 2500); // Changes every 2.5 seconds
    return () => clearInterval(interval);
  },[]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/suggestions-text?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (e) { console.error(e); }
  },[]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(searchQuery), 200);
    return () => clearTimeout(timer);
  },[searchQuery, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  },[]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = searchQuery.trim() || SEARCH_KEYWORDS[placeholderIndex];
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
  };

  const handleSuggClick = (title: string) => {
    setSearchQuery(title);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(title)}`);
  };

  const showSearchBar = pathname === '/' || pathname.startsWith('/explore');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* TOPBAR SITS EXACTLY BELOW HEADER (70px) */
        .sj10-master-topbar { 
          position: fixed; 
          top: 70px; 
          left: 0; 
          width: 100%; 
          z-index: 9998; 
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sj10-master-topbar.header-visible {
          transform: translateY(0);
        }

        .sj10-master-topbar.header-hidden {
          /* Translates up exactly by (70px header + 40px utility strip) = 110px. 
             This forces the Orange Bar to stick perfectly at 0px! */
          transform: translateY(-110px);
        }
        
        body { padding-top: 175px !important; }
        
        @media (max-width: 768px) { 
          body { padding-top: 145px !important; } 
          .sj10-master-topbar.header-hidden {
            /* Mobile hides Utility Strip, so we only translate by the 70px header */
            transform: translateY(-70px);
          }
        }
        
        .container { max-width: 1350px; margin: 0 auto; padding: 0 15px; width: 100%; box-sizing: border-box; }

        /* 1. UTILITY STRIP (Lighter, Vibrant Royal Blue: #1e40af) */
        .utility-strip { 
          background-color: #1e40af; 
          height: 40px; 
          display: flex; align-items: center;
          color: white; border-bottom: 1px solid rgba(255,255,255,0.08); 
        }
        .utility-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }

        /* Enhanced Sell Button */
        .sell-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff; padding: 4px 18px; border-radius: 25px;
          font-size: 13px; font-weight: 800; text-decoration: none;
          transition: all 0.3s ease; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .sell-badge i { color: #ff9f43; font-size: 16px; }
        .sell-badge:hover { background: #ffffff; color: #f85606; box-shadow: 0 4px 15px rgba(255,255,255,0.4); transform: translateY(-1px); }
        .sell-badge:hover i { color: #f85606; }

        /* 2. MAIN ORANGE NAV AREA */
        .main-nav-area { 
          background: linear-gradient(90deg, #f85606 0%, #ff8a00 100%); 
          padding: 14px 0; box-shadow: 0 6px 15px rgba(0,0,0,0.15); 
          border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;
        }
        .nav-grid { display: flex; align-items: center; justify-content: space-between; gap: 30px; }
        .nav-left { display: flex; align-items: center; gap: 15px; }
        .sj-logo { height: 48px; width: auto; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }

        /* GRADIENT ICONS */
        .gradient-icon {
          background: linear-gradient(180deg, #ffffff 50%, #93c5fd 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          display: inline-block; font-size: 24px; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.15));
        }
        .top-icon-btn { transition: all 0.2s ease; text-decoration: none; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }
        .top-icon-btn:hover { transform: translateY(-2px); background: rgba(255,255,255,0.25); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }

        /* SEARCH ENGINE */
        .nav-center { flex: 1; max-width: 800px; position: relative; }
        .pro-search-box { display: flex; background: white; border-radius: 10px; overflow: hidden; height: 48px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); transition: all 0.3s ease; position: relative; }
        .pro-search-box:focus-within { box-shadow: 0 0 0 4px rgba(255,255,255,0.3); }
        
        .animated-placeholder {
           position: absolute; left: 20px; top: 0; bottom: 0; display: flex; align-items: center;
           color: #94a3b8; font-size: 15px; font-weight: 500; pointer-events: none;
           transition: opacity 0.2s;
        }
        .pro-search-box input { flex: 1; border: none; padding: 0 20px; font-size: 15px; font-weight: 500; color: #222; outline: none; background: transparent; z-index: 2; }
        
        .pro-search-btn { width: 64px; background: #ffe1d2; border: none; color: #f85606; font-size: 20px; cursor: pointer; transition: 0.2s; z-index: 2; }
        .pro-search-btn:hover { background: #f85606; color: white; }

        /* FIXED SEARCH SUGGESTIONS */
        .pro-suggestions { 
          position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: white; 
          border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); z-index: 10000; overflow: hidden; 
          border: 1px solid #f0f0f0; animation: fadeDown 0.2s ease-out;
        }
        .sugg-item { padding: 14px 20px; font-size: 14px; font-weight: 600; color: #374151; cursor: pointer; border-bottom: 1px solid #f8f8f8; display: flex; gap: 12px; align-items: center; transition: all 0.2s; }
        .sugg-item:hover { background: #fff7ed; color: #f85606; padding-left: 28px; }
        .sugg-icon { color: #cbd5e1; font-size: 14px; transition: color 0.2s; }
        .sugg-item:hover .sugg-icon { color: #f85606; }

        /* RIGHT NAV & AUTH */
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .auth-zone { position: relative; margin-left: 8px; }
        .auth-skeleton-pill { width: 120px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 50px; animation: pulse 1.5s infinite; }
        
        .login-signup-pill { background: #ffffff; color: #f85606; border: none; padding: 12px 24px; border-radius: 50px; font-weight: 800; font-size: 13px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .login-signup-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,255,255,0.3); }
        
        .logged-in-pill { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 4px 12px; border-radius: 50px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); transition: 0.3s; }
        .logged-in-pill:hover { background: rgba(255,255,255,0.25); }
        .user-greeting { color: white; font-weight: 800; font-size: 13px; text-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .user-dp { width: 36px; height: 36px; border-radius: 50%; border: 2px solid white; object-fit: cover; background: white; }

        /* BEAUTIFUL PROFILE DROPDOWN */
        .pro-dropdown { 
          position: absolute; top: 135%; right: 0; background: white; border-radius: 16px; 
          width: 220px; box-shadow: 0 15px 40px rgba(0,0,0,0.15); overflow: hidden; z-index: 10000;
          border: 1px solid #f1f5f9; animation: slideDown 0.2s ease-out forwards;
        }
        .pro-dropdown-header {
          padding: 16px 20px; background: linear-gradient(90deg, #f8f9fa, #ffffff); border-bottom: 1px solid #f1f5f9;
        }
        .pro-dropdown-header p { margin:0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .pro-dropdown a, .pro-dropdown button { 
          display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 20px; font-size: 14px; font-weight: 600; 
          color: #4b5563; text-decoration: none; background: none; border: none; cursor: pointer; border-bottom: 1px solid #f8fafc;
          transition: all 0.2s; text-align: left;
        }
        .pro-dropdown a:hover, .pro-dropdown button:hover { background: #fff7ed; color: #f85606; padding-left: 26px; }
        .pro-dropdown i { color: #9ca3af; font-size: 16px; width: 20px; text-align: center; transition: color 0.2s; }
        .pro-dropdown a:hover i, .pro-dropdown button:hover i { color: #f85606; }
        .logout-btn { color: #ef4444 !important; border-bottom: none !important; }
        .logout-btn:hover { background: #fef2f2 !important; color: #dc2626 !important; }
        .logout-btn:hover i { color: #dc2626 !important; }

        /* Animations */
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        @keyframes slideUpType { 0% { opacity: 0; transform: translateY(10px); } 15% { opacity: 1; transform: translateY(0); } 85% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } }
        
        .animated-text-item { animation: slideUpType 2.5s infinite; position: absolute; left: 0; white-space: nowrap; }

        .hidden { display: none; }
        @media (min-width: 769px) { .md-block { display: block; } .md-flex { display: flex; } }

        @media (max-width: 768px) {
          .main-nav-area { padding: 10px; border-radius: 0; }
          .nav-grid { justify-content: center; gap: 0; }
          .nav-center { min-width: 100%; }
          .pro-search-box { height: 48px; border-radius: 50px; } 
          .pro-search-box input { font-size: 14px; padding: 0 20px; }
        }
      `}} />

      <div className={`sj10-master-topbar ${showFullHeader ? 'header-visible' : 'header-hidden'}`}>
        
        {/* TOP UTILITY STRIP (Now a Lighter, Vibrant Blue) */}
        <div className="utility-strip hidden md-block">
          <div className="container utility-content">
            <div className="left-links">
              <a href="https://sj10seller.online" target="_blank" rel="noreferrer" className="sell-badge">
                <i className="fas fa-store-alt"></i> Sell on SJ10 & Earn
              </a>
            </div>
            <div className="right-links">
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        {/* MAIN NAV AREA */}
        <div className="main-nav-area">
          <div className="container nav-grid">
            
            <div className="nav-left hidden md-flex">
              <Link href="/" className="top-icon-btn" title="Home"><i className="fas fa-home gradient-icon"></i></Link>
              <Link href="/" className="logo-link"><img src="/logo.gif" alt="SJ10 Logo" className="sj-logo" /></Link>
            </div>

            {/* CENTER: SEARCH ENGINE */}
            <div className="nav-center" ref={searchRef}>
              {showSearchBar && (
                <>
                  <form className="pro-search-box" onSubmit={handleSearchSubmit}>
                    
                    {/* DARAZ STYLE ANIMATED PLACEHOLDER */}
                    <div className="animated-placeholder" style={{ opacity: searchQuery ? 0 : 1 }}>
                      <i className="fas fa-search" style={{ marginRight: '8px', color: '#cbd5e1' }}></i>
                      <span>Search for </span>
                      <div style={{ position: 'relative', width: '150px', height: '20px', marginLeft: '6px', overflow: 'hidden' }}>
                        <strong className="animated-text-item" key={placeholderIndex} style={{ color: '#f85606' }}>
                          "{SEARCH_KEYWORDS[placeholderIndex]}"
                        </strong>
                      </div>
                    </div>

                    <input 
                      type="text" 
                      value={searchQuery}
                      autoComplete="off"
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    />
                    <button type="submit" className="pro-search-btn" title="Search"><i className="fas fa-search"></i></button>
                  </form>

                  {/* Suggestions Panel */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="pro-suggestions">
                      {suggestions.map((s, i) => (
                        <div key={i} className="sugg-item" onClick={() => handleSuggClick(s.title)}>
                          <i className="fas fa-search sugg-icon"></i> {s.title}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT: ICONS & PROFILE */}
            <div className="nav-right hidden md-flex">
              <Link href="/explore" className="top-icon-btn" title="Explore"><i className="fas fa-compass gradient-icon"></i></Link>
              <Link href="/category" className="top-icon-btn" title="Categories"><i className="fas fa-th-large gradient-icon"></i></Link>
              
              <div className="auth-zone" ref={dropdownRef}>
                {!mounted || isLoading ? (
                  <div className="auth-skeleton-pill"></div>
                ) : user ? (
                  <div className="logged-in-pill" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <span className="user-greeting">HI, {user.full_name?.split(' ')[0].toUpperCase()}</span>
                    <img src={user.profile_pic || DEFAULT_DP} alt="User DP" className="user-dp" />
                    
                    {/* REVAMPED PROFILE DROPDOWN */}
                    {isProfileOpen && (
                      <div className="pro-dropdown">
                        <div className="pro-dropdown-header">
                          <p>Welcome Back</p>
                        </div>
                        <Link href="/profile" onClick={() => setIsProfileOpen(false)}><i className="fas fa-user-circle"></i> My Profile</Link>
                        <Link href="/orders" onClick={() => setIsProfileOpen(false)}><i className="fas fa-box-open"></i> My Orders</Link>
                        <Link href="/favorites" onClick={() => setIsProfileOpen(false)}><i className="fas fa-heart"></i> My Favorites</Link>
                        <button onClick={() => { setIsProfileOpen(false); signOut(); }} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="login-signup-pill" onClick={() => setIsAuthModalOpen(true)}>
                    LOGIN | SIGNUP
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}