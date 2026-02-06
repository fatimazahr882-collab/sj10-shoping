"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import ProductCard, { type Product } from '@/components/ProductCard';
import ProductPageSkeleton from "@/components/ProductPageSkeleton";

export default function ProductDetailPage() {
    // FIX: We tell TypeScript that 'slug' exists and is a string
    const params = useParams<{ slug: string }>();
    const router = useRouter();

    // Now 'params.slug' is guaranteed to be a string, no red line.
    const rawSlug = params.slug; 

    // State
    const [product, setProduct] = useState<any | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!rawSlug) return;

        async function fetchProductData() {
            try {
                // 1. Decode and Encode Slug to handle special characters correctly
                const productSlug = decodeURIComponent(rawSlug);
                const encodedSlug = encodeURIComponent(productSlug);
                
                // 2. Fetch Product
                const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/slug/${encodedSlug}`, { 
                    headers: { 'Cache-Control': 'no-cache' } 
                });
                
                if (!res.ok) throw new Error('Product not found');
                
                const productData = await res.json();
                if (!productData || !productData.id) throw new Error('Product invalid');

                setProduct(productData);

                // 3. Fetch Related Products (Non-blocking)
                if (productData.category_id) {
                    try {
                        const relatedRes = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products?category=${productData.category_id}&limit=8`);
                        if (relatedRes.ok) {
                            const relatedData = await relatedRes.json();
                            if (relatedData && Array.isArray(relatedData.products)) {
                                setRelatedProducts(relatedData.products.filter((p: Product) => p.id !== productData.id));
                            }
                        }
                    } catch (e) { console.error(e); }
                }

            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchProductData();
    }, [rawSlug]);

    // Use Skeleton for Instant Load feel
    if (loading) {
        return <ProductPageSkeleton />;
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <i className="fas fa-exclamation-circle text-4xl text-gray-300 mb-4"></i>
                <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
                <p className="text-gray-500 mb-6">The product you are looking for might have been removed.</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <ProductDetailClient product={product}>
            {relatedProducts.length > 0 && relatedProducts.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
            ))}
        </ProductDetailClient>
    );
}