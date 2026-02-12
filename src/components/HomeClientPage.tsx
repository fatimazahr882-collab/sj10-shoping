// src/components/HomeClientPage.tsx
"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// --- INSTANT IMPORTS (Phase 1) ---
import Banners from '@/components/Banners';
import VerticalBanner from '@/components/VerticalBanner';
import SearchBar from '@/components/SearchBar';
import StripBanner from '@/components/StripBanner';
import HomeSubcategories from '@/components/HomeSubcategories';
import PromotedSection from '@/components/PromotedSection'; 
import DynamicDiscountSections from '@/components/DynamicDiscountSections';
import { HomeData } from '@/lib/home-data';

// --- LAZY IMPORTS (Phase 2 - On Scroll) ---
import LazySection from '@/components/LazySection';

// These components will NOT download until the user scrolls near them
const PopularProducts = dynamic(() => import('@/components/PopularProducts'));
const CategoryRows = dynamic(() => import('@/components/CategoryRows'));
const ExploreHomepage = dynamic(() => import('@/components/ExploreHomepage'), { ssr: false });

export default function HomeClientPage({ initialData }: { initialData: HomeData }) {
  
  // Inline styles for sliders
  const sliderStyle: React.CSSProperties = {
    display: 'flex', overflowX: 'auto', gap: '12px', padding: '10px 15px 25px 15px',
    scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none', msOverflowStyle: 'none',
  };

  return (
    <div className="homepage-wrapper bg-gray-50 pb-10">

      {/* ========================================= */}
      {/* === PHASE 1: INSTANT LOAD (Top View)  === */}
      {/* ========================================= */}
      
      <div className="sticky top-[70px] z-40 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100 shadow-sm transition-all">
        <SearchBar />
      </div>

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

      {/* Subcategories (Instant) */}
      {initialData.subCatRow1?.length > 0 && (
        <HomeSubcategories 
          subcategories={initialData.subCatRow1} 
          title="Explore Categories" 
          priority={true} 
        />
      )}

      {/* Promoted Products (Instant) */}
      <PromotedSection products={initialData.promotedTop50} />

      {/* Discount Sections (Instant) */}
      <DynamicDiscountSections sections={initialData.discountSections} />


      {/* ========================================= */}
      {/* === PHASE 2: LAZY LOAD (On Scroll)    === */}
      {/* ========================================= */}

      {/* 1. Popular Products (Loads when scrolled near) */}
      <LazySection height="400px" offset="200px">
        <PopularProducts />
      </LazySection>

      {/* 2. Subcats Row 2 */}
      {initialData.subCatRow2?.length > 0 && (
        <LazySection height="150px">
          <div className="border-t-8 border-gray-100 py-4 bg-white">
            <HomeSubcategories subcategories={initialData.subCatRow2} title="Trending Categories" priority={false} />
          </div>
        </LazySection>
      )}

      {/* 3. Category Rows */}
      <LazySection height="600px" offset="300px">
        <CategoryRows />
      </LazySection>

      {/* 4. Subcats Row 3 */}
      {initialData.subCatRow3?.length > 0 && (
        <LazySection height="150px">
          <div className="border-t-8 border-gray-100 py-4 bg-white">
            <HomeSubcategories subcategories={initialData.subCatRow3} title="More to Explore" priority={false} />
          </div>
        </LazySection>
      )}

      {/* 5. Explore - Loads last */}
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