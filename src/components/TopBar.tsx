// src/components/TopBar.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { useCart } from '@/context/CartContext'; 
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import AuthModal from './AuthModal';
import ClientOnly from './ClientOnly';

const DEFAULT_DP = "https://pub-1390981b409c46698da5dc6c45e08eaa.r2.dev/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp";

const TRENDING_KEYWORDS = [
  "Women's Fashion", "Smart Watches", "Airbuds", "Lawn Suits", 
  "Men's Sneakers", "Perfumes", "Makeup Kits", "Home Decor", "Bags"
];

export default function TopBar() {
  const { user, isLoading, signOut } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isNavigatingSearch, setIsNavigatingSearch] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const suggestionListRef = useRef<HTMLDivElement>(null);

  const [showFullHeader, setShowFullHeader] = useState(true);
  const lastScrollY = useRef(0);

  // 🟢 FORAN CLOSE DROPDOWN JAB BHI URL YA ROUTE BADLE
  useEffect(() => {
    setIsNavigatingSearch(false);
    setShowSuggestions(false);
    setSuggestions([]);
  }, [pathname, searchParams]);

  // Scroll hide/show
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

  // Placeholder rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % TRENDING_KEYWORDS.length);
    }, 2800); 
    return () => clearInterval(interval);
  }, []);

  // Suggestions Fetcher
  const fetchSuggestions = useCallback(async (q: string) => {
    const cleanQ = q.trim();
    if (cleanQ.length < 2) { 
      setSuggestions(TRENDING_KEYWORDS.slice(0, 5));
      return; 
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/suggestions-text?q=${encodeURIComponent(cleanQ)}`);
      if (res.ok) {
        const data = await res.json();
        const titles = Array.isArray(data) 
          ? data.map(item => (typeof item === 'string' ? item : item.title || item.name || '')).filter(Boolean)
          : [];

        if (titles.length > 0) {
          setSuggestions(titles.slice(0, 7));
        } else {
          const fallback = TRENDING_KEYWORDS.filter(k => k.toLowerCase().includes(cleanQ.toLowerCase()));
          setSuggestions(fallback.length > 0 ? fallback : [cleanQ]);
        }
      } else {
        const fallback = TRENDING_KEYWORDS.filter(k => k.toLowerCase().includes(cleanQ.toLowerCase()));
        setSuggestions(fallback);
      }
    } catch (e) {
      const fallback = TRENDING_KEYWORDS.filter(k => k.toLowerCase().includes(cleanQ.toLowerCase()));
      setSuggestions(fallback);
    }
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, showSuggestions, fetchSuggestions]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🟢 CORE SEARCH TRIGGER: INPUT UNFOCUS HOGA AUR SUGGESTIONS FORAN BAND HONGAY
  const triggerSearch = (queryToSearch: string) => {
    const finalQ = queryToSearch.trim();
    if (!finalQ) return;
    
    // Close & clear instantly
    setShowSuggestions(false);
    setSuggestions([]);
    setIsNavigatingSearch(true);
    
    // Unfocus input to prevent reopening
    inputRef.current?.blur();
    mobInputRef.current?.blur();

    router.push(`/search?q=${encodeURIComponent(finalQ)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = searchQuery.trim() || TRENDING_KEYWORDS[placeholderIndex];
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
        handleSuggClick(suggestions[selectedIndex]);
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

      {/* 🟢 NAVBAR IS NOW 100% GLOBAL ACROSS ALL PAGES */}
      <div className={`sj10-master-topbar ${showFullHeader ? 'header-visible' : 'header-hidden'}`}>

        {/* ======================================================== */}
        {/* 📱 MOBILE VIEW: SEARCH BAR (ALWAYS VISIBLE EVERYWHERE)    */}
        {/* ======================================================== */}
        <div className="mobile-topbar-block">
          <div className="mob-search-wrapper" ref={searchRef}>
            <form className="mob-search-form" onSubmit={handleSearchSubmit}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" className="mob-search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>

              <div className="mob-animated-placeholder" style={{ opacity: searchQuery ? 0 : 1 }}>
                <span className="search-prefix">Search</span>
                <div className="placeholder-mask">
                  <strong className="animated-keyword" key={placeholderIndex}>
                    "{TRENDING_KEYWORDS[placeholderIndex]}"
                  </strong>
                </div>
              </div>

              <input 
                ref={mobInputRef}
                type="text" 
                className="mob-search-input" 
                value={searchQuery} 
                autoComplete="off" 
                aria-label="Search items" 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onFocus={() => {
                  fetchSuggestions(searchQuery);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
              />
              
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); }} className="mob-clear-btn">
                  ✕
                </button>
              )}

              <button type="submit" className="mob-submit-btn" aria-label="Search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </form>

            {/* 🟢 MOBILE DROPDOWN (Click bug fixed with onMouseDown & onTouchEnd) */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="pro-suggestions-dropdown" ref={suggestionListRef}>
                {!searchQuery.trim() && (
                  <div className="suggestions-header-chip">
                    🔥 Trending Searches
                  </div>
                )}

                {suggestions.map((title, i) => (
                  <div 
                    key={i} 
                    className={`sugg-row ${selectedIndex === i ? 'keyboard-selected' : ''}`} 
                    onMouseDown={(e) => { e.preventDefault(); handleSuggClick(title); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleSuggClick(title); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f85606" strokeWidth="2.5" className="sugg-row-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <span className="sugg-row-text">{title}</span>
                    <span className="sugg-arrow-icon">→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 💻 DESKTOP VIEW: MAIN NAVBAR (ALWAYS VISIBLE EVERYWHERE) */}
        {/* ======================================================== */}
        <div className="desktop-topbar-block">
          <div className="main-nav-area">
            <div className="container nav-grid">
              
              <div className="nav-left">
                <Link href="/" style={{ textDecoration: 'none' }} aria-label="SJ10 Home">
                  <span className="sr-only">SJ10 Home</span>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" style={{ marginRight: '8px' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <span>Search </span>
                      <div className="placeholder-mask">
                        <strong className="animated-keyword" key={placeholderIndex}>
                          "{TRENDING_KEYWORDS[placeholderIndex]}"
                        </strong>
                      </div>
                    </div>

                    <input 
                      ref={inputRef}
                      type="text" 
                      value={searchQuery} 
                      autoComplete="off" 
                      aria-label="Search" 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      onFocus={() => {
                        fetchSuggestions(searchQuery);
                        setShowSuggestions(true);
                      }}
                      onKeyDown={handleKeyDown}
                    />

                    {searchQuery && (
                      <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); }} className="desktop-clear-btn">
                        ✕
                      </button>
                    )}

                    <button type="submit" className="pro-search-btn" aria-label="Submit Search">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f85606" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    </button>
                  </form>

                  {/* Cart Icon */}
                  <Link href="/cart" className="cart-beside-search" aria-label="Shopping Cart">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    <ClientOnly>
                      {itemCount > 0 && <span className="cart-badge-beside">{itemCount}</span>}
                    </ClientOnly>
                  </Link>

                  {/* 🟢 DESKTOP DROPDOWN (Click Bug Fixed: onMouseDown closes and submits instantly) */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="pro-suggestions-dropdown" ref={suggestionListRef}>
                      {!searchQuery.trim() && (
                        <div className="suggestions-header-chip">
                          🔥 Popular Searches in Pakistan
                        </div>
                      )}

                      {suggestions.map((title, i) => (
                        <div 
                          key={i} 
                          className={`sugg-row ${selectedIndex === i ? 'keyboard-selected' : ''}`} 
                          onMouseDown={(e) => { 
                            e.preventDefault(); 
                            handleSuggClick(title); 
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f85606" strokeWidth="2.5" className="sugg-row-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                          <span className="sugg-row-text">{title}</span>
                          <span className="sugg-press-enter">Select ↵</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Links Right */}
              <div className="nav-right">
                <Link href="/category" className="desktop-nav-item">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                  <span>Categories</span>
                </Link>
                
                <Link href="/explore" className="desktop-nav-item">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                  <span>Explore</span>
                </Link>
                
                <Link href="/favorites" className="desktop-nav-item">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  <span>Favorites</span>
                </Link>
                
                {/* User Auth Zone */}
                <div className="auth-zone" ref={dropdownRef} style={{ position: 'relative' }}>
                  {!mounted || isLoading ? (
                    <div style={{ width: '85px', height: '35px', background: 'rgba(255,255,255,0.2)', borderRadius: '50px' }}></div>
                  ) : user ? (
                    <div className="logged-in-pill" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: 700, marginLeft: '6px' }}>ACCOUNT</span>
                      <img src={user.profile_pic || DEFAULT_DP} alt="User" className="user-dp" />
                      
                      {isProfileOpen && (
                        <div className="pro-dropdown">
                          <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{user.full_name}</strong>
                          </div>
                          <Link href="/profile" onClick={() => setIsProfileOpen(false)}>Dashboard</Link>
                          <Link href="/orders" onClick={() => setIsProfileOpen(false)}>My Orders</Link>
                          <button onClick={() => { setIsProfileOpen(false); signOut(); }} style={{ color: '#ef4444' }}>Logout</button>
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