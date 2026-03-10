"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import Banners from '@/components/Banners';
import VerticalBanner from '@/components/VerticalBanner';
import SearchBar from '@/components/SearchBar';
import StripBanner from '@/components/StripBanner';
import HomeSubcategories from '@/components/HomeSubcategories';
import PromotedSection from '@/components/PromotedSection';
import PopularProducts from '@/components/PopularProducts';
import LatestProducts from '@/components/LatestProducts'; // ✅ IMPORT THE NEW COMPONENT
import DynamicDiscountSections from '@/components/DynamicDiscountSections';
import { HomeData } from '@/lib/home-data';

import SectionLoader from '@/components/SectionLoader';
import LoadTrigger from '@/components/LoadTrigger';

const CategoryRows = dynamic(() => import('@/components/CategoryRows'), { ssr: false });
const ExploreHomepage = dynamic(() => import('@/components/ExploreHomepage'), { ssr: false });

const LAZY_SUBCAT_URL = `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/homepage-data`;

export default function HomeClientPage({ initialData }: { initialData: HomeData }) {
  const [loadStage, setLoadStage] = useState(0);
  const[lazySubCatData, setLazySubCatData] = useState({ row2: [], row3:[] });

  useEffect(() => {
    // Lazy loading logic for LOWER sections
    if (loadStage === 2) {
      fetch(LAZY_SUBCAT_URL).then(res => res.json()).then(data => {
          setLazySubCatData(prev => ({ ...prev, row2: data.subCatRow2 ||[], row3: data.subCatRow3 || [] }));
          setLoadStage(4);
        });
    }
  }, [loadStage]);

  return (
    <div className="homepage-wrapper bg-gray-50 pb-20 overflow-x-hidden">
      
      
      
      {/* Banners */}
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
      
      {/* Sub Categories 1 */}
      {initialData.subCatRow1?.length > 0 && (
        <HomeSubcategories subcategories={initialData.subCatRow1} title="Explore Categories" priority={true} />
      )}
      
      {/* Promoted Products */}
      <PromotedSection products={initialData.promotedTop50} />
      
      {/* Discount Sections */}
      <DynamicDiscountSections sections={initialData.discountSections} />

      {/* 🔥 1. POPULAR PRODUCTS (Top Reviews/Views) */}
      {initialData.popularProducts?.length > 0 && (
         <PopularProducts products={initialData.popularProducts} />
      )}

      {/* 🔥 2. NEW LATEST PRODUCTS (Strictly Newest 50 with Horizontal Scroll) */}
      {initialData.latestProducts?.length > 0 && (
         <LatestProducts products={initialData.latestProducts} />
      )}

      {/* --- LAZY LOADED SECTIONS TRIGGER --- */}
      {loadStage < 2 && <LoadTrigger onVisible={() => setLoadStage(2)} />}

      {/* Category Rows */}
      {loadStage >= 2 && loadStage < 4 && <SectionLoader text="Loading Collections..." />}
      {loadStage >= 4 && <div className="animate-fade-in"><CategoryRows /></div>}
      
      {loadStage === 4 && <LoadTrigger onVisible={() => setLoadStage(6)} />}

      {/* Sub Category Row 3 */}
      {loadStage === 6 && <SectionLoader text="Discover More..." />}
      {loadStage >= 6 && lazySubCatData.row3.length > 0 && (
        <div className="border-t-8 border-gray-100 py-4 bg-white animate-fade-in">
          <HomeSubcategories subcategories={lazySubCatData.row3} title="More to Explore" priority={false} />
        </div>
      )}
      {loadStage >= 6 && <LoadTrigger onVisible={() => setLoadStage(8)} />}

      {/* Explore Feed */}
      {loadStage === 8 && <SectionLoader text="Loading Feed..." />}
      {loadStage >= 8 && (
        <section className="border-t-8 border-gray-100 mt-4 min-h-screen animate-fade-in w-full overflow-hidden" id="explore-section">
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