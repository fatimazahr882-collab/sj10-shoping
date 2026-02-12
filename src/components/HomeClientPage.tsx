// src/components/HomeClientPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- INSTANT COMPONENTS ---
import Banners from '@/components/Banners';
import VerticalBanner from '@/components/VerticalBanner';
import SearchBar from '@/components/SearchBar';
import StripBanner from '@/components/StripBanner';
import HomeSubcategories from '@/components/HomeSubcategories';
import PromotedSection from '@/components/PromotedSection';
import DynamicDiscountSections from '@/components/DynamicDiscountSections';
import { HomeData } from '@/lib/home-data';

// --- UTILS & LAZY COMPONENTS ---
import SectionLoader from '@/components/SectionLoader';
import LoadTrigger from '@/components/LoadTrigger';

// `ssr: false` tells Next.js to only render these on the client-side.
const PopularProducts = dynamic(() => import('@/components/PopularProducts'), { ssr: false });
const CategoryRows = dynamic(() => import('@/components/CategoryRows'), { ssr: false });
const ExploreHomepage = dynamic(() => import('@/components/ExploreHomepage'), { ssr: false });

// Data for sections 2 and 3 will now be fetched on the client.
const LAZY_SUBCAT_URL = `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/homepage-data`;

export default function HomeClientPage({ initialData }: { initialData: HomeData }) {

  // This state is the single source of truth for the sequence.
  const [loadStage, setLoadStage] = useState(0);

  // Client-side state for our lazy-loaded subcategory data.
  const [lazySubCatData, setLazySubCatData] = useState({ row2: [], row3: [] });

  // This effect fetches the subcategory data in the background when it's needed.
  useEffect(() => {
    // Stage 3 is for loading "Trending Categories" (SubCat2)
    if (loadStage === 3) {
      fetch(LAZY_SUBCAT_URL)
        .then(res => res.json())
        .then(data => {
          setLazySubCatData(prev => ({ ...prev, row2: data.subCatRow2 || [] }));
          // Once data is fetched, advance to the next stage to show it
          setLoadStage(4);
        });
    }
    // Stage 7 is for loading "More to Explore" (SubCat3)
    if (loadStage === 7) {
       fetch(LAZY_SUBCAT_URL)
        .then(res => res.json())
        .then(data => {
          setLazySubCatData(prev => ({ ...prev, row3: data.subCatRow3 || [] }));
          setLoadStage(8);
        });
    }
  }, [loadStage]);

  return (
    <div className="homepage-wrapper bg-gray-50 pb-20">
      
      {/* ======================================================= */}
      {/* PHASE 1: INSTANT CONTENT (SERVER-RENDERED)            */}
      {/* ======================================================= */}
      <div className="sticky top-[70px] z-40 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100 shadow-sm"><SearchBar /></div>
      <div className="desktop-banner-layout"><VerticalBanner /><div className="main-banner-wrapper"><Banners banners={initialData.banners} priority={true} /></div></div>
      <div className="full-width-banner"><Banners banners={initialData.banners} priority={true} /></div>
      <StripBanner />
      {initialData.subCatRow1?.length > 0 && (<HomeSubcategories subcategories={initialData.subCatRow1} title="Explore Categories" priority={true} />)}
      <PromotedSection products={initialData.promotedTop50} />
      <DynamicDiscountSections sections={initialData.discountSections} />
      
      {/* Trigger for the very first scroll-based load */}
      {loadStage < 1 && <LoadTrigger onVisible={() => setLoadStage(1)} />}

      {/* ======================================================= */}
      {/* PHASE 2: POPULAR PRODUCTS                             */}
      {/* ======================================================= */}
      {loadStage === 1 && <SectionLoader text="Loading Popular Products..." />}
      {loadStage >= 2 && <div className="animate-fade-in"><PopularProducts /></div>}
      {loadStage === 1 && <LoadTrigger onVisible={() => setLoadStage(2)} />}
      
      {/* Trigger for the next section is only shown after the current one is loaded */}
      {loadStage === 2 && <LoadTrigger onVisible={() => setLoadStage(3)} />}

      {/* ======================================================= */}
      {/* PHASE 3: SUB-CATEGORY 2 (TRENDING)                    */}
      {/* ======================================================= */}
      {loadStage === 3 && <SectionLoader text="Loading Trending Categories..." />}
      {loadStage >= 4 && lazySubCatData.row2.length > 0 && (
        <div className="border-t-8 border-gray-100 py-4 bg-white animate-fade-in">
          <HomeSubcategories subcategories={lazySubCatData.row2} title="Trending Categories" priority={false} />
        </div>
      )}
      {loadStage === 4 && <LoadTrigger onVisible={() => setLoadStage(5)} />}
      
      {/* ======================================================= */}
      {/* PHASE 4: CATEGORY ROWS                                */}
      {/* ======================================================= */}
      {loadStage === 5 && <SectionLoader text="Loading More Collections..." />}
      {loadStage >= 6 && <div className="animate-fade-in"><CategoryRows /></div>}
      {loadStage === 5 && <LoadTrigger onVisible={() => setLoadStage(6)} />}
      
      {loadStage === 6 && <LoadTrigger onVisible={() => setLoadStage(7)} />}

      {/* ======================================================= */}
      {/* PHASE 5: SUB-CATEGORY 3                               */}
      {/* ======================================================= */}
      {loadStage === 7 && <SectionLoader text="Discover More..." />}
      {loadStage >= 8 && lazySubCatData.row3.length > 0 && (
        <div className="border-t-8 border-gray-100 py-4 bg-white animate-fade-in">
          <HomeSubcategories subcategories={lazySubCatData.row3} title="More to Explore" priority={false} />
        </div>
      )}
      {loadStage === 8 && <LoadTrigger onVisible={() => setLoadStage(9)} />}

      {/* ======================================================= */}
      {/* PHASE 6: EXPLORE FEED (FINAL)                         */}
      {/* ======================================================= */}
      {loadStage === 9 && <SectionLoader text="Preparing Your Explore Feed..." />}
      {loadStage >= 9 && (
        <section className="border-t-8 border-gray-100 mt-4 min-h-screen animate-fade-in" id="explore-section">
          <ExploreHomepage />
        </section>
      )}

      {/* Global Animation Styles */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}