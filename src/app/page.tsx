"use client";

import { Suspense } from 'react';
import useSWR from 'swr'; // ✅ 1. Import SWR

// Components
import ProductCard, { type Product } from '@/components/ProductCard';
import Banners from '@/components/Banners';
import HomeSubcategories from '@/components/HomeSubcategories';
import CategoryRows from '@/components/CategoryRows';
import VerticalBanner from '@/components/VerticalBanner';
import SearchBar from '@/components/SearchBar';
import ExploreHomepage from '@/components/ExploreHomepage';
import DynamicDiscountSections from '@/components/DynamicDiscountSections';
import StripBanner from '@/components/StripBanner'; // 👈 1. IMPORT THIS
<<<<<<< HEAD

=======
import Loading from './loading'; // Import the new shimmer loader
>>>>>>> 0285b10bb2bf0f627fc886f916872e67d590239a

// --- Data structure for our homepage ---
interface HomeData {
  banners: any[];
  subCatRow1: any[];
  subCatRow2: any[];
  subCatRow3: any[];
  promotedTop50: Product[];
  popularMixed: Product[];
}

// ✅ 2. Create a simple fetcher function for SWR to use
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  
  // ✅ 3. Replace useState/useEffect with the SWR hook
  // This handles fetching, caching, loading, and errors automatically.
  const { data, error, isLoading } = useSWR<HomeData>(
    `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/homepage-data`,
    fetcher,
    {
      revalidateOnFocus: false, // Prevents refetching when user clicks back to the window
      dedupingInterval: 300000, // Caches data for at least 5 minutes
    }
  );

  // ✅ 4. SMART LOADING LOGIC
  // This now only shows the full page skeleton if we have NO cached data AND we are loading.
  // If you navigate away and back, `data` will exist, so this is skipped!
<<<<<<< HEAD
=======
  if (!data && isLoading) {
    return <Loading />; // Use the beautiful shimmer loader
  }
>>>>>>> 0285b10bb2bf0f627fc886f916872e67d590239a

  // Graceful Error Handling
  if (error && !data) {
    return <div className="text-center p-10 text-red-500">Failed to load homepage. Please try again later.</div>;
  }
  
  // Create a "safe" version of data that falls back to empty arrays.
  // This prevents the app from crashing if the API is slow or returns null.
  const safeData = data || {
    banners: [], 
    subCatRow1: [], 
    subCatRow2: [], 
    subCatRow3: [], 
    promotedTop50: [], 
    popularMixed: []
  };

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

      {/* Sticky Search Bar */}
      <div className="sticky top-[70px] z-40 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100 shadow-sm transition-all">
        <SearchBar />
      </div>

      {/* Banners */}
      <div className="desktop-banner-layout">
        <VerticalBanner />
        <div className="main-banner-wrapper">
          <Banners banners={safeData.banners} priority={true} />
        </div>
      </div>
      <div className="full-width-banner">
        <Banners banners={safeData.banners} priority={true} />
      </div>

      
  {/* 👇👇 2. ADD THE STRIP BANNER HERE 👇👇 */}
      {/* This places it between the Main Banner and Subcategories */}
      <StripBanner /> 
      {/* 👆👆 END STRIP BANNER 👆👆 */}


      {/* Subcategories Row 1 (Lazy loading subsequent rows) */}
      {safeData.subCatRow1?.length > 0 && (
        <HomeSubcategories
          subcategories={safeData.subCatRow1}
          title="Explore Categories"
          priority={true} // Priority loads first row images instantly
        />
      )}

      {/* Promoted Products Slider */}
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

      {/* Dynamic Discount Sections (Now uses SWR inside itself for speed) */}
      <DynamicDiscountSections />

      {/* Popular Products */}
      <section className="py-4 px-4 bg-white border-t-8 border-gray-100">
        <h2 className="section-title text-lg font-bold mb-4 text-gray-800">Popular Products</h2>
        <div className="product-grid">
          {safeData.popularMixed.map((p) => (
            <ProductCard key={`pop-${p.id}`} product={p} />
          ))}
        </div>
      </section>

      {/* Lazy Loaded Components */}
      {safeData.subCatRow2?.length > 0 && (
        <div className="border-t-8 border-gray-100 py-4 bg-white">
          <HomeSubcategories
            subcategories={safeData.subCatRow2}
            title="Trending Categories"
            priority={false} // No priority = lazy loaded images
          />
        </div>
      )}

      {/* ✅ JUST RENDER IT DIRECTLY - SWR handles the loading state internally now */}
  <CategoryRows />

      {safeData.subCatRow3?.length > 0 && (
        <div className="border-t-8 border-gray-100 py-4 bg-white">
          <HomeSubcategories
            subcategories={safeData.subCatRow3}
            title="More to Explore"
            priority={false}
          />
        </div>
      )}

      {/* Explore Infinite Scroll */}
      <section className="border-t-8 border-gray-100 mt-4 min-h-screen" id="explore-section">
        <ExploreHomepage />
      </section>

      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}