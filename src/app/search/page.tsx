"use client";

import React, { Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWRInfinite from 'swr/infinite';
import { Loader2, AlertCircle } from 'lucide-react';
import ProductCard, { type Product } from '@/components/ProductCard';

// Define the API endpoint. Fallback for safety.
const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://sj10-cart.vercel.app/api";
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Main Search Page Component
function SearchPageComponent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    // --- SWR Hook for Infinite Data Loading & Caching ---
    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.products?.length) return null; // Reached the end
        if (!query) return null; // No search query
        
        const params = new URLSearchParams({
            page: (pageIndex + 1).toString(),
            limit: '30', // Fetch 30 items per page
            q: query
        });
        return `${API_BASE}/products/search-results?${params.toString()}`;
    };

    const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(getKey, fetcher, {
        revalidateFirstPage: false,
        revalidateOnFocus: false, // Prevents re-fetching when window is refocused
        persistSize: true,      // Remembers how many pages were loaded
    });

    const products: Product[] = data ? data.flatMap(page => page.products || []) : [];
    const totalCount = data?.[0]?.totalCount || 0;
    const isReachingEnd = data && (data[data.length - 1]?.products?.length || 0) < 30;

    // --- Intersection Observer for Triggering Lazy Load ---
    const observer = useRef<IntersectionObserver>();
    const loadMoreRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            // If the trigger element is on screen, and we're not at the end, fetch more data
            if (entries[0].isIntersecting && !isReachingEnd && !isValidating) {
                setSize(size + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, isReachingEnd, isValidating, setSize, size]);

    return (
        // This is the main container for the entire page.
        <div className="min-h-screen bg-gray-100 font-sans">
            
            {/* --- Sticky Header --- */}
            <header className="sticky top-0 sm:top-[60px] z-30 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                        Results for <span className="text-orange-600">"{query}"</span>
                    </h1>
                    <p className="text-sm text-gray-500">
                        {isLoading && !products.length ? 'Searching...' : `${totalCount} products found`}
                    </p>
                </div>
            </header>

            {/* --- Main Content Area for Products --- */}
            {/* This container has reduced padding on mobile (`px-2`) to create space */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6">
                
                {/* 1. Loading Skeleton */}
                {isLoading && products.length === 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="w-full bg-white rounded-lg p-2 animate-pulse">
                                <div className="aspect-[3/4] bg-gray-200 rounded-md"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. No Results Found */}
                {!isLoading && products.length === 0 && (
                    <div className="text-center py-20">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-lg font-semibold text-gray-800">No products found</h3>
                        <p className="mt-1 text-sm text-gray-500">Please try a different search term.</p>
                    </div>
                )}

                {/* 
                  ====================================================================
                  THE DEFINITIVE PRODUCT GRID FIX
                  ====================================================================
                  - `grid-cols-2`: Sets 2 columns on mobile.
                  - `lg:grid-cols-5`: Sets 5 columns on large screens.
                  - `gap-2`: Uses a small gap on mobile to save space.
                  - `min-w-0`: Applied to the direct child of the grid. This is the
                               most important fix. It forces the ProductCard to
                               shrink to fit the column, solving the 1-column issue.
                  ====================================================================
                */}
                {products.length > 0 && (
                    <div className="search-product-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                        {products.map((product) => (
                            <div key={product.id} className="search-product-item w-full min-w-0">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}

                {/* --- Load More Trigger & Spinner --- */}
                <div ref={loadMoreRef} className="h-24 flex items-center justify-center">
                    {isValidating && (
                         <div className="flex items-center space-x-2 text-gray-600">
                            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                            <span className="text-sm font-medium">Loading...</span>
                         </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Next.js requires a Suspense boundary for components using `useSearchParams`
export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
            <SearchPageComponent />
        </Suspense>
    );
}