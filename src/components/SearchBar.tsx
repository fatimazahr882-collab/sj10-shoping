"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Lightweight Type (No images/prices)
type Suggestion = {
  id: number;
  slug: string;
  title: string;
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 1. FAST Search (Titles Only)
  const performSearch = useCallback(async (currentQuery: string) => {
    if (!currentQuery.trim()) { setResults([]); return; }

    try {
      // Calls the new lightweight endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/suggestions-text?q=${encodeURIComponent(currentQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data); // Expecting array of {id, title, slug}
        setShowDropdown(true);
      }
    } catch (error) { setResults([]); }
  }, []);

  // 2. Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) performSearch(query);
      else { setResults([]); setShowDropdown(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // 3. Click Outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 4. Navigation
  const goToSearchPage = () => {
    setShowDropdown(false);
    // Redirects to NEW dedicated search page
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSuggestionClick = (title: string) => {
    setQuery(title);
    setShowDropdown(false);
    // Search for that specific title
    router.push(`/search?q=${encodeURIComponent(title)}`);
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto', fontFamily: 'var(--font-poppins)' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: '16px', pointerEvents: 'none', color: '#94a3b8' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && goToSearchPage()}
          placeholder="Search products..."
          style={{ width: '100%', height: '48px', paddingLeft: '48px', paddingRight: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '15px', color: '#1e293b', outline: 'none', boxShadow: showDropdown ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {/* --- TEXT ONLY DROPDOWN --- */}
      {showDropdown && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 50 }}>
          {results.map((p) => (
            <div 
              key={p.id} 
              onClick={() => handleSuggestionClick(p.title)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              {/* Only Title - FAST */}
              <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>{p.title}</span>
            </div>
          ))}
          <div onClick={goToSearchPage} style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#ea580c', cursor: 'pointer', backgroundColor: '#fff7ed' }}>
            See all results for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}