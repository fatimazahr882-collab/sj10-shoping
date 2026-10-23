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
      {isNavigatingSearch && (
        <div className="instant-search-loader">
          <div className="loader-bar-slide"></div>
        </div>
      )}

      <div className={`sj10-master-topbar ${showFullHeader ? 'header-visible' : 'header-hidden'}`} style={{ display: showSearchBar ? 'block' : 'none' }}>

        {/* MOBILE VIEW SEARCH BAR */}
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

        {/* DESKTOP VIEW NAV BAR */}
        <div className="desktop-topbar-block">
          <div className="main-nav-area">
            <div className="container nav-grid">
              
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