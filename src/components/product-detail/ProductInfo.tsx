"use client";

import React, { useState, useEffect } from 'react';
import ProductDiscountTimer from './ProductDiscountTimer';

export default function ProductInfo({ 
    product, 
    selectedVariant, 
    setSelectedVariant, 
    quantity, 
    setQuantity, 
    ratingData,
    viewCount,       
    favoriteCount,   
    isFavorite,
    handleToggleFavorite,
    onAddToCart,
    onBuyNow
}: any) {
    
    // 🟢 SMART PRICE & CUT-MARK PRICE CALCULATOR
    const rawPrice = parseFloat(String(selectedVariant?.price || product.price || 0));
    const rawDiscountedPrice = parseFloat(String(selectedVariant?.discounted_price || product.discounted_price || 0));
    const discountPct = Number(product.discount_percentage || product.discount?.percentage || 0);

    let price = rawPrice;
    let cutPrice = 0;
    let hasDiscount = false;

    if (rawDiscountedPrice > 0 && rawDiscountedPrice < rawPrice) {
        price = rawDiscountedPrice;
        cutPrice = rawPrice;
        hasDiscount = true;
    } else if (rawPrice > 0 && discountPct > 0) {
        price = Math.round(rawPrice - (rawPrice * discountPct / 100));
        cutPrice = rawPrice;
        hasDiscount = true;
    } else if (rawPrice > 0 && product.discount_label) {
        // Fallback for promotional campaigns: Calculate 20% MSRP cut price if label exists
        price = rawPrice;
        cutPrice = Math.round(rawPrice * 1.25);
        hasDiscount = true;
    }

    const finalDiscountPct = hasDiscount && cutPrice > price 
        ? Math.round(((cutPrice - price) / cutPrice) * 100) 
        : 0;

    const amountSaved = hasDiscount ? cutPrice - price : 0;
    
    // Real Stock Logic
    const variantStock = selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock !== null ? Number(selectedVariant.stock) : 0;
    const mainQuantity = (product.quantity !== undefined && product.quantity !== null) ? Number(product.quantity) : 0;
    
    const rawStatus = String(product.status || '').toLowerCase().trim();
    const isExplicitlyInStock = rawStatus === 'in_stock';
    const isExplicitlyOutOfStock = rawStatus === 'out_of_stock';

    const availableStock = variantStock > 0 ? variantStock : mainQuantity;
    const isOutOfStock = isExplicitlyOutOfStock ? true : (isExplicitlyInStock ? false : availableStock <= 0);

    // Rating Logic
    const reviewsList = Array.isArray(product.reviews) ? product.reviews : [];
    const reviewCount = reviewsList.length || product.total_reviews_count || 0;
    const calculatedAvgRating = reviewCount > 0 
        ? (reviewsList.reduce((acc: number, r: any) => acc + Number(r.rating || 0), 0) / reviewCount)
        : 0;
    const avgRating = product.avg_rating ? Number(product.avg_rating) : calculatedAvgRating;

    const targetViews = Number(viewCount !== undefined && viewCount !== null ? viewCount : (product.views || product.stats?.views || 0));
    const realFavs = Number(favoriteCount !== undefined && favoriteCount !== null ? favoriteCount : (product.stats?.favorites || product.favorites || 0));

    // 🟢 ANIMATED VIEWS COUNT UP (0 TO MAX ANIMATION)
    const [animatedViews, setAnimatedViews] = useState(0);
    useEffect(() => {
        if (targetViews <= 0) {
            setAnimatedViews(0);
            return;
        }
        let start = 0;
        const duration = 1200; // 1.2 seconds
        const stepTime = 30;
        const steps = duration / stepTime;
        const increment = Math.ceil(targetViews / steps);

        const timer = setInterval(() => {
            start += increment;
            if (start >= targetViews) {
                setAnimatedViews(targetViews);
                clearInterval(timer);
            } else {
                setAnimatedViews(start);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [targetViews]);

    // Supplier Verification
    const isVerifiedSupplier = product.supplier_verified || String(product.supplier?.verified_status).toLowerCase() === 'verified';

    const colors = Array.from(new Set(product.variants?.map((v: any) => v.custom_color || v.color).filter((c: any) => c && c !== 'null')));
    const sizes = Array.from(new Set(product.variants?.map((v: any) => v.custom_size || v.size).filter((s: any) => s && s !== 'null')));

    const activeDiscountName = product.discount_label || product.discount?.name || null;
    const activeDiscountEndTime = product.discount_end_time || null;

    return (
        <div className="product-info-wrapper">
            <h1 className="product-title">{product.title}</h1>
            
            <div className="product-meta-row">
                {reviewCount > 0 && avgRating > 0 && (
                    <div className="stars-wrap">
                        <span className="rating-score-num">{avgRating.toFixed(1)}</span>
                        <div className="star-icons-row">
                          {[...Array(5)].map((_, i) => (
                            <i 
                              key={i} 
                              className={i < Math.floor(avgRating) ? "fas fa-star full" : (i < avgRating ? "fas fa-star-half-alt full" : "far fa-star empty")}
                            ></i>
                          ))}
                        </div>
                        <span className="review-count-lbl">({reviewCount} Ratings)</span>
                    </div>
                )}
                
                {/* 🟢 ANIMATED VIEWS COUNT UP */}
                <div className="meta-pill views-pill">
                    <i className="fas fa-eye text-emerald-500 animate-pulse-eye"></i>
                    <span><strong>{animatedViews.toLocaleString()}</strong> Views</span>
                </div>

                <div className="meta-pill fav-pill" onClick={handleToggleFavorite}>
                    <i className={`${isFavorite ? "fas fa-heart text-red" : "far fa-heart"}`}></i>
                    <span><strong>{realFavs.toLocaleString()}</strong> Favorites</span>
                </div>
            </div>

            {/* 🟢 PRICING SECTION WITH GUARANTEED CUT-MARK PRICE */}
            <div className="pricing-section">
                <div className="price-row">
                    <span className="current-price">Rs. {price.toLocaleString()}</span>
                    
                    {/* ALWAYS SHOW CUT PRICE IF DISCOUNT EXISTS */}
                    {hasDiscount && cutPrice > price && (
                        <span className="old-price-strikethrough">
                            Rs. {cutPrice.toLocaleString()}
                        </span>
                    )}
                    
                    {product.is_promoted && (
                        <span className="promoted-badge">
                            <i className="fas fa-bolt"></i> Promoted
                        </span>
                    )}

                    {product.discount_label ? (
                        <span className="discount-tag-badge">
                            <i className="fas fa-tags"></i> {product.discount_label}
                        </span>
                    ) : (
                        hasDiscount && <span className="discount-badge-percent">-{finalDiscountPct}% OFF</span>
                    )}
                </div>

                {hasDiscount && amountSaved > 0 && (
                    <div className="save-badge">
                        <i className="fas fa-coins"></i> You Save Rs. {amountSaved.toLocaleString()}
                    </div>
                )}
            </div>

            {/* DISCOUNT TIMER OR SOCIAL PROOF BANNER */}
            {activeDiscountEndTime ? (
                <ProductDiscountTimer 
                    discountName={activeDiscountName || "Special Sale"} 
                    endTime={activeDiscountEndTime} 
                />
            ) : (
                <div className="social-proof-banner">
                    <div className="sp-icon-box">
                        <i className="fas fa-fire-flame-curved"></i>
                    </div>
                    <div className="sp-text-box">
                        <span className="sp-title">High Demand Item!</span>
                        <span className="sp-desc">Loved by {realFavs > 0 ? realFavs : 12}+ shoppers. Order now before stock runs out!</span>
                    </div>
                </div>
            )}

            {/* 🟢 ENHANCED SKU, STOCK, AND VERIFIED SUPPLIER CHIPS */}
            <div className="sku-stock-row">
                <div className="info-chip">
                    <i className="fas fa-barcode chip-icon-theme"></i>
                    <span className="info-label">SKU:</span> 
                    <span className="info-value">{selectedVariant?.sku || product.sku || 'N/A'}</span>
                </div>

                <div className="info-chip">
                    <span className={`stock-pulse-dot ${isOutOfStock ? 'dot-red' : 'dot-green'}`}></span>
                    <span className="info-label">Stock:</span> 
                    <span className={isOutOfStock ? 'out-stock' : 'in-stock'}>
                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </span>
                    {!isOutOfStock && availableStock > 0 && <span className="stock-count">({availableStock} available)</span>}
                </div>

                <div className="info-chip">
                    <i className={isVerifiedSupplier ? "fas fa-circle-check text-emerald-500" : "fas fa-store icon-muted"}></i>
                    <span className="info-label">Seller:</span>
                    <span className={`supplier-tag ${isVerifiedSupplier ? 'verified' : 'regular'}`}>
                        {isVerifiedSupplier ? 'Verified Supplier' : (product.supplier?.brand_name || 'Seller Store')}
                    </span>
                </div>
            </div>

            <hr className="divider" />

            {/* Variants */}
            {product.variants?.length > 0 && (colors.length > 0 || sizes.length > 0) && (
                <div className="variants-section">
                    {colors.length > 0 && (
                        <div className="variant-group">
                            <span className="variant-label">Color:</span>
                            <div className="options-flex">
                                {colors.map((color: any) => {
                                    const isActive = (selectedVariant?.custom_color || selectedVariant?.color) === color;
                                    const cssColor = color.toLowerCase().replace(' ', '');
                                    return (
                                        <button 
                                            key={color} 
                                            className={`color-circle ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                const v = product.variants.find((x: any) => (x.custom_color || x.color) === color);
                                                if(v) setSelectedVariant(v);
                                            }}
                                            title={color}
                                            style={{ backgroundColor: cssColor }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {sizes.length > 0 && (
                        <div className="variant-group">
                            <span className="variant-label">Size:</span>
                            <div className="options-flex">
                                {sizes.map((size: any) => {
                                    const isActive = (selectedVariant?.custom_size || selectedVariant?.size) === size;
                                    return (
                                        <button 
                                            key={size} 
                                            className={`size-box ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                const v = product.variants.find((x: any) => (x.custom_size || x.size) === size);
                                                if(v) setSelectedVariant(v);
                                            }}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quantity Selector */}
            <div className="quantity-section">
                <span className="variant-label">Quantity:</span>
                <div className="qty-controls">
                    <button className="qty-btn" onClick={() => setQuantity((q: number) => Math.max(1, q - 1))}><i className="fas fa-minus"></i></button>
                    <span className="qty-val">{quantity}</span>
                    <button className="qty-btn" onClick={() => setQuantity((q: number) => Math.min(availableStock > 0 ? availableStock : 99, q + 1))}><i className="fas fa-plus"></i></button>
                </div>
                {availableStock > 0 && availableStock < 10 && (
                    <span className="low-stock-warning"><i className="fas fa-fire"></i> Only {availableStock} left</span>
                )}
            </div>

            {/* Desktop Action Buttons */}
            <div className="desktop-inline-buy-buttons" id="desktop-main-actions">
                <button className="desktop-btn add-bag-btn" onClick={onAddToCart}>
                    <i className="fas fa-shopping-bag"></i>
                    <span>Add to bag</span>
                </button>
                <button className="desktop-btn buy-now-btn" onClick={onBuyNow} disabled={isOutOfStock}>
                    <i className="fas fa-bolt"></i>
                    <span>Buy now</span>
                </button>
            </div>

            {/* Trust Badges */}
            <div className="desktop-trust-badges-row">
                <div className="trust-badge-item">
                    <i className="fas fa-money-bill-wave text-emerald-500"></i>
                    <span>Cash on delivery</span>
                </div>
                <div className="trust-badge-item">
                    <i className="fas fa-rotate-left text-emerald-500"></i>
                    <span>7-day easy returns</span>
                </div>
                <div className="trust-badge-item">
                    <i className="fas fa-shield-check text-emerald-500"></i>
                    <span>Secure checkout</span>
                </div>
            </div>

            <style jsx>{`
                .product-info-wrapper { display: flex; flex-direction: column; gap: 14px; margin-bottom: 10px; background: #fff; width: 100%; box-sizing: border-box; }
                .product-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.35; letter-spacing: -0.3px; }
                
                .product-meta-row { display: flex; gap: 10px; align-items: center; font-size: 13px; flex-wrap: wrap; }
                .stars-wrap { display: flex; align-items: center; gap: 6px; }
                .rating-score-num { font-size: 16px; font-weight: 900; color: #1e293b; }
                .star-icons-row { display: flex; gap: 2px; color: #fbbf24; font-size: 14px; }
                .star-icons-row .empty { color: #cbd5e1; }
                .review-count-lbl { color: #1e293b; font-weight: 700; font-size: 13px; }

                .meta-pill { display: inline-flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #f1f5f9; padding: 5px 12px; border-radius: 20px; font-size: 12px; color: #475569; font-weight: 500; }
                .animate-pulse-eye { animation: eyePulse 2s infinite ease-in-out; }
                @keyframes eyePulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.2); } }

                .fav-pill { cursor: pointer; transition: all 0.2s; }
                .fav-pill:hover { background: #fef2f2; border-color: #fecaca; }
                .fav-pill i.text-red { color: #e91e63 !important; }

                .pricing-section { display: flex; flex-direction: column; gap: 8px; margin: 6px 0; }
                .price-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
                .current-price { font-size: 32px; font-weight: 900; color: #00b862; }
                .old-price-strikethrough { font-size: 18px; color: #94a3b8; text-decoration: line-through; font-weight: 600; margin-left: 4px; }
                
                .promoted-badge { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3); }
                .discount-tag-badge { background: linear-gradient(135deg, #f85606, #ff8a00); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(248, 86, 6, 0.3); }
                .discount-badge-percent { border: 1px solid #ef4444; color: #ef4444; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }
                
                .save-badge { display: inline-flex; align-items: center; gap: 6px; width: fit-content; background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid #a7f3d0; }
                
                .social-proof-banner {
                    display: flex; align-items: center; gap: 12px;
                    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
                    border: 1px solid #fed7aa; padding: 12px 16px; border-radius: 12px; margin: 8px 0;
                }
                .sp-icon-box {
                    width: 38px; height: 38px; border-radius: 50%; background: #f85606; color: white;
                    display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(248, 86, 6, 0.25);
                }
                .sp-text-box { display: flex; flex-direction: column; }
                .sp-title { font-size: 13px; font-weight: 800; color: #9a3412; }
                .sp-desc { font-size: 12px; color: #c2410c; font-weight: 500; }

                /* 🟢 ENHANCED SKU & STOCK CHIPS */
                .sku-stock-row { display: flex; gap: 12px; font-size: 12px; margin-top: 4px; flex-wrap: wrap; }
                .info-chip { display: flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 10px; }
                .chip-icon-theme { color: #f85606; font-size: 14px; }
                .info-label { color: #64748b; font-weight: 600; }
                .info-value { color: #0f172a; font-weight: 700; font-family: monospace; background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;}
                
                .stock-pulse-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
                .dot-green { background: #00b862; box-shadow: 0 0 0 0 rgba(0, 184, 98, 0.4); animation: pulseDot 2s infinite; }
                .dot-red { background: #ef4444; }
                @keyframes pulseDot { 0% { box-shadow: 0 0 0 0 rgba(0, 184, 98, 0.6); } 70% { box-shadow: 0 0 0 6px rgba(0, 184, 98, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 184, 98, 0); } }

                .stock-box .in-stock { color: #00b862; font-weight: 800; }
                .stock-box .out-stock { color: #ef4444; font-weight: 800; }
                .stock-count { color: #64748b; font-size: 12px; font-weight: 500; }

                .supplier-tag { font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
                .supplier-tag.verified { background: #f0fdf4; color: #00b862; border: 1px solid #bbf7d0; }
                .supplier-tag.regular { background: #ffffff; color: #475569; border: 1px solid #e2e8f0; }

                .divider { border: 0; height: 1px; background: #f1f5f9; margin: 10px 0; }
                .variants-section { display: flex; flex-direction: column; gap: 15px; }
                .variant-group { display: flex; align-items: flex-start; gap: 12px; flex-direction: column; }
                .variant-label { font-size: 13px; font-weight: 700; color: #1e293b; min-width: 60px; }
                .options-flex { display: flex; gap: 10px; flex-wrap: wrap; }
                .color-circle { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #e2e8f0; cursor: pointer; transition: 0.2s; outline: 2px solid transparent; outline-offset: 2px; }
                .color-circle:hover { transform: scale(1.1); }
                .color-circle.active { outline-color: #00b862; border-color: white; }
                .size-box { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .size-box:hover { border-color: #94a3b8; }
                .size-box.active { border-color: #00b862; color: #00b862; background: #f0fdf4; }
                
                .quantity-section { display: flex; align-items: center; gap: 16px; margin-top: 5px; flex-wrap: wrap; }
                .qty-controls { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff; }
                .qty-btn { background: #f8fafc; border: none; padding: 8px 14px; cursor: pointer; color: #475569; transition: 0.2s; font-size: 13px; }
                .qty-btn:hover { background: #e2e8f0; color: #111827; }
                .qty-val { width: 40px; text-align: center; font-size: 14px; font-weight: 700; color: #111827; }
                .low-stock-warning { color: #ef4444; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; }

                .desktop-inline-buy-buttons { display: none; gap: 15px; margin-top: 20px; }
                @media (min-width: 769px) { .desktop-inline-buy-buttons { display: flex; } }
                .desktop-btn { flex: 1; padding: 14px 20px; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; }
                .add-bag-btn { background: #ffffff; border: 2px solid #1e293b; color: #1e293b; }
                .add-bag-btn:hover { background: #1e293b; color: #ffffff; transform: translateY(-2px); }
                .buy-now-btn { background: linear-gradient(135deg, #00b862 0%, #009952 100%); border: none; color: white; box-shadow: 0 4px 15px rgba(0, 184, 98, 0.3); }
                .buy-now-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 184, 98, 0.4); }

                .desktop-trust-badges-row { display: none; gap: 20px; margin-top: 20px; padding-top: 15px; border-top: 1px dashed #e2e8f0; }
                @media (min-width: 769px) { .desktop-trust-badges-row { display: flex; } }
                .trust-badge-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #475569; }
            `}</style>
        </div>
    );
}