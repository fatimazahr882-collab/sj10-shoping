// src/components/HomeClientPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

// Components
import ProductCard from '@/components/ProductCard';
import Banners from '@/components/Banners';
import HomeSubcategories from '@/components/HomeSubcategories';
import CategoryRows from '@/components/CategoryRows';
import VerticalBanner from '@/components/VerticalBanner';
import SearchBar from '@/components/SearchBar';
import ExploreHomepage from '@/components/ExploreHomepage';
import DynamicDiscountSections from '@/components/DynamicDiscountSections';
import StripBanner from '@/components/StripBanner';
import { HomeData } from '@/lib/home-data';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomeClientPage({ initialData }: { initialData: HomeData }) {
  
  // 1. HYBRID DATA STRATEGY
  const { data } = useSWR<HomeData>(
    `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/homepage-data`,
    fetcher,
    {
      fallbackData: initialData, 
      revalidateOnFocus: false,
      dedupingInterval: 60000, 
    }
  );

  const safeData = data || initialData;

  // 2. DEFER LOADING OF HEAVY SECTIONS
  // This prevents the "Timeout" error by letting the top of the page load first
  const [loadHeavyContent, setLoadHeavyContent] = useState(false);

  useEffect(() => {
    // Wait for the main thread to be free, then load the rest
    const timer = setTimeout(() => {
      setLoadHeavyContent(true);
    }, 100); // 100ms delay allows the browser to paint the Banners first
    return () => clearTimeout(timer);
  }, []);

  // Inline styles for the horizontal sliders
  const sliderStyle: React.CSSProperties = {
    display: 'flex', overflowX: 'auto', gap: '12px', padding: '10px 15px 25px 15px',
    scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none', msOverflowStyle: 'none',
  };

  const sliderItemStyle: React.CSSProperties = {
    flex: '0 0 auto', width: '160px', scrollSnapAlign: 'start', position: 'relative'
  };

  return (
    <div className="homepage-wrapper bg-gray-50 pb-10">

      {/* 1. STICKY SEARCH BAR */}
      <div className="sticky top-[70px] z-40 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100 shadow-sm transition-all">
        <SearchBar />
      </div>

      {/* 2. BANNERS LAYOUT */}
      <div className="desktop-banner-layout">
        <VerticalBanner /> 
        <div className="main-banner-wrapper">
          <Banners banners={safeData.banners} priority={true} />
        </div>
      </div>
      
      <div className="full-width-banner">
        <Banners banners={safeData.banners} priority={true} />
      </div>

      {/* 3. STRIP BANNER */}
      <StripBanner />

      {/* 4. SUBCATEGORIES ROW 1 - CRITICAL FIX APPLIED HERE */}
      {safeData.subCatRow1?.length > 0 && (
        <HomeSubcategories 
          // FIX: Only render the first 18 items. Rendering 283 items crashes performance.
          // The user can view more via a "View All" link inside the component if needed.
          subcategories={safeData.subCatRow1.slice(0, 18)} 
          title="Explore Categories" 
          priority={true} 
        />
      )}

      {/* 5. PROMOTED PRODUCTS SLIDER */}
      {safeData.promotedTop50?.length > 0 && (
        <section className="bg-white my-4 py-4 border-t-8 border-gray-100 relative z-0">
          <div className="flex justify-between px-4 mb-2">
            <h2 className="section-title text-lg font-bold text-gray-800">Promoted</h2>
          </div>
          <div className="hide-scrollbar" style={sliderStyle}>
            {safeData.promotedTop50.map((p) => (
              <div key={`promo-${p.id}`} style={sliderItemStyle} className="md:w-[220px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- HEAVY CONTENT BOUNDARY --- */}
      {/* We only render the rest of the page after the initial paint is done */}
      {loadHeavyContent && (
        <>
          {/* 6. DYNAMIC DISCOUNT SECTIONS */}
          <DynamicDiscountSections />

          {/* 7. POPULAR PRODUCTS GRID */}
          <section className="py-4 px-4 bg-white border-t-8 border-gray-100">
            <h2 className="section-title text-lg font-bold mb-4 text-gray-800">Popular Products</h2>
            <div className="product-grid">
              {safeData.popularMixed.map((p) => (
                <ProductCard key={`pop-${p.id}`} product={p} />
              ))}
            </div>
          </section>

          {/* 8. SUBCATEGORIES ROW 2 - LIMITED */}
          {safeData.subCatRow2?.length > 0 && (
            <div className="border-t-8 border-gray-100 py-4 bg-white">
              <HomeSubcategories 
                subcategories={safeData.subCatRow2.slice(0, 15)} 
                title="Trending Categories" 
                priority={false} 
              />
            </div>
          )}

          {/* 9. CATEGORY ROWS */}
          <CategoryRows />

          {/* 10. SUBCATEGORIES ROW 3 - LIMITED */}
          {safeData.subCatRow3?.length > 0 && (
            <div className="border-t-8 border-gray-100 py-4 bg-white">
              <HomeSubcategories 
                subcategories={safeData.subCatRow3.slice(0, 15)} 
                title="More to Explore" 
                priority={false} 
              />
            </div>
          )}

          {/* 11. INFINITE SCROLL EXPLORE */}
          <section className="border-t-8 border-gray-100 mt-4 min-h-screen" id="explore-section">
            <ExploreHomepage />
          </section>
        </>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}