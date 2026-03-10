"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import ThemeSwitcher from './ThemeSwitcher';

const DEFAULT_DP = "https://pub-1390981b409c46698da5dc6c45e08eaa.r2.dev/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp";

export default function TopBar() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const[isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const[isProfileOpen, setIsProfileOpen] = useState(false);
  const[searchQuery, setSearchQuery] = useState('');
  
  // Suggestion States
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- SEARCH BRAIN ---
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
  },[]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(searchQuery), 200);
    return () => clearTimeout(timer);
  },[searchQuery, fetchSuggestions]);

  // Handle outside clicks to close dropdowns
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
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggClick = (title: string) => {
    setSearchQuery(title);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(title)}`);
  };

  const showSearchBar = pathname === '/' || pathname.startsWith('/explore');

  if (isLoading) return null;

  return (
    <>
      {/* 
        🔥 REVERSED STACKING ORDER 🔥 
        Header (Cart/Bell) is forced to the VERY TOP (top: 0).
        This TopBar is forced to sit right BELOW the Header (top: 75px).
      */}
      <style jsx global>{`
        /* 1. HEADER AT THE VERY TOP */
        .global-sticky-header { 
          position: fixed !important;
          top: 0 !important; 
          left: 0;
          width: 100%;
          z-index: 9999 !important; /* Highest layer */
        }

        /* 2. TOPBAR BELOW THE HEADER */
        .sj10-master-topbar {
          position: fixed;
          top: 75px; /* <-- Adjust this number if your header is taller/shorter */
          left: 0;
          width: 100%;
          z-index: 9998; /* Just under the header */
        }
        
        /* 3. PUSH BODY DOWN SO NOTHING HIDES BEHIND THEM */
        body { 
          padding-top: 195px !important; 
        }

        /* MOBILE ADJUSTMENTS */
        @media (max-width: 768px) {
          .sj10-master-topbar { 
            top: 65px; /* Assuming mobile header is a bit thinner */
          }
          body { 
            padding-top: 150px !important; 
          }
        }
      `}</style>

      <div className="sj10-master-topbar">
        
        {/* 1. TOP UTILITY STRIP (Desktop Only - Navy Blue) */}
        <div className="utility-strip hidden md-block">
          <div className="container utility-content">
            <div className="left-links">
              <a href="https://sj10suppliers.netlify.app/" target="_blank" rel="noreferrer" className="utility-link">
                SELL ON SJ10
              </a>
            </div>
            <div className="right-links">
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        {/* 2. MAIN ORANGE ACTION BAR */}
        <div className="main-orange-bar">
          <div className="container nav-grid">
            
            {/* LEFT: HOME ICON & LOGO (Desktop Only) */}
            <div className="nav-left hidden md-flex">
              <Link href="/" className="top-icon-btn" title="Home">
                <i className="fas fa-home"></i>
              </Link>
              <Link href="/" className="logo-link">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.gif" alt="SJ10 Logo" className="sj-logo" />
              </Link>
            </div>

            {/* CENTER: SEARCH ENGINE */}
            <div className="nav-center" ref={searchRef}>
              {showSearchBar && (
                <>
                  <form className="pro-search-box" onSubmit={handleSearchSubmit}>
                    <input 
                      type="text" 
                      placeholder="Search products, brands and more..." 
                      value={searchQuery}
                      autoComplete="off"
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    />
                    <button type="submit" className="pro-search-btn" title="Search">
                      <i className="fas fa-search"></i>
                    </button>
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

            {/* RIGHT: ICONS & PROFILE (Desktop Only) */}
            <div className="nav-right hidden md-flex">
              
              <Link href="/help" className="top-icon-btn" title="Help & Support">
                <i className="fas fa-headset"></i>
              </Link>
              <Link href="/explore" className="top-icon-btn" title="Explore">
                <i className="fas fa-compass"></i>
              </Link>
              <Link href="/category" className="top-icon-btn" title="Categories">
                <i className="fas fa-th-large"></i>
              </Link>

              {/* User Profile / Auth Area */}
              <div className="auth-zone" ref={dropdownRef}>
                {user ? (
                  <div className="logged-in-pill" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <span className="user-greeting">HI, {user.full_name?.split(' ')[0].toUpperCase()}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.profile_pic || DEFAULT_DP} alt="User DP" className="user-dp" />
                    
                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div className="pro-dropdown">
                        <Link href="/profile"><i className="fas fa-user-circle"></i> My Profile</Link>
                        <Link href="/orders"><i className="fas fa-box"></i> My Orders</Link>
                        <button onClick={() => signOut()} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</button>
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

      {/* SCOPED STYLES */}
      <style jsx>{`
        .container { max-width: 1350px; margin: 0 auto; padding: 0 15px; width: 100%; box-sizing: border-box; }

        /* Utility Strip */
        .utility-strip { background: #001e3c; color: white; padding: 6px 0; font-family: sans-serif; }
        .utility-content { display: flex; justify-content: space-between; align-items: center; }
        .utility-link { color: #f1f1f1; text-decoration: none; font-size: 11px; font-weight: 800; letter-spacing: 1px; transition: 0.2s; }
        .utility-link:hover { color: #f85606; }

        /* Main Orange Bar */
        .main-orange-bar { 
          background: linear-gradient(90deg, #f85606 0%, #ff7b00 100%); 
          padding: 16px 0; 
          min-height: 85px; 
          display: flex; align-items: center; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        }
        .nav-grid { display: flex; align-items: center; justify-content: space-between; gap: 30px; }

        /* Left Group (Logo) */
        .nav-left { display: flex; align-items: center; gap: 15px; }
        .sj-logo { height: 48px; width: auto; }

        /* Center (Search) */
        .nav-center { flex: 1; max-width: 800px; position: relative; }
        .pro-search-box { 
          display: flex; background: white; border-radius: 8px; overflow: hidden; 
          height: 48px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); transition: all 0.3s ease;
        }
        .pro-search-box:focus-within { 
          box-shadow: 0 0 0 4px rgba(255,255,255,0.3); 
          transform: translateY(-1px);
        }
        .pro-search-box input { flex: 1; border: none; padding: 0 20px; font-size: 15px; font-weight: 500; color: #222; outline: none; }
        .pro-search-btn { width: 60px; background: #ffe1d2; border: none; color: #f85606; font-size: 20px; cursor: pointer; transition: background 0.2s, color 0.2s; }
        .pro-search-btn:hover { background: #f85606; color: white; }

        /* Suggestions */
        .pro-suggestions { 
          position: absolute; top: 115%; left: 0; right: 0; background: white; 
          border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); z-index: 10000; overflow: hidden; 
          animation: fadeIn 0.2s ease;
        }
        .sugg-item { padding: 14px 20px; font-size: 14px; font-weight: 600; color: #444; cursor: pointer; border-bottom: 1px solid #f8f8f8; display: flex; gap: 12px; align-items: center; transition: all 0.2s; }
        .sugg-item:hover { background: #fff3ed; color: #f85606; padding-left: 28px; }
        .sugg-icon { color: #ccc; font-size: 14px; transition: color 0.2s; }
        .sugg-item:hover .sugg-icon { color: #f85606; }

        /* Right Group (Icons & Auth) */
        .nav-right { display: flex; align-items: center; gap: 24px; }
        
        .top-icon-btn { 
          color: #ffffff !important; 
          font-size: 24px; 
          transition: all 0.2s ease; 
          text-decoration: none;
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 50%;
        }
        .top-icon-btn:hover { 
          transform: scale(1.1) translateY(-2px); 
          background: rgba(255,255,255,0.2);
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        /* Profile & Auth Pill */
        .auth-zone { position: relative; margin-left: 10px; }
        
        .login-signup-pill { 
          background: rgba(0,0,0,0.15); border: 1.5px solid rgba(255,255,255,0.4); color: white; 
          padding: 10px 22px; border-radius: 50px; font-weight: 800; font-size: 13px; cursor: pointer; 
          transition: all 0.3s ease; letter-spacing: 0.5px;
        }
        .login-signup-pill:hover { 
          background: white; color: #f85606; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
          transform: translateY(-2px); 
          border-color: white;
        }

        .logged-in-pill { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 4px 10px; border-radius: 50px; transition: background 0.3s; }
        .logged-in-pill:hover { background: rgba(0,0,0,0.1); }
        .user-greeting { color: white; font-weight: 800; font-size: 14px; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .user-dp { width: 44px; height: 44px; border-radius: 50%; border: 2.5px solid white; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.2); background: white; }

        /* Dropdown */
        .pro-dropdown { 
          position: absolute; top: 130%; right: 0; background: white; border-radius: 12px; 
          width: 180px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); overflow: hidden; z-index: 10000;
          animation: slideDown 0.2s ease forwards;
        }
        .pro-dropdown a, .pro-dropdown button { 
          display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 20px; font-size: 14px; font-weight: 700; 
          color: #333; text-decoration: none; background: none; border: none; cursor: pointer; border-bottom: 1px solid #f5f5f5;
          transition: all 0.2s; text-align: left;
        }
        .pro-dropdown a:hover, .pro-dropdown button:hover { background: #fff3ed; color: #f85606; padding-left: 24px; }
        .pro-dropdown i { color: #999; font-size: 16px; width: 20px; text-align: center; transition: color 0.2s; }
        .pro-dropdown a:hover i, .pro-dropdown button:hover i { color: #f85606; }
        
        .logout-btn { border-bottom: none !important; color: #d32f2f !important; }
        .logout-btn:hover { background: #ffebee !important; color: #b71c1c !important; }
        .logout-btn:hover i { color: #b71c1c !important; }

        /* Animations */
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Utility Classes */
        .hidden { display: none; }
        @media (min-width: 769px) { .md-block { display: block; } .md-flex { display: flex; } }

        /* 🔥 MOBILE VIEW: SEARCH BAR ONLY 🔥 */
        @media (max-width: 768px) {
          .main-orange-bar { min-height: 75px; padding: 12px 10px; }
          .nav-grid { justify-content: center; gap: 0; }
          .nav-center { min-width: 100%; }
          .pro-search-box { height: 46px; border-radius: 50px; } /* Rounded Pill shape for mobile */
          .pro-search-box input { font-size: 14px; padding: 0 20px; }
        }
      `}</style>
    </>
  );
}