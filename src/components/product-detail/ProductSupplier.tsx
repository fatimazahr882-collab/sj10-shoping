"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const OFFICIAL_SUPPLIER_ID = '854ee7de-425b-4057-a8f7-eb310491c6b0';

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "S";

const formatCount = (num: number | string | undefined | null) => {
    if (!num) return "0";
    const n = Number(num);
    if (isNaN(n)) return "0";
    if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toLocaleString();
};

export default function ProductSupplier({ product, showToast, getToken, getLoginRedirectUrl }: any) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(product.supplier?.is_following || false);
  const [followerCount, setFollowerCount] = useState(product.supplier?.followers_count || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Targets
  const targetFollowers = Number(followerCount || 0);
  const targetProducts = Number(product.supplier?.total_products || 0);
  const rawRating = Number(product.supplier?.average_rating || 5.0);
  const targetPositive = Math.round((rawRating / 5) * 100);

  // 🟢 COUNT-UP ANIMATED STATES (START FROM 0 ON MOUNT)
  const [animFollowers, setAnimFollowers] = useState(0);
  const [animProducts, setAnimProducts] = useState(0);
  const [animPositive, setAnimPositive] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // 1.2s
    const steps = 40;
    const stepTime = duration / steps;

    const folInc = Math.ceil(targetFollowers / steps) || 1;
    const prodInc = Math.ceil(targetProducts / steps) || 1;
    const posInc = Math.ceil(targetPositive / steps) || 1;

    const timer = setInterval(() => {
      start++;
      
      setAnimFollowers(prev => (prev + folInc >= targetFollowers ? targetFollowers : prev + folInc));
      setAnimProducts(prev => (prev + prodInc >= targetProducts ? targetProducts : prev + prodInc));
      setAnimPositive(prev => (prev + posInc >= targetPositive ? targetPositive : prev + posInc));

      if (start >= steps) {
        setAnimFollowers(targetFollowers);
        setAnimProducts(targetProducts);
        setAnimPositive(targetPositive);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetFollowers, targetProducts, targetPositive]);

  useEffect(() => {
    const token = getToken();
    if (!token || !product.supplier?.id) return;
    fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/follow/status/${product.supplier.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => { if (data && typeof data.isFollowing === 'boolean') setIsFollowing(data.isFollowing); })
    .catch(e => console.error(e));
  }, [product.supplier?.id]);

  const handleFollow = async () => {
    if (!getToken()) return router.push(getLoginRedirectUrl());
    if (!product.supplier?.id || isFollowLoading) return;
    setIsFollowLoading(true);
    const previousState = isFollowing; 
    setIsFollowing(!isFollowing); 
    setFollowerCount((prev: number) => !previousState ? prev + 1 : prev - 1);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/follow/${product.supplier.id}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error("Action failed");
        showToast(!previousState ? "Following Supplier" : "Unfollowed Supplier", "fa-user-check");
    } catch (error) { 
        setIsFollowing(previousState); 
        setFollowerCount(product.supplier?.followers_count || 0); 
        showToast("Unable to follow.", "fa-times-circle", "#e91e63"); 
    } finally { setIsFollowLoading(false); }
  };

  const handleVisitStore = () => {
    if (product.supplier?.id) router.push(`/suppliers/${product.supplier.id}`);
  };

  if (!product.supplier) return null;
  const isOfficialSupplier = product.supplier.id === OFFICIAL_SUPPLIER_ID;

  return (
    <div className="new-supplier-card animate-card-up">
        {/* Sold By Header */}
        <div className="sold-by-text">Sold by</div>
        
        {/* Supplier Profile Row */}
        <div className="supplier-header-row">
            <div className="supplier-logo-box">
                {product.supplier.profile_pic ? (
                    <Image src={product.supplier.profile_pic} alt="Seller" fill style={{objectFit:'cover'}} unoptimized />
                ) : (
                    <span className="fallback-initials">{getInitials(product.supplier.name)}</span>
                )}
            </div>
            
            <div className="supplier-info-box">
                <h4 className="supplier-name">
                    {product.supplier.name} 
                    {product.supplier.verified_status === 'verified' && <i className="fas fa-check-circle verified-icon" title="Verified Supplier"></i>}
                </h4>
                <div className="supplier-rating-info">
                    <span className="star-icon">⭐</span>
                    <span className="rating-score">{rawRating.toFixed(1)}</span>
                    {isOfficialSupplier ? (
                        <span className="supplier-reviews-count" style={{color: '#ea580c', fontWeight: 700}}>
                            <i className="fas fa-crown" style={{fontSize: '11px', marginRight: '4px'}}></i> Official Store
                        </span>
                    ) : (
                        <span className="supplier-reviews-count">Verified Store</span>
                    )}
                </div>
            </div>
        </div>

        {/* 🟢 ANIMATED STATS GRID (0 -> TARGET COUNT-UP) */}
        <div className="supplier-stats-grid">
            <div className="s-stat">
                <span className="s-stat-val">{formatCount(animFollowers)}</span>
                <span className="s-stat-lbl">Followers</span>
            </div>
            <div className="s-stat border-sides">
                <span className="s-stat-val">{formatCount(animProducts)}</span>
                <span className="s-stat-lbl">Products</span>
            </div>
            <div className="s-stat">
                <span className="s-stat-val">{animPositive}%</span>
                <span className="s-stat-lbl">Positive</span>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="supplier-actions">
            <button className="btn-visit-outline" onClick={handleVisitStore}>
                Visit Store
            </button>
            <button className={`btn-follow-solid ${isFollowing ? 'following' : ''}`} onClick={handleFollow} disabled={isFollowLoading}>
                {isFollowLoading ? <i className="fas fa-circle-notch fa-spin"></i> : isFollowing ? "Following" : "Follow"}
            </button>
        </div>

        <style jsx>{`
            .new-supplier-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 16px; 
                padding: 22px; 
                margin: 20px 0;
                box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
            }
            .new-supplier-card.animate-card-up {
                animation: cardSlideUp 0.4s ease-out forwards;
            }
            @keyframes cardSlideUp {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .sold-by-text {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .supplier-header-row {
                display: flex;
                align-items: center;
                gap: 14px;
                margin-bottom: 20px;
            }

            .supplier-logo-box {
                position: relative;
                width: 52px;
                height: 52px;
                border-radius: 50%;
                overflow: hidden;
                background: #f0fdf4;
                border: 1.5px solid #bbf7d0;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .fallback-initials {
                font-size: 20px;
                font-weight: 800;
                color: #00b862;
            }

            .supplier-info-box {
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            .supplier-name {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 800;
                color: #0f172a;
                display: flex;
                align-items: center;
                gap: 6px;
                line-height: 1.2;
            }

            .verified-icon { 
                color: #00b862; 
                font-size: 14px; 
            }

            .supplier-rating-info {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
            }

            .star-icon { font-size: 12px; color: #fbbf24; }
            .rating-score { font-weight: 800; color: #0f172a; }
            .supplier-reviews-count { color: #64748b; font-weight: 500;}

            .supplier-stats-grid {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                background: #f8fafc;
                border-radius: 12px;
                padding: 12px 10px;
                border: 1px solid #f1f5f9;
            }

            .s-stat {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .border-sides {
                border-left: 1px solid #e2e8f0;
                border-right: 1px solid #e2e8f0;
            }

            .s-stat-val {
                font-size: 16px;
                font-weight: 900;
                color: #0f172a;
            }

            .s-stat-lbl {
                font-size: 11px;
                color: #64748b;
                margin-top: 3px;
                font-weight: 600;
            }

            .supplier-actions {
                display: flex;
                gap: 14px;
            }

            .btn-visit-outline {
                flex: 1;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                color: #0f172a;
                font-weight: 800;
                font-size: 13px;
                padding: 11px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-visit-outline:hover { 
                background: #f8fafc; 
                border-color: #cbd5e1; 
                transform: translateY(-1px);
            }

            .btn-follow-solid {
                flex: 1;
                background: #00b862;
                border: 1px solid #00b862;
                color: white;
                font-weight: 800;
                font-size: 13px;
                padding: 11px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-follow-solid:hover { 
                background: #00a356; 
                box-shadow: 0 4px 12px rgba(0, 184, 98, 0.25);
                transform: translateY(-1px);
            }
            .btn-follow-solid.following { 
                background: #f1f5f9; 
                color: #475569; 
                border-color: #e2e8f0; 
                box-shadow: none;
            }
        `}</style>
    </div>
  );
}