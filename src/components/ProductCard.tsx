"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import SjLoader from './SjLoader';

// --- ICONS (SVG) ---
const StarFull = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>);
const PlayIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2.5"><path d="M5 3l14 9-14 9V3z"/></svg>);
const VerifiedIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>);
const UnverifiedIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);

const getOptimizedUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        return url.replace('/upload/', '/upload/w_400,f_auto,q_auto:good/');
    }
    return url;
};

// 🔥 FIX #1: Add `sku` to the product type
export type Product = {
    id: number | string;
    slug: string;
    sku?: string; // <-- SKU ADDED HERE
    title: string;
    price: number | string;
    discounted_price?: number | string | null;
    discount_label?: string | null; 
    image_urls: string | string[];
    avg_rating?: number;
    review_count?: number;
    product_ratings?: { avg_rating: number | null; review_count: number | null }[];
    supplier_verified?: boolean | string | number;
    supplier?: { verified_status?: string | boolean; is_verified?: boolean };
    verified?: boolean;
    has_video?: boolean;
    video_url?: string;
};

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
    const pathname = usePathname();
    const router = useRouter();
    const [imgLoading, setImgLoading] = useState(true);

    if (!product) return <div className="product-card skeleton"><div className="product-card-img-container"></div><div className="product-card-info"><div style={{ height: '14px', background: '#f3f3f3', marginBottom: '8px', borderRadius: '4px' }}></div><div style={{ height: '14px', width: '60%', background: '#f3f3f3', borderRadius: '4px' }}></div></div><style jsx>{`.skeleton .product-card-img-container { background: #f3f3f3; }`}</style></div>;

    // 🔥 FIX #2: Create the final, SEO-friendly URL directly
    const productUrl = `/products/${product.slug}${product.sku ? `-${product.sku}` : ''}`;

    const handleMouseEnter = () => {
        if (pathname !== productUrl) {
            router.prefetch(productUrl);
        }
    };

    const { firstImage, secondImage, hasVideo } = useMemo(() => {
        let f = '/placeholder.jpg', s = '/placeholder.jpg';
        let videoFound = product.has_video || false;
        try {
            const imgs = typeof product.image_urls === 'string' ? JSON.parse(product.image_urls) : product.image_urls;
            if (Array.isArray(imgs) && imgs.length > 0) {
                f = getOptimizedUrl(imgs[0]); 
                s = getOptimizedUrl(imgs[1] || imgs[0]);
                if (!videoFound && imgs.some((url: string) => typeof url === 'string' && url.includes('.mp4'))) videoFound = true;
            }
        } catch (e) {}
        if (product.video_url && typeof product.video_url === 'string' && product.video_url.length > 5) videoFound = true;
        return { firstImage: f, secondImage: s, hasVideo: videoFound };
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
        <div className="product-card" onMouseEnter={handleMouseEnter}>
            <Link href={productUrl} className="stretched-link" aria-label={product.title}></Link>
            {discountPct > 0 && <div className="discount-badge">-{discountPct}%</div>}
            {product.discount_label && <div className="promo-badge">{product.discount_label}</div>}

            <div className="product-card-img-container">
                {imgLoading && <div className="loader-overlay"><SjLoader /></div>}
                <Image 
                    src={firstImage} 
                    alt={product.title} 
                    fill 
                    sizes="(max-width: 768px) 50vw, 20vw" 
                    className={`main-img ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                    unoptimized={true} 
                    onLoad={() => setImgLoading(false)} 
                />
                {firstImage !== secondImage && <Image src={secondImage} alt={product.title} fill className="img-back" unoptimized={true} />}
                {hasVideo && <div className="video-icon-glass"><PlayIcon /></div>}
            </div>
            
            <div className="product-card-info">
                <h2 className="product-name" title={product.title}>{product.title}</h2>
                <StarRating rating={rating} count={reviewCount} />
                <div className="price-container">
                    <span className="price">Rs. {(discPrice || price).toLocaleString()}</span>
                    {discountPct > 0 && <span className="original-price">Rs. {price.toLocaleString()}</span>}
                </div>
                <div className="badge-wrapper">
                    {isVerified ? (
                        <div className="badge verified"><span className="icon"><VerifiedIcon /></span><span className="text">Verified</span><div className="glow"></div></div>
                    ) : (
                        <div className="badge unverified"><span className="icon"><UnverifiedIcon /></span><span className="text">Unverified</span></div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .product-card { background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; position: relative; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); height: 100%; display: flex; flex-direction: column; }
                .product-card:hover { transform: translateY(-5px); box-shadow: 0 12px 25px rgba(0,0,0,0.08); border-color: transparent; }
                .loader-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #f9fafb; display: flex; align-items: center; justify-content: center; z-index: 20; }
                .main-img { transition: opacity 0.3s ease; }
                .discount-badge { position: absolute; top: 10px; left: 10px; background: #ef4444; color: white; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; z-index: 5; }
                .promo-badge { position: absolute; top: 10px; right: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; z-index: 5; box-shadow: 0 2px 5px rgba(0,0,0,0.2); letter-spacing: 0.5px; }
                .video-icon-glass { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 44px; height: 44px; background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(6px); border: 1.5px solid rgba(255, 255, 255, 0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); z-index: 10; transition: transform 0.2s ease; }
                .product-card:hover .video-icon-glass { transform: translate(-50%, -50%) scale(1.1); background: rgba(0,0,0,0.4); }
                .badge-wrapper { margin-top: 10px; display: flex; align-items: center; }
                .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase; position: relative; overflow: hidden; }
                .badge.verified { background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #15803d; border: 1px solid #86efac; box-shadow: 0 2px 6px rgba(34, 197, 94, 0.15); }
                .badge.unverified { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
                .badge .icon { display: flex; align-items: center; font-size: 12px; }
                .badge.verified .glow { position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent); transform: skewX(-20deg); animation: shimmer 3s infinite; }
                @keyframes shimmer { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }
            `}</style>
        </div>
    );
}