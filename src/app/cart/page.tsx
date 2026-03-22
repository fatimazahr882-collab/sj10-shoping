"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trash2, 
    ArrowRight, 
    Check, 
    Truck, 
    ShieldCheck,
    TrendingUp,
    CreditCard,
    Package,
    Banknote,
    Palette,
    Ruler,
    ShoppingBag
} from 'lucide-react';

const createSlug = (title: string) => {
    return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

export default function CartPage() {
    const router = useRouter();
    const { cart, isLoading, removeItemFromCart } = useCart();
    
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

    // Auto-select all
    useEffect(() => {
        if (!isLoading && cart.length > 0) {
            setSelectedItemIds(cart.map(item => item.cart_item_id));
        }
    }, [isLoading, cart.length]);

    // Calculations
    const { totalProductCost, totalProfit, totalDelivery, totalCommission, grandTotal, selectedCount } = useMemo(() => {
        let pCost = 0;
        let profit = 0;
        let delivery = 0;
        let commission = 0;
        let count = 0;

        cart.forEach((item) => {
            if (selectedItemIds.includes(item.cart_item_id)) {
                const qty = item.quantity;
                const basePrice = parseFloat(item.price || '0');
                const itemProfit = parseFloat((item.profit || 0).toString());
                
                pCost += basePrice * qty;
                profit += itemProfit * qty;
                delivery += (item.delivery_fee || 0) * qty;
                commission += (item.system_commission || 0) * qty;
                count++;
            }
        });

        return { 
            totalProductCost: pCost, 
            totalProfit: profit, 
            totalDelivery: delivery,
            totalCommission: commission,
            grandTotal: pCost + profit + delivery + commission,
            selectedCount: count
        };
    }, [cart, selectedItemIds]);

    // Handlers
    const toggleSelectItem = (id: number) => {
        if (selectedItemIds.includes(id)) setSelectedItemIds(prev => prev.filter(itemId => itemId !== id));
        else setSelectedItemIds(prev => [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedItemIds.length === cart.length) setSelectedItemIds([]); 
        else setSelectedItemIds(cart.map((item) => item.cart_item_id)); 
    };

    const handleDelete = async (id: number) => {
        setIsDeletingId(id);
        // Instant trigger without artificial delay for snappier feel
        await removeItemFromCart(id);
        setSelectedItemIds(prev => prev.filter(itemId => itemId !== id));
        setIsDeletingId(null);
    };

    const handleProceedToCheckout = () => {
        if (selectedCount === 0) return;
        setIsNavigating(true);

        const selectedItems = cart.filter(item => selectedItemIds.includes(item.cart_item_id));
        const checkoutItems = selectedItems.map((item) => {
            const basePrice = parseFloat(item.price || '0');
            const profit = parseFloat((item.profit || 0).toString());
            const unitPrice = basePrice + profit;
            
            return {
                ...item,
                displayDetails: {
                    title: item.title,
                    image_url: item.image_urls,
                    price_each: unitPrice,
                    delivery_fee: (item.delivery_fee || 0) * item.quantity,
                    system_commission: (item.system_commission || 0) * item.quantity,
                    subtotal: unitPrice * item.quantity 
                }
            };
        });

        sessionStorage.setItem('checkoutState', JSON.stringify({
            items: checkoutItems,
            totalPrice: grandTotal, 
            isDirectBuy: false
        }));
        router.push('/checkout');
    };

    if (isLoading) return <CartShimmer />;

    return (
        <div className="cart-wrapper">
            <style jsx global>{`
                .cart-wrapper { background-color: #f8fafc; min-height: 100vh; padding: 30px 20px; font-family: 'Inter', sans-serif; padding-bottom: 120px; }
                .container { max-width: 1100px; margin: 0 auto; }
                
                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

                /* Floating Animation for Header Icon */
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                    100% { transform: translateY(0px); }
                }
                .floating-icon { animation: float 3s ease-in-out infinite; }

                /* Gradient Text */
                .gradient-text {
                    background: linear-gradient(90deg, #0f172a, #334155);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                @media (max-width: 768px) {
                    .cart-wrapper { padding: 15px 12px; padding-bottom: 140px; } 
                    
                    /* Header Align Left */
                    .header-top { flex-direction: column; align-items: flex-start !important; gap: 15px; }
                    .header-title-group { align-items: flex-start !important; }
                    
                    .cart-content-flex { flex-direction: column; }
                    
                    /* Center Summary */
                    .summary-container { position: relative; top: 0; margin: 0 auto !important; }
                    
                    .cart-item-card { padding: 12px !important; gap: 12px !important; }
                    .item-image-box { width: 80px !important; height: 80px !important; }
                    .item-title { font-size: 0.95rem !important; }
                }
            `}</style>

            <div className="container">
                {/* HEADER */}
                <div className="header-top" style={{ marginBottom: '25px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                    <div className="header-title-group">
                        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'5px'}}>
                            <div className="floating-icon" style={{background:'#eff6ff', padding:'8px', borderRadius:'14px', border:'1px solid #dbeafe'}}>
                                <ShoppingBag size={28} color="#2563eb" fill="#2563eb" fillOpacity={0.1} />
                            </div>
                            <h1 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em', margin:0 }}>
                                My Cart
                            </h1>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginLeft:'4px' }}>
                            <span style={{fontWeight:'700', color:'#334155'}}>{cart.length} items</span> added to your bag
                        </p>
                    </div>

                    {cart.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                            {selectedItemIds.length > 0 && (
                                <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if(confirm(`Remove ${selectedItemIds.length} items?`)) {
                                            selectedItemIds.forEach(id => removeItemFromCart(id));
                                            setSelectedItemIds([]);
                                        }
                                    }}
                                    style={{
                                        background: '#fee2e2', color: '#ef4444', border: 'none',
                                        padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                                        fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <Trash2 size={16} /> Delete
                                </motion.button>
                            )}
                            
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleSelectAll}
                                style={{
                                    background: 'white', border: '1px solid #e2e8f0', padding: '8px 14px',
                                    borderRadius: '10px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px', color: '#475569',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <div style={{
                                    width: 16, height: 16, borderRadius: 4, 
                                    border: selectedItemIds.length === cart.length ? 'none' : '2px solid #cbd5e1',
                                    background: selectedItemIds.length === cart.length ? '#2563eb' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {selectedItemIds.length === cart.length && <Check size={10} color="white" strokeWidth={4} />}
                                </div>
                                {selectedItemIds.length === cart.length ? "Deselect" : "Select All"}
                            </motion.button>
                        </div>
                    )}
                </div>

                {cart.length === 0 ? (
                    <EmptyCartState />
                ) : (
                    <div className="cart-content-flex" style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
                        
                        {/* --- LIST SECTION --- */}
                        <div style={{ flex: '1', width: '100%' }}>
                            <AnimatePresence mode='popLayout'>
                                {cart.map((item) => (
                                    <CartItem 
                                        key={item.cart_item_id} 
                                        item={item}
                                        isSelected={selectedItemIds.includes(item.cart_item_id)}
                                        toggleSelect={toggleSelectItem}
                                        onDelete={handleDelete}
                                        isDeleting={isDeletingId === item.cart_item_id}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* --- SUMMARY SECTION --- */}
                        <div className="summary-container" style={{ width: '100%', maxWidth: '360px', flexShrink: 0 }}>
                            <div style={{ position: 'sticky', top: '20px' }}>
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ 
                                        background: 'rgba(255, 255, 255, 0.95)', 
                                        borderRadius: '20px', padding: '20px',
                                        border: '1px solid white',
                                        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.06)'
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '15px', color: '#1e293b' }}>
                                        Order Summary
                                    </h3>

                                    {selectedCount === 0 ? (
                                        <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8' }}>
                                            <Package size={40} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                                            <p style={{ fontSize: '0.9rem' }}>Select items to checkout</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <SummaryRow label="Subtotal" value={`Rs. ${totalProductCost.toLocaleString()}`} />
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <TrendingUp size={14} /> Your Profit
                                                </span>
                                                <span>+ Rs. {totalProfit.toLocaleString()}</span>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6366f1', fontWeight: 500, fontSize: '0.9rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Truck size={14} /> Delivery
                                                </span>
                                                <span>+ Rs. {totalDelivery.toLocaleString()}</span>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b', fontWeight: 500, fontSize: '0.9rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Banknote size={14} /> Cash Handling
                                                </span>
                                                <span>+ Rs. {totalCommission.toLocaleString() }</span>
                                            </div>

                                            <div style={{ margin: '10px 0', borderTop: '1px dashed #e2e8f0' }}></div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#334155' }}>Total</span>
                                                <motion.span 
                                                    key={grandTotal}
                                                    initial={{ scale: 1.1 }}
                                                    animate={{ scale: 1 }}
                                                    style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}
                                                >
                                                    Rs. {grandTotal.toLocaleString()}
                                                </motion.span>
                                            </div>
                                        </div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleProceedToCheckout}
                                        disabled={selectedCount === 0 || isNavigating}
                                        style={{
                                            width: '100%', marginTop: '20px', padding: '14px',
                                            background: selectedCount === 0 ? '#cbd5e1' : '#0f172a',
                                            color: selectedCount === 0 ? '#64748b' : '#fff',
                                            border: 'none', borderRadius: '14px',
                                            fontSize: '0.95rem', fontWeight: '700',
                                            cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                                            boxShadow: selectedCount === 0 ? 'none' : '0 8px 16px -4px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        {isNavigating ? <div className="processing-spinner"></div> : <>Proceed to Checkout <ArrowRight size={16} /></>}
                                    </motion.button>

                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '15px', color: '#cbd5e1' }}>
                                        <ShieldCheck size={18} />
                                        <Truck size={18} />
                                        <CreditCard size={18} />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- ITEM COMPONENT (With Fast Squash Animation) ---
const CartItem = ({ item, isSelected, toggleSelect, onDelete, isDeleting }: any) => {
    const basePrice = parseFloat(item.price || '0');
    const profit = parseFloat((item.profit || 0).toString());
    const totalItemPrice = (basePrice + profit) * item.quantity;
    const color = item.options?.color && item.options.color !== 'null' ? item.options.color : 'Standard';
    const size = item.options?.size && item.options.size !== 'null' ? item.options.size : 'Standard';
    const productLink = `/products/${createSlug(item.title)}`;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ 
                opacity: 0, 
                height: 0, 
                marginBottom: 0, 
                scale: 0.9,
                transition: { duration: 0.25, ease: "easeInOut" } 
            }}
            className="cart-item-card"
            style={{
                background: 'white', borderRadius: '18px', padding: '15px',
                border: isSelected ? '1.5px solid #2563eb' : '1px solid #f1f5f9',
                boxShadow: isSelected ? '0 8px 20px -5px rgba(37, 99, 235, 0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex', gap: '15px', position: 'relative', overflow: 'hidden',
                marginBottom: '15px'
            }}
        >
            {/* Checkbox */}
            <div onClick={() => toggleSelect(item.cart_item_id)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <motion.div 
                    animate={{ 
                        backgroundColor: isSelected ? '#2563eb' : '#fff',
                        borderColor: isSelected ? '#2563eb' : '#cbd5e1',
                        scale: isSelected ? 1.05 : 1
                    }}
                    style={{
                        width: 22, height: 22, borderRadius: 6, border: '2px solid',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    {isSelected && <Check size={14} color="white" strokeWidth={4} />}
                </motion.div>
            </div>

            {/* Compact Image */}
            <Link href={productLink} style={{ flexShrink: 0 }}>
                <div className="item-image-box" style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>
                    <Image 
                        src={item.image_urls?.[0] || '/placeholder.png'} 
                        alt={item.title} fill style={{ objectFit: 'cover' }}
                         unoptimized // <--- ADD THIS HERE
                        className="hover:scale-110 transition-transform duration-500 ease-out"
                    />
                </div>
            </Link>

            {/* Details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Link href={productLink} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="item-title" style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.title}
                    </h3>
                </Link>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <Badge icon={<Package size={10} />} text={`Qty: ${item.quantity}`} />
                    <Badge icon={<Palette size={10} />} text={color} />
                    <Badge icon={<Ruler size={10} />} text={size} />
                </div>

                {profit > 0 && (
                    <div style={{ 
                        marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                        color: '#059669', fontSize: '0.8rem', fontWeight: '700'
                    }}>
                        <TrendingUp size={14} /> Profit: Rs. {(profit * item.quantity).toLocaleString()}
                    </div>
                )}
            </div>

            {/* Price & Delete */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', minWidth:'80px' }}>
                <div style={{ textAlign: 'right' }}>
                    {/* ✅ FIXED PRICE: NO 'K' FORMAT */}
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                        Rs. {totalItemPrice.toLocaleString()}
                    </div>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 10, color: '#ef4444' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(item.cart_item_id)}
                    style={{ 
                        width: 32, height: 32, borderRadius: 8, border: 'none',
                        background: '#f1f5f9', color: '#94a3b8', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                >
                    {isDeleting ? <span className="processing-spinner" style={{borderTopColor:'#ef4444', width:14, height:14, borderWidth:2}}></span> : <Trash2 size={16} />}
                </motion.button>
            </div>
        </motion.div>
    );
};

const Badge = ({ icon, text }: any) => (
    <div style={{ 
        display: 'flex', alignItems: 'center', gap: '4px', 
        background: '#f8fafc', border: '1px solid #e2e8f0', 
        padding: '3px 8px', borderRadius: '6px', 
        fontSize: '0.7rem', fontWeight: '600', color: '#64748b',
        whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis'
    }}>
        <span style={{opacity:0.7}}>{icon}</span> {text}
    </div>
);

const SummaryRow = ({ label, value }: { label: string, value: string | number }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b' }}>
        <span>{label}</span>
        <span style={{ fontWeight: '600', color: '#334155' }}>{value}</span>
    </div>
);

const CartShimmer = () => (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        <div className="shimmer-bg" style={{ width: '200px', height: '30px', borderRadius: '8px', marginBottom: '30px' }}></div>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ 
                        height: '110px', background: 'white', borderRadius: '18px', marginBottom: '15px',
                        display: 'flex', padding: '15px', gap: '15px', border: '1px solid #f1f5f9' 
                    }}>
                        <div className="shimmer-bg" style={{ width: '20px', height: '20px', borderRadius: '6px', marginTop: '30px' }}></div>
                        <div className="shimmer-bg" style={{ width: '80px', height: '80px', borderRadius: '12px' }}></div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                            <div className="shimmer-bg" style={{ width: '80%', height: '16px', borderRadius: '4px' }}></div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div className="shimmer-bg" style={{ width: '50px', height: '12px', borderRadius: '4px' }}></div>
                                <div className="shimmer-bg" style={{ width: '50px', height: '12px', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ width: '100%', maxWidth: '360px', margin:'0 auto' }}>
                <div className="shimmer-bg" style={{ height: '300px', width: '100%', borderRadius: '20px' }}></div>
            </div>
        </div>
    </div>
);

const EmptyCartState = () => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            padding: '80px 20px', textAlign: 'center' 
        }}
    >
        <div className="floating-icon" style={{ 
            width: '120px', height: '120px', background: '#f8fafc', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '25px', border:'2px dashed #cbd5e1'
        }}>
            <ShoppingBag size={50} color="#94a3b8" />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px', color: '#1e293b' }}>Your bag is empty</h2>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '350px', marginBottom: '30px' }}>
            It seems you haven't found the perfect item yet. Check out our latest arrivals!
        </p>
        <Link href="/" style={{ textDecoration: 'none' }}>
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                    background: '#0f172a', color: 'white', padding: '14px 35px', 
                    borderRadius: '50px', fontWeight: '600', border: 'none', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}
            >
                Start Shopping <ArrowRight size={18} />
            </motion.button>
        </Link>
    </motion.div>
);