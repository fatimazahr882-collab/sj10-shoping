"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    FaCheckCircle, FaTimesCircle, FaPlus, FaSearch,
    FaStar, FaExclamationTriangle, FaFire, FaClock
} from 'react-icons/fa';

// --- CONFIG ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const PLACEHOLDER_IMG = "https://via.placeholder.com/400x400.png?text=No+Image";

// --- HELPERS ---
const getSafeImage = (image_urls: any) => {
    if (!image_urls) return PLACEHOLDER_IMG;
    try {
        if (typeof image_urls === 'string' && (image_urls.startsWith('[') || image_urls.startsWith('{'))) {
            const parsed = JSON.parse(image_urls);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        }
        if (Array.isArray(image_urls) && image_urls.length > 0) return image_urls[0];
        if (typeof image_urls === 'string' && image_urls.startsWith('http')) return image_urls;
    } catch (e) {
        if (typeof image_urls === 'string') return image_urls;
    }
    return PLACEHOLDER_IMG;
};

const formatPrice = (price: any) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price || 0);

const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_token') || localStorage.getItem('token');
};

// --- COMPONENT: SHIMMER SKELETON ---
const ProductSkeleton = () => (
    <div className="skeleton-card">
        <div className="sk-img shimmer"></div>
        <div className="sk-info">
            <div className="sk-title shimmer"></div>
            <div className="sk-price shimmer"></div>
        </div>
        <style jsx>{`
            .skeleton-card { background: white; border-radius: 8px; overflow: hidden; border: 1px solid #eee; display: flex; flex-direction: column; height: 100%; }
            .sk-img { width: 100%; padding-top: 100%; background: #e0e0e0; }
            .sk-info { padding: 10px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
            .sk-title { height: 16px; width: 80%; background: #e0e0e0; border-radius: 4px; }
            .sk-price { height: 20px; width: 40%; background: #e0e0e0; border-radius: 4px; margin-top: auto; }
            .shimmer { position: relative; overflow: hidden; }
            .shimmer::after {
                content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
                animation: shine 1.5s infinite;
            }
            @keyframes shine { 100% { left: 100%; } }
        `}</style>
    </div>
);

// --- COMPONENT: ROBUST VERIFICATION BADGE ---
const VerificationBadge = ({ status }: { status: any }) => {
    // 1. Normalize the status (lowercase, trim spaces)
    const normalizedStatus = status ? String(status).toLowerCase().trim() : "";

    // 2. CHECK FOR VERIFIED
    if (normalizedStatus === 'verified' || normalizedStatus === '1' || normalizedStatus === 'true') {
        return (
            <div className="badge badge-verified">
                <FaCheckCircle /> VERIFIED SUPPLIER
            </div>
        );
    }

    // 3. CHECK FOR UNDER REVIEW
    if (normalizedStatus === 'underreview' || normalizedStatus === 'pending' || normalizedStatus === 'under review') {
        return (
            <div className="badge badge-pending">
                <FaClock /> UNDER REVIEW
            </div>
        );
    }

    // 4. DEFAULT: UNVERIFIED
    return (
        <div className="badge badge-unverified">
            <FaExclamationTriangle /> UNVERIFIED ACCOUNT
        </div>
    );
};

// ==========================================
// === MAIN PAGE COMPONENT                ===
// ==========================================
export default function SupplierShopPage({ params }: { params: any }) {
    const { supplierId } = params;
    const router = useRouter();

    // Data
    const [supplier, setSupplier] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Animation State
    const [hotDealIndex, setHotDealIndex] = useState(0);
    const [fadeKey, setFadeKey] = useState(0);

    // Follow Logic
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    // 1. FETCH DATA
    useEffect(() => {
        if (!supplierId) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const [supRes, prodRes] = await Promise.all([
                    fetch(`${API_URL}/api/suppliers/${supplierId}`),
                    fetch(`${API_URL}/api/products?supplierId=${supplierId}&limit=100`)
                ]);

                if (supRes.ok) {
                    const data = await supRes.json();
                    console.log("Supplier Data Received:", data); // DEBUG: Check verified_status here
                    setSupplier(data);
                    setFollowerCount(data.followers_count || 0);
                }
                if (prodRes.ok) {
                    const data = await prodRes.json();
                    const list = Array.isArray(data) ? data : (data.products || data.data || []);
                    setProducts(list);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [supplierId]);

    // 2. CHECK FOLLOW STATUS
    useEffect(() => {
        const checkStatus = async () => {
            const token = getToken();
            if (!token || !supplierId) return;
            try {
                const res = await fetch(`${API_URL}/api/social/status/${supplierId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setIsFollowing(data.isFollowing);
                }
            } catch (e) { }
        };
        checkStatus();
    }, [supplierId]);

    // 3. FOLLOW ACTION
    const handleFollow = async () => {
        const token = getToken();
        if (!token) {
            router.push(`/auth/user/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        if (isFollowLoading) return;
        setIsFollowLoading(true);

        const prevState = isFollowing;
        setIsFollowing(!isFollowing);
        setFollowerCount(prev => !prevState ? prev + 1 : prev - 1);

        try {
            const res = await fetch(`${API_URL}/api/social/follow/${supplierId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed");
        } catch (e) {
            setIsFollowing(prevState);
            setFollowerCount(prevState ? followerCount + 1 : followerCount - 1);
            alert("Connection failed.");
        } finally {
            setIsFollowLoading(false);
        }
    };

    // 4. ANIMATION LOGIC
    useEffect(() => {
        if (products.length < 2) return;
        const interval = setInterval(() => {
            setHotDealIndex(prev => {
                const next = (prev + 1) % Math.min(products.length, 5);
                setFadeKey(Date.now());
                return next;
            });
        }, 4000);
        return () => clearInterval(interval);
    }, [products]);

    // Derived Products
    const filteredProducts = useMemo(() => {
        let res = [...products];
        if (searchTerm) res = res.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

        if (sortBy === 'newest') res.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        if (sortBy === 'price_high') res.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
        if (sortBy === 'price_low') res.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
        return res;
    }, [products, searchTerm, sortBy]);

    const hotDealProduct = filteredProducts[hotDealIndex];
    const latestBig = filteredProducts[0];
    const latestSmall = filteredProducts.slice(1, 4);
    const gridProducts = filteredProducts.slice(4);

    // Preload Next Image
    const nextHotIndex = (hotDealIndex + 1) % Math.min(products.length, 5);
    const nextPreloadImage = products.length > 0 ? getSafeImage(products[nextHotIndex]?.image_urls) : null;

    return (
        <div className="page-wrapper">
            <style jsx global>{`
        /* RESET */
        body { margin: 0; padding-bottom: 60px; background-color: #f1f3f6; font-family: 'Roboto', sans-serif; }
        
        /* HEADER */
        .store-header {
            position: relative;
            background: linear-gradient(135deg, #240b36 0%, #c31432 100%);
            min-height: 280px;
            padding: 30px 20px;
            display: flex; flex-direction: column; justify-content: center;
            color: white; overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .bubble { position: absolute; background: rgba(255,255,255,0.1); border-radius: 50%; animation: float 6s infinite ease-in-out; pointer-events: none; }
        @keyframes float { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(-300px); opacity: 0; } }
        
        .header-inner { position: relative; z-index: 2; display: flex; align-items: flex-start; gap: 20px; }
        .profile-img {
            width: 90px; height: 90px; border-radius: 14px; background: white;
            border: 3px solid rgba(255,255,255,0.4); overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            font-size: 32px; font-weight: 800; color: #c31432;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        }
        
        .info-col { flex: 1; }
        .brand-name { font-size: 26px; font-weight: 900; margin: 0; text-shadow: 0 2px 5px rgba(0,0,0,0.4); line-height: 1.1; }
        .meta { margin-top: 8px; display: flex; gap: 15px; font-size: 13px; opacity: 0.9; }

        /* BADGES */
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 800; margin-top: 12px; letter-spacing: 0.5px; }
        
        .badge-verified {
            background: #00C853; color: white;
            box-shadow: 0 0 10px rgba(0, 200, 83, 0.5);
            animation: shine 2s infinite;
        }

        .badge-pending { background: #FFD700; color: #333; }

        .badge-unverified {
            background: #1a0000; color: #ff3333; border: 1px solid #ff3333;
            font-family: 'Courier New', monospace; letter-spacing: 1px;
            box-shadow: 0 0 8px rgba(255, 0, 0, 0.4);
            animation: pulseHorror 1.5s infinite;
        }
        @keyframes pulseHorror {
            0% { border-color: #ff3333; box-shadow: 0 0 0 0 rgba(255, 51, 51, 0.4); }
            50% { border-color: #ff0000; }
            100% { border-color: #ff3333; box-shadow: 0 0 0 10px rgba(255, 51, 51, 0); }
        }

        /* FOLLOW BUTTON */
        .follow-btn {
            background: rgba(255,255,255,0.2); backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.5); color: white;
            padding: 10px 22px; border-radius: 30px; font-weight: 700; cursor: pointer;
            margin-top: auto; transition: 0.2s;
        }
        .follow-btn.active { background: white; color: #c31432; }

        /* SEARCH */
        .toolbar { position: sticky; top: 0; z-index: 50; background: white; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; gap: 10px; }
        .search-box { flex: 1; background: #f5f5f5; border-radius: 8px; padding: 0 12px; display: flex; align-items: center; }
        .search-inp { border: none; background: transparent; padding: 12px; width: 100%; outline: none; }
        
        /* LAYOUTS */
        .section-h { padding: 20px 20px 10px; font-size: 18px; font-weight: 800; color: #222; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
        
        .latest-wrap { display: flex; gap: 10px; padding: 0 15px; height: 320px; margin-bottom: 20px; }
        .latest-big { flex: 1.3; background: white; border-radius: 8px; border: 1px solid #eee; overflow: hidden; position: relative; }
        .latest-stack { flex: 1; display: flex; flex-direction: column; gap: 8px; height: 100%; }
        .latest-small { flex: 1; background: white; border-radius: 8px; border: 1px solid #eee; display: flex; align-items: center; padding: 5px; gap: 10px; overflow: hidden; }

        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 15px; }
        @media (min-width: 768px) {
            .grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
            .store-header, .toolbar, .content { max-width: 1200px; margin: 0 auto; }
            .latest-wrap { height: 450px; }
        }

        /* PRODUCT CARD */
        .card { background: white; border-radius: 8px; border: 1px solid #eee; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s; position: relative; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .img-box { position: relative; width: 100%; padding-top: 100%; background: #f9f9f9; }
        .p-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
        .info { padding: 12px; flex: 1; display: flex; flex-direction: column; }
        .title { font-size: 13px; color: #333; margin-bottom: 6px; line-height: 1.4; height: 38px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        
        .price-box { margin-top: auto; }
        .price { font-size: 16px; font-weight: 700; color: #f53d2d; }
        .cut-price { font-size: 11px; color: #999; text-decoration: line-through; margin-left: 6px; }

        .fade-enter { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeIn { from { opacity: 0.6; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>

            {/* --- PRELOADER --- */}
            {nextPreloadImage && (
                <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 }}>
                    <img src={nextPreloadImage} alt="preload" />
                </div>
            )}

            {/* --- CONTENT --- */}
            {loading ? (
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                    <div className="skeleton-card" style={{ height: '250px', marginBottom: '20px' }}>
                        <div className="shimmer" style={{ width: '100%', height: '100%', background: '#e0e0e0' }}></div>
                    </div>
                    <div className="grid">
                        {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                </div>
            ) : !supplier ? (
                <div style={{ textAlign: 'center', padding: 50 }}>Store Not Found</div>
            ) : (
                <div className="content">
                    <header className="store-header">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bubble" style={{
                                left: `${Math.random() * 100}%`, bottom: '-50px',
                                width: `${20 + Math.random() * 50}px`, height: `${20 + Math.random() * 50}px`,
                                animationDuration: `${5 + Math.random() * 10}s`, animationDelay: `${Math.random() * 5}s`
                            }}></div>
                        ))}

                        <div className="header-inner">
                            <div className="profile-img">
                                <img
                                    src={getSafeImage(supplier.profile_pic)}
                                    alt={supplier.brand_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { (e.target as any).onerror = null; (e.target as any).src = PLACEHOLDER_IMG; }}
                                />
                            </div>
                            <div className="info-col">
                                <h1 className="brand-name">{supplier.brand_name}</h1>
                                <div className="meta">
                                    <span>{followerCount} Followers</span>
                                    <span><FaStar color="#FFD700" /> {supplier.average_rating || '5.0'}</span>
                                </div>
                                {/* THE FIXED BADGE COMPONENT */}
                                <VerificationBadge status={supplier.verified_status} />
                            </div>
                            <button className={`follow-btn ${isFollowing ? 'active' : ''}`} onClick={handleFollow} disabled={isFollowLoading}>
                                {isFollowing ? <FaCheckCircle /> : <FaPlus />} {isFollowing ? "Following" : "Follow"}
                            </button>
                        </div>
                    </header>

                    <div className="toolbar">
                        <div className="search-box">
                            <FaSearch color="#999" />
                            <input type="text" className="search-inp" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #eee' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="newest">Newest</option>
                            <option value="price_low">Low Price</option>
                            <option value="price_high">High Price</option>
                        </select>
                    </div>

                    {latestBig && !searchTerm && (
                        <>
                            <div className="section-h"><FaFire color="orange" /> Latest Additions</div>
                            <div className="latest-wrap">
                                <Link href={`/products/${latestBig.slug}`} className="latest-big">
                                    <img src={getSafeImage(latestBig.image_urls)} className="p-img" alt={latestBig.title} />
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 text-white">
                                        <div className="text-sm truncate">{latestBig.title}</div>
                                        <div className="font-bold text-lg">{formatPrice(latestBig.price)}</div>
                                    </div>
                                </Link>
                                <div className="latest-stack">
                                    {latestSmall.map(p => (
                                        <Link href={`/products/${p.slug}`} key={p.id} className="latest-small">
                                            <img src={getSafeImage(p.image_urls)} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} alt="" />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="title" style={{ height: 'auto', marginBottom: 2 }}>{p.title}</div>
                                                <div className="price" style={{ fontSize: 14 }}>{formatPrice(p.price)}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="section-h"><FaFire color="red" /> Hot Deals</div>
                    <div className="grid">
                        {hotDealProduct && !searchTerm && (
                            <Link href={`/products/${hotDealProduct.slug}`} className="card fade-enter" key={`hot-${hotDealIndex}-${fadeKey}`}>
                                <div className="img-box">
                                    <img src={getSafeImage(hotDealProduct.image_urls)} className="p-img" alt="Hot Deal" />
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">FLASH SALE</div>
                                </div>
                                <div className="info">
                                    <div className="title">{hotDealProduct.title}</div>
                                    <div className="price-box">
                                        <span className="price">{formatPrice(hotDealProduct.price)}</span>
                                        <span className="cut-price">{formatPrice(parseFloat(hotDealProduct.price) * 1.2)}</span>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {gridProducts.map(p => {
                            const price = parseFloat(p.price);
                            const cutPrice = p.discounted_price ? p.price : price * 1.2;
                            const displayPrice = p.discounted_price ? p.discounted_price : p.price;

                            return (
                                <Link href={`/products/${p.slug}`} key={p.id} className="card">
                                    <div className="img-box">
                                        <img src={getSafeImage(p.image_urls)} className="p-img" alt={p.title} onError={(e) => { (e.target as any).src = PLACEHOLDER_IMG }} />
                                    </div>
                                    <div className="info">
                                        <div className="title">{p.title}</div>
                                        <div className="price-box">
                                            <span className="price">{formatPrice(displayPrice)}</span>
                                            <span className="cut-price">{formatPrice(cutPrice)}</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}