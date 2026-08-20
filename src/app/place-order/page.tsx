"use client";

import { useEffect, useState, useMemo, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/context/CartContext';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, ArrowLeft, ArrowRight, Truck, ShieldCheck,
    Banknote, Palette, Ruler, AlertCircle, 
    Sparkles, Zap, PackageCheck, Star
} from 'lucide-react';

const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_token') || 
           localStorage.getItem('token') || 
           localStorage.getItem('authToken') ||
           sessionStorage.getItem('user_token');
};

// --- TYPES ---
type Variant = {
    id: string | number;
    product_id: string;
    custom_size?: string;
    custom_color?: string;
    size?: string;
    color?: string;
    price?: number;
    discounted_price?: number;
    sku?: string;
    image_url?: string;
};

type Product = {
    id: string;
    title: string;
    price: number;
    discounted_price: number | null;
    image_urls: string | string[];
    variants: Variant[] | string;
    package_information?: string;
    colors?: string;
    sizes?: string;
    supplier_id?: string;
    supplier?: { id?: string; brand_name?: string; name?: string };
    brand_name?: string;
};

// --- UTILS ---
const cleanData = (input: any) => {
    if (!input || input === 'null' || input === 'undefined') return null;
    return String(input).replace(/[\[\]"]/g, '').trim();
};

const calculateDeliveryFee = (packageInfo: string = "") => {
    const lowerInfo = (packageInfo || "").toLowerCase();
    const kgMatch = lowerInfo.match(/(\d+(\.\d+)?)\s*kg/);
    const gMatch = lowerInfo.match(/(\d+(\.\d+)?)\s*g/);

    let weight = 0.5;
    if (kgMatch) weight = parseFloat(kgMatch[1]);
    else if (gMatch) weight = parseFloat(gMatch[1]) / 1000;

    if (weight <= 0.5) return 200;
    if (weight <= 1.0) return 250;
    if (weight <= 2.0) return 300;
    if (weight <= 5.0) return 450;
    return 450 + (Math.ceil(weight - 5) * 100);
};

const calculateCommission = (price: number) => {
    if (price < 100) return 10;
    if (price < 500) return 15;
    if (price <= 1000) return 25;
    if (price <= 2000) return 35;
    if (price < 3000) return 40;
    if (price < 5000) return 60;
    return 100;
};

const SkeletonLoader = () => (
    <div className="skeleton-overlay">
        <style jsx>{`
            .skeleton-overlay { 
                position: fixed; inset: 0; background: #f8fafc; z-index: 9999; 
                overflow-y: auto; padding-bottom: 120px;
            }
            .sk-container { max-width: 600px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
            .sk-header { display: flex; gap: 15px; align-items: center; margin-bottom: 10px; }
            .sk-circle { width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; }
            .sk-line { height: 10px; background: #e2e8f0; border-radius: 4px; width: 100%; }
            .sk-card { background: white; border-radius: 20px; padding: 20px; display: flex; gap: 15px; border: 1px solid #f1f5f9; }
            .sk-box { width: 80px; height: 80px; background: #e2e8f0; border-radius: 12px; flex-shrink: 0; }
            .sk-content { flex: 1; display: flex; flex-direction: column; gap: 10px; justify-content: center; }
            .animate-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        `}</style>
        
        <div className="sk-container">
            <div className="sk-header animate-pulse">
                <div className="sk-circle"></div>
                <div style={{ width: '150px' }}><div className="sk-line" style={{ height: '18px', marginBottom: '6px' }}></div><div className="sk-line" style={{ width: '60%' }}></div></div>
            </div>
            <div className="sk-card animate-pulse">
                <div className="sk-box"></div>
                <div className="sk-content">
                    <div className="sk-line" style={{ height: '16px', width: '85%' }}></div>
                    <div className="sk-line" style={{ height: '14px', width: '60%' }}></div>
                </div>
            </div>
            <div className="sk-card animate-pulse" style={{ height: '120px' }}></div>
            <div className="sk-card animate-pulse" style={{ height: '160px' }}></div>
        </div>
    </div>
);

function PlaceOrderContent() {
    const router = useRouter();
    const { user } = useAuth();
    const { addItemToCart } = useCart();
    const searchParams = useSearchParams();

    // --- STATE ---
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    // Animation States
    const [isProcessing, setIsProcessing] = useState(false);
    const [flyingAnimation, setFlyingAnimation] = useState(false);
    const [flyStartPos, setFlyStartPos] = useState({ x: 0, y: 0 });
    const [cartBurst, setCartBurst] = useState(false);

    // Data States
    const [quantity, setQuantity] = useState(1);
    const [sellingPriceInput, setSellingPriceInput] = useState(''); 
    const inputRef = useRef<HTMLInputElement>(null);
    const cartBtnRef = useRef<HTMLButtonElement>(null);

    // --- FETCH PRODUCT ---
    useEffect(() => {
        const productId = searchParams.get('productId');
        if (!productId) { router.push('/'); return; }

        const fetchProductData = async () => {
            setLoading(true);
            try {
                const token = getToken();
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/${productId}`, { headers });
                if (!res.ok) throw new Error("Failed to load product");

                const data: Product = await res.json();
                if (typeof data.variants === 'string') {
                    try { data.variants = JSON.parse(data.variants); } catch (e) { data.variants = []; }
                }
                setProduct(data);
            } catch (error) {
                console.error("Fetch Product Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [searchParams, router]);

    // Selected Variant
    const selectedVariant = useMemo(() => {
        const variantIdParam = searchParams.get('variantId');
        if (!product || !variantIdParam || !Array.isArray(product.variants)) return null;
        return product.variants.find((v) => String(v.id) === String(variantIdParam)) || null;
    }, [product, searchParams]);

    // Financial calculations
    const { finalPrice, finalColor, finalSize, finalImage } = useMemo(() => {
        let price = Number(product?.discounted_price || product?.price || 0);
        let color = cleanData(product?.colors) || "Standard";
        let size = cleanData(product?.sizes) || "Standard";
        let image = '/placeholder.png';

        if (product?.image_urls) {
            try {
                const raw = product.image_urls;
                const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                image = Array.isArray(parsed) ? parsed[0] : parsed;
            } catch (e) { image = product.image_urls as string; }
        }

        if (selectedVariant) {
            price = Number(selectedVariant.discounted_price || selectedVariant.price || price);
            if (selectedVariant.image_url) image = selectedVariant.image_url;
            const vColor = cleanData(selectedVariant.custom_color) || cleanData(selectedVariant.color);
            if (vColor && vColor !== 'null') color = vColor;
            const vSize = cleanData(selectedVariant.custom_size) || cleanData(selectedVariant.size);
            if (vSize && vSize !== 'null') size = vSize;
        }

        return { finalPrice: price, finalColor: color, finalSize: size, finalImage: image };
    }, [product, selectedVariant]);

    const deliveryFee = useMemo(() => calculateDeliveryFee(product?.package_information), [product]);
    const commissionFee = useMemo(() => calculateCommission(finalPrice), [finalPrice]);
    const baseCostPerItem = finalPrice + deliveryFee + commissionFee;
    const totalBaseCost = baseCostPerItem * quantity;

    const userEnteredPrice = Number(sellingPriceInput);
    const calculatedProfit = userEnteredPrice - totalBaseCost;
    const isPriceValid = sellingPriceInput === '' || userEnteredPrice >= totalBaseCost;
    const isProfitable = userEnteredPrice > totalBaseCost;

    // --- ACTIONS ---
    const handleAddToCart = async () => {
        if (!product) return;
        if (sellingPriceInput !== '' && userEnteredPrice < totalBaseCost) {
            inputRef.current?.focus();
            return;
        }
        if (!user) {
            router.push(`/auth?view=login&redirect=${encodeURIComponent(window.location.href)}`);
            return;
        }

        if (cartBtnRef.current) {
            const rect = cartBtnRef.current.getBoundingClientRect();
            setFlyStartPos({ x: rect.left + rect.width / 2, y: rect.top });
            setFlyingAnimation(true);
        }

        setIsProcessing(true);
        const finalProfit = (userEnteredPrice || totalBaseCost) - totalBaseCost;
        
        const realSupplierId = product.supplier_id || product.supplier?.id || null;
        const realBrandName = product.supplier?.brand_name || product.supplier?.name || product.brand_name || 'SJ10 Official';

        const options = { 
            variantId: selectedVariant?.id, 
            color: finalColor, 
            size: finalSize, 
            profit: finalProfit / quantity,
            supplier_id: realSupplierId,
            supplier: { id: realSupplierId, brand_name: realBrandName }
        };

        try {
            await addItemToCart(product.id.toString(), quantity, { options, profit: finalProfit });
        } catch (error) { 
            setIsProcessing(false); 
            setFlyingAnimation(false); 
        }
    };

    const handleCheckout = () => {
        if (!product) return;
        if (sellingPriceInput !== '' && userEnteredPrice < totalBaseCost) {
            inputRef.current?.focus();
            return;
        }
        setIsProcessing(true);
        const finalSellingPrice = userEnteredPrice || totalBaseCost;
        const finalProfit = finalSellingPrice - totalBaseCost;
        
        const realSupplierId = product.supplier_id || product.supplier?.id || null;
        const realBrandName = product.supplier?.brand_name || product.supplier?.name || product.brand_name || 'SJ10 Official';
        
        const options = { 
            variantId: selectedVariant?.id, 
            color: finalColor, 
            size: finalSize, 
            profit: finalProfit / quantity,
            supplier_id: realSupplierId,
            supplier: { id: realSupplierId, brand_name: realBrandName }
        };

        const directItem = {
            productId: product.id,
            product_id: product.id,
            quantity,
            options,
            supplier_id: realSupplierId,
            supplier: {
                id: realSupplierId,
                brand_name: realBrandName
            },
            displayDetails: { 
                title: product.title, 
                image_url: [finalImage], 
                price_each: finalSellingPrice / quantity, 
                base_cost: totalBaseCost, 
                user_profit: finalProfit, 
                subtotal: finalSellingPrice,
                delivery_fee: deliveryFee * quantity,
                system_commission: commissionFee * quantity,
                brand_name: realBrandName
            }
        };
        
        sessionStorage.setItem('checkoutState', JSON.stringify({ 
            items: [directItem], 
            totalPrice: finalSellingPrice, 
            isDirectBuy: true 
        }));
        router.push('/checkout');
    };

    const onAnimationComplete = () => {
        setFlyingAnimation(false);
        setCartBurst(true);
        setTimeout(() => {
            setCartBurst(false);
            setIsProcessing(false);
            router.push('/cart');
        }, 500);
    };

    if (loading) return <SkeletonLoader />;

    return (
        <div className="place-order-root">
            <style jsx global>{`
                body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; }
                * { box-sizing: border-box; }
            `}</style>
            
            <style jsx>{`
                .place-order-root {
                    min-height: 100vh;
                    background-color: #f8fafc;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                
                /* HEADER */
                .po-header {
                    position: sticky; top: 0; z-index: 100;
                    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
                    padding: 12px 16px; border-bottom: 1px solid #eef2f6; 
                    display: flex; align-items: center; gap: 14px;
                }
                .back-btn-pill {
                    width: 38px; height: 38px; border-radius: 50%; border: 1px solid #e2e8f0; background: #f1f5f9;
                    display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1e293b;
                    transition: 0.2s; flex-shrink: 0;
                }
                .back-btn-pill:hover { background: #e2e8f0; }
                .po-title-block h1 { margin: 0; font-size: 17px; font-weight: 800; color: #0f172a; }
                .guarantee-sub { font-size: 11.5px; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 4px; margin-top: 2px; }

                /* SCROLLABLE CONTENT */
                .scrollable-body {
                    flex: 1;
                    padding: 20px 14px 180px 14px; 
                }
                .body-container {
                    max-width: 600px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* CARDS */
                .po-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                    border: 1px solid #f1f5f9;
                }
                
                /* PRODUCT */
                .product-row { display: flex; gap: 16px; align-items: center; }
                .img-box { 
                    width: 80px; height: 80px; border-radius: 12px; background: #f8fafc; 
                    position: relative; overflow: hidden; border: 1.5px solid #e2e8f0; flex-shrink: 0;
                }
                .prod-details { flex: 1; min-width: 0; }
                .prod-details h3 { margin: 0 0 8px 0; font-size: 14px; line-height: 1.4; color: #1e293b; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .pill { 
                    display: inline-flex; align-items: center; gap: 4px; background: #f8fafc; 
                    padding: 4px 10px; border-radius: 8px; font-size: 11.5px; font-weight: 600; 
                    color: #475569; border: 1px solid #e2e8f0; margin-right: 8px; 
                }

                /* QUANTITY & PRICING */
                .qty-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .qty-lbl { display: flex; align-items: center; gap: 8px; font-weight: 800; color: #1e293b; font-size: 14px; }
                .qty-controls { display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 4px; border-radius: 12px; border: 1px solid #e2e8f0; }
                .qty-btn { width: 34px; height: 34px; border: none; background: white; border-radius: 8px; font-weight: 700; color: #334155; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.04); transition: 0.2s; }
                .qty-btn:active { transform: scale(0.9); }
                .qty-val { font-size: 14px; font-weight: 800; width: 25px; text-align: center; color: #0f172a; }

                .divider-line { width: 100%; height: 1px; background: #f1f5f9; margin: 16px 0; }

                .price-input-wrapper { position: relative; margin-top: 10px; }
                .custom-price-input {
                    width: 100%; height: 50px; padding: 0 16px 0 46px; font-size: 16px; font-weight: 800;
                    border: 1.5px solid #e2e8f0; border-radius: 14px; outline: none; transition: 0.2s;
                    background: #f8fafc; color: #0f172a; font-family: monospace;
                }
                .custom-price-input:focus { border-color: #00b862; background: #ffffff; box-shadow: 0 0 0 3px rgba(0, 184, 98, 0.1); }
                .currency-prefix { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: 800; color: #94a3b8; font-size: 14px; }
                
                .profit-notification-badge { 
                    margin-top: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; 
                    padding: 12px 16px; border-radius: 14px; display: flex; align-items: center; gap: 12px;
                }
                .profit-icon-circle { background: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: #059669; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .profit-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.5px; }
                .profit-amount { font-size: 16px; font-weight: 900; color: #064e3b; }

                .error-box { 
                    color: #dc2626; font-size: 12px; font-weight: 700; margin-top: 10px; 
                    display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #fef2f2; border-radius: 12px; 
                }

                /* 🟢 FIXED: COST BREAKDOWN PROPER STYLING */
                .breakdown-title { margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.8px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
                .cost-list { display: flex; flex-direction: column; gap: 12px; } /* BUG FIXED HERE */
                .cost-row { display: flex; justify-content: space-between; color: #64748b; font-size: 14px; font-weight: 500; }
                .cost-val { color: #1e293b; font-weight: 700; }
                .base-cost-total { border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 4px; font-size: 15px; font-weight: 800; color: #0f172a; }

                /* 🟢 FIXED BOTTOM ACTION DOCK (PREMIUM UI) */
                .po-bottom-dock {
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    background: rgba(255, 255, 255, 0.98) !important;
                    backdrop-filter: blur(15px) !important;
                    -webkit-backdrop-filter: blur(15px) !important;
                    padding: 12px 16px !important;
                    padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important;
                    border-top: 1px solid #e2e8f0 !important;
                    box-shadow: 0 -8px 25px rgba(0,0,0,0.08) !important;
                    z-index: 99999 !important;
                }
                .dock-inner-flex { 
                    display: flex; gap: 12px; max-width: 600px; margin: 0 auto; width: 100%;
                }
                .dock-btn {
                    flex: 1; height: 50px; border-radius: 14px; border: none; font-weight: 800; font-size: 15px;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: all 0.2s;
                }
                .dock-btn:active { transform: scale(0.97); }
                .btn-add-bag { background: #ffffff; color: #1e293b; border: 1.5px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .btn-add-bag:hover { background: #f8fafc; border-color: #cbd5e1; }
                .btn-checkout-now { 
                    background: linear-gradient(135deg, #00b862 0%, #009952 100%); 
                    color: white; box-shadow: 0 4px 14px rgba(0, 184, 98, 0.35); 
                }
                .btn-checkout-now:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 184, 98, 0.4); }
                .btn-disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(1); box-shadow: none; }

                /* FLYING & BURST ANIMATIONS */
                .fly-icon { 
                    position: fixed; z-index: 100000; color: #f85606; pointer-events: none; 
                    filter: drop-shadow(0 4px 8px rgba(248, 86, 6, 0.4));
                }
                .burst-effect {
                    position: fixed; top: 15px; right: 15px; z-index: 100001; pointer-events: none;
                }
            `}</style>

            {/* FLYING BAG ANIMATION */}
            <AnimatePresence>
                {flyingAnimation && (
                    <motion.div
                        initial={{ x: flyStartPos.x, y: flyStartPos.y, scale: 1, rotate: 0 }}
                        animate={{ x: window.innerWidth - 40, y: 20, scale: 0.4, rotate: 360 }}
                        transition={{ duration: 0.9, ease: "easeInOut" }}
                        onAnimationComplete={onAnimationComplete}
                        className="fly-icon"
                    >
                        <ShoppingBag size={28} fill="currentColor" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BURST EXPLOSION AT TOP RIGHT */}
            <AnimatePresence>
                {cartBurst && (
                    <motion.div 
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="burst-effect"
                    >
                        <div style={{width:'40px', height:'40px', background:'#4f46e5', borderRadius:'50%'}}></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <header className="po-header">
                <button className="back-btn-pill" onClick={() => router.back()} type="button">
                    <ArrowLeft size={18}/>
                </button>
                <div className="po-title-block">
                    <h1>Review & Set Price</h1>
                    <div className="guarantee-sub"><Sparkles size={12} className="text-orange-500"/> Customize Reseller Profit</div>
                </div>
            </header>

            {/* SCROLLABLE CONTENT */}
            <div className="scrollable-body">
                <div className="body-container">
                    
                    {/* 1. PRODUCT CARD */}
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="po-card">
                        <div className="product-row">
                            <div className="img-box">
                                {!imageLoaded && (
                                    <div className="animate-pulse" style={{position:'absolute', inset:0, background:'#cbd5e1'}}/>
                                )}
                                <NextImage 
                                    src={finalImage} alt="Product" fill 
                                    style={{objectFit:'cover', opacity: imageLoaded ? 1 : 0, transition:'0.4s ease-in'}}
                                    onLoad={() => setImageLoaded(true)}
                                />
                            </div>
                            <div className="prod-details">
                                <h3>{product?.title}</h3>
                                <div>
                                    <span className="pill"><Palette size={12}/> {finalColor}</span>
                                    <span className="pill"><Ruler size={12}/> {finalSize}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. QUANTITY & CUSTOMER PRICE CARD */}
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="po-card">
                        <div className="qty-row">
                            <div className="qty-lbl"><PackageCheck size={20} className="text-slate-600"/> Quantity</div>
                            <div className="qty-controls">
                                <button className="qty-btn" onClick={() => quantity > 1 && setQuantity(q => q - 1)}>-</button>
                                <span className="qty-val">{quantity}</span>
                                <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
                            </div>
                        </div>
                        
                        <div className="divider-line"></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontWeight: 800, color: '#1e293b', fontSize: '14px' }}>Customer Selling Price</label>
                            <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', color: '#64748b', fontWeight: 700 }}>
                                Min: Rs. {totalBaseCost}
                            </span>
                        </div>
                        
                        <div className="price-input-wrapper">
                            <span className="currency-prefix">Rs.</span>
                            <input 
                                ref={inputRef}
                                type="number" 
                                className="custom-price-input"
                                style={!isPriceValid ? {borderColor:'#fca5a5', background:'#fef2f2', color:'#b91c1c'} : isProfitable ? {borderColor:'#34d399', background:'#f0fdf4', color:'#065f46'} : {}}
                                placeholder={totalBaseCost.toString()}
                                value={sellingPriceInput}
                                onChange={(e) => setSellingPriceInput(e.target.value)}
                            />
                        </div>

                        <AnimatePresence>
                            {sellingPriceInput && isProfitable && (
                                <motion.div initial={{height:0, opacity:0, y:-10}} animate={{height:'auto', opacity:1, y:0}} className="profit-notification-badge">
                                    <div className="profit-icon-circle">
                                        <Star size={16} fill="currentColor"/>
                                    </div>
                                    <div>
                                        <div className="profit-title">Your Reseller Net Profit</div>
                                        <div className="profit-amount">Rs. {calculatedProfit.toLocaleString()}</div>
                                    </div>
                                </motion.div>
                            )}
                            {sellingPriceInput && !isPriceValid && (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="error-box">
                                    <AlertCircle size={16}/> 
                                    <span>Price too low. Minimum allowed is <strong>Rs. {totalBaseCost}</strong></span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* 3. COST BREAKDOWN */}
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="po-card">
                        <h4 className="breakdown-title">
                            <Banknote size={16}/> Base Cost Breakdown
                        </h4>
                        
                        {/* 🟢 THE FIX IS HERE: flex-direction: column in CSS now works perfectly */}
                        <div className="cost-list">
                            <div className="cost-row">
                                <span>Wholesale Price</span><span className="cost-val">Rs. {(finalPrice * quantity).toLocaleString()}</span>
                            </div>
                            <div className="cost-row">
                                <span>Delivery Fee</span><span className="cost-val">Rs. {(deliveryFee * quantity).toLocaleString()}</span>
                            </div>
                            <div className="cost-row">
                                <span>Platform / Handling Fee</span><span className="cost-val">Rs. {(commissionFee * quantity).toLocaleString()}</span>
                            </div>
                            <div className="cost-row base-cost-total">
                                <span>Total Minimum Cost</span><span>Rs. {totalBaseCost.toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 4. TRUST BADGES */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', padding: '10px 0', opacity: 0.7 }}>
                        <div style={{ display: 'flex', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', alignItems: 'center' }}>
                            <ShieldCheck size={16} className="text-emerald-500"/> 100% Safe COD
                        </div>
                        <div style={{ display: 'flex', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', alignItems: 'center' }}>
                            <Truck size={16} className="text-blue-500"/> Fast Delivery
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟢 FIXED BOTTOM ACTION DOCK (ALWAYS VISIBLE, BEAUTIFUL UI) */}
            <div className="po-bottom-dock">
                <div className="dock-inner-flex">
                    <button ref={cartBtnRef} className="dock-btn btn-add-bag" onClick={handleAddToCart} disabled={isProcessing}>
                        <ShoppingBag size={18} /> Add to Cart
                    </button>
                    <button 
                        className={`dock-btn btn-checkout-now ${(!isPriceValid && sellingPriceInput) ? 'btn-disabled' : ''}`} 
                        onClick={handleCheckout} 
                        disabled={!isPriceValid || isProcessing}
                    >
                        {isProcessing && !flyingAnimation ? (
                            <Zap className="animate-spin" size={18}/> 
                        ) : (
                            <>Proceed <ArrowRight size={18}/></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PlaceOrderPage() {
    return (
        <Suspense fallback={<SkeletonLoader />}>
            <PlaceOrderContent />
        </Suspense>
    );
}