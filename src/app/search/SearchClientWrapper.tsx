"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard, { type Product } from '@/components/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://api.sj10.pk/api";

type Props = {
  initialQuery: string;
  initialProducts: Product[];
  initialTotalCount: number;
};

export default function SearchClientWrapper({ initialQuery, initialProducts, initialTotalCount }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || initialQuery || '';
  const query = queryParam.trim();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(initialProducts.length < initialTotalCount);

  const displayQuery = query.length > 35 ? query.substring(0, 32) + '...' : query;

  const getShortKeyword = (kw: string) => {
    if (!kw) return "Items";
    return kw.length > 16 ? kw.substring(0, 13) + '...' : kw;
  };

  const shortKw = getShortKeyword(query);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setTotalCount(0);
      return;
    }

    if (query !== initialQuery) {
      const fetchSearchData = async () => {
        setLoading(true);
        setPage(1);
        try {
          const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}&page=1&limit=40`, {
            cache: 'no-store'
          });
          if (res.ok) {
            const data = await res.json();
            const list = data.products || [];
            setProducts(list);
            setTotalCount(data.totalCount || list.length);
            setHasMore(list.length < (data.totalCount || list.length));
          }
        } catch (err) {
          console.error("Search fetch error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchSearchData();
    }
  }, [query, initialQuery]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}&page=${nextPage}&limit=40`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        const newItems = data.products || [];
        setProducts(prev => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore((products.length + newItems.length) < (data.totalCount || 0));
      }
    } catch (e) {
      console.error("Load more error:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans pb-24">
      
      {/* 🚨 EXPLICIT GRID STYLING TO PREVENT BIG CARDS OVERFLOW 🚨 */}
      <style jsx global>{`
        .sj10-strict-grid {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 10px !important;
          width: 100% !important;
        }
        @media (min-width: 640px) {
          .sj10-strict-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 768px) {
          .sj10-strict-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 1024px) {
          .sj10-strict-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
            gap: 16px !important;
          }
        }
        .sj10-card-wrapper {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
        }
      `}</style>

      {/* TOP HEADER */}
      <header className="sticky top-0 sm:top-[60px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-orange-500 text-lg">🔍</span>
              <span>Results for <span className="text-orange-600 font-black">"{displayQuery}"</span></span>
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 font-semibold mt-0.5 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {loading ? 'Searching catalog...' : `${totalCount.toLocaleString()} wholesale products found in Pakistan`}
            </p>
          </div>

          <div className="hidden sm:block">
            <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1.5 rounded-full border border-orange-200 shadow-sm">
              {totalCount.toLocaleString()} Items
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        
        {/* SKELETON LOADERS */}
        {loading && (
          <div className="sj10-strict-grid">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="sj10-card-wrapper bg-white rounded-2xl p-2.5 shadow-sm border border-gray-100 animate-pulse flex flex-col justify-between h-72">
                <div className="w-full h-40 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2 mt-2">
                  <div className="h-3.5 bg-gray-200 rounded-md w-5/6"></div>
                  <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
                  <div className="h-4 bg-orange-100 rounded-md w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NO PRODUCTS FOUND */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm my-4 px-6 max-w-xl mx-auto">
            <div className="text-5xl mb-3">⚠️</div>
            <h3 className="text-lg font-black text-gray-900">No products found for "{displayQuery}"</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6 font-medium">Try searching with a different word or browse our categories.</p>
            <button 
              onClick={() => router.push('/category')} 
              style={{
                background: 'linear-gradient(135deg, #ff7f00 0%, #ff5500 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '14px',
                fontWeight: '900',
                fontSize: '12px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Explore Categories 🚀
            </button>
          </div>
        )}

        {/* STRICT GRID: 5 COLS DESKTOP / 2 COLS MOBILE */}
        {!loading && products.length > 0 && (
          <div className="sj10-strict-grid">
            {products.map((product, idx) => (
              <div key={`${product.id}-${idx}`} className="sj10-card-wrapper">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* LOAD MORE BUTTON */}
        {!loading && hasMore && products.length > 0 && (
          <div className="mt-12 text-center flex flex-col items-center justify-center">
            <button 
              onClick={handleLoadMore} 
              disabled={loadingMore}
              style={{
                background: 'linear-gradient(135deg, #ff7f00 0%, #ff5500 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '16px',
                fontWeight: '900',
                fontSize: '12px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(255, 127, 0, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loadingMore ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Loading More "{shortKw}"...</span>
                </>
              ) : (
                <>
                  <span>Load More "{shortKw}"</span>
                  <span className="text-sm">▼</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-500 font-bold tracking-wider mt-2.5 uppercase">
              Showing {products.length} of {totalCount} items
            </p>
          </div>
        )}

      </main>

      {/* SEO FOOTER BLOCK */}
      {query && !loading && (
        <section className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-200 text-gray-600 text-xs leading-relaxed">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">SEO Guide</span>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                Best {displayQuery} Price in Pakistan | SJ10 Shopping
              </h2>
            </div>
            <p>
              Looking for top-rated <strong>{query}</strong> in Pakistan? At <strong>SJ10.pk</strong>, we offer an extensive wholesale selection of high-quality <strong>{query}</strong> with Cash on Delivery nationwide.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}