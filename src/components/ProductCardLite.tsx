// src/components/ProductCardLite.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SjLoader from './SjLoader';

export type ProductLite = {
    id: number | string;
    t: string;       
    s: string;       
    sku?: string;
    p: number;       
    dp: number;      
    img: string;     
    v: boolean;      
    b: string;       
    r?: number;      
    rc?: number;     
    hv?: boolean;    
};

const R2_DOMAIN = "https://media.sj10.pk";
const formatImageUrl = (path: string) => {
    if (!path || path === 'null') return '/placeholder.jpg';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `${R2_DOMAIN}/${path}`;
};

const StarFull = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden="true">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
);

const PlayIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2.5" aria-hidden="true">
        <path d="M5 3l14 9-14 9V3z"/>
    </svg>
);

const StarRating = ({ rating, count }: { rating: number, count: number }) => {
    if (!count || count === 0) return <div style={{ height: '18px', marginBottom: '4px' }}></div>;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '4px' }}>
            {[...Array(Math.round(rating))].map((_, i) => (<StarFull key={i} />))}
            <span style={{ fontSize: '11px', color: '#888', marginLeft: '4px', fontWeight: '600' }}>({count})</span>
        </div>
    );
};

export default function ProductCardLite({ product }: { product: ProductLite }) {
    const [isImgLoading, setIsImgLoading] = useState(true);

    if (!product) return null;

    const productUrl = `/products/${product.s}${product.sku ? `-${product.sku}` : ''}`;
    const firstImage = formatImageUrl(product.img);
    
    const price = product.dp || product.p;
    const originalPrice = product.p;
    const discountPct = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return (
        // ✅ 100% CLICKABLE FIX: The <Link> wraps the entire card!
        <Link href={productUrl} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
            <article className="product-card-lite">
                
                {discountPct > 0 && <div className="discount-badge">-{discountPct}%</div>}

                <div className="product-card-img-container">
                    {isImgLoading && <SjLoader />}
                    
                    <Image 
                        src={firstImage} 
                        alt={product.t} 
                        fill 
                        sizes="(max-width: 640px) 45vw, 25vw" 
                        quality={40} 
                        unoptimized 
                        className="main-image object-cover"
                        style={{ opacity: isImgLoading ? 0 : 1, transition: 'opacity 0.4s ease-in-out' }}
                        onLoad={() => setIsImgLoading(false)}
                        onError={() => setIsImgLoading(false)}
                        loading="lazy"
                    />

                    {product.hv && <div className="video-glass-icon"><PlayIcon /></div>}
                </div>
                
                <div className="product-card-info">
                    <h3 className="product-name" title={product.t}>{product.t}</h3>
                    
                    <StarRating rating={product.r || 0} count={product.rc || 0} />

                    <div className="price-container">
                        <span className="price">Rs. {price.toLocaleString()}</span>
                        {originalPrice > price && <span className="original-price">Rs. {originalPrice.toLocaleString()}</span>}
                    </div>
                    
                    <div className="badge-row">
                        {product.v && (
                            <div className="badge verified">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{marginRight: '4px'}}>
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                                </svg>
                                Verified
                            </div>
                        )}
                    </div>
                </div>
            </article>

            <style jsx>{`
                .product-card-lite { 
                    background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; 
                    overflow: hidden; position: relative; height: 100%; display: flex; 
                    flex-direction: column; transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .product-card-lite:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); border-color: transparent; }
                
                .product-card-img-container { 
                    position: relative; width: 100%; aspect-ratio: 1 / 1; 
                    background-color: #f1f5f9; overflow: hidden;
                }
                
               .discount-badge { position: absolute; top: 8px; left: 8px; background: #dc2626; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 7px; border-radius: 4px; z-index: 5; }

                .video-glass-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 38px; height: 38px; background: rgba(0, 0, 0, 0.35); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 6; }
                
                .product-card-info { padding: 10px 12px; flex-grow: 1; display: flex; flex-direction: column; position: relative; z-index: 2; }
                .product-name { margin: 0 0 6px; font-size: 13px; font-weight: 500; line-height: 1.4; height: 36px; overflow: hidden; color: #111827; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
                
                .price-container { display: flex; align-items: baseline; gap: 6px; margin-top: auto; }
              .price { font-weight: 700; font-size: 16px; color: #b33b04; }
.original-price { font-size: 11px; color: #475569; text-decoration: line-through; }
                
                .badge-row { margin-top: 8px; }
                .badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
               /* Change color from #16a34a to #15803d (Green 700) */
.badge.verified { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
            `}</style>
        </Link>
    );
}