// src/components/HomeClientPage.tsx
"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// --- PHASE 1 IMPORTS (Instant Load) ---
import Banners from '@/components/Banners';
import VerticalBanner from '@/components/VerticalBanner';
import SearchBar from '@/components/SearchBar';
import StripBanner from '@/components/StripBanner';
import HomeSubcategories from '@/components/HomeSubcategories';
import ProductCard from '@/components/ProductCard';
import DynamicDiscountSections from '@/components/DynamicDiscountSections';
import { HomeData } from '@/lib/home-data';

// --- PHASE 2 IMPORTS (Lazy Load Code) ---
// We import these dynamically so their JS code isn't even downloaded until needed
import LazySection from '@/components/LazySection';

const PopularProducts = dynamic(() => import('@/components/PopularProducts'));
const CategoryRows = dynamic(() => import('@/components/CategoryRows'));
const ExploreHomepage = dynamic(() => import('@/components/ExploreHomepage'), { ssr: false });

export default function HomeClientPage({ initialData }: { initialData: HomeData }) {
  
  // Inline styles for sliders (matching your original UI)
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

      {/* === PHASE 1: CRITICAL RENDER (Loads Instantly) === */}
      
      {/* 1. Sticky Search */}
      <div className="sticky top-[70px] z-40 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100 shadow-sm transition-all">
        <SearchBar />
      </div>

      {/* 2. Banners */}
      <div className="desktop-banner-layout">
        <VerticalBanner /> 
        <div className="main-banner-wrapper">
          <Banners banners={initialData.banners} priority={true} />
        </div>
      </div>
      
      <div className="full-width-banner">
        <Banners banners={initialData.banners} priority={true} />
      </div>

      <StripBanner />

      {/* 3. Subcategories (Limited to 18 for performance) */}
      {initialData.subCatRow1?.length > 0 && (
        <HomeSubcategories 
          subcategories={initialData.subCatRow1} 
          title="Explore Categories" 
          priority={true} 
        />
      )}

      {/* 4. Promoted Products */}
      {initialData.promotedTop50?.length > 0 && (
        <section className="bg-white my-4 py-4 border-t-8 border-gray-100 relative z-0">
          <div className="flex justify-between px-4 mb-2">
            <h2 className="section-title text-lg font-bold text-gray-800">Promoted</h2>
          </div>
          <div className="hide-scrollbar" style={sliderStyle}>
            {initialData.promotedTop50.map((p) => (
              <div key={`promo-${p.id}`} style={sliderItemStyle} className="md:w-[220px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Discount Sections */}
      <DynamicDiscountSections />


      {/* === PHASE 2: LAZY LOAD (Loads on Scroll) === */}
      {/* The browser will NOT render or fetch data for these sections until the user scrolls down */}

      <LazySection height="400px" offset="200px">
        <PopularProducts />
      </LazySection>

      {/* Subcats Row 2 */}
      {initialData.subCatRow2?.length > 0 && (
        <LazySection height="150px">
          <div className="border-t-8 border-gray-100 py-4 bg-white">
            <HomeSubcategories subcategories={initialData.subCatRow2} title="Trending Categories" priority={false} />
          </div>
        </LazySection>
      )}

      <LazySection height="500px" offset="300px">
        <CategoryRows />
      </LazySection>

      {/* Subcats Row 3 */}
      {initialData.subCatRow3?.length > 0 && (
        <LazySection height="150px">
          <div className="border-t-8 border-gray-100 py-4 bg-white">
            <HomeSubcategories subcategories={initialData.subCatRow3} title="More to Explore" priority={false} />
          </div>
        </LazySection>
      )}

      {/* Explore Section (Heavy) - Last priority */}
      <LazySection height="800px" offset="100px">
        <section className="border-t-8 border-gray-100 mt-4 min-h-screen" id="explore-section">
          <ExploreHomepage />
        </section>
      </LazySection>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}