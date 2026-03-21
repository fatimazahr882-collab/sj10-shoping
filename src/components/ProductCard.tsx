// src/components/ProductCard.tsx
"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// --- ICONS (SVG) ---
const StarFull = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>);
const PlayIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2.5"><path d="M5 3l14 9-14 9V3z"/></svg>);
const VerifiedIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>);
const UnverifiedIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);

export type Product = { id: number | string; slug: string; sku?: string; title: string; price: number | string; discounted_price?: number | string | null; discount_label?: string | null; image_urls: string | string[]; avg_rating?: number; review_count?: number; product_ratings?: { avg_rating: number | null; review_count: number | null }[]; supplier_verified?: boolean | string | number; supplier?: { verified_status?: string | boolean; is_verified?: boolean }; verified?: boolean; has_video?: boolean; video_url?: string; };

const StarRating = ({ rating, count }: { rating: number, count: number }) => {
    if (!count || count === 0) return <div style={{ height: '18px', marginBottom: '4px' }}></div>;
    const safeRating = Math.max(0, Math.min(5, rating || 0));
    const fullStars = Math.round(safeRating);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '4px' }}>
            {[...Array(fullStars)].map((_, i) => (<span key={i}><StarFull /></span>))}
            <span style={{ fontSize: '11px', color: '#888', marginLeft: '4px', fontWeight: '500' }}>({count})</span>
        </div>
    );
};

export default function ProductCard({ product }: { product: Product | null }) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    if (!product) {
        return (
            <div className="product-card skeleton">
                <div className="product-card-img-container bg-gray-100 flex items-center justify-center">
                    <div className="animate-pulse w-full h-full bg-gray-200"></div>
                </div>
                <div className="product-card-info p-3">
                    <div style={{ height: '14px', background: '#f3f3f3', marginBottom: '8px', borderRadius: '4px' }} className="animate-pulse"></div>
                    <div style={{ height: '14px', width: '60%', background: '#f3f3f3', borderRadius: '4px' }} className="animate-pulse"></div>
                </div>
            </div>
        );
    }

    const productUrl = `/products/${product.slug}${product.sku ? `-${product.sku}` : ''}`;

    const { firstImage, hasVideo } = useMemo(() => {
        let f = '/placeholder.jpg';
        let videoFound = product.has_video || false;
        try {
            const imgs = typeof product.image_urls === 'string' ? JSON.parse(product.image_urls) : product.image_urls;
            if (Array.isArray(imgs) && imgs.length > 0 && imgs[0]) {
                f = imgs[0];
                if (!videoFound && imgs.some((url: string) => typeof url === 'string' && url.includes('.mp4'))) videoFound = true;
            }
        } catch (e) {}
        if (product.video_url && typeof product.video_url === 'string' && product.video_url.length > 5) videoFound = true;
        return { firstImage: f, hasVideo: videoFound };
    }, [product]);

    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const discPrice = product.discounted_price ? (typeof product.discounted_price === 'string' ? parseFloat(product.discounted_price) : product.discounted_price) : null;
    const discountPct = discPrice && price ? Math.round(((price - discPrice) / price) * 100) : 0;
    const rating = product.avg_rating || (product.product_ratings?.[0]?.avg_rating) || 0;
    const reviewCount = product.review_count || (product.product_ratings?.[0]?.review_count) || 0;
    const isVerified = useMemo(() => {
        const v1 = product.supplier_verified;
        const v2 = product.supplier?.verified_status;
        if (v1 === true || v1 === 1 || v1 === '1') return true;
        if (typeof v1 === 'string' && v1.toLowerCase() === 'verified') return true;
        if (typeof v2 === 'string') {
            const status = v2.trim().toLowerCase();
            if (status === 'verified' || status === 'true') return true;
        }
        return false;
    }, [product]);

    return (
        <div className="product-card">
            <Link href={productUrl} className="stretched-link" aria-label={`Buy ${product.title}`}></Link>
            
            {discountPct > 0 && <div className="discount-badge">-{discountPct}%</div>}
            {product.discount_label && <div className="promo-badge">{product.discount_label}</div>}

            <div className="product-card-img-container">
                <Image 
                    src={firstImage} 
                    alt={product.title} 
                    fill 
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" 
                    quality={60}
                    className={`object-cover ${isImageLoaded ? 'loaded' : ''}`}
                    onLoad={() => setIsImageLoaded(true)}
                    loading="lazy"
                />
                {hasVideo && <div className="video-icon-glass"><PlayIcon /></div>}
            </div>
            
            <div className="product-card-info">
                <h3 className="product-name" title={product.title}>{product.title}</h3>
                <StarRating rating={rating} count={reviewCount} />
                <div className="price-container">
                    <span className="price">Rs. {(discPrice || price).toLocaleString()}</span>
                    {discountPct > 0 && <span className="original-price">Rs. {price.toLocaleString()}</span>}
                </div>
                <div className="badge-wrapper">
                    {isVerified ? (
                        <div className="badge verified"><span className="icon"><VerifiedIcon /></span><span className="text">Verified</span></div>
                    ) : (
                        <div className="badge unverified"><span className="icon"><UnverifiedIcon /></span><span className="text">Unverified</span></div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .discount-badge { position: absolute; top: 10px; left: 10px; background: #ef4444; color: white; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; z-index: 5; }
                .promo-badge { position: absolute; top: 10px; right: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; z-index: 5; box-shadow: 0 2px 5px rgba(0,0,0,0.2); letter-spacing: 0.5px; }
                .video-icon-glass { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); border: 1.5px solid rgba(255, 255, 255, 0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10; }
                .product-card-info { padding: 10px 12px; display: flex; flex-direction: column; flex-grow: 1; }
                .product-name { margin: 0 0 5px; font-size: 13px; font-weight: 500; line-height: 1.4; height: 36px; overflow: hidden; color: #111827; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
                .price-container { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; margin-top: auto; }
                .price { font-weight: 700; font-size: 16px; color: #f85606; }
                .original-price { font-size: 12px; color: #94a3b8; text-decoration: line-through; }
                .badge-wrapper { margin-top: 8px; display: flex; align-items: center; }
                .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
                .badge.verified { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
                .badge.unverified { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
                .badge .icon { display: flex; align-items: center; }
            `}</style>
        </div>
    );
}