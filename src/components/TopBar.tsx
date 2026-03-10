"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import ThemeSwitcher from './ThemeSwitcher';

// The default profile picture link you requested
const DEFAULT_DP = "https://pub-1390981b409c46698da5dc6c45e08eaa.r2.dev/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp";

export default function TopBar() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Suggestion States for the "Daraz Brain"
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- SEARCH BRAIN ---
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/suggestions-text?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (e) { console.error(e); }
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (isLoading) return null;

  return (
    <>
      <div className="sj10-master-header">
        
        {/* 1. TOP UTILITY STRIP (Dark Navy) */}
        <div className="top-utility-strip">
          <div className="container utility-flex">
            <div className="left-links">
              <a href="https://sj10suppliers.netlify.app/" target="_blank" className="utility-item">
                <i className="fas fa-store-alt icon-gold"></i> SELL ON SJ10
              </a>
              <Link href="/help" className="utility-item">
                <i className="fas fa-headset icon-gold"></i> HELP & SUPPORT
              </Link>
            </div>
            <div className="right-links">
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        {/* 2. MAIN LARGE ACTION BAR (Orange) */}
        <div className="main-nav-bar">
          <div className="container nav-content-grid">
            
            {/* LEFT: HOME & LOGO */}
            <div className="logo-section">
              <Link href="/" className="home-btn-attractive" title="Home">
                <i className="fas fa-home"></i>
              </Link>
              <Link href="/" className="logo-link">
                <img src="/logo.gif" alt="SJ10 Logo" className="sj-logo-img" />
              </Link>
            </div>

            {/* CENTER: SEARCH ENGINE */}
            <div className="search-section-wrap" ref={searchRef}>
              <form className="modern-search-form" onSubmit={handleSearchSubmit}>
                <input 
                  type="text" 
                  placeholder="Search products, brands and more..." 
                  value={searchQuery}
                  autoComplete="off"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                />
                <button type="submit" className="search-trigger-btn">
                  <i className="fas fa-search"></i>
                </button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestion-results-box">
                  {suggestions.map((s, i) => (
                    <div key={i} className="sugg-row" onClick={() => {setSearchQuery(s.title); router.push(`/search?q=${s.title}`); setShowSuggestions(false)}}>
                      <i className="fas fa-search"></i> {s.title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: NAVIGATION ICONS */}
            <div className="nav-icons-section">
              
              <Link href="/explore" className="nav-icon-link" title="Explore">
                <i className="fas fa-compass"></i>
                <span>Explore</span>
              </Link>

              <Link href="/category" className="nav-icon-link" title="Categories">
                <i className="fas fa-th-large"></i>
                <span>Category</span>
              </Link>

              {/* AUTH / PROFILE DYNAMIC SECTION */}
              <div className="user-auth-wrapper" ref={dropdownRef}>
                {user ? (
                  <div className="logged-in-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <div className="profile-text-group">
                      <span className="hi-text">HI, {user.full_name?.split(' ')[0].toUpperCase()}</span>
                    </div>
                    <div className="dp-container">
                      <img src={user.profile_pic || DEFAULT_DP} alt="User DP" className="user-dp" />
                    </div>
                    
                    {isProfileOpen && (
                      <div className="profile-dropdown-menu">
                        <Link href="/profile"><i className="fas fa-user-edit"></i> My Profile</Link>
                        <Link href="/orders"><i className="fas fa-box-open"></i> My Orders</Link>
                        <button onClick={() => signOut()}><i className="fas fa-sign-out-alt"></i> Logout</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="logged-out-profile" onClick={() => setIsAuthModalOpen(true)}>
                     <i className="fas fa-user-circle logout-icon"></i>
                     <span className="profile-text">Profile</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <style jsx>{`
        .sj10-master-header { width: 100%; position: sticky; top: 0; z-index: 2000; box-shadow: 0 10px 30px rgba(0,0,0,0.1); font-family: 'Poppins', sans-serif; }
        .container { max-width: 1400px; margin: 0 auto; padding: 0 20px; width: 100%; box-sizing: border-box; }

        /* 1. Utility Strip (Navy) */
        .top-utility-strip { background: #001e3c; padding: 8px 0; color: #fff; }
        .utility-flex { display: flex; justify-content: space-between; align-items: center; }
        .left-links { display: flex; gap: 30px; }
        .utility-item { color: #f1f1f1; text-decoration: none; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; transition: 0.3s; display: flex; align-items: center; gap: 8px; }
        .utility-item:hover { color: #f85606; }
        .icon-gold { color: #ffbc00; font-size: 14px; }

        /* 2. Main Header (Orange - Increased Height) */
        .main-nav-bar { background: #f85606; padding: 15px 0; min-height: 95px; display: flex; align-items: center; }
        .nav-content-grid { display: flex; align-items: center; justify-content: space-between; gap: 20px; }

        /* Logo Group */
        .logo-section { display: flex; align-items: center; gap: 15px; }
        .home-btn-attractive { font-size: 28px; color: #fff; transition: 0.3s; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
        .home-btn-attractive:hover { transform: scale(1.15); color: #001e3c; }
        .sj-logo-img { height: 55px; width: auto; unoptimized: true; }

        /* Search Engine */
        .search-section-wrap { flex: 1; max-width: 800px; position: relative; }
        .modern-search-form { display: flex; background: white; border-radius: 50px; overflow: hidden; height: 48px; box-shadow: 0 5px 20px rgba(0,0,0,0.15); }
        .modern-search-form input { flex: 1; border: none; padding: 0 25px; outline: none; font-size: 15px; font-weight: 500; color: #333; }
        .search-trigger-btn { width: 60px; background: #fff1eb; border: none; color: #f85606; cursor: pointer; font-size: 20px; transition: 0.2s; }
        .search-trigger-btn:hover { background: #f85606; color: white; }

        /* Suggestions List */
        .suggestion-results-box { position: absolute; top: 115%; left: 0; right: 0; background: white; border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.2); z-index: 3000; overflow: hidden; }
        .sugg-row { padding: 14px 20px; font-size: 14px; font-weight: 600; color: #444; cursor: pointer; display: flex; gap: 12px; align-items: center; border-bottom: 1px solid #f8f8f8; }
        .sugg-row:hover { background: #fff3ed; color: #f85606; padding-left: 30px; transition: 0.2s; }

        /* Icons Section */
        .nav-icons-section { display: flex; align-items: center; gap: 25px; }
        .nav-icon-link { color: white; text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: 0.3s; }
        .nav-icon-link i { font-size: 24px; } /* Increased Size */
        .nav-icon-link span { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .nav-icon-link:hover { transform: translateY(-4px); text-shadow: 0 5px 15px rgba(0,0,0,0.3); }

        /* User Profile & DP */
        .logged-in-profile { display: flex; align-items: center; gap: 12px; cursor: pointer; position: relative; }
        .hi-text { color: white; font-weight: 900; font-size: 14px; letter-spacing: 0.5px; }
        .dp-container { width: 45px; height: 45px; border-radius: 50%; border: 3px solid white; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.2); background: white; }
        .user-dp { width: 100%; height: 100%; object-fit: cover; }
        
        .logged-out-profile { display: flex; flex-direction: column; align-items: center; color: white; cursor: pointer; transition: 0.3s; }
        .logout-icon { font-size: 26px; }
        .profile-text { font-size: 10px; font-weight: 800; margin-top: 4px; }
        .logged-out-profile:hover { transform: scale(1.1); }

        /* Dropdown */
        .profile-dropdown-menu { position: absolute; top: 120%; right: 0; background: white; border-radius: 12px; width: 180px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; z-index: 100; animation: slideUp 0.3s ease; }
        .profile-dropdown-menu a, .profile-dropdown-menu button { display: block; width: 100%; padding: 14px 20px; color: #333; text-decoration: none; font-size: 14px; font-weight: 700; text-align: left; background: none; border: none; cursor: pointer; border-bottom: 1px solid #f5f5f5; }
        .profile-dropdown-menu a:hover, .profile-dropdown-menu button:hover { background: #f85606; color: white; }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Mobile Adjustments */
        @media (max-width: 900px) {
          .nav-content-grid { flex-wrap: wrap; gap: 10px; }
          .search-section-wrap { order: 3; min-width: 100%; margin-top: 5px; }
          .logo-section { order: 1; }
          .nav-icons-section { order: 2; gap: 15px; }
          .hi-text, .nav-icon-link span, .top-utility-strip { display: none; }
          .main-nav-bar { min-height: auto; padding: 12px 0; }
          .sj-logo-img { height: 40px; }
          .dp-container { width: 35px; height: 35px; }
        }
      `}</style>
    </>
  );
}