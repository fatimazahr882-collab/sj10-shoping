// src/components/HomeClientPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic'; // ⚡ CORE IMPORT FOR LAZY LOADING

// --- 1. CRITICAL COMPONENTS (Load Instantly for LCP) ---
// These are imported normally because they are "Above the Fold" (visible immediately)
import Banners from '@/components/Banners';
import VerticalBanner from '@/components/VerticalBanner';
import SearchBar from '@/components/SearchBar';
import StripBanner from '@/components/StripBanner';
import { HomeData } from '@/lib/home-data';

// --- 2. HEAVY COMPONENTS (Lazy Load Code) ---
// These imports are split from the main bundle. They won't block the initial load.
const HomeSubcategories = dynamic(() => import('@/components/HomeSubcategories'), { 
  loading: () => <div className="h-32 bg-gray-50 animate-pulse rounded-lg m-4" /> 
});
const ProductCard = dynamic(() => import('@/components/ProductCard')); // Lazy load individual cards logic
const DynamicDiscountSections = dynamic(() => import('@/components/DynamicDiscountSections'), {
  loading: () => <div className="h-60 bg-gray-50 animate-pulse rounded-lg m-4" />
});
const CategoryRows = dynamic(() => import('@/components/CategoryRows'), {
  loading: () => <div className="h-20 bg-gray-50 animate-pulse rounded-lg m-4" />
});
const ExploreHomepage = dynamic(() => import('@/components/ExploreHomepage'), {
  ssr: false, // ⚡ Disable Server Rendering for Infinite Scroll to speed up initial HTML
  loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-lg m-4" />
});


const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomeClientPage({ initialData }: { initialData: HomeData }) {
  
  // SWR: Revalidates in background
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

  // --- 3. SCROLL DEFERRAL STRATEGY ---
  // Even with dynamic imports, we don't want to render the bottom DOM nodes
  // until the browser has finished painting the banners.
  const [isReadyToLoadBottom, setIsReadyToLoadBottom] = useState(false);

  useEffect(() => {
    // Wait for the 'load' event or a small timeout to ensure Banners are visible first
    const timer = setTimeout(() => {
        setIsReadyToLoadBottom(true);
    }, 1500); // 1.5 second delay allows the Main Thread to breathe
    return () => clearTimeout(timer);
  }, []);

  // Inline styles for sliders
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

      {/* --- CRITICAL SECTION (LOADS INSTANTLY) --- */}
      
      <div className="sticky top-[70px] z-40 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100 shadow-sm transition-all">
        <SearchBar />
      </div>

      <div className="desktop-banner-layout">
        <VerticalBanner /> 
        <div className="main-banner-wrapper">
          <Banners banners={safeData.banners} priority={true} />
        </div>
      </div>
      
      <div className="full-width-banner">
        <Banners banners={safeData.banners} priority={true} />
      </div>

      <StripBanner />

      {/* --- LAYER 2: FIRST DATA SECTION --- */}
      {/* We load the first row of categories immediately, but via dynamic import to save bundle size */}
      {safeData.subCatRow1?.length > 0 && (
        <HomeSubcategories 
          subcategories={safeData.subCatRow1.slice(0, 18)} // Limit to 18 to prevent DOM explosion
          title="Explore Categories" 
          priority={true} 
        />
      )}

      {/* --- LAYER 3: DEFERRED CONTENT (LOADS AFTER 1.5s) --- */}
      {/* This prevents the "Parallel Loading" crash. These components won't even try to render initially. */}
      {isReadyToLoadBottom && (
        <>
            {/* Promoted Slider */}
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

            <DynamicDiscountSections />

            <section className="py-4 px-4 bg-white border-t-8 border-gray-100">
                <h2 className="section-title text-lg font-bold mb-4 text-gray-800">Popular Products</h2>
                <div className="product-grid">
                    {safeData.popularMixed.map((p) => (
                    <ProductCard key={`pop-${p.id}`} product={p} />
                    ))}
                </div>
            </section>

            {/* Subcats Row 2 & 3 - Limited */}
            {safeData.subCatRow2?.length > 0 && (
                <div className="border-t-8 border-gray-100 py-4 bg-white">
                <HomeSubcategories subcategories={safeData.subCatRow2.slice(0, 15)} title="Trending Categories" priority={false} />
                </div>
            )}

            <CategoryRows />

            {safeData.subCatRow3?.length > 0 && (
                <div className="border-t-8 border-gray-100 py-4 bg-white">
                <HomeSubcategories subcategories={safeData.subCatRow3.slice(0, 15)} title="More to Explore" priority={false} />
                </div>
            )}

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