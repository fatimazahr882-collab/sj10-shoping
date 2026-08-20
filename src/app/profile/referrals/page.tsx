"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Copy, CheckCircle2, Share2, 
    Gift, ArrowLeft, Clock, Sparkles, Check, 
    AlertCircle, HelpCircle, TrendingUp, Lightbulb, Wallet
} from 'lucide-react';
import apiClient from '@/lib/apiClient';

// ==============================================================
// 🟢 1. LUXURY SHIMMER SKELETON LOADER
// ==============================================================
const ReferralSkeleton = () => (
    <div className="referral-content-container">
        {/* Banner Skeleton */}
        <div className="skel-block skel-hero shimmer-gold"></div>

        {/* Stats Grid Skeleton */}
        <div className="skel-grid-duo">
            <div className="skel-block skel-stat shimmer-silver"></div>
            <div className="skel-block skel-stat shimmer-silver"></div>
        </div>

        {/* Steps Skeleton */}
        <div className="skel-block skel-steps shimmer-silver"></div>

        {/* List Skeleton */}
        <div className="skel-list-wrap">
            {[1, 2].map((n) => (
                <div key={n} className="skel-block skel-friend-row shimmer-silver"></div>
            ))}
        </div>

        <style jsx>{`
            .referral-content-container { max-width: 600px; margin: 0 auto; padding: 16px 14px; }
            .skel-hero { height: 210px; border-radius: 20px; margin-bottom: 16px; width: 100%; }
            .skel-grid-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
            .skel-stat { height: 90px; border-radius: 16px; }
            .skel-steps { height: 140px; border-radius: 18px; margin-bottom: 16px; }
            .skel-list-wrap { display: flex; flex-direction: column; gap: 10px; }
            .skel-friend-row { height: 70px; border-radius: 14px; }

            .skel-block { position: relative; overflow: hidden; }
            .shimmer-silver { background: #e2e8f0; }
            .shimmer-silver::after {
                content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
                animation: sweepAnim 1.4s infinite linear;
            }

            .shimmer-gold { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); }
            .shimmer-gold::after {
                content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
                animation: sweepAnim 1.4s infinite linear;
            }

            @keyframes sweepAnim { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        `}</style>
    </div>
);

// ==============================================================
// 🟢 2. MAIN REFERRALS & GUIDE PAGE
// ==============================================================
export default function ReferralsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    
    const [stats, setStats] = useState<{
        is_active: boolean;
        referral_code: string;
        referral_link: string;
        bonus_per_order: number;
        max_orders_rewarded: number;
        total_friends_invited: number;
        total_bonus_earned: number;
        friends: Array<{
            user_id: string;
            name: string;
            profile_pic: string | null;
            joined_date: string;
            orders_completed: number;
            bonus_earned: number;
        }>;
    } | null>(null);

    useEffect(() => {
        apiClient('referrals/my-stats', 'GET')
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Referral stats error:", err);
                setLoading(false);
            });
    }, []);

    const handleCopyLink = () => {
        if (!stats?.referral_link) return;
        navigator.clipboard.writeText(stats.referral_link);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleWhatsAppShare = () => {
        if (!stats?.referral_link) return;
        const msg = `*SJ10 Par Zero Investment Reselling Shuru Karein!* 🚀\n\nAbhi mere referral link se account banayein aur wholesale rates par products bech kar mahana munafa kamayein:\n${stats.referral_link}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const isActive = stats?.is_active ?? true;
    const maxBonusPerFriend = (stats?.bonus_per_order || 50) * (stats?.max_orders_rewarded || 2);

    return (
        <div className="referral-page-root">
            
            {/* 🟢 TOP HEADER */}
            <header className="page-nav-header">
                <button onClick={() => router.back()} className="back-btn-pill" type="button" aria-label="Go Back">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="nav-heading">Invite & Earn Program</h1>
            </header>

            {loading ? (
                <ReferralSkeleton />
            ) : (
                <div className="referral-content-container">
                    
                    {/* 🔴 INACTIVE NOTICE */}
                    {!isActive && (
                        <div className="paused-program-banner">
                            <AlertCircle size={20} className="text-amber-600" />
                            <div>
                                <strong>Program is Temporarily Paused</strong>
                                <p>New bonus rewards are currently paused by Admin. You can still see your invited friends below.</p>
                            </div>
                        </div>
                    )}

                    {/* 🟢 HERO CARD (GUARANTEED ROYAL BLUE GRADIENT VIA INLINE STYLES) */}
                    <div 
                        style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #1d4ed8 100%)',
                            backgroundColor: '#1e3a8a',
                            borderRadius: '22px',
                            padding: '22px 18px',
                            color: '#ffffff',
                            boxShadow: '0 12px 35px rgba(30, 58, 138, 0.28)',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.35)'
                            }}>
                                <Gift size={26} color="#ffffff" />
                            </div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.35)',
                                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, color: '#ffffff'
                            }}>
                                <Sparkles size={14} className="text-yellow-300" />
                                <span>Get Rs. {maxBonusPerFriend} Per Friend</span>
                            </div>
                        </div>

                        <h2 style={{ fontSize: '21px', fontWeight: 900, margin: '0 0 6px 0', color: '#ffffff', letterSpacing: '-0.3px' }}>
                            Invite Friends, Earn Real Cash! 💸
                        </h2>
                        <p style={{ fontSize: '13px', color: '#dbeafe', lineHeight: 1.5, margin: '0 0 18px 0', fontWeight: 500 }}>
                            Apne doston ko invite karein. Jab woh pehle <strong>2 orders</strong> deliver karwayenge, aapko har order par <strong>Rs. {stats?.bonus_per_order || 50}</strong> direct wallet mein milenge!
                        </p>

                        {/* SHARE LINK BOX */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '16px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: '#ffffff', padding: '10px 14px', borderRadius: '10px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <span style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>
                                    {stats?.referral_code}
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px', fontWeight: 500 }}>
                                    {stats?.referral_link}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={handleCopyLink} 
                                    style={{
                                        flex: 1, height: '44px', borderRadius: '10px', border: 'none',
                                        fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        background: isCopied ? '#10b981' : '#ffffff',
                                        color: isCopied ? '#ffffff' : '#1e3a8a',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                                    }}
                                >
                                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                    <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                                </button>

                                <button 
                                    onClick={handleWhatsAppShare} 
                                    style={{
                                        flex: 1.2, height: '44px', borderRadius: '10px', border: 'none',
                                        fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        background: '#25D366', color: '#ffffff',
                                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)'
                                    }}
                                >
                                    <i className="fab fa-whatsapp" style={{ fontSize: '17px' }}></i>
                                    <span>Share on WhatsApp</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 🟢 STATS OVERVIEW CARDS */}
                    <div className="stats-cards-grid">
                        <div className="stat-card-box">
                            <span className="stat-num-val">{stats?.total_friends_invited || 0}</span>
                            <span className="stat-lbl-text">
                                <Users size={15} className="text-blue" /> Total Friends Joined
                            </span>
                        </div>

                        <div className="stat-card-box">
                            <span className="stat-num-val text-green">Rs. {(stats?.total_bonus_earned || 0).toLocaleString()}</span>
                            <span className="stat-lbl-text">
                                <Wallet size={15} className="text-emerald" /> Total Cash Earned
                            </span>
                        </div>
                    </div>

                    {/* 🟢 3 STEPS HOW IT WORKS (BLOG / GUIDE STYLE) */}
                    <div className="guide-card-box">
                        <div className="guide-head-row">
                            <Lightbulb size={18} className="text-orange" />
                            <h3 className="guide-title">How Does It Work? (Earning Formula)</h3>
                        </div>
                        
                        <div className="steps-row">
                            <div className="step-item">
                                <div className="step-num">1</div>
                                <strong>Share Link</strong>
                                <p>Send your link on WhatsApp / Social Media.</p>
                            </div>
                            <div className="step-item">
                                <div className="step-num">2</div>
                                <strong>Friend Joins</strong>
                                <p>They register a free reseller account.</p>
                            </div>
                            <div className="step-item">
                                <div className="step-num">3</div>
                                <strong>Earn Rs. 50 x 2</strong>
                                <p>Get Rs. 50 on each of their first 2 delivered orders!</p>
                            </div>
                        </div>
                    </div>

                    {/* 🟢 INVITED FRIENDS LIST */}
                    <div className="friends-list-section">
                        <div className="section-title-row">
                            <h3 className="section-title-main">Invited Friends Activity ({stats?.friends?.length || 0})</h3>
                        </div>

                        {stats?.friends && stats.friends.length > 0 ? (
                            <div className="friends-cards-stack">
                                {stats.friends.map((friend, i) => {
                                    const isComplete = friend.orders_completed >= (stats.max_orders_rewarded || 2);
                                    return (
                                        <div key={friend.user_id || i} className="friend-row-card">
                                            
                                            {/* Avatar */}
                                            <div className="friend-avatar-box">
                                                {friend.profile_pic ? (
                                                    <Image src={friend.profile_pic} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
                                                ) : (
                                                    <div className="avatar-initials">
                                                        {friend.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Name & Details */}
                                            <div className="friend-info-col">
                                                <h4 className="friend-name-text">{friend.name}</h4>
                                                <span className="friend-join-date">
                                                    Joined {new Date(friend.joined_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>

                                            {/* Orders Progress & Bonus Tag */}
                                            <div className="friend-reward-col">
                                                <span className={`order-progress-tag ${isComplete ? 'complete' : ''}`}>
                                                    {isComplete ? (
                                                        <><CheckCircle2 size={12} /> 2/2 Complete</>
                                                    ) : (
                                                        <><Clock size={12} /> {friend.orders_completed}/2 Delivered</>
                                                    )}
                                                </span>
                                                <span className="earned-text">
                                                    + Rs. {friend.bonus_earned.toLocaleString()}
                                                </span>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-friends-card">
                                <div className="empty-gift-wrap">
                                    <Users size={36} className="text-slate-400" />
                                </div>
                                <h4 className="empty-head">No Friends Joined Yet</h4>
                                <p className="empty-sub">Share your invite link with your friends & family to earn Rs. 100 on their completed orders!</p>
                                <button onClick={handleWhatsAppShare} className="empty-share-btn">
                                    <i className="fab fa-whatsapp"></i> Share on WhatsApp Now
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 🟢 FAQS & RULES GUIDE (BLOG STYLE) */}
                    <div className="faq-guide-card">
                        <div className="faq-head">
                            <HelpCircle size={18} className="text-blue" />
                            <h4>Frequently Asked Questions</h4>
                        </div>
                        
                        <div className="faq-item">
                            <strong>1. Mujhe bonus kab milega?</strong>
                            <p>Jab aapka dost order place karega aur courier woh order successfully <strong>Deliver</strong> kar dega, tab Rs. 50 foran aapke wallet mein transfer ho jayenge.</p>
                        </div>

                        <div className="faq-item">
                            <strong>2. Ek dost se maximum kitna bonus mil sakta hai?</strong>
                            <p>Aapko ek dost ke pehle 2 delivered orders par Rs. 50 + Rs. 50 (Total Rs. 100) milenge. Uske baad ke orders par koi bonus nahi milega.</p>
                        </div>

                        <div className="faq-item">
                            <strong>3. Kya main yeh bonus withdraw kar sakta hoon?</strong>
                            <p>Jee bilkul! Yeh bonus seedha aapke <strong>My Earnings Dashboard</strong> mein jama hota hai aur aap kisi bhi waqt EasyPaisa, JazzCash ya Bank Account mein withdraw le sakte hain.</p>
                        </div>
                    </div>

                </div>
            )}

            {/* 🟢 PURE SCOPED CSS */}
            <style jsx>{`
                .referral-page-root {
                    min-height: 100vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', -apple-system, sans-serif;
                    padding-bottom: 120px; /* Space for mobile nav bar */
                }

                .page-nav-header {
                    position: sticky; top: 0; z-index: 90;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid #eef2f6;
                    padding: 12px 18px;
                    display: flex; align-items: center; gap: 14px;
                }
                .back-btn-pill {
                    width: 36px; height: 36px; border-radius: 50%;
                    border: none; background: #f1f5f9; color: #1e293b;
                    font-size: 15px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: 0.2s;
                }
                .back-btn-pill:hover { background: #e2e8f0; }
                .nav-heading { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }

                .referral-content-container {
                    max-width: 600px;
                    margin: 16px auto 0;
                    padding: 0 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .paused-program-banner {
                    display: flex; align-items: center; gap: 12px;
                    background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 14px;
                    padding: 12px 16px; color: #92400e; font-size: 12.5px;
                }
                .paused-program-banner strong { display: block; font-size: 13.5px; margin-bottom: 2px; }
                .paused-program-banner p { margin: 0; font-size: 11.5px; color: #b45309; }

                /* STATS GRID */
                .stats-cards-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
                }
                .stat-card-box {
                    background: white; border-radius: 18px; padding: 18px 14px;
                    border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                    display: flex; flex-direction: column; gap: 4px; text-align: center;
                }
                .stat-num-val { font-size: 24px; font-weight: 900; color: #0f172a; }
                .stat-num-val.text-green { color: #00b862; }
                .stat-lbl-text {
                    font-size: 12px; color: #64748b; font-weight: 600;
                    display: flex; align-items: center; justify-content: center; gap: 5px;
                }
                .text-blue { color: #2563eb; }
                .text-emerald { color: #059669; }

                /* GUIDE CARD */
                .guide-card-box {
                    background: white; border-radius: 18px; padding: 18px;
                    border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
                .guide-head-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
                .guide-title { font-size: 14.5px; font-weight: 800; color: #0f172a; margin: 0; }
                .text-orange { color: #f85606; }

                .steps-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
                .step-item { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
                .step-num {
                    width: 28px; height: 28px; border-radius: 50%;
                    background: #eff6ff; color: #2563eb; font-size: 13px; font-weight: 900;
                    display: flex; align-items: center; justify-content: center; margin-bottom: 3px;
                }
                .step-item strong { font-size: 12px; color: #1e293b; font-weight: 700; }
                .step-item p { font-size: 10.5px; color: #64748b; margin: 0; line-height: 1.35; }

                /* FRIENDS LIST */
                .friends-list-section { display: flex; flex-direction: column; gap: 10px; }
                .section-title-row { display: flex; justify-content: space-between; align-items: center; }
                .section-title-main { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; }

                .friends-cards-stack { display: flex; flex-direction: column; gap: 10px; }
                .friend-row-card {
                    background: white; border-radius: 16px; padding: 14px 16px;
                    border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                    display: flex; align-items: center; gap: 12px;
                }
                .friend-avatar-box {
                    width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
                    position: relative; flex-shrink: 0; border: 1.5px solid #e2e8f0;
                }
                .avatar-initials {
                    width: 100%; height: 100%; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                    color: white; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center;
                }

                .friend-info-col { flex: 1; min-width: 0; }
                .friend-name-text { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .friend-join-date { font-size: 11px; color: #94a3b8; font-weight: 500; }

                .friend-reward-col { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
                .order-progress-tag {
                    font-size: 10.5px; font-weight: 700; background: #eff6ff; color: #2563eb;
                    padding: 2px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;
                }
                .order-progress-tag.complete { background: #ecfdf5; color: #059669; }
                .earned-text { font-size: 13.5px; font-weight: 900; color: #00b862; }

                /* EMPTY STATE */
                .empty-friends-card {
                    background: white; border-radius: 20px; padding: 35px 20px;
                    border: 1.5px dashed #cbd5e1; text-align: center;
                }
                .empty-gift-wrap {
                    width: 64px; height: 64px; border-radius: 50%; background: #f8fafc;
                    display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;
                }
                .empty-head { font-size: 15px; font-weight: 800; color: #1e293b; margin: 0 0 6px 0; }
                .empty-sub { font-size: 12.5px; color: #64748b; max-width: 320px; margin: 0 auto 16px; line-height: 1.5; }
                
                .empty-share-btn {
                    background: #25D366; color: white; border: none; padding: 12px 26px;
                    border-radius: 50px; font-size: 13.5px; font-weight: 800; cursor: pointer;
                    display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
                    transition: transform 0.2s;
                }
                .empty-share-btn:active { transform: scale(0.97); }

                /* FAQ BLOG CARD */
                .faq-guide-card {
                    background: white; border-radius: 18px; padding: 20px 18px;
                    border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
                .faq-head { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
                .faq-head h4 { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; }
                .faq-item { margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
                .faq-item:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
                .faq-item strong { display: block; font-size: 13px; color: #1e293b; font-weight: 700; margin-bottom: 4px; }
                .faq-item p { font-size: 12px; color: #64748b; line-height: 1.5; margin: 0; }
            `}</style>
        </div>
    );
}