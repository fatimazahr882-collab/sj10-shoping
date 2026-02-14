// src/components/HomeClientPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- INSTANT COMPONENTS ---
// Note: PopularProducts is now imported normally, not dynamically
import Banners from '@/components/Banners';
import VerticalBanner from '@/components/VerticalBanner';
import SearchBar from '@/components/SearchBar';
import StripBanner from '@/components/StripBanner';
import HomeSubcategories from '@/components/HomeSubcategories';
import PromotedSection from '@/components/PromotedSection';
import PopularProducts from '@/components/PopularProducts'; // <--- IMPORT NORMALLY
import DynamicDiscountSections from '@/components/DynamicDiscountSections';
import { HomeData } from '@/lib/home-data';

// --- UTILS & LAZY COMPONENTS ---
import SectionLoader from '@/components/SectionLoader';
import LoadTrigger from '@/components/LoadTrigger';

// Keep these lazy to prioritize the top fold
const CategoryRows = dynamic(() => import('@/components/CategoryRows'), { ssr: false });
const ExploreHomepage = dynamic(() => import('@/components/ExploreHomepage'), { ssr: false });

const LAZY_SUBCAT_URL = `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/homepage-data`;

export default function HomeClientPage({ initialData }: { initialData: HomeData }) {
  const [loadStage, setLoadStage] = useState(0);
  const [lazySubCatData, setLazySubCatData] = useState({ row2: [], row3: [] });

  useEffect(() => {
    // Lazy loading logic for LOWER sections (Trending Categories etc)
    if (loadStage === 3) {
      fetch(LAZY_SUBCAT_URL).then(res => res.json()).then(data => {
          setLazySubCatData(prev => ({ ...prev, row2: data.subCatRow2 || [] }));
          setLoadStage(4);
        });
    }
    if (loadStage === 7) {
       fetch(LAZY_SUBCAT_URL).then(res => res.json()).then(data => {
          setLazySubCatData(prev => ({ ...prev, row3: data.subCatRow3 || [] }));
          setLoadStage(8);
        });
    }
  }, [loadStage]);

  return (
    <div className="homepage-wrapper bg-gray-50 pb-20">
      
      {/* --- INSTANT FOLD (0ms Load Time via ISR) --- */}
      <div className="sticky top-[70px] z-40 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100 shadow-sm">
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
      
      {initialData.subCatRow1?.length > 0 && (
        <HomeSubcategories subcategories={initialData.subCatRow1} title="Explore Categories" priority={true} />
      )}
      
      {/* PROMOTED SECTION (Instant - 6 Hour Cache) */}
      <PromotedSection products={initialData.promotedTop50} />
      
      <DynamicDiscountSections sections={initialData.discountSections} />

      {/* POPULAR SECTION (Instant - 6 Hour Cache) */}
      {/* We pass data directly. No Loading state needed here anymore. */}
      {initialData.popularProducts?.length > 0 && (
         <PopularProducts products={initialData.popularProducts} />
      )}

      {/* --- LAZY LOADED SECTIONS (Below the Fold) --- */}
      
      {/* Trigger for Category Rows */}
      {loadStage < 5 && <LoadTrigger onVisible={() => setLoadStage(5)} />}

      {loadStage === 5 && <SectionLoader text="Loading Collections..." />}
      {loadStage >= 6 && <div className="animate-fade-in"><CategoryRows /></div>}
      {loadStage === 5 && <LoadTrigger onVisible={() => setLoadStage(6)} />}
      
      {loadStage === 6 && <LoadTrigger onVisible={() => setLoadStage(7)} />}

      {/* Sub Category Row 3 */}
      {loadStage === 7 && <SectionLoader text="Discover More..." />}
      {loadStage >= 8 && lazySubCatData.row3.length > 0 && (
        <div className="border-t-8 border-gray-100 py-4 bg-white animate-fade-in">
          <HomeSubcategories subcategories={lazySubCatData.row3} title="More to Explore" priority={false} />
        </div>
      )}
      {loadStage === 8 && <LoadTrigger onVisible={() => setLoadStage(9)} />}

      {/* Explore Feed */}
      {loadStage === 9 && <SectionLoader text="Loading Feed..." />}
      {loadStage >= 9 && (
        <section className="border-t-8 border-gray-100 mt-4 min-h-screen animate-fade-in" id="explore-section">
          <ExploreHomepage />
        </section>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}