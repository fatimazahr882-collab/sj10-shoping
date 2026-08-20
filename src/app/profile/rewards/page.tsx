"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Copy, CheckCircle2, Clock, Frown, Gift } from 'lucide-react';
import apiClient from '@/lib/apiClient';

// ==============================================================
// 🟢 1. LUXURY GOLD & SILVER SHIMMER SKELETON LOADER
// ==============================================================
const RewardsSkeleton = () => (
    <div className="rewards-container">
        {/* Banner Shimmer */}
        <div className="skel-block skel-banner shimmer-gold"></div>

        {/* Tabs Shimmer */}
        <div className="skel-tabs-container">
            <div className="skel-block skel-tab shimmer-silver"></div>
            <div className="skel-block skel-tab shimmer-silver"></div>
        </div>

        {/* Ticket Skeletons */}
        <div className="list-wrapper">
            {[1, 2].map((n) => (
                <div key={n} className="skel-ticket-card">
                    <div className="skel-ticket-left shimmer-gold"></div>
                    <div className="skel-ticket-right">
                        <div className="skel-block skel-line w-60 shimmer-silver"></div>
                        <div className="skel-block skel-line w-80 shimmer-silver"></div>
                        <div className="skel-footer-flex">
                            <div className="skel-block skel-pill shimmer-silver"></div>
                            <div className="skel-block skel-btn shimmer-silver"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <style jsx>{`
            .rewards-container { max-width: 550px; margin: 0 auto; padding: 16px 14px; }
            .skel-banner { height: 80px; border-radius: 16px; margin-bottom: 20px; width: 100%; }
            .skel-tabs-container { height: 48px; border-radius: 12px; background: white; border: 1px solid #e2e8f0; padding: 4px; display: flex; gap: 8px; margin-bottom: 20px; }
            .skel-tab { flex: 1; border-radius: 8px; height: 100%; }
            .list-wrapper { display: flex; flex-direction: column; gap: 14px; }
            .skel-ticket-card { height: 135px; background: white; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
            .skel-ticket-left { width: 32%; min-width: 95px; height: 100%; }
            .skel-ticket-right { flex: 1; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; }
            .skel-line { height: 14px; border-radius: 4px; }
            .w-60 { width: 60%; }
            .w-80 { width: 80%; }
            .skel-footer-flex { display: flex; justify-content: space-between; align-items: center; }
            .skel-pill { width: 90px; height: 24px; border-radius: 6px; }
            .skel-btn { width: 80px; height: 30px; border-radius: 8px; }

            .skel-block { position: relative; overflow: hidden; }
            
            /* 🟢 METALLIC SHIMMER EFFECT */
            .shimmer-silver { background: #e2e8f0; }
            .shimmer-silver::after {
                content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
                animation: shimmerAnim 1.4s infinite linear;
            }

            .shimmer-gold { background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); }
            .shimmer-gold::after {
                content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
                animation: shimmerAnim 1.4s infinite linear;
            }

            @keyframes shimmerAnim { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        `}</style>
    </div>
);

// ==============================================================
// 🟢 2. MAIN REWARDS PAGE (PERMANENT BLUE BANNER & CLEAN UI)
// ==============================================================
export default function RewardsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient('spin/coupons', 'GET')
            .then(data => {
                setCoupons(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Coupons load error:", err);
                setLoading(false);
            });
    }, []);

    const activeCoupons = coupons.filter(c => new Date(c.expires_at).getTime() > Date.now() && c.is_used === 0);
    const expiredCoupons = coupons.filter(c => new Date(c.expires_at).getTime() <= Date.now() || c.is_used === 1);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="rewards-page-root">
            {/* Header */}
            <header className="page-nav-header">
                <button onClick={() => router.back()} className="back-btn-pill" type="button" aria-label="Go Back">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h1 className="nav-heading">My Rewards & Coupons</h1>
            </header>

            {loading ? (
                <RewardsSkeleton />
            ) : (
                <div className="rewards-container">
                    
                    {/* 🟢 PERMANENT ROYAL BLUE BANNER (GUARANTEED NO OVERRIDE) */}
                    <div 
                        style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                            backgroundColor: '#1e3a8a',
                            borderRadius: '16px',
                            padding: '16px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            marginBottom: '20px',
                            boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
                            color: '#ffffff',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                    >
                        <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '1px solid rgba(255, 255, 255, 0.35)'
                        }}>
                            <Gift size={24} color="#ffffff" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0', letterSpacing: '-0.3px' }}>
                                Your Exclusive Savings!
                            </h2>
                            <p style={{ color: '#dbeafe', fontSize: '12px', margin: 0, fontWeight: 500, opacity: 0.95 }}>
                                Apply these codes at checkout to save extra money.
                            </p>
                        </div>
                    </div>

                    {/* 🟢 TABS (ACTIVE VS EXPIRED) */}
                    <div className="tabs-container">
                        <button 
                            className={`tab-btn ${activeTab === 'active' ? 'active-tab' : ''}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Active Coupons ({activeCoupons.length})
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'expired' ? 'expired-tab' : ''}`}
                            onClick={() => setActiveTab('expired')}
                        >
                            Expired / Used ({expiredCoupons.length})
                        </button>
                    </div>

                    {/* 🟢 COUPONS LIST */}
                    <div className="coupons-list">
                        <AnimatePresence mode="wait">
                            {activeTab === 'active' ? (
                                <motion.div 
                                    key="active-list"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="list-wrapper"
                                >
                                    {activeCoupons.length > 0 ? activeCoupons.map((coupon) => (
                                        <CouponCard 
                                            key={coupon.id} 
                                            coupon={coupon} 
                                            isExpired={false} 
                                            onCopy={() => handleCopy(coupon.coupon_code)}
                                            isCopied={copiedCode === coupon.coupon_code}
                                        />
                                    )) : (
                                        <EmptyState type="active" />
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="expired-list"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="list-wrapper"
                                >
                                    {expiredCoupons.length > 0 ? expiredCoupons.map((coupon) => (
                                        <CouponCard 
                                            key={coupon.id} 
                                            coupon={coupon} 
                                            isExpired={true} 
                                            onCopy={() => {}}
                                            isCopied={false}
                                        />
                                    )) : (
                                        <EmptyState type="expired" />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* 🟢 SCOPED CSS */}
            <style jsx>{`
                .rewards-page-root {
                    min-height: 100vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', -apple-system, sans-serif;
                    padding-bottom: 60px;
                    width: 100%;
                    overflow-x: hidden;
                }
                
                .page-nav-header {
                    position: sticky; top: 0; z-index: 100;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid #eef2f6;
                    padding: 12px 16px;
                    display: flex; align-items: center; gap: 14px;
                }
                .back-btn-pill {
                    width: 36px; height: 36px; border-radius: 50%;
                    border: none; background: #f1f5f9; color: #1e293b;
                    font-size: 15px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: 0.2s;
                }
                .back-btn-pill:hover { background: #e2e8f0; }
                .nav-heading { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0; }

                .rewards-container {
                    max-width: 550px;
                    margin: 0 auto;
                    padding: 16px 14px;
                }

                .tabs-container {
                    display: flex; background: white; border-radius: 12px; padding: 4px;
                    border: 1px solid #e2e8f0; margin-bottom: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }
                .tab-btn {
                    flex: 1; padding: 10px; border: none; background: transparent;
                    border-radius: 8px; font-size: 13px; font-weight: 700; color: #64748b;
                    cursor: pointer; transition: all 0.2s;
                }
                .active-tab { background: #f85606; color: white; box-shadow: 0 3px 10px rgba(248, 86, 6, 0.3); }
                .expired-tab { background: #64748b; color: white; }

                .list-wrapper { display: flex; flex-direction: column; gap: 14px; }
            `}</style>
        </div>
    );
}

// ==============================================================
// 🟢 3. LIVE COUNTDOWN TIMER (PRECISE 24H TRACKING)
// ==============================================================
const LiveTimer = ({ expiresAt, isExpired }: { expiresAt: string, isExpired: boolean }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (isExpired) return;

        const updateTimer = () => {
            const now = Date.now();
            let expiry = new Date(expiresAt).getTime(); 
            let diff = expiry - now;

            if (diff > 24 * 60 * 60 * 1000) {
                diff -= 5 * 60 * 60 * 1000;
            }

            if (diff <= 0) {
                setTimeLeft('Expired');
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${String(h).padStart(2, '0')}h : ${String(m).padStart(2, '0')}m : ${String(s).padStart(2, '0')}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [expiresAt, isExpired]);

    return (
        <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 800 }}>
            {timeLeft || '...'}
        </span>
    );
};

// ==============================================================
// 🟢 4. COUPON TICKET (NON-OVERLAPPING FLEXBOX)
// ==============================================================
const CouponCard = ({ coupon, isExpired, onCopy, isCopied }: any) => {
    return (
        <div className={`coupon-ticket ${isExpired ? 'expired' : ''}`}>
            
            {/* Left Side */}
            <div className="ticket-left">
                <div className="discount-title">
                    {coupon.discount_type === 'percentage' 
                        ? `${parseFloat(coupon.discount_value)}%` 
                        : `Rs. ${parseFloat(coupon.discount_value)}`}
                </div>
                <div className="discount-sub">OFF</div>
            </div>

            {/* Right Side */}
            <div className="ticket-right">
                <div className="code-header-line">
                    <span className="code-text">{coupon.coupon_code}</span>
                </div>

                <div className="rules-block">
                    <span className="rule-item">Min Spend: <strong>Rs. {parseFloat(coupon.min_order_value || 499)}</strong></span>
                    {parseFloat(coupon.max_discount_cap) > 0 && (
                        <span className="rule-item">Max Cap: <strong>Rs. {parseFloat(coupon.max_discount_cap)}</strong></span>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="ticket-action-footer">
                    <div className="expiry-pill">
                        <Clock size={11} />
                        {isExpired ? (
                            <span>{coupon.is_used === 1 ? 'Used on Order' : 'Expired'}</span>
                        ) : (
                            <LiveTimer expiresAt={coupon.expires_at} isExpired={isExpired} />
                        )}
                    </div>

                    {!isExpired && (
                        <button 
                            type="button"
                            onClick={onCopy} 
                            className={`copy-btn ${isCopied ? 'copied' : ''}`}
                            aria-label="Copy code"
                        >
                            {isCopied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .coupon-ticket {
                    display: flex;
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                    border: 1px solid #e2e8f0;
                    position: relative;
                    min-height: 125px;
                    width: 100%;
                    box-sizing: border-box;
                    transition: transform 0.2s;
                }
                .coupon-ticket:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
                
                /* Cutouts */
                .coupon-ticket::before, .coupon-ticket::after {
                    content: ''; position: absolute; top: 50%;
                    width: 18px; height: 18px; background: #f8fafc; border-radius: 50%;
                    border: 1px solid #cbd5e1; z-index: 10;
                }
                .coupon-ticket::before { left: -10px; transform: translateY(-50%); }
                .coupon-ticket::after { right: -10px; transform: translateY(-50%); }

                .ticket-left {
                    width: 30%;
                    min-width: 90px;
                    background: linear-gradient(135deg, #f85606 0%, #ea580c 100%);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-right: 2px dashed rgba(255,255,255,0.45);
                    padding: 10px;
                    box-sizing: border-box;
                }
                .discount-title { font-size: 20px; font-weight: 900; line-height: 1.1; text-align: center; }
                .discount-sub { font-size: 11px; font-weight: 800; letter-spacing: 1px; opacity: 0.9; margin-top: 2px; }

                .ticket-right {
                    flex: 1;
                    min-width: 0;
                    padding: 12px 14px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 6px;
                    box-sizing: border-box;
                }

                .code-header-line {
                    display: flex; align-items: center; justify-content: space-between;
                }
                .code-text { 
                    font-size: 15px; font-weight: 900; color: #1e3a8a; 
                    font-family: monospace; letter-spacing: 1px; margin: 0;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }

                .rules-block {
                    display: flex; flex-direction: column; gap: 2px;
                }
                .rule-item { font-size: 11px; color: #64748b; font-weight: 500; }
                .rule-item strong { color: #0f172a; font-weight: 700; }

                .ticket-action-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    margin-top: 4px;
                    width: 100%;
                }

                .expiry-pill { 
                    display: inline-flex; align-items: center; gap: 4px; font-size: 11px; 
                    color: #ef4444; font-weight: 700; background: #fef2f2; 
                    padding: 4px 8px; border-radius: 6px; flex-shrink: 0;
                }

                .copy-btn {
                    padding: 6px 12px; border-radius: 8px;
                    border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;
                    font-size: 11.5px; font-weight: 800; cursor: pointer;
                    display: inline-flex; align-items: center; gap: 4px;
                    transition: 0.2s; flex-shrink: 0;
                }
                .copy-btn:active { transform: scale(0.95); }
                .copy-btn.copied { background: #10b981; color: white; border-color: #10b981; }

                /* EXPIRED STATE */
                .coupon-ticket.expired .ticket-left { background: #94a3b8; border-right-color: rgba(255,255,255,0.3); }
                .coupon-ticket.expired .code-text { color: #64748b; text-decoration: line-through; }
                .coupon-ticket.expired .expiry-row, .coupon-ticket.expired .expiry-pill { color: #64748b; background: #f1f5f9; }
            `}</style>
        </div>
    );
};

// ==============================================================
// 🟢 5. EMPTY STATE COMPONENT
// ==============================================================
const EmptyState = ({ type }: { type: string }) => (
    <div className="empty-state">
        {type === 'active' ? <Ticket size={45} className="empty-icon" /> : <Frown size={45} className="empty-icon" />}
        <h3>{type === 'active' ? 'No Active Coupons' : 'No Expired Coupons'}</h3>
        <p>{type === 'active' ? "Spin the wheel daily to win exciting discounts!" : "You haven't lost any coupons yet."}</p>
        
        <style jsx>{`
            .empty-state {
                text-align: center; padding: 45px 20px;
                background: white; border-radius: 16px; border: 1px dashed #cbd5e1;
            }
            .empty-icon { color: #cbd5e1; margin: 0 auto 12px; }
            h3 { font-size: 15px; font-weight: 800; color: #334155; margin: 0 0 6px 0; }
            p { font-size: 12.5px; color: #94a3b8; margin: 0; }
        `}</style>
    </div>
);