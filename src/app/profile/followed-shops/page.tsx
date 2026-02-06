"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr"; // ✅ Fast Caching
import { useAuth } from "@/components/AuthProvider";

// ✅ YOUR ADMIN ID
const ADMIN_SUPPLIER_ID = "854ee7de-425b-4057-a8f7-eb310491c6b0";

type ShopItem = {
    id: number | string;
    brand_name: string;
    profile_pic: string | null;
    verified_status: string; // 'verified', 'unverified', 'under_review'
};

// SWR Fetcher Wrapper to include Token
const fetcher = async ([url, token]: [string, string]) => {
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
};

export default function FollowedShopsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [token, setToken] = useState<string | null>(null);

    // 1. Get Token on Mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const t = localStorage.getItem("authToken") || localStorage.getItem("user_token");
            setToken(t);
        }
    }, []);

    // 2. Auth Redirect Logic
    useEffect(() => {
        if (!authLoading && !user && !token) {
            router.push("/auth?view=login");
        }
    }, [user, authLoading, token, router]);

    // 3. SWR Data Fetching (Instant Cache)
    const { data: shops, isLoading } = useSWR(
        token ? [`${process.env.NEXT_PUBLIC_CART_API_URL}/shops/followed`, token] : null,
        fetcher,
        {
            revalidateOnFocus: false, // Don't refetch just by clicking window
            dedupingInterval: 60000,  // Cache for 1 min
        }
    );

    return (
        <div className="page-wrapper">
            <style jsx global>{`
                .page-wrapper { min-height: 100vh; background-color: #f8fafc; padding: 20px; }
                .content-container { max-width: 600px; margin: 0 auto; }
                
                /* HEADER */
                .page-header-card {
                    background: white; padding: 20px; border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 20px;
                    display: flex; align-items: center; gap: 12px;
                }
                .header-title { font-size: 22px; font-weight: 800; color: #1e293b; margin: 0; }
                .icon-circle {
                    width: 44px; height: 44px; background: #f3e8ff; color: #9333ea;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;
                }

                /* SHOPS LIST */
                .shops-list { display: flex; flex-direction: column; gap: 14px; }
                
                /* SHOP CARD - Optimized for Click Speed */
                .shop-card {
                    display: flex; align-items: center; background: white; padding: 16px;
                    border-radius: 16px; text-decoration: none; border: 1px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative; overflow: hidden;
                }
                .shop-card:active { transform: scale(0.98); background: #f1f5f9; } /* Instant feedback */
                .shop-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.06); }

                /* AVATAR WRAPPER */
                .avatar-wrapper { position: relative; width: 56px; height: 56px; flex-shrink: 0; }
                
                .shop-avatar {
                    width: 100%; height: 100%; border-radius: 50%; overflow: hidden;
                    background: #f1f5f9; border: 2px solid #fff; 
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                }
                .img-object { object-fit: cover; }

                /* STATUS BADGE (Green Tick / Red Cross) */
                .status-badge {
                    position: absolute; bottom: 0; right: 0;
                    width: 20px; height: 20px; border-radius: 50%;
                    border: 2px solid #fff;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; color: white;
                    z-index: 10;
                }
                .status-verified { background: #22c55e; } /* Green */
                .status-unverified { background: #ef4444; } /* Red */

                /* INFO AREA */
                .shop-info { margin-left: 16px; flex-grow: 1; display: flex; flex-direction: column; gap: 2px; }
                
                .name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
                .shop-name { font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.2; }
                
                .visit-text { font-size: 13px; color: #64748b; font-weight: 500; }

                /* OFFICIAL BADGE ANIMATION */
                .official-badge {
                    background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
                    background-size: 200% 200%;
                    color: #7a4b0af2;
                    font-size: 9px; font-weight: 900;
                    padding: 3px 8px; border-radius: 10px;
                    text-transform: uppercase; letter-spacing: 0.5px;
                    box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
                    animation: shine 3s ease infinite;
                    border: 1px solid #ffffffaa;
                }
                @keyframes shine {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .arrow-icon { 
                    color: #cbd5e1; width: 32px; height: 32px; 
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 50%; background: #f8fafc;
                    transition: all 0.2s;
                }
                .shop-card:hover .arrow-icon { background: #9333ea; color: white; }

                /* SKELETON */
                .skeleton { height: 88px; background: #e2e8f0; border-radius: 16px; animation: pulse 1s infinite; }
                @keyframes pulse { 50% { opacity: 0.6; } }
            `}</style>

            <div className="content-container">
                <div className="page-header-card">
                    <div className="icon-circle"><i className="fas fa-store-alt"></i></div>
                    <h1 className="header-title">Followed Shops</h1>
                </div>

                {!isLoading && shops?.length === 0 && (
                    <div style={{textAlign: 'center', padding: '60px 20px', color: '#64748b'}}>
                        <i className="fas fa-store-slash" style={{fontSize: '48px', marginBottom: '20px', opacity: 0.5}}></i>
                        <h3 style={{fontWeight: 700, color: '#334155'}}>No shops followed yet</h3>
                    </div>
                )}

                {isLoading && (
                    <div className="shops-list">
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton"></div>)}
                    </div>
                )}

                <div className="shops-list">
                    {!isLoading && shops?.map((shop: ShopItem) => {
                        const hasValidImage = shop.profile_pic && !imageErrors[shop.id];
                        const isOfficial = shop.id === ADMIN_SUPPLIER_ID;
                        const isVerified = shop.verified_status === 'verified';

                        return (
                            <Link 
                                href={`/suppliers/${shop.id}`} 
                                key={shop.id} 
                                className="shop-card"
                                prefetch={true} // Ensures Instant Navigation
                            >
                                <div className="avatar-wrapper">
                                    <div className="shop-avatar">
                                        {hasValidImage ? (
                                            <Image 
                                                src={shop.profile_pic!} 
                                                alt={shop.brand_name} 
                                                fill
                                                className="img-object"
                                                sizes="56px"
                                                onError={() => setImageErrors(prev => ({ ...prev, [shop.id]: true }))}
                                            />
                                        ) : (
                                            <div style={{
                                                width:'100%', height:'100%', background:'#9333ea', color:'white',
                                                display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'22px'
                                            }}>
                                                {shop.brand_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* --- VERIFICATION STATUS ON EDGE --- */}
                                    {isVerified ? (
                                        <div className="status-badge status-verified">
                                            <i className="fas fa-check"></i>
                                        </div>
                                    ) : (
                                        <div className="status-badge status-unverified">
                                            <i className="fas fa-times"></i>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="shop-info">
                                    <div className="name-row">
                                        <span className="shop-name">{shop.brand_name}</span>
                                        
                                        {/* --- OFFICIAL ANIMATED BADGE --- */}
                                        {isOfficial && (
                                            <span className="official-badge">
                                                <i className="fas fa-shield-alt" style={{marginRight:'3px'}}></i> Official
                                            </span>
                                        )}
                                    </div>
                                    <span className="visit-text">Tap to view products</span>
                                </div>

                                <div className="arrow-icon">
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}