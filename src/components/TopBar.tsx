// src/components/TopBar.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import AuthModal from './AuthModal';

const DEFAULT_PROFILE_PIC = "https://ui-avatars.com/api/?name=User&background=f85606&color=fff";

// Type for our search suggestions
type Suggestion = {
  id: number;
  title: string;
  slug: string;
};

export default function TopBar() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const[isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Close profile dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      // Close search suggestions
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  },[]);

  const handleLogout = async () => {
    await signOut();
    setIsProfileOpen(false);
    router.refresh();
  };

  // --- 🔥 THE SEARCH BRAIN (DEBOUNCE & FETCH) ---
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) { 
        setSuggestions([]); 
        setShowSuggestions(false); 
        return; 
    }

    try {
      // Calls your newly updated fast endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/suggestions-text?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) { 
        setSuggestions([]); 
    }
  },[]);

  // Delay the search so it doesn't fire on every single keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Handle final search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  // Only show the Search Bar on Home and Explore pages
  const showSearchBar = pathname === '/' || pathname === '/explore';

  if (isLoading) {
    return <div style={{ height: '70px', backgroundColor: '#f85606' }}></div>;
  }

  return (
    <>
      <div className="daraz-top-bar">
        
        {/* 1. TOP THIN LINKS ROW */}
        <div className="daraz-links-row hidden md-flex">
          <a href="#" className="daraz-link">SAVE MORE ON APP</a>
          <a href="https://sj10suppliers.netlify.app/" target="_blank" rel="noopener noreferrer" className="daraz-link">SELL ON SJ10</a>
          <Link href="/help" className="daraz-link">HELP & SUPPORT</Link>
          
          {user ? (
            <>
              <Link href="/profile" className="daraz-link">HELLO, {user.full_name?.split(' ')[0].toUpperCase()}</Link>
              <button onClick={handleLogout} className="daraz-link-btn">LOGOUT</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsAuthModalOpen(true)} className="daraz-link-btn">LOGIN</button>
              <button onClick={() => setIsAuthModalOpen(true)} className="daraz-link-btn">SIGN UP</button>
            </>
          )}
          
          {/* Language Switcher Placeholder */}
          <button className="daraz-link-btn">زبان تبدیل کریں</button>
        </div>

        {/* 2. SEARCH BAR ROW */}
        {showSearchBar && (
          <div className="daraz-search-row">
            
            {/* We wrap the form in a div to handle the absolute dropdown */}
            <div className="search-wrapper" ref={searchContainerRef}>
                <form className="daraz-search-box" onSubmit={handleSearchSubmit}>
                  <input 
                    type="text" 
                    placeholder="Search in SJ10" 
                    className="daraz-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true) }}
                  />
                  <button type="submit" className="daraz-search-btn">
                    <i className="fas fa-search"></i>
                  </button>
                </form>

                {/* 🔥 THE SUGGESTIONS DROPDOWN 🔥 */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                        {suggestions.map((sugg) => (
                            <div 
                                key={sugg.id} 
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(sugg.title)}
                            >
                                <i className="fas fa-search sugg-icon"></i>
                                {sugg.title}
                            </div>
                        ))}
                    </div>
                )}
            </div>

          </div>
        )}

      </div>

      {/* Render the Fixed Auth Modal Here */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* EXACT DARAZ STYLING */}
      <style jsx>{`
        .daraz-top-bar {
          background-color: #f85606; 
          width: 100%;
          position: relative;
          z-index: 1040;
          font-family: Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
        }

        .daraz-links-row {
          max-width: 1188px; margin: 0 auto; display: flex;
          justify-content: flex-end; align-items: center;
          padding: 4px 15px; gap: 25px;
        }

        .daraz-link, .daraz-link-btn {
          color: white; font-size: 12px; text-decoration: none;
          background: none; border: none; cursor: pointer; letter-spacing: 0.3px;
          padding: 0; transition: opacity 0.2s;
        }
        .daraz-link:hover, .daraz-link-btn:hover { opacity: 0.8; }

        .daraz-search-row {
          max-width: 1188px; margin: 0 auto;
          padding: 8px 15px 16px 15px; display: flex; justify-content: center;
        }

        /* Search Wrapper for Dropdown Positioning */
        .search-wrapper {
            width: 100%; max-width: 700px; position: relative;
        }

        .daraz-search-box {
          display: flex; width: 100%; background: white;
          border-radius: 2px; overflow: hidden; height: 42px;
        }

        .daraz-search-input {
          flex: 1; border: none; outline: none; padding: 0 15px;
          font-size: 14px; color: #212121;
        }

        .daraz-search-btn {
          background-color: #ffe1d2; border: none; color: #f85606;
          width: 50px; cursor: pointer; font-size: 16px; display: flex;
          align-items: center; justify-content: center; transition: background 0.2s;
        }
        .daraz-search-btn:hover { background-color: #ffc9b0; }

        /* 🔥 Suggestions Dropdown UI 🔥 */
        .suggestions-dropdown {
            position: absolute; top: 100%; left: 0; right: 0;
            background: white; border-radius: 0 0 4px 4px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            z-index: 1050; overflow: hidden;
            border: 1px solid #e0e0e0; border-top: none;
        }

        .suggestion-item {
            padding: 12px 15px; cursor: pointer; font-size: 14px;
            color: #212121; display: flex; align-items: center; gap: 12px;
            transition: background 0.2s;
        }
        .suggestion-item:hover { background-color: #f5f5f5; color: #f85606; }
        .sugg-icon { color: #9e9e9e; font-size: 12px; }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .md-flex { display: none; } 
          .daraz-search-row { padding: 12px 15px; }
        }
        @media (min-width: 769px) { .md-flex { display: flex; } }
      `}</style>
    </>
  );
}