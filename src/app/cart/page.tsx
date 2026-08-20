"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart, CartItem as CartItemType } from '@/context/CartContext';
import { useAuth } from '@/components/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '@/components/AuthModal';
import apiClient from '@/lib/apiClient';
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
    ShoppingBag,
    Gift,
    X,
    Lock
} from 'lucide-react';

const createSlug = (title: string) => {
    return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

export default function CartPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();
    const { cart, isLoading: isCartLoading, removeItemFromCart, appliedCoupon, setAppliedCoupon } = useCart();
    
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Coupon States
    const [couponInput, setCouponInput] = useState('');
    const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
    const [couponFeedback, setCouponFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Auto-select all items on load
    useEffect(() => {
        if (!isCartLoading && cart.length > 0) {
            setSelectedItemIds(cart.map(item => item.cart_item_id));
        }
    }, [isCartLoading, cart.length]);

    // ==============================================================
    // 🟢 MULTI-SUPPLIER DELIVERY CALCULATION (1 Supplier = 1 Delivery Fee)
    // ==============================================================
    const { totalProductCost, totalProfit, totalDelivery, totalCommission, subtotalBeforeDiscount, grandTotal, selectedCount } = useMemo(() => {
        let pCost = 0;
        let profit = 0;
        let commission = 0;
        let count = 0;

        // Group delivery fees by supplier
        const supplierDeliveryMap: Record<string, number> = {};

        cart.forEach((item: CartItemType) => {
            if (selectedItemIds.includes(item.cart_item_id)) {
                const qty = item.quantity;
                const basePrice = parseFloat(item.price || '0');
                const itemProfit = parseFloat((item.profit || 0).toString());
                
                pCost += basePrice * qty;
                profit += itemProfit * qty;
                commission += Number(item.system_commission || 50) * qty;
                count++;

                // 🟢 1 SUPPLIER = 1 DELIVERY CHARGE
                const sId = String(item.supplier_id || (item as any).supplier?.id || (item as any).supplier?.brand_name || 'sj10-official');
                const itemDeliveryFee = Number(item.delivery_fee || 200);

                if (!supplierDeliveryMap[sId] || itemDeliveryFee > supplierDeliveryMap[sId]) {
                    supplierDeliveryMap[sId] = itemDeliveryFee;
                }
            }
        });

        // Sum delivery fees across all unique suppliers
        const delivery = Object.values(supplierDeliveryMap).reduce((sum, fee) => sum + fee, 0);

        const rawSubtotal = pCost + profit + delivery + commission;
        const discountAmount = appliedCoupon ? Number(appliedCoupon.discount || 0) : 0;
        const calculatedGrandTotal = Math.max(0, rawSubtotal - discountAmount);

        return { 
            totalProductCost: pCost, 
            totalProfit: profit, 
            totalDelivery: delivery,
            totalCommission: commission,
            subtotalBeforeDiscount: rawSubtotal,
            grandTotal: calculatedGrandTotal,
            selectedCount: count
        };
    }, [cart, selectedItemIds, appliedCoupon]);

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
        await removeItemFromCart(id);
        setSelectedItemIds(prev => prev.filter(itemId => itemId !== id));
        setIsDeletingId(null);
    };

    // Apply Coupon
    const handleApplyCoupon = async () => {
        const cleanCode = couponInput.trim().toUpperCase();
        if (!cleanCode) return;

        if (selectedCount === 0) {
            setCouponFeedback({ text: 'Please select items to apply coupon.', type: 'error' });
            return;
        }

        setIsVerifyingCoupon(true);
        setCouponFeedback(null);

        try {
            const res = await apiClient('spin/apply-coupon', 'POST', {
                coupon_code: cleanCode,
                cart_total: subtotalBeforeDiscount
            });

            if (res && res.success) {
                const newCoupon = {
                    code: res.code || cleanCode,
                    discount: Number(res.discount_amount || 0)
                };
                setAppliedCoupon(newCoupon);
                setCouponFeedback({ text: res.message, type: 'success' });
                setCouponInput('');
            } else {
                throw new Error(res?.message || 'This coupon is not valid.');
            }
        } catch (err: any) {
            setCouponFeedback({ text: err.message || 'This coupon is not valid.', type: 'error' });
        } finally {
            setIsVerifyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponFeedback(null);
    };

    // 🟢 PROCEED TO CHECKOUT (100% TYPE-SAFE)
    const handleProceedToCheckout = () => {
        if (selectedCount === 0) return;
        setIsNavigating(true);

        const selectedItems = cart.filter(item => selectedItemIds.includes(item.cart_item_id));
        
        const checkoutItems = selectedItems.map((item: CartItemType) => {
            const basePrice = parseFloat(item.price || '0');
            const profit = parseFloat((item.profit || 0).toString());
            const unitPrice = basePrice + profit;
            
            const realSupplierId = item.supplier_id || (item.supplier as any)?.id || null;
            const realBrandName = item.supplier?.brand_name || 'SJ10 Official';

            return {
                ...item,
                supplier_id: realSupplierId,
                supplier: {
                    id: realSupplierId,
                    brand_name: realBrandName
                },
                displayDetails: {
                    title: item.title,
                    image_url: item.image_urls,
                    price_each: unitPrice,
                    delivery_fee: Number(item.delivery_fee || 200),
                    system_commission: Number(item.system_commission || 50),
                    subtotal: unitPrice * item.quantity,
                    brand_name: realBrandName
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

    if (isAuthLoading || (isCartLoading && user)) {
        return (
            <div className="loading-container">
                <div className="loader-spinner"></div>
            </div>
        );
    }

    // =========================================================================
    // 🟢 GUEST MODE UI
    // =========================================================================
    if (!user) {
        return (
            <div className="cart-wrapper guest-mode-wrapper">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="guest-card"
                >
                    <div className="guest-icon-pulse">
                        <ShoppingBag size={50} className="guest-bag-icon" />
                    </div>
                    
                    <h2 className="guest-title">Your Shopping Bag is Waiting!</h2>
                    <p className="guest-desc">
                        Please log in to your account to view your saved items, apply daily spin coupons, and enjoy fast Cash on Delivery checkout.
                    </p>

                    <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="guest-login-btn"
                    >
                        <Lock size={18} /> Login / Sign Up to Continue
                    </button>
                    
                    <div className="guest-perks-row">
                        <span><ShieldCheck size={16} /> 100% Safe Checkout</span>
                        <span><Truck size={16} /> Fast Delivery in Pakistan</span>
                    </div>
                </motion.div>

                <AuthModal 
                    isOpen={isAuthModalOpen} 
                    onClose={() => setIsAuthModalOpen(false)} 
                />

                <style jsx>{`
                    .guest-mode-wrapper {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 80vh;
                    }
                    .guest-card {
                        background: #ffffff;
                        border-radius: 24px;
                        padding: 40px 24px;
                        max-width: 480px;
                        width: 100%;
                        text-align: center;
                        border: 1px solid #f1f5f9;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    }
                    .guest-icon-pulse {
                        width: 100px;
                        height: 100px;
                        background: #fff7ed;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 20px;
                        color: #f85606;
                        animation: pulseGlow 2s infinite ease-in-out;
                    }
                    @keyframes pulseGlow {
                        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(248, 86, 6, 0.3); }
                        50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(248, 86, 6, 0); }
                    }
                    .guest-title {
                        font-size: 22px;
                        font-weight: 800;
                        color: #0f172a;
                        margin: 0 0 10px 0;
                    }
                    .guest-desc {
                        font-size: 14px;
                        color: #64748b;
                        line-height: 1.6;
                        margin: 0 0 25px 0;
                    }
                    .guest-login-btn {
                        width: 100%;
                        height: 52px;
                        background: linear-gradient(135deg, #f85606 0%, #ff8a00 100%);
                        color: white;
                        border: none;
                        border-radius: 14px;
                        font-size: 16px;
                        font-weight: 800;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        box-shadow: 0 4px 15px rgba(248, 86, 6, 0.35);
                        transition: all 0.2s;
                    }
                    .guest-login-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(248, 86, 6, 0.45);
                    }
                    .guest-perks-row {
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                        margin-top: 25px;
                        font-size: 12px;
                        color: #94a3b8;
                        font-weight: 600;
                    }
                    .guest-perks-row span {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                `}</style>
            </div>
        );
    }

    // =========================================================================
    // 🟢 MAIN CART UI
    // =========================================================================
    return (
        <div className="cart-wrapper">
            <div className="container">
                
                {/* HEADER */}
                <div className="header-top">
                    <div className="header-title-group">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '5px' }}>
                            <div className="floating-icon">
                                <ShoppingBag size={28} color="#f85606" />
                            </div>
                            <h1 className="gradient-text">
                                My Cart
                            </h1>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginLeft: '4px', margin: 0 }}>
                            <span style={{ fontWeight: '700', color: '#334155' }}>{cart.length} items</span> in your bag
                        </p>
                    </div>

                    {cart.length > 0 && (
                        <div className="header-actions">
                            {selectedItemIds.length > 0 && (
                                <button 
                                    onClick={() => {
                                        if (confirm(`Remove ${selectedItemIds.length} items?`)) {
                                            selectedItemIds.forEach(id => removeItemFromCart(id));
                                            setSelectedItemIds([]);
                                        }
                                    }}
                                    className="btn-bulk-delete"
                                >
                                    <Trash2 size={15} /> Delete ({selectedItemIds.length})
                                </button>
                            )}
                            
                            <button 
                                onClick={toggleSelectAll}
                                className="btn-select-all"
                            >
                                <div className={`custom-checkbox ${selectedItemIds.length === cart.length ? 'checked' : ''}`}>
                                    {selectedItemIds.length === cart.length && <Check size={11} color="white" strokeWidth={4} />}
                                </div>
                                {selectedItemIds.length === cart.length ? "Deselect All" : "Select All"}
                            </button>
                        </div>
                    )}
                </div>

                {cart.length === 0 ? (
                    <EmptyCartState />
                ) : (
                    <div className="cart-content-flex">
                        
                        {/* --- LEFT: ITEMS LIST --- */}
                        <div className="cart-items-column">
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

                        {/* --- RIGHT: ORDER SUMMARY SIDEBAR --- */}
                        <div className="summary-container">
                            <div className="summary-sticky-wrap">
                                <div className="summary-card-ui">
                                    <h3 className="summary-title">
                                        Order Summary
                                    </h3>

                                    {/* 🟢 ANIMATED COUPON BOX IN CART */}
                                    <div className="coupon-box-wrap">
                                        {!appliedCoupon ? (
                                            <div>
                                                <div className="coupon-prompt-title">
                                                    <Gift size={15} color="#f85606" /> Have a Promo Code?
                                                </div>
                                                <div className="coupon-input-group">
                                                    <input 
                                                        type="text" 
                                                        placeholder="ENTER CODE" 
                                                        value={couponInput} 
                                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                        className="coupon-input"
                                                    />
                                                    <button 
                                                        onClick={handleApplyCoupon} 
                                                        disabled={!couponInput.trim() || isVerifyingCoupon}
                                                        className="coupon-apply-btn"
                                                    >
                                                        {isVerifyingCoupon ? '...' : 'Apply'}
                                                    </button>
                                                </div>
                                                {couponFeedback && (
                                                    <p className={`coupon-msg ${couponFeedback.type}`}>
                                                        {couponFeedback.text}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <motion.div 
                                                initial={{ scale: 0.95, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="applied-coupon-badge"
                                            >
                                                <div>
                                                    <span className="badge-tag"><Check size={12} /> COUPON APPLIED</span>
                                                    <span className="badge-code">{appliedCoupon.code}</span>
                                                </div>
                                                <div className="badge-right">
                                                    <span className="badge-discount">- Rs. {appliedCoupon.discount}</span>
                                                    <button onClick={handleRemoveCoupon} className="remove-coupon-btn" title="Remove">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {selectedCount === 0 ? (
                                        <div className="no-selection-box">
                                            <Package size={36} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
                                            <p>Select at least 1 item to checkout</p>
                                        </div>
                                    ) : (
                                        <div className="summary-breakdown-list">
                                            <SummaryRow label="Subtotal" value={`Rs. ${totalProductCost.toLocaleString()}`} />
                                            
                                            <div className="financial-row profit-row">
                                                <span><TrendingUp size={14} /> Your Profit</span>
                                                <span>+ Rs. {totalProfit.toLocaleString()}</span>
                                            </div>

                                            {/* 🟢 MULTI-SUPPLIER GROUPED DELIVERY FEE */}
                                            <div className="financial-row delivery-row">
                                                <span><Truck size={14} /> Delivery Charges</span>
                                                <span>+ Rs. {totalDelivery.toLocaleString()}</span>
                                            </div>

                                            <div className="financial-row handling-row">
                                                <span><Banknote size={14} /> Cash Handling Fee</span>
                                                <span>+ Rs. {totalCommission.toLocaleString()}</span>
                                            </div>

                                            {/* 🟢 DISCOUNT ROW */}
                                            {appliedCoupon && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="financial-row discount-row"
                                                >
                                                    <span><Gift size={14} /> Coupon Discount</span>
                                                    <span>- Rs. {appliedCoupon.discount.toLocaleString()}</span>
                                                </motion.div>
                                            )}

                                            <div className="summary-divider"></div>

                                            <div className="grand-total-row">
                                                <span className="grand-lbl">Grand Total</span>
                                                <span className="grand-amount">
                                                    Rs. {grandTotal.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleProceedToCheckout}
                                        disabled={selectedCount === 0 || isNavigating}
                                        className="proceed-checkout-btn"
                                    >
                                        {isNavigating ? <div className="btn-spinner"></div> : <>Proceed to Checkout <ArrowRight size={18} /></>}
                                    </button>

                                    <div className="trust-footer-icons">
                                        <span><ShieldCheck size={16} /> 100% Safe</span>
                                        <span><Truck size={16} /> COD Available</span>
                                        <span><CreditCard size={16} /> Best Quality</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            <style jsx>{`
                .cart-wrapper {
                    background-color: #f8fafc;
                    min-height: 100vh;
                    padding: 24px 16px 150px 16px;
                    font-family: 'Inter', -apple-system, sans-serif;
                }
                .container {
                    max-width: 1150px;
                    margin: 0 auto;
                    width: 100%;
                }

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .floating-icon {
                    background: #fff7ed;
                    padding: 8px;
                    border-radius: 12px;
                    border: 1px solid #ffedd5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .gradient-text {
                    font-size: 1.8rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                .header-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                .btn-bulk-delete {
                    background: #fee2e2;
                    color: #ef4444;
                    border: none;
                    padding: 8px 14px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    transition: 0.2s;
                }
                .btn-bulk-delete:hover { background: #fecaca; }

                .btn-select-all {
                    background: white;
                    border: 1.5px solid #e2e8f0;
                    padding: 8px 14px;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #475569;
                    font-size: 0.85rem;
                }

                .custom-checkbox {
                    width: 18px;
                    height: 18px;
                    border-radius: 5px;
                    border: 2px solid #cbd5e1;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }
                .custom-checkbox.checked {
                    background: #f85606;
                    border-color: #f85606;
                }

                .cart-content-flex {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    align-items: flex-start;
                }
                .cart-items-column {
                    width: 100%;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .summary-container {
                    width: 100%;
                }

                @media (min-width: 1024px) {
                    .cart-content-flex {
                        flex-direction: row;
                        gap: 30px;
                    }
                    .summary-container {
                        width: 360px;
                        flex-shrink: 0;
                    }
                    .summary-sticky-wrap {
                        position: sticky;
                        top: 90px;
                    }
                }

                .summary-card-ui {
                    background: #ffffff;
                    border-radius: 24px;
                    padding: 24px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                }
                .summary-title {
                    font-size: 1.2rem;
                    font-weight: 900;
                    margin: 0 0 18px 0;
                    color: #0f172a;
                }

                .coupon-box-wrap {
                    background: #fff7ed;
                    border: 1.5px dashed #fed7aa;
                    border-radius: 16px;
                    padding: 14px;
                    margin-bottom: 20px;
                }
                .coupon-prompt-title {
                    font-size: 12.5px;
                    font-weight: 800;
                    color: #c2410c;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .coupon-input-group {
                    display: flex;
                    gap: 8px;
                }
                .coupon-input {
                    flex: 1;
                    padding: 10px 12px;
                    background: white;
                    border: 1.5px solid #fed7aa;
                    border-radius: 10px;
                    font-size: 13px;
                    font-family: monospace;
                    font-weight: 800;
                    text-transform: uppercase;
                    outline: none;
                }
                .coupon-input:focus { border-color: #f85606; }
                .coupon-apply-btn {
                    background: #f85606;
                    color: white;
                    border: none;
                    padding: 0 16px;
                    border-radius: 10px;
                    font-weight: 800;
                    font-size: 13px;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .coupon-apply-btn:hover { background: #ea580c; }
                .coupon-apply-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .coupon-msg {
                    font-size: 11px;
                    font-weight: 700;
                    margin: 6px 0 0 0;
                }
                .coupon-msg.error { color: #dc2626; }
                .coupon-msg.success { color: #16a34a; }

                .applied-coupon-badge {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #ecfdf5;
                    border: 1px solid #a7f3d0;
                    padding: 10px 12px;
                    border-radius: 12px;
                }
                .badge-tag {
                    font-size: 10px;
                    font-weight: 900;
                    color: #059669;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    text-transform: uppercase;
                }
                .badge-code {
                    font-size: 14px;
                    font-weight: 900;
                    color: #0f172a;
                    font-family: monospace;
                }
                .badge-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .badge-discount {
                    font-size: 14px;
                    font-weight: 900;
                    color: #dc2626;
                }
                .remove-coupon-btn {
                    background: #fee2e2;
                    color: #ef4444;
                    border: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .no-selection-box {
                    padding: 30px 0;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .summary-breakdown-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .financial-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .financial-row span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .profit-row { color: #10b981; }
                .delivery-row { color: #6366f1; }
                .handling-row { color: #f59e0b; }
                .discount-row { color: #dc2626; font-weight: 800; }

                .summary-divider {
                    height: 1px;
                    border-top: 1px dashed #e2e8f0;
                    margin: 8px 0;
                }

                .grand-total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    padding-top: 4px;
                }
                .grand-lbl {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #1e293b;
                }
                .grand-amount {
                    font-size: 1.6rem;
                    font-weight: 900;
                    color: #0f172a;
                }

                .proceed-checkout-btn {
                    width: 100%;
                    height: 52px;
                    margin-top: 20px;
                    background: linear-gradient(135deg, #f85606 0%, #ff8a00 100%);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-size: 16px;
                    font-weight: 900;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 8px 20px rgba(248, 86, 6, 0.3);
                    transition: all 0.2s;
                }
                .proceed-checkout-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(248, 86, 6, 0.45);
                }
                .proceed-checkout-btn:disabled {
                    background: #cbd5e1;
                    box-shadow: none;
                    cursor: not-allowed;
                }

                .trust-footer-icons {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 20px;
                    color: #94a3b8;
                    font-size: 11px;
                    font-weight: 700;
                }
                .trust-footer-icons span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .loading-container {
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .loader-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e2e8f0;
                    border-top-color: #f85606;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                .btn-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid white;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

// =========================================================================
// 🟢 CART ITEM COMPONENT (100% Type-Safe)
// =========================================================================
const CartItem = ({ item, isSelected, toggleSelect, onDelete, isDeleting }: any) => {
    const basePrice = parseFloat(item.price || '0');
    const profit = parseFloat((item.profit || 0).toString());
    const totalItemPrice = (basePrice + profit) * item.quantity;
    const color = item.options?.color && item.options.color !== 'null' ? item.options.color : 'Standard';
    const size = item.options?.size && item.options.size !== 'null' ? item.options.size : null;
    const productLink = `/products/${createSlug(item.title)}`;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className={`cart-item-card ${isSelected ? 'selected-item' : ''}`}
        >
            {/* Checkbox */}
            <div onClick={() => toggleSelect(item.cart_item_id)} className="item-checkbox-click">
                <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <Check size={12} color="white" strokeWidth={4} />}
                </div>
            </div>

            {/* Image Box */}
            <Link href={productLink} className="item-img-link">
                <div className="item-img-box">
                    <Image 
                        src={item.image_urls?.[0] || '/placeholder.png'} 
                        alt={item.title} 
                        fill 
                        style={{ objectFit: 'cover' }}
                        unoptimized
                    />
                </div>
            </Link>

            {/* Details */}
            <div className="item-info-col">
                <Link href={productLink} className="item-title-link">
                    <h3 className="item-title-text">{item.title}</h3>
                </Link>

                <div className="item-badges-flex">
                    <span className="info-badge">Qty: <strong>{item.quantity}</strong></span>
                    <span className="info-badge"><Palette size={11} /> {color}</span>
                    {size && <span className="info-badge"><Ruler size={11} /> {size}</span>}
                </div>

                {profit > 0 && (
                    <div className="item-profit-tag">
                        <TrendingUp size={13} /> Profit: Rs. {(profit * item.quantity).toLocaleString()}
                    </div>
                )}
            </div>

            {/* Price & Trash Action */}
            <div className="item-actions-col">
                <div className="item-final-price">
                    Rs. {totalItemPrice.toLocaleString()}
                </div>

                <button 
                    onClick={() => onDelete(item.cart_item_id)}
                    className="delete-item-btn"
                    title="Remove item"
                >
                    {isDeleting ? <div className="mini-spinner"></div> : <Trash2 size={15} />}
                </button>
            </div>

            <style jsx>{`
                .cart-item-card {
                    background: white;
                    border-radius: 18px;
                    padding: 16px;
                    border: 1.5px solid #f1f5f9;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    transition: all 0.2s;
                }
                .cart-item-card.selected-item {
                    border-color: #f85606;
                    box-shadow: 0 4px 15px rgba(248, 86, 6, 0.08);
                }
                .item-checkbox-click {
                    cursor: pointer;
                    padding: 4px;
                }
                .custom-checkbox {
                    width: 20px;
                    height: 20px;
                    border-radius: 6px;
                    border: 2px solid #cbd5e1;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }
                .custom-checkbox.checked {
                    background: #f85606;
                    border-color: #f85606;
                }

                .item-img-link { flex-shrink: 0; }
                .item-img-box {
                    width: 75px;
                    height: 75px;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                }

                .item-info-col {
                    flex: 1;
                    min-width: 0;
                }
                .item-title-link { text-decoration: none; }
                .item-title-text {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 6px 0;
                    line-height: 1.35;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .item-badges-flex {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .info-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #475569;
                }

                .item-profit-tag {
                    margin-top: 6px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    color: #059669;
                    font-size: 0.8rem;
                    font-weight: 800;
                }

                .item-actions-col {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: space-between;
                    height: 75px;
                    flex-shrink: 0;
                }
                .item-final-price {
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #0f172a;
                }
                .delete-item-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: #f8fafc;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .delete-item-btn:hover {
                    background: #fee2e2;
                    color: #ef4444;
                }
                .mini-spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid #ef4444;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </motion.div>
    );
};

const SummaryRow = ({ label, value }: { label: string, value: string | number }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
        <span>{label}</span>
        <span style={{ color: '#334155', fontWeight: 700 }}>{value}</span>
    </div>
);

const EmptyCartState = () => (
    <div className="empty-state-box">
        <div className="empty-icon-wrap">
            <ShoppingBag size={55} color="#94a3b8" />
        </div>
        <h2 className="empty-heading">Your bag is empty</h2>
        <p className="empty-sub">It seems you haven't added any products yet. Discover our latest collections!</p>
        <Link href="/" className="start-shopping-link">
            Start Shopping <ArrowRight size={18} />
        </Link>
        <style jsx>{`
            .empty-state-box {
                background: white;
                border-radius: 24px;
                padding: 60px 20px;
                text-align: center;
                border: 1px solid #f1f5f9;
                max-width: 500px;
                margin: 40px auto;
            }
            .empty-icon-wrap {
                width: 110px;
                height: 110px;
                background: #f8fafc;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                border: 2px dashed #cbd5e1;
            }
            .empty-heading {
                font-size: 1.6rem;
                font-weight: 900;
                color: #1e293b;
                margin: 0 0 8px 0;
            }
            .empty-sub {
                font-size: 0.95rem;
                color: #64748b;
                max-width: 350px;
                margin: 0 auto 25px auto;
                line-height: 1.5;
            }
            .start-shopping-link {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: #0f172a;
                color: white;
                padding: 14px 32px;
                border-radius: 50px;
                font-weight: 800;
                font-size: 0.95rem;
                text-decoration: none;
                transition: 0.2s;
            }
            .start-shopping-link:hover {
                background: #f85606;
                transform: translateY(-2px);
            }
        `}</style>
    </div>
);