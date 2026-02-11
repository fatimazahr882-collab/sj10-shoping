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
    Sparkles, Zap, PackageCheck, Info, Star, Check
} from 'lucide-react';

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

// --- CENTERED SKELETON LOADER ---
const SkeletonLoader = () => (
    <div className="skeleton-overlay">
        <style jsx>{`
            .skeleton-overlay { 
                position: fixed; inset: 0; background: #f8fafc; z-index: 9999; 
                overflow-y: auto; padding-bottom: 100px;
            }
            .sk-container { max-width: 600px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
            
            /* Header Mockup */
            .sk-header { display: flex; gap: 15px; align-items: center; margin-bottom: 10px; }
            .sk-circle { width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; }
            .sk-line { height: 10px; background: #e2e8f0; border-radius: 4px; width: 100%; }

            /* Card Mockup */
            .sk-card { background: white; border-radius: 24px; padding: 20px; display: flex; gap: 15px; border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            .sk-box { width: 90px; height: 90px; background: #e2e8f0; border-radius: 16px; flex-shrink: 0; }
            .sk-content { flex: 1; display: flex; flex-direction: column; gap: 12px; justify-content: center; }
            
            .animate-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        `}</style>
        
        <div className="sk-container">
            {/* Header */}
            <div className="sk-header animate-pulse">
                <div className="sk-circle"></div>
                <div style={{width: '150px'}}><div className="sk-line" style={{height:'20px', marginBottom:'8px'}}></div><div className="sk-line" style={{width:'60%'}}></div></div>
            </div>

            {/* Product Card - EXACTLY MATCHES CONTENT LAYOUT */}
            <div className="sk-card animate-pulse">
                <div className="sk-box"></div>
                <div className="sk-content">
                    <div className="sk-line" style={{height:'18px', width:'90%'}}></div>
                    <div className="sk-line" style={{height:'18px', width:'70%'}}></div>
                    <div style={{display:'flex', gap:'10px', marginTop:'5px'}}>
                        <div className="sk-line" style={{width:'50px', height:'20px', borderRadius:'8px'}}></div>
                        <div className="sk-line" style={{width:'50px', height:'20px', borderRadius:'8px'}}></div>
                    </div>
                </div>
            </div>

            {/* Price Card */}
            <div className="sk-card animate-pulse" style={{flexDirection:'column'}}>
                 <div style={{display:'flex', justifyContent:'space-between'}}>
                    <div className="sk-line" style={{width:'100px'}}></div>
                    <div className="sk-line" style={{width:'80px'}}></div>
                 </div>
                 <div className="sk-line" style={{height:'50px', borderRadius:'16px', marginTop:'10px'}}></div>
            </div>

            {/* Summary Card */}
            <div className="sk-card animate-pulse" style={{flexDirection:'column', gap:'15px'}}>
                <div className="sk-line" style={{width:'120px', marginBottom:'5px'}}></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><div className="sk-line" style={{width:'30%'}}></div><div className="sk-line" style={{width:'20%'}}></div></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><div className="sk-line" style={{width:'30%'}}></div><div className="sk-line" style={{width:'20%'}}></div></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><div className="sk-line" style={{width:'30%'}}></div><div className="sk-line" style={{width:'20%'}}></div></div>
            </div>
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
    const [cartBurst, setCartBurst] = useState(false); // New Explosion State

    // Data States
    const [quantity, setQuantity] = useState(1);
    const [sellingPriceInput, setSellingPriceInput] = useState(''); 
    const inputRef = useRef<HTMLInputElement>(null);
    const cartBtnRef = useRef<HTMLButtonElement>(null);

    // --- FETCH ---
    useEffect(() => {
        const productId = searchParams.get('productId');
        if (!productId) { router.push('/'); return; }

        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Short wait to ensure DOM is ready for skeleton transition
                await new Promise(r => setTimeout(r, 100)); 
                const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/${productId}`);
                if (!res.ok) throw new Error("Failed");
                const data: Product = await res.json();
                if (typeof data.variants === 'string') {
                    try { data.variants = JSON.parse(data.variants); } 
                    catch (e) { data.variants = []; }
                }
                setProduct(data);
            } catch (error) {
                console.error(error);
                router.back();
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [searchParams, router]);

    // --- CALCULATIONS ---
    const selectedVariant = useMemo(() => {
        const variantIdParam = searchParams.get('variantId');
        if (!product || !variantIdParam || !Array.isArray(product.variants)) return null;
        return product.variants.find((v) => v.id == variantIdParam) || null;
    }, [product, searchParams]);

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

        // 1. Start Flying Animation
        if (cartBtnRef.current) {
            const rect = cartBtnRef.current.getBoundingClientRect();
            setFlyStartPos({ x: rect.left + rect.width / 2, y: rect.top });
            setFlyingAnimation(true);
        }

        setIsProcessing(true);
        const finalProfit = (userEnteredPrice || totalBaseCost) - totalBaseCost;
        const options = { variantId: selectedVariant?.id, color: finalColor, size: finalSize, profit: finalProfit / quantity };

        try {
            await addItemToCart(product.id.toString(), quantity, { options, profit: finalProfit });
            // Animation is handling the delay visually
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
        const options = { variantId: selectedVariant?.id, color: finalColor, size: finalSize, profit: finalProfit / quantity };
        
        const directItem = {
            productId: product.id, quantity, options,
            displayDetails: { title: product.title, image_url: [finalImage], price_each: finalSellingPrice / quantity, base_cost: totalBaseCost, user_profit: finalProfit, subtotal: finalSellingPrice }
        };
        sessionStorage.setItem('checkoutState', JSON.stringify({ items: [directItem], totalPrice: finalSellingPrice, isDirectBuy: true }));
        router.push('/checkout');
    };

    // Callback when bag reaches top right
    const onAnimationComplete = () => {
        setFlyingAnimation(false);
        setCartBurst(true); // Trigger explosion
        setTimeout(() => {
            setCartBurst(false);
            setIsProcessing(false);
            router.push('/cart');
        }, 600);
    };

    if (loading) return <SkeletonLoader />;

    return (
        <div className="page-wrapper">
            <style jsx global>{`
                body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #f8fafc; }
                * { box-sizing: border-box; }
            `}</style>
            
            <style jsx>{`
                .page-wrapper {
                    position: fixed; inset: 0; z-index: 9999;
                    background-color: #f8fafc; display: flex; flex-direction: column;
                }
                
                /* HEADER */
                .header {
                    background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
                    padding: 15px 20px; border-bottom: 1px solid #f1f5f9; 
                    display: flex; align-items: center; gap: 15px; flex-shrink: 0;
                }
                .back-btn {
                    width: 44px; height: 44px; border-radius: 50%; border: 1px solid #e2e8f0; background: white;
                    display: flex; align-items: center; justify-content: center; cursor: pointer; color: #334155;
                    transition: 0.2s;
                }
                .back-btn:active { transform: scale(0.9); background: #f1f5f9; }
                .header-title h1 { margin: 0; font-size: 1.2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
                .guarantee { font-size: 0.75rem; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 4px; }

                /* CONTENT */
                .content-scroll { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 140px; }
                .container { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }

                /* CARDS */
                .card { background: white; border-radius: 28px; padding: 22px; box-shadow: 0 8px 30px -5px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
                
                /* PRODUCT */
                .product-row { display: flex; gap: 18px; }
                .img-wrapper { 
                    width: 100px; height: 100px; border-radius: 20px; background: #f1f5f9; 
                    position: relative; overflow: hidden; border: 1px solid #e2e8f0; flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .prod-details h3 { margin: 0 0 10px 0; font-size: 1rem; line-height: 1.4; color: #1e293b; font-weight: 700; }
                .pill { 
                    display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; 
                    padding: 5px 12px; border-radius: 10px; font-size: 0.75rem; font-weight: 700; 
                    color: #3b82f6; border: 1px solid #dbeafe; margin-right: 8px; 
                }

                /* INPUTS */
                .qty-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .qty-label { display: flex; align-items: center; gap: 8px; font-weight: 800; color: #334155; font-size: 0.95rem; }
                .qty-control { display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 6px; border-radius: 14px; border: 1px solid #e2e8f0; }
                .qty-btn { width: 36px; height: 36px; border: none; background: white; border-radius: 10px; font-weight: bold; color: #334155; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); transition: 0.2s; }
                .qty-btn:active { transform: scale(0.9); }
                .qty-val { font-size: 1.1rem; font-weight: 800; width: 30px; text-align: center; color: #0f172a; }

                .price-group { position: relative; margin-top: 10px; }
                .price-input {
                    width: 100%; padding: 18px 18px 18px 55px; font-size: 1.3rem; font-weight: 800;
                    border: 2px solid #e2e8f0; border-radius: 18px; outline: none; transition: 0.3s;
                    background: #fff; color: #0f172a; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                }
                .price-input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
                .currency { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); font-weight: 800; color: #cbd5e1; font-size: 1.2rem; }
                
                .profit-badge { 
                    margin-top: 12px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); 
                    border: 1px solid #a7f3d0; color: #047857; padding: 14px; border-radius: 16px; 
                    display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.1);
                }
                .error-msg { 
                    color: #ef4444; font-size: 0.85rem; font-weight: 700; margin-top: 10px; 
                    display: flex; align-items: center; gap: 6px; padding: 10px; background: #fef2f2; border-radius: 12px; 
                }

                /* BOTTOM DOCK */
                .bottom-dock {
                    background: rgba(255,255,255,0.95); backdrop-filter: blur(15px);
                    padding: 15px 20px; border-top: 1px solid #f1f5f9;
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.06);
                    padding-bottom: max(20px, env(safe-area-inset-bottom));
                }
                .dock-inner { display: flex; gap: 15px; max-width: 600px; margin: 0 auto; }
                .btn {
                    flex: 1; padding: 18px; border-radius: 18px; border: none; font-weight: 800; font-size: 1rem;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
                    transition: transform 0.1s; letter-spacing: -0.3px;
                }
                .btn:active { transform: scale(0.96); }
                .btn-secondary { background: white; color: #334155; border: 2px solid #f1f5f9; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
                .btn-primary { 
                    background: linear-gradient(135deg, #0f172a 0%, #334155 100%); 
                    color: white; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25); 
                }
                .btn-disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(1); }

                /* FLYING & BURST ANIMATIONS */
                .fly-icon { 
                    position: fixed; z-index: 10000; color: #4f46e5; pointer-events: none; 
                    filter: drop-shadow(0 4px 8px rgba(79, 70, 229, 0.4));
                }
                .burst-effect {
                    position: fixed; top: 15px; right: 15px; z-index: 10001; pointer-events: none;
                }
            `}</style>

            {/* FLYING BAG ANIMATION (CURVED PATH) */}
            <AnimatePresence>
                {flyingAnimation && (
                    <motion.div
                        initial={{ x: flyStartPos.x, y: flyStartPos.y, scale: 1, rotate: 0 }}
                        animate={{ 
                            x: window.innerWidth - 40, // Target Right (Cart Icon Area)
                            y: 20, // Target Top
                            scale: 0.4, 
                            rotate: 360
                        }}
                        transition={{ 
                            duration: 1.5, // SLOW & SMOOTH
                            ease: "easeInOut", // Smooth curve feel
                        }}
                        onAnimationComplete={onAnimationComplete}
                        className="fly-icon"
                    >
                        <ShoppingBag size={32} fill="currentColor" />
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
            <header className="header">
                <button className="back-btn" onClick={() => router.back()}>
                    <ArrowLeft size={22}/>
                </button>
                <div className="header-title">
                    <h1>Review Order</h1>
                    <div className="guarantee"><Sparkles size={12} className="text-indigo-500"/> Best Price Guaranteed</div>
                </div>
            </header>

            {/* SCROLLABLE CONTENT */}
            <div className="content-scroll">
                <div className="container">
                    
                    {/* PRODUCT CARD */}
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="card">
                        <div className="product-row">
                            <div className="img-wrapper">
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

                    {/* PRICING & QTY CARD */}
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="card">
                        <div className="qty-row">
                            <div className="qty-label"><PackageCheck size={20} className="text-slate-600"/> Quantity</div>
                            <div className="qty-control">
                                <button className="qty-btn" onClick={() => quantity > 1 && setQuantity(q => q - 1)}>-</button>
                                <span className="qty-val">{quantity}</span>
                                <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
                            </div>
                        </div>
                        
                        <div style={{width:'100%', height:'1px', background:'#f1f5f9', margin:'20px 0'}}></div>

                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'10px'}}>
                            <label style={{fontWeight:'800', color:'#1e293b', fontSize:'0.95rem'}}>Customer Price</label>
                            <span style={{fontSize:'0.75rem', background:'#f1f5f9', padding:'4px 8px', borderRadius:'6px', color:'#64748b', fontWeight:'600', border:'1px solid #e2e8f0'}}>
                                Min: Rs. {totalBaseCost}
                            </span>
                        </div>
                        
                        <div className="price-group">
                            <span className="currency">Rs.</span>
                            <input 
                                ref={inputRef}
                                type="number" 
                                className="price-input"
                                style={!isPriceValid ? {borderColor:'#fca5a5', background:'#fef2f2', color:'#b91c1c'} : isProfitable ? {borderColor:'#34d399', background:'#f0fdf4', color:'#065f46'} : {}}
                                placeholder={totalBaseCost.toString()}
                                value={sellingPriceInput}
                                onChange={(e) => setSellingPriceInput(e.target.value)}
                            />
                        </div>

                        <AnimatePresence>
                            {sellingPriceInput && isProfitable && (
                                <motion.div initial={{height:0, opacity:0, y:-10}} animate={{height:'auto', opacity:1, y:0}} className="profit-badge">
                                    <div style={{background:'white', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
                                        <Star size={16} className="text-emerald-500" fill="currentColor"/>
                                    </div>
                                    <div>
                                        <div style={{fontSize:'0.7rem', fontWeight:'800', textTransform:'uppercase', color:'#059669', letterSpacing:'0.5px'}}>Your Net Profit</div>
                                        <div style={{fontSize:'1.1rem', fontWeight:'900', color:'#064e3b'}}>Rs. {calculatedProfit.toLocaleString()}</div>
                                    </div>
                                </motion.div>
                            )}
                            {sellingPriceInput && !isPriceValid && (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="error-msg">
                                    <AlertCircle size={18} className="text-red-500"/> 
                                    <span>Price too low. Minimum is <strong>Rs. {totalBaseCost}</strong></span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* SUMMARY CARD */}
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="card">
                        <h4 style={{margin:'0 0 18px 0', fontSize:'0.8rem', textTransform:'uppercase', color:'#94a3b8', letterSpacing:'1px', fontWeight:'800', display:'flex', alignItems:'center', gap:'8px'}}>
                            <Banknote size={16}/> Cost Breakdown
                        </h4>
                        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', color:'#64748b', fontSize:'0.9rem', fontWeight:'500'}}>
                                <span>Wholesale Price</span><span style={{color:'#334155', fontWeight:'700'}}>Rs. {(finalPrice * quantity).toLocaleString()}</span>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', color:'#64748b', fontSize:'0.9rem', fontWeight:'500'}}>
                                <span>Delivery Fee</span><span style={{color:'#334155', fontWeight:'700'}}>Rs. {(deliveryFee * quantity).toLocaleString()}</span>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', color:'#64748b', fontSize:'0.9rem', fontWeight:'500'}}>
                                <span>Platform Fee</span><span style={{color:'#334155', fontWeight:'700'}}>Rs. {(commissionFee * quantity).toLocaleString()}</span>
                            </div>
                            <div style={{borderTop:'1px dashed #cbd5e1', paddingTop:'15px', marginTop:'5px', display:'flex', justifyContent:'space-between', fontSize:'1rem', fontWeight:'800', color:'#0f172a'}}>
                                <span>Total Base Cost</span><span>Rs. {totalBaseCost.toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* BADGES */}
                    <div style={{display:'flex', justifyContent:'center', gap:'25px', opacity:0.7, paddingBottom:'20px'}}>
                        <div style={{display:'flex', gap:'6px', fontSize:'0.75rem', fontWeight:'700', color:'#475569', alignItems:'center', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                            <ShieldCheck size={16} className="text-emerald-500"/> Secure Checkout
                        </div>
                        <div style={{display:'flex', gap:'6px', fontSize:'0.75rem', fontWeight:'700', color:'#475569', alignItems:'center', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                            <Truck size={16} className="text-blue-500"/> Fast Delivery
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM DOCK */}
            <div className="bottom-dock">
                <div className="dock-inner">
                    <button ref={cartBtnRef} className="btn btn-secondary" onClick={handleAddToCart} disabled={isProcessing}>
                        <ShoppingBag size={22} className="text-slate-700"/> Add to Cart
                    </button>
                    <button 
                        className={`btn ${(!isPriceValid && sellingPriceInput) ? 'btn-disabled' : 'btn-primary'}`} 
                        onClick={handleCheckout} 
                        disabled={!isPriceValid || isProcessing}
                    >
                        {isProcessing && !flyingAnimation ? (
                            <Zap className="animate-spin" size={22}/> 
                        ) : (
                            <>Proceed <ArrowRight size={22}/></>
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