// src/components/ProductCard.tsx
"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SjLoader from './SjLoader'; // ✅ IMPORTED your loader

// --- ACCESSIBLE ICONS ---
const StarFull = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden="true"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>);
const PlayIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2.5" aria-hidden="true"><path d="M5 3l14 9-14 9V3z"/></svg>);
const VerifiedIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>);

export type Product = { 
    id: number | string; 
    slug: string; 
    sku?: string; 
    title: string; 
    price: number | string; 
    discounted_price?: number | string | null; 
    image_urls: any; 
    image_url?: any;
    avg_rating?: number; 
    review_count?: number; 
    supplier_verified?: boolean | string | number; 
    supplier?: { verified_status?: string }; 
    has_video?: boolean; 
    video_url?: string; 
};

// --- URL FORMATTER FOR CLOUDFLARE R2 ---
const R2_DOMAIN = "https://media.sj10.pk";
const formatImageUrl = (path: string) => {
    if (!path || path === 'null' || path === 'undefined') return '/placeholder.jpg';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path;
    return `${R2_DOMAIN}/${path}`;
};

const StarRating = ({ rating, count }: { rating: number, count: number }) => {
    if (!count || count === 0) return <div style={{ height: '18px', marginBottom: '4px' }}></div>;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '4px' }}>
            {[...Array(Math.round(rating))].map((_, i) => (<StarFull key={i} />))}
            <span style={{ fontSize: '11px', color: '#888', marginLeft: '4px', fontWeight: '600' }}>({count})</span>
        </div>
    );
};

export default function ProductCard({ product }: { product: Product | null }) {
    // State to show/hide the loader
    const [isImgLoading, setIsImgLoading] = useState(true);

    if (!product) {
        return (
            <div className="product-card skeleton">
                <div className="product-card-img-container"><SjLoader /></div>
            </div>
        );
    }

    const productUrl = `/products/${product.slug}${product.sku ? `-${product.sku}` : ''}`;

    const { firstImage, hasVideo } = useMemo(() => {
        let rawImgPath = '/placeholder.jpg';
        let videoFound = product.has_video || false;
        try {
            const rawImages = product.image_urls || product.image_url;
            if (typeof rawImages === 'string') {
                rawImgPath = rawImages.startsWith('[') ? JSON.parse(rawImages)[0] : rawImages;
            } else if (Array.isArray(rawImages) && rawImages.length > 0) {
                rawImgPath = rawImages[0];
            }
            if (!videoFound && typeof rawImgPath === 'string' && rawImgPath.includes('.mp4')) videoFound = true;
        } catch (e) {}
        if (product.video_url && typeof product.video_url === 'string' && product.video_url.length > 5) videoFound = true;
        return { firstImage: formatImageUrl(rawImgPath), hasVideo: videoFound };
    }, [product]);

    const price = parseFloat(String(product.discounted_price || product.price));
    const originalPrice = parseFloat(String(product.price));
    const discountPct = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    
    const isVerified = useMemo(() => {
        const status = (product.supplier_verified || product.supplier?.verified_status || "").toString().toLowerCase();
        return ['verified', '1', 'true'].includes(status);
    }, [product]);

    return (
        <article className="product-card">
            <Link href={productUrl} className="stretched-link" aria-label={`View details for ${product.title}`}></Link>
            
            {discountPct > 0 && <div className="discount-badge">-{discountPct}%</div>}

            <div className="product-card-img-container">
                {/* ✅ LOADER: Beautiful Sj loader until image is ready */}
                {isImgLoading && <SjLoader />}
                
                {/* ✅ PERFORMANCE & FIX: Image is hidden until onLoad fires */}
 <Image 
    src={firstImage} 
    alt={product.title || "Product"} 
    fill 
    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw" 
    quality={40} 
    unoptimized // <--- ADD THIS HERE
    className="main-image object-cover"
    style={{ opacity: isImgLoading ? 0 : 1 }}
    onLoad={() => setIsImgLoading(false)}
    onError={() => setIsImgLoading(false)}
    loading="lazy"
/>
                
                {hasVideo && <div className="video-glass-icon"><PlayIcon /></div>}
            </div>
            
            <div className="product-card-info">
                <h3 className="product-name" title={product.title}>{product.title}</h3>
                <StarRating rating={product.avg_rating || 0} count={product.review_count || 0} />
                <div className="price-container">
                    <span className="price">Rs. {price.toLocaleString()}</span>
                    {originalPrice > price && <span className="original-price">Rs. {originalPrice.toLocaleString()}</span>}
                </div>
                <div className="badge-row">
                    {isVerified && <div className="badge verified"><VerifiedIcon /><span style={{marginLeft:'4px'}}>Verified</span></div>}
                </div>
            </div>

            <style jsx>{`
                .product-card { 
                    background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; 
                    overflow: hidden; position: relative; height: 100%; display: flex; 
                    flex-direction: column; transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .product-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); border-color: transparent; }
                
                .product-card-img-container { 
                    position: relative; width: 100%; aspect-ratio: 1 / 1; 
                    background-color: #f1f5f9; overflow: hidden;
                }
                
                .main-image { 
                    transition: opacity 0.4s ease-in-out;
                }
                
.discount-badge { position: absolute; top: 8px; left: 8px; background: #dc2626; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 7px; border-radius: 4px; z-index: 5; }

                .video-glass-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 38px; height: 38px; background: rgba(0, 0, 0, 0.35); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 6; }
                
                .product-card-info { padding: 10px 12px; flex-grow: 1; display: flex; flex-direction: column; }
                .product-name { margin: 0 0 6px; font-size: 13px; font-weight: 500; line-height: 1.4; height: 36px; overflow: hidden; color: #111827; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
                
                .price-container { display: flex; align-items: baseline; gap: 6px; margin-top: auto; }
                .price { font-weight: 700; font-size: 16px; color: #f85606; }
                .original-price { font-size: 11px; color: #94a3b8; text-decoration: line-through; }
                
                .badge-row { margin-top: 8px; }
                .badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
               /* Change color from #16a34a to #15803d (Green 700) */
.badge.verified { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
            `}</style>
        </article>
    );
}