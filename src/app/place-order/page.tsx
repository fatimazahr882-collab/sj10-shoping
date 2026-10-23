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
    Sparkles, Zap, PackageCheck, TrendingUp, Check
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
                overflow-y: auto; padding: 20px;
            }
            .sk-container { max-width: 580px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
            .sk-card { background: white; border-radius: 18px; padding: 20px; border: 1px solid #f1f5f9; }
            .sk-line { height: 14px; background: #e2e8f0; border-radius: 6px; }
            .animate-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        `}</style>
        
        <div className="sk-container">
            <div className="sk-card animate-pulse" style={{ height: '110px' }}></div>
            <div className="sk-card animate-pulse" style={{ height: '180px' }}></div>
            <div className="sk-card animate-pulse" style={{ height: '150px' }}></div>
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

    // Financial breakdown
    const deliveryFee = useMemo(() => calculateDeliveryFee(product?.package_information), [product]);
    const commissionFee = useMemo(() => calculateCommission(finalPrice), [finalPrice]);

    // Total base minimum cost to cover all logistics & wholesale
    const totalProductWholesale = finalPrice * quantity;
    const totalDeliveryCharges = deliveryFee; // 1 parcel = 1 delivery fee
    const totalHandlingCharges = commissionFee * quantity;
    const totalBaseCost = totalProductWholesale + totalDeliveryCharges + totalHandlingCharges;

    const userEnteredPrice = Number(sellingPriceInput);
    const calculatedProfit = Math.max(0, userEnteredPrice - totalBaseCost);
    const isPriceValid = sellingPriceInput === '' || userEnteredPrice >= totalBaseCost;
    const isProfitable = userEnteredPrice > totalBaseCost;

    // Reseller profit per single piece
    const profitPerItem = calculatedProfit / quantity;

    // Quick Profit Adder (+200, +500, +1000)
    const handleAddQuickProfit = (extraProfit: number) => {
        const targetPrice = totalBaseCost + (extraProfit * quantity);
        setSellingPriceInput(targetPrice.toString());
    };

    // --- ADD TO CART ---
    const handleAddToCart = async () => {
        if (!product) return;
        if (sellingPriceInput !== '' && userEnteredPrice < totalBaseCost) {
            inputRef.current?.focus();
            return;
        }
        if (!user) {
            router.push(`/auth/login?redirect=${encodeURIComponent(window.location.href)}`);
            return;
        }

        if (cartBtnRef.current) {
            const rect = cartBtnRef.current.getBoundingClientRect();
            setFlyStartPos({ x: rect.left + rect.width / 2, y: rect.top });
            setFlyingAnimation(true);
        }

        setIsProcessing(true);
        
        const realSupplierId = product.supplier_id || product.supplier?.id || null;
        const realBrandName = product.supplier?.brand_name || product.supplier?.name || product.brand_name || 'SJ10 Official';

        const options = { 
            variantId: selectedVariant?.id, 
            color: finalColor, 
            size: finalSize, 
            profit: profitPerItem, // Clean profit per item
            supplier_id: realSupplierId,
            supplier: { id: realSupplierId, brand_name: realBrandName }
        };

        try {
            await addItemToCart(product.id.toString(), quantity, { options, profit: calculatedProfit });
        } catch (error) { 
            setIsProcessing(false); 
            setFlyingAnimation(false); 
        }
    };

    // ==============================================================
    // 🟢 100% FIXED CHECKOUT LOGIC: NO DOUBLE CHARGING!
    // ==============================================================
    const handleCheckout = () => {
        if (!product) return;
        if (sellingPriceInput !== '' && userEnteredPrice < totalBaseCost) {
            inputRef.current?.focus();
            return;
        }
        setIsProcessing(true);

        const realSupplierId = product.supplier_id || product.supplier?.id || null;
        const realBrandName = product.supplier?.brand_name || product.supplier?.name || product.brand_name || 'SJ10 Official';

        // 🛑 KEY FIX: Checkout page takes `price_each` and adds delivery + handling on top of it.
        // Therefore, `price_each` sent to checkout MUST ONLY BE (finalPrice + profitPerItem).
        // It must NOT include delivery or commission!
        const unitPriceForCheckout = finalPrice + profitPerItem;
        
        // Final total payable by customer at doorstep
        const finalCustomerPayable = userEnteredPrice > 0 ? userEnteredPrice : totalBaseCost;

        const options = { 
            variantId: selectedVariant?.id, 
            color: finalColor, 
            size: finalSize, 
            profit: profitPerItem,
            supplier_id: realSupplierId,
            supplier: { id: realSupplierId, brand_name: realBrandName }
        };

        const directItem = {
            productId: product.id,
            product_id: product.id,
            quantity,
            options,
            price: unitPriceForCheckout,
            supplier_id: realSupplierId,
            supplier: {
                id: realSupplierId,
                brand_name: realBrandName
            },
            displayDetails: { 
                title: product.title, 
                image_url: [finalImage], 
                price_each: unitPriceForCheckout, // Pure wholesale + profit per item!
                delivery_fee: deliveryFee,        // Checkout uses this cleanly
                system_commission: commissionFee, // Checkout uses this cleanly
                subtotal: unitPriceForCheckout * quantity,
                brand_name: realBrandName
            }
        };
        
        sessionStorage.setItem('checkoutState', JSON.stringify({ 
            items: [directItem], 
            totalPrice: finalCustomerPayable, 
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
                body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; color: #0f172a; }
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
                    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px);
                    padding: 12px 18px; border-bottom: 1px solid #eef2f6; 
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

                /* SCROLLABLE BODY */
                .scrollable-body {
                    flex: 1;
                    padding: 18px 14px 170px 14px; 
                }
                .body-container {
                    max-width: 580px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* CARDS */
                .po-card {
                    background: #ffffff;
                    border-radius: 18px;
                    padding: 18px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                    border: 1px solid #f1f5f9;
                }
                
                /* PRODUCT ROW */
                .product-row { display: flex; gap: 14px; align-items: center; }
                .img-box { 
                    width: 78px; height: 78px; border-radius: 12px; background: #f8fafc; 
                    position: relative; overflow: hidden; border: 1.5px solid #e2e8f0; flex-shrink: 0;
                }
                .prod-details { flex: 1; min-width: 0; }
                .prod-details h3 { margin: 0 0 6px 0; font-size: 14px; line-height: 1.4; color: #1e293b; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .meta-tags-flex { display: flex; flex-wrap: wrap; gap: 6px; }
                .pill { 
                    display: inline-flex; align-items: center; gap: 4px; background: #f8fafc; 
                    padding: 3px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600; 
                    color: #475569; border: 1px solid #e2e8f0;
                }

                /* QUANTITY */
                .qty-row { display: flex; justify-content: space-between; align-items: center; }
                .qty-lbl { display: flex; align-items: center; gap: 8px; font-weight: 800; color: #1e293b; font-size: 13.5px; }
                .qty-controls { display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 4px; border-radius: 10px; border: 1px solid #e2e8f0; }
                .qty-btn { width: 32px; height: 32px; border: none; background: white; border-radius: 8px; font-weight: 800; color: #334155; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.04); transition: 0.2s; font-size: 15px; }
                .qty-btn:active { transform: scale(0.9); }
                .qty-val { font-size: 14px; font-weight: 800; width: 24px; text-align: center; color: #0f172a; }

                .divider-line { width: 100%; height: 1px; background: #f1f5f9; margin: 16px 0; }

                /* PRICING INPUT */
                .price-input-wrapper { position: relative; margin-top: 10px; }
                .custom-price-input {
                    width: 100%; height: 50px; padding: 0 16px 0 46px; font-size: 17px; font-weight: 800;
                    border: 1.5px solid #e2e8f0; border-radius: 12px; outline: none; transition: 0.2s;
                    background: #f8fafc; color: #0f172a; font-family: monospace;
                }
                .custom-price-input:focus { border-color: #00b862; background: #ffffff; box-shadow: 0 0 0 3px rgba(0, 184, 98, 0.1); }
                .currency-prefix { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: 800; color: #94a3b8; font-size: 14px; }
                
                /* QUICK PROFIT CHIPS */
                .quick-chips-row { display: flex; gap: 8px; margin-top: 10px; align-items: center; }
                .quick-chip {
                    padding: 5px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700;
                    border: 1px solid #cbd5e1; background: #ffffff; color: #475569; cursor: pointer;
                    transition: 0.15s;
                }
                .quick-chip:hover { border-color: #00b862; color: #00b862; background: #f0fdf4; }

                /* PROFIT NOTIFICATION */
                .profit-notification-badge { 
                    margin-top: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; 
                    padding: 12px 14px; border-radius: 12px; display: flex; align-items: center; gap: 12px;
                }
                .profit-icon-circle { background: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; color: #059669; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .profit-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.5px; }
                .profit-amount { font-size: 16px; font-weight: 900; color: #064e3b; }

                .error-box { 
                    color: #dc2626; font-size: 12px; font-weight: 700; margin-top: 10px; 
                    display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #fef2f2; border-radius: 10px; 
                }

                /* COST BREAKDOWN */
                .breakdown-title { margin: 0 0 14px 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.8px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
                .cost-list { display: flex; flex-direction: column; gap: 10px; }
                .cost-row { display: flex; justify-content: space-between; color: #64748b; font-size: 13.5px; font-weight: 500; }
                .cost-val { color: #1e293b; font-weight: 700; }
                .profit-highlight-row { color: #059669; font-weight: 700; }
                .base-cost-total { border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 4px; font-size: 15px; font-weight: 800; color: #0f172a; }

                /* BOTTOM DOCK */
                .po-bottom-dock {
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    background: rgba(255, 255, 255, 0.98) !important;
                    backdrop-filter: blur(15px) !important;
                    -webkit-backdrop-filter: blur(15px) !important;
                    padding: 10px 14px !important;
                    padding-bottom: max(12px, env(safe-area-inset-bottom)) !important;
                    border-top: 1px solid #e2e8f0 !important;
                    box-shadow: 0 -8px 25px rgba(0,0,0,0.08) !important;
                    z-index: 99999 !important;
                }
                .dock-inner-flex { 
                    display: flex; gap: 10px; max-width: 580px; margin: 0 auto; width: 100%;
                }
                .dock-btn {
                    flex: 1; height: 48px; border-radius: 12px; border: none; font-weight: 800; font-size: 14.5px;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: all 0.2s;
                }
                .dock-btn:active { transform: scale(0.97); }
                .btn-add-bag { background: #ffffff; color: #1e293b; border: 1.5px solid #cbd5e1; }
                .btn-add-bag:hover { background: #f8fafc; }
                .btn-checkout-now { 
                    background: #00b862; 
                    color: white; box-shadow: 0 4px 14px rgba(0, 184, 98, 0.35); 
                }
                .btn-checkout-now:hover:not(:disabled) { background: #00a356; }
                .btn-disabled { opacity: 0.5; cursor: not-allowed; }

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

            {/* BURST EFFECT */}
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
                    <h1>Review & Set Reselling Price</h1>
                    <div className="guarantee-sub"><Sparkles size={12} className="text-orange-500"/> Zero-Investment Drop-shipping</div>
                </div>
            </header>

            {/* SCROLLABLE BODY */}
            <div className="scrollable-body">
                <div className="body-container">
                    
                    {/* 1. PRODUCT PREVIEW */}
                    <motion.div initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} className="po-card">
                        <div className="product-row">
                            <div className="img-box">
                                {!imageLoaded && (
                                    <div className="animate-pulse" style={{position:'absolute', inset:0, background:'#cbd5e1'}}/>
                                )}
                                <NextImage 
                                    src={finalImage} alt="Product" fill 
                                    style={{objectFit:'cover', opacity: imageLoaded ? 1 : 0, transition:'0.3s ease-in'}}
                                    onLoad={() => setImageLoaded(true)}
                                />
                            </div>
                            <div className="prod-details">
                                <h3>{product?.title}</h3>
                                <div className="meta-tags-flex">
                                    <span className="pill"><Palette size={12}/> {finalColor}</span>
                                    <span className="pill"><Ruler size={12}/> {finalSize}</span>
                                    <span className="pill" style={{ color: '#059669', borderColor: '#a7f3d0' }}>Wholesale: Rs. {finalPrice}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. QUANTITY & CUSTOMER PRICE */}
                    <motion.div initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{delay:0.05}} className="po-card">
                        <div className="qty-row">
                            <div className="qty-lbl"><PackageCheck size={18} className="text-slate-600"/> Select Quantity</div>
                            <div className="qty-controls">
                                <button className="qty-btn" onClick={() => quantity > 1 && setQuantity(q => q - 1)}>-</button>
                                <span className="qty-val">{quantity}</span>
                                <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
                            </div>
                        </div>
                        
                        <div className="divider-line"></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontWeight: 800, color: '#1e293b', fontSize: '13.5px' }}>
                                Customer Final Price (Cash on Delivery)
                            </label>
                            <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', color: '#64748b', fontWeight: 700 }}>
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

                        {/* Quick Profit Addition Chips */}
                        <div className="quick-chips-row">
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Quick Profit:</span>
                            <button type="button" onClick={() => handleAddQuickProfit(200)} className="quick-chip">+ Rs. 200</button>
                            <button type="button" onClick={() => handleAddQuickProfit(500)} className="quick-chip">+ Rs. 500</button>
                            <button type="button" onClick={() => handleAddQuickProfit(1000)} className="quick-chip">+ Rs. 1000</button>
                        </div>

                        <AnimatePresence>
                            {sellingPriceInput && isProfitable && (
                                <motion.div initial={{height:0, opacity:0, y:-10}} animate={{height:'auto', opacity:1, y:0}} className="profit-notification-badge">
                                    <div className="profit-icon-circle">
                                        <TrendingUp size={16} />
                                    </div>
                                    <div>
                                        <div className="profit-title">Your Net Reseller Profit</div>
                                        <div className="profit-amount">Rs. {calculatedProfit.toLocaleString()}</div>
                                    </div>
                                </motion.div>
                            )}
                            {sellingPriceInput && !isPriceValid && (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="error-box">
                                    <AlertCircle size={15}/> 
                                    <span>Selling price is too low! Minimum required is <strong>Rs. {totalBaseCost}</strong></span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* 3. TRANSPARENT FINANCIAL BREAKDOWN */}
                    <motion.div initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="po-card">
                        <h4 className="breakdown-title">
                            <Banknote size={15}/> Cost & Profit Breakdown
                        </h4>
                        
                        <div className="cost-list">
                            <div className="cost-row">
                                <span>Wholesale Cost ({quantity}x)</span>
                                <span className="cost-val">Rs. {totalProductWholesale.toLocaleString()}</span>
                            </div>
                            <div className="cost-row">
                                <span>Delivery Charges (Courier)</span>
                                <span className="cost-val">Rs. {totalDeliveryCharges.toLocaleString()}</span>
                            </div>
                            <div className="cost-row">
                                <span>Platform / COD Handling</span>
                                <span className="cost-val">Rs. {totalHandlingCharges.toLocaleString()}</span>
                            </div>

                            {calculatedProfit > 0 && (
                                <div className="cost-row profit-highlight-row">
                                    <span>Your Reseller Profit</span>
                                    <span style={{ color: '#059669', fontWeight: 800 }}>+ Rs. {calculatedProfit.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="cost-row base-cost-total">
                                <span>Total Customer Price (COD)</span>
                                <span style={{ color: '#00b862', fontSize: '18px', fontWeight: 900 }}>
                                    Rs. {(userEnteredPrice > 0 ? userEnteredPrice : totalBaseCost).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 4. TRUST BADGES */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', padding: '10px 0', opacity: 0.75 }}>
                        <div style={{ display: 'flex', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', alignItems: 'center' }}>
                            <ShieldCheck size={16} className="text-emerald-500"/> Inspected Quality
                        </div>
                        <div style={{ display: 'flex', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569', alignItems: 'center' }}>
                            <Truck size={16} className="text-blue-500"/> Direct Doorstep COD
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟢 BOTTOM ACTION DOCK */}
            <div className="po-bottom-dock">
                <div className="dock-inner-flex">
                    <button ref={cartBtnRef} className="dock-btn btn-add-bag" onClick={handleAddToCart} disabled={isProcessing}>
                        <ShoppingBag size={17} /> Add to Bag
                    </button>
                    <button 
                        className={`dock-btn btn-checkout-now ${(!isPriceValid && sellingPriceInput) ? 'btn-disabled' : ''}`} 
                        onClick={handleCheckout} 
                        disabled={!isPriceValid || isProcessing}
                    >
                        {isProcessing && !flyingAnimation ? (
                            <Zap className="animate-spin" size={17}/> 
                        ) : (
                            <>Proceed to Checkout <ArrowRight size={17}/></>
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