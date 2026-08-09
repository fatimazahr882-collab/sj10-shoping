// src/components/TopBar.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { useCart } from '@/context/CartContext'; 
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import ClientOnly from './ClientOnly';

const DEFAULT_DP = "https://pub-1390981b409c46698da5dc6c45e08eaa.r2.dev/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp";

const SEARCH_KEYWORDS = [
  "Women's Fashion", "Men's Collection", "Electronics", "Smart Watches", 
  "Wireless Earbuds", "Sneakers", "Perfumes", "Makeup Kits", "Home Decor"
];

export default function TopBar() {
  const { user, isLoading, signOut } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isNavigatingSearch, setIsNavigatingSearch] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const suggestionListRef = useRef<HTMLDivElement>(null);

  const [showFullHeader, setShowFullHeader] = useState(true);
  const lastScrollY = useRef(0);

  const showSearchBar = pathname === '/' || pathname.startsWith('/explore') || pathname.startsWith('/search');

  useEffect(() => {
    setIsNavigatingSearch(false);
  }, [pathname]);

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
  }, []);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_KEYWORDS.length);
    }, 2500); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionListRef.current) {
      const activeEl = suggestionListRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

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
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerSearch = (queryToSearch: string) => {
    setShowSuggestions(false);
    setIsNavigatingSearch(true);
    router.push(`/search?q=${encodeURIComponent(queryToSearch)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = searchQuery.trim() || SEARCH_KEYWORDS[placeholderIndex];
    triggerSearch(finalQuery);
  };

  const handleSuggClick = (title: string) => {
    setSearchQuery(title);
    triggerSearch(title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSearchSubmit(e);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggClick(suggestions[selectedIndex].title);
      } else {
        handleSearchSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <>
      {/* 🟢 TOP INSTANT LOADING PROGRESS LINE */}
      {isNavigatingSearch && (
        <div className="instant-search-loader">
          <div className="loader-bar-slide"></div>
        </div>
      )}

      {/* ⚡ CRITICAL PRE-PAINT LAYOUT LOCK (PREVENTS 0.5s FLASH & HIDES MOBILE BAR IF NO SEARCH) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .desktop-topbar-block { display: none !important; }
        .mobile-topbar-block { display: ${showSearchBar ? 'block' : 'none'} !important; }

        @media (min-width: 769px) {
          .desktop-topbar-block { display: block !important; }
          .mobile-topbar-block { display: none !important; }
        }

        .sj10-master-topbar {
          position: fixed !important; left: 0 !important; width: 100% !important;
          z-index: 9998 !important;
          box-sizing: border-box !important;
        }

        @media (max-width: 768px) {
          .sj10-master-topbar {
            top: 65px !important;
            display: ${showSearchBar ? 'block' : 'none'} !important;
          }
        }

        @media (min-width: 769px) {
          .sj10-master-topbar { top: 32px !important; }
        }

        /* Lock Input & Logo Sizes Before Hydration */
        .pro-search-box input, .mob-search-input { font-family: inherit; }
        .desktop-logo-vid { width: 52px !important; height: 52px !important; aspect-ratio: 1 / 1 !important; }
      ` }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .container { max-width: 1400px; margin: 0 auto; padding: 0 15px; width: 100%; box-sizing: border-box; }

        .instant-search-loader {
          position: fixed; top: 0; left: 0; right: 0; height: 3px;
          z-index: 1000000; background: rgba(248, 86, 6, 0.2); overflow: hidden;
        }
        .loader-bar-slide {
          height: 100%; width: 50%;
          background: linear-gradient(90deg, #f85606, #ff8a00, #3b82f6);
          animation: lineSlide 1s infinite linear;
        }
        @keyframes lineSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .pro-suggestions { 
          position: absolute !important; 
          top: calc(100% + 8px) !important; 
          left: 0 !important; 
          right: 0 !important; 
          background: #ffffff !important; 
          border-radius: 16px !important; 
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25) !important; 
          z-index: 100000 !important; 
          overflow: hidden !important; 
          border: 1px solid #e2e8f0 !important;
          max-height: 280px !important;
          overflow-y: auto !important;
          animation: fadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .sugg-item { 
          padding: 13px 18px !important; 
          font-size: 13.5px !important; 
          font-weight: 600 !important; 
          color: #0f172a !important; 
          cursor: pointer !important; 
          border-bottom: 1px solid #f1f5f9 !important; 
          display: flex !important; 
          gap: 12px !important; 
          align-items: center !important; 
          transition: all 0.15s ease !important; 
          background: #ffffff !important;
          -webkit-tap-highlight-color: transparent;
          border-left: 4px solid transparent;
        }

        .sugg-item:hover, .sugg-item:active, .sugg-item.keyboard-selected { 
          background: #fff7ed !important; 
          color: #f85606 !important; 
          padding-left: 24px !important; 
          border-left-color: #f85606 !important;
        }

        .sugg-icon { 
          color: #f85606 !important; 
          font-size: 13px !important; 
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ========================================== */
        /* MOBILE VIEW STYLES                         */
        /* ========================================== */
        @media (max-width: 768px) {
          .sj10-master-topbar { 
            position: fixed; left: 0; width: 100%; z-index: 9997; 
            top: 65px; 
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
            transform: translateZ(0);
          }
          .sj10-master-topbar.header-visible { transform: translateY(0); }
          .sj10-master-topbar.header-hidden { transform: translateY(-150%); }

          .mobile-topbar-block {
            background: linear-gradient(90deg, #f85606 0%, #ff8a00 100%); 
            padding: 8px 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            position: relative;
          }
          
          .mob-search-form {
            display: flex; align-items: center; background: #ffffff;
            border-radius: 50px; padding: 0 4px 0 14px; height: 40px;
            width: 100%; box-sizing: border-box; position: relative;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          }
          
          .mob-search-input {
            flex: 1; border: none; background: transparent;
            outline: none; font-size: 14px; color: #111; z-index: 2;
            width: 100%; height: 100%;
          }

          .mob-search-btn {
            width: 34px; height: 34px; border-radius: 50%;
            background: #ffe1d2; color: #f85606; border: none;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; flex-shrink: 0; z-index: 2;
          }

          .mob-animated-placeholder {
            position: absolute; left: 36px; top: 0; bottom: 0;
            display: flex; align-items: center; color: #94a3b8;
            font-size: 13px; font-weight: 500; pointer-events: none; z-index: 1;
          }
        }

        /* ========================================== */
        /* DESKTOP VIEW STYLES                        */
        /* ========================================== */
        @media (min-width: 769px) {
          .sj10-master-topbar { 
            position: fixed !important; left: 0; width: 100%; 
            z-index: 9999 !important; 
            top: 32px !important; 
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
            transform: translateZ(0);
          }
          .sj10-master-topbar.header-visible { top: 32px !important; }
          .sj10-master-topbar.header-hidden { 
            top: 0px !important; 
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25) !important;
          }

          .main-nav-area { 
            background: linear-gradient(90deg, #1e3a8a 0%, #1e40af 15%, #f85606 40%, #ff8a00 100%); 
            padding: 14px 0 !important; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.15); 
            border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;
          }
          
          .nav-grid { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
          
          .nav-left { display: flex; align-items: center; padding-right: 15px; }
          .desktop-logo-vid { 
            height: 52px !important; 
            width: 52px !important; 
            background: #ffffff !important;
            border-radius: 50% !important;
            padding: 2px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
            transition: transform 0.3s; cursor: pointer;
            object-fit: cover !important;
          }
          .desktop-logo-vid:hover { transform: scale(1.05); }

          .desktop-nav-item {
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
            color: white; text-decoration: none; transition: transform 0.2s; cursor: pointer;
          }
          .desktop-nav-item i { font-size: 19px; color: white; transition: 0.2s; }
          .desktop-nav-item span { font-size: 11px; font-weight: 600; opacity: 0.9; }
          .desktop-nav-item:hover { transform: translateY(-3px); }
          .desktop-nav-item:hover i { color: #ffedd5; }

          .nav-center { flex: 1; max-width: 650px; position: relative; }
          .search-cart-wrapper { display: flex; align-items: center; gap: 12px; width: 100%; }
          
          .pro-search-box { flex: 1; display: flex; background: white; border-radius: 10px; overflow: hidden; height: 44px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); position: relative; border: 2px solid transparent; transition: 0.3s; }
          .pro-search-box:focus-within { border-color: #f85606; }
          
          .animated-placeholder { position: absolute; left: 15px; top: 0; bottom: 0; display: flex; align-items: center; color: #94a3b8; font-size: 14px; font-weight: 500; pointer-events: none; transition: opacity 0.2s; }
          .pro-search-box input { flex: 1; border: none; padding: 0 15px; font-size: 14px; color: #222; outline: none; background: transparent; z-index: 2; }
          .pro-search-btn { width: 50px; background: #ffe1d2; border: none; color: #f85606; font-size: 17px; cursor: pointer; z-index: 2; transition: 0.2s; }
          .pro-search-btn:hover { background: #f85606; color: white; }
          
          .cart-beside-search {
            display: flex; align-items: center; justify-content: center;
            width: 48px; height: 44px; border-radius: 10px;
            background: #ffffff; color: #f85606; text-decoration: none;
            position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: cartWobble 3s infinite; border: 2px solid white;
          }
          .cart-beside-search:hover { background: #f85606; color: white; transform: translateY(-3px) scale(1.05); animation: none; }
          .cart-beside-search i { font-size: 19px; }
          .cart-badge-beside {
            position: absolute; top: -7px; right: -7px; background: #1e3a8a; color: white;
            font-size: 10px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }

          @keyframes cartWobble {
            0%, 100% { transform: rotate(0deg); }
            5%, 15% { transform: rotate(-10deg) scale(1.1); }
            10%, 20% { transform: rotate(10deg) scale(1.1); }
            25% { transform: rotate(0deg) scale(1); }
          }

          .nav-right { display: flex; align-items: center; gap: 22px; }
          .login-signup-pill { background: #ffffff; color: #f85606; border: none; padding: 9px 22px; border-radius: 50px; font-weight: 800; font-size: 12px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: 0.2s; }
          .login-signup-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,255,255,0.3); }
          .logged-in-pill { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 12px; border-radius: 50px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); transition: 0.3s; }
          .user-dp { width: 32px; height: 34px; border-radius: 50%; border: 2px solid white; object-fit: cover; }

          .pro-dropdown { position: absolute; top: 135%; right: 0; background: white; border-radius: 16px; width: 220px; box-shadow: 0 15px 40px rgba(0,0,0,0.15); overflow: hidden; z-index: 10000; border: 1px solid #f1f5f9; }
          .pro-dropdown a, .pro-dropdown button { display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 20px; font-size: 14px; font-weight: 600; color: #4b5563; text-decoration: none; background: none; border: none; cursor: pointer; border-bottom: 1px solid #f8fafc; text-align: left; }
          .pro-dropdown a:hover, .pro-dropdown button:hover { background: #fff7ed; color: #f85606; }

          @keyframes slideUpType { 0% { opacity: 0; transform: translateY(10px); } 15% { opacity: 1; transform: translateY(0); } 85% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } }
          .animated-text-item { animation: slideUpType 2.5s infinite; position: absolute; left: 0; white-space: nowrap; }
        }
      `}} />

      <div className={`sj10-master-topbar ${showFullHeader ? 'header-visible' : 'header-hidden'}`}>

        {/* MOBILE VIEW SEARCH BAR */}
        {showSearchBar && (
          <div className="mobile-topbar-block">
            <div style={{ position: 'relative', width: '100%' }} ref={searchRef}>
              <form className="mob-search-form" onSubmit={handleSearchSubmit}>
                <i className="fas fa-search" style={{ color: '#94a3b8', fontSize: '14px', marginRight: '6px' }}></i>

                <div className="mob-animated-placeholder" style={{ opacity: searchQuery ? 0 : 1 }}>
                  <div style={{ position: 'relative', width: '130px', height: '18px', overflow: 'hidden' }}>
                    <strong className="animated-text-item" key={placeholderIndex} style={{ color: '#f85606' }}>
                      "{SEARCH_KEYWORDS[placeholderIndex]}"
                    </strong>
                  </div>
                </div>

                <input 
                  type="text" 
                  className="mob-search-input" 
                  value={searchQuery} 
                  autoComplete="off" 
                  aria-label="Search" 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                />
                
                {searchQuery && (
                  <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); }} style={{ border:'none', background:'none', color:'#94a3b8', padding:'0 6px', zIndex:3, cursor:'pointer' }}>
                    <i className="fas fa-times-circle"></i>
                  </button>
                )}

                <button type="submit" className="mob-search-btn" aria-label="Submit"><i className="fas fa-search"></i></button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="pro-suggestions" ref={suggestionListRef}>
                  {suggestions.map((s, i) => (
                    <div 
                      key={i} 
                      className={`sugg-item ${selectedIndex === i ? 'keyboard-selected' : ''}`} 
                      onClick={() => handleSuggClick(s.title)}
                    >
                      <i className="fas fa-search sugg-icon"></i>
                      <span style={{ flex: 1 }}>{s.title}</span>
                      <i className="fas fa-chevron-right" style={{ fontSize: '11px', color: '#cbd5e1' }}></i>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DESKTOP VIEW NAV BAR */}
        <div className="desktop-topbar-block">
          <div className="main-nav-area">
            <div className="container nav-grid">
              
              {/* DESKTOP LOGO */}
              <div className="nav-left">
                <Link href="/" style={{ textDecoration: 'none' }} aria-label="Go to SJ10 Homepage">
                  <span className="sr-only">SJ10 Homepage</span>
                  <video 
                    src="/logo.mp4" 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    className="desktop-logo-vid" 
                    aria-hidden="true" 
                  />
                </Link>
              </div>

              <div className="nav-center" ref={searchRef}>
                {showSearchBar && (
                  <div className="search-cart-wrapper">
                    
                    <form className="pro-search-box" onSubmit={handleSearchSubmit}>
                      <div className="animated-placeholder" style={{ opacity: searchQuery ? 0 : 1 }}>
                        <i className="fas fa-search" style={{ marginRight: '8px' }}></i>
                        <span>Search </span>
                        <div style={{ position: 'relative', width: '150px', height: '20px', marginLeft: '4px', overflow: 'hidden' }}>
                          <strong className="animated-text-item" key={placeholderIndex} style={{ color: '#f85606' }}>
                            "{SEARCH_KEYWORDS[placeholderIndex]}"
                          </strong>
                        </div>
                      </div>

                      <input 
                        type="text" 
                        value={searchQuery} 
                        autoComplete="off" 
                        aria-label="Search" 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                      />
                      <button type="submit" className="pro-search-btn" aria-label="Submit"><i className="fas fa-search"></i></button>
                    </form>

                    <Link href="/cart" className="cart-beside-search" aria-label="Shopping Cart">
                      <i className="fas fa-shopping-cart"></i>
                      <ClientOnly>
                        {itemCount > 0 && <span className="cart-badge-beside">{itemCount}</span>}
                      </ClientOnly>
                    </Link>

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="pro-suggestions" ref={suggestionListRef}>
                        {suggestions.map((s, i) => (
                          <div 
                            key={i} 
                            className={`sugg-item ${selectedIndex === i ? 'keyboard-selected' : ''}`} 
                            onClick={() => handleSuggClick(s.title)}
                          >
                            <i className="fas fa-search sugg-icon"></i> {s.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="nav-right">
                <Link href="/category" className="desktop-nav-item">
                  <i className="fas fa-th-large"></i><span>Categories</span>
                </Link>
                
                <Link href="/explore" className="desktop-nav-item">
                  <i className="fas fa-compass"></i><span>Explore</span>
                </Link>
                
                <Link href="/favorites" className="desktop-nav-item">
                  <i className="fas fa-heart"></i><span>Favorites</span>
                </Link>
                
                <div className="auth-zone" ref={dropdownRef} style={{position:'relative'}}>
                  {!mounted || isLoading ? (
                    <div style={{width:'80px', height:'35px', background:'rgba(255,255,255,0.2)', borderRadius:'50px'}}></div>
                  ) : user ? (
                    <div className="logged-in-pill" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                      <span style={{color:'white', fontSize:'13px', fontWeight:700, marginLeft:'6px'}}>ACCOUNT</span>
                      <img src={user.profile_pic || DEFAULT_DP} alt="User" className="user-dp" />
                      
                      {isProfileOpen && (
                        <div className="pro-dropdown">
                          <div style={{padding:'15px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9'}}>
                            <strong style={{fontSize:'14px', color:'#0f172a'}}>{user.full_name}</strong>
                          </div>
                          <Link href="/profile" onClick={() => setIsProfileOpen(false)}><i className="fas fa-user-circle"></i> Dashboard</Link>
                          <Link href="/orders" onClick={() => setIsProfileOpen(false)}><i className="fas fa-box"></i> My Orders</Link>
                          <button onClick={() => { setIsProfileOpen(false); signOut(); }} style={{color:'#ef4444'}}><i className="fas fa-sign-out-alt"></i> Logout</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button className="login-signup-pill" onClick={() => setIsAuthModalOpen(true)}>Login / Signup</button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}