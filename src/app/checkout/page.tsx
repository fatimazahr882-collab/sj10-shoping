"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { pakistanLocations } from '@/lib/locations';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const cartContext = useCart();
    
    // Global/Local Coupon sync
    const globalCoupon = (cartContext as any)?.appliedCoupon || null;
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [couponInput, setCouponInput] = useState('');
    const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
    const [couponFeedback, setCouponFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const [checkoutState, setCheckoutState] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    
    // View Controller: 'summary' | 'address'
    const [currentView, setCurrentView] = useState<'summary' | 'address'>('summary');
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    
    // Address Form State
    const [addressData, setAddressData] = useState({
        name: '',
        phone: '',
        phone2: '',
        province: '',
        city: '',
        area: '',
        street_address: ''
    });

    const [initialAddressBackup, setInitialAddressBackup] = useState(addressData);

    // Accordions State
    const [deliveryOpen, setDeliveryOpen] = useState(true);
    const [returnOpen, setReturnOpen] = useState(false);

    // 1. Load Session & User Saved Address
    useEffect(() => {
        const storedState = sessionStorage.getItem('checkoutState');
        if (storedState) {
            setCheckoutState(JSON.parse(storedState));
        } else {
            router.push('/cart');
        }

        if (user) {
            try {
                let rawAddress: any = (user as any)?.address;
                if (typeof rawAddress === 'string' && (rawAddress.startsWith('{') || rawAddress.startsWith('['))) {
                    rawAddress = JSON.parse(rawAddress);
                }
                
                const parsed: Record<string, any> = (typeof rawAddress === 'object' && rawAddress !== null) ? rawAddress : {};
                const loaded = {
                    name: String(parsed.name || user.full_name || ''),
                    phone: String(parsed.phone || user.phone || ''),
                    phone2: String(parsed.phone2 || ''),
                    province: String(parsed.province || ''),
                    city: String(parsed.city || ''),
                    area: String(parsed.area || ''),
                    street_address: String(parsed.street_address || (typeof rawAddress === 'string' && !rawAddress.startsWith('{') ? rawAddress : ''))
                };

                setAddressData(loaded);
                setInitialAddressBackup(loaded);
            } catch (e) {
                const fallback = { name: user.full_name || '', phone: user.phone || '', phone2: '', province: '', city: '', area: '', street_address: '' };
                setAddressData(fallback);
                setInitialAddressBackup(fallback);
            }
        }
    }, [user, router]);

    // 2. Sync Global Coupon
    useEffect(() => {
        if (globalCoupon && !appliedCoupon) {
            setAppliedCoupon(globalCoupon);
        }
    }, [globalCoupon]);

    const citiesForProvince = useMemo(() => {
        if (!addressData.province) return [];
        return pakistanLocations.cities[addressData.province as keyof typeof pakistanLocations.cities]?.sort() || [];
    }, [addressData.province]);

    const isAddressValid = useMemo(() => {
        return (
            addressData.name.trim() !== '' &&
            addressData.phone.trim().length >= 10 &&
            addressData.city.trim() !== '' &&
            addressData.street_address.trim() !== ''
        );
    }, [addressData]);

    const hasUnsavedAddressChanges = useMemo(() => {
        return JSON.stringify(addressData) !== JSON.stringify(initialAddressBackup);
    }, [addressData, initialAddressBackup]);

    const handleAddressBack = () => {
        if (hasUnsavedAddressChanges) {
            setShowDiscardModal(true);
        } else {
            setCurrentView('summary');
        }
    };

    const handleSaveAddress = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!isAddressValid) {
            alert("Please fill all required fields marked with *");
            return;
        }
        setIsSavingAddress(true);
        try {
            await apiClient('user/profile', 'PUT', {
                fullName: addressData.name,
                phone: addressData.phone,
                address: JSON.stringify(addressData)
            });
            setInitialAddressBackup(addressData);
            setShowDiscardModal(false);
            setCurrentView('summary');
        } catch (err) {
            setInitialAddressBackup(addressData);
            setShowDiscardModal(false);
            setCurrentView('summary');
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleDiscardChanges = () => {
        setAddressData(initialAddressBackup);
        setShowDiscardModal(false);
        setCurrentView('summary');
    };

    // ==============================================================
    // 🟢 MULTI-SUPPLIER GROUPING & CALCULATION ENGINE
    // ==============================================================
    const { packages, totalOrderWholesale, totalOrderDelivery, totalOrderHandling } = useMemo(() => {
        if (!checkoutState || !checkoutState.items || checkoutState.items.length === 0) {
            return { packages: [], totalOrderWholesale: 0, totalOrderDelivery: 0, totalOrderHandling: 0 };
        }

        const supplierGroups: Record<string, {
            supplierId: string;
            supplierName: string;
            items: any[];
        }> = {};

       checkoutState.items.forEach((item: any) => {
            // 🟢 Extracts Real Supplier ID & Real Brand Name
            const sId = String(item.supplier_id || item.supplier?.id || item.displayDetails?.supplier_id || 'sj10-official');
            const sName = item.supplier?.brand_name || item.displayDetails?.brand_name || item.brand_name || 'SJ10 Official';

            if (!supplierGroups[sId]) {
                supplierGroups[sId] = { supplierId: sId, supplierName: sName, items: [] };
            }
            supplierGroups[sId].items.push(item);
        });

        const packageList = Object.values(supplierGroups).map((group, index) => {
            let pkgWholesale = 0;
            let pkgHandling = 0;
            let maxDeliveryFeeForPackage = 0;

            group.items.forEach((item) => {
                const qty = Number(item.quantity || 1);
                const eachPrice = Number(item.displayDetails?.price_each || item.price || 0);
                pkgWholesale += (eachPrice * qty);
                pkgHandling += Number(item.displayDetails?.system_commission || item.system_commission || 50);

                // 1 Supplier = 1 Delivery Fee
                const itemDelivery = Number(item.displayDetails?.delivery_fee || item.delivery_fee || 200);
                if (itemDelivery > maxDeliveryFeeForPackage) {
                    maxDeliveryFeeForPackage = itemDelivery;
                }
            });

            if (maxDeliveryFeeForPackage === 0 && pkgWholesale > 0) maxDeliveryFeeForPackage = 200;

            return {
                packageNumber: index + 1,
                supplierName: group.supplierName,
                items: group.items,
                wholesalePrice: pkgWholesale,
                deliveryFee: maxDeliveryFeeForPackage,
                handlingFee: pkgHandling,
                packageTotal: pkgWholesale + maxDeliveryFeeForPackage + pkgHandling
            };
        });

        const orderWholesale = packageList.reduce((sum, p) => sum + p.wholesalePrice, 0);
        const orderDelivery = packageList.reduce((sum, p) => sum + p.deliveryFee, 0);
        const orderHandling = packageList.reduce((sum, p) => sum + p.handlingFee, 0);

        return {
            packages: packageList,
            totalOrderWholesale: orderWholesale,
            totalOrderDelivery: orderDelivery,
            totalOrderHandling: orderHandling
        };
    }, [checkoutState]);

    const totalBeforeDiscount = totalOrderWholesale + totalOrderDelivery + totalOrderHandling;
    const discountVal = appliedCoupon ? Number(appliedCoupon.discount || 0) : 0;
    const finalTotalPayable = Math.max(0, totalBeforeDiscount - discountVal);

    // Coupon Apply
    const handleApplyCoupon = async () => {
        const cleanCode = couponInput.trim().toUpperCase();
        if (!cleanCode) return;

        setIsVerifyingCoupon(true);
        setCouponFeedback(null);

        try {
            const res = await apiClient('spin/apply-coupon', 'POST', {
                coupon_code: cleanCode,
                cart_total: totalBeforeDiscount
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
                throw new Error(res?.message || "This coupon is not valid.");
            }
        } catch (err: any) {
            setCouponFeedback({ text: err.message || "This coupon is not valid.", type: 'error' });
        } finally {
            setIsVerifyingCoupon(false);
        }
    };

    // Place Order
    const handlePlaceOrder = async () => {
        if (!isAddressValid) {
            setCurrentView('address');
            return;
        }

        setLoading(true);
        const fullCity = `${addressData.province ? addressData.province + ' - ' : ''}${addressData.city}`;
        const fullAddress = `${addressData.street_address}${addressData.area ? ', Area: ' + addressData.area : ''}${addressData.phone2 ? ' (Alt: ' + addressData.phone2 + ')' : ''}`;

        const payload: any = {
            customer_name: addressData.name,
            customer_phone: addressData.phone,
            customer_email: user?.email || 'no-email@provided.com',
            customer_city: fullCity,
            customer_address: fullAddress,
            coupon_code: appliedCoupon ? appliedCoupon.code : null,
            discount_amount: discountVal,
            final_price: finalTotalPayable
        };

        if (checkoutState.isDirectBuy) {
            payload.items = checkoutState.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                profit: item.options?.profit || 0,
                options: item.options 
            }));
        } else {
            payload.items = checkoutState.items.map((item: any) => ({
                productId: item.product_id,
                quantity: item.quantity,
                profit: item.profit || 0,
                options: item.options 
            }));
        }

        try {
            await apiClient('api/orders', 'POST', payload);
            sessionStorage.removeItem('checkoutState');
            router.push('/order-confirmation');
        } catch (error: any) {
            alert("Failed to place order: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    if (!checkoutState) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    const totalPackageCount = packages.length;

    return (
        <div className="checkout-master-root">
            
            {/* ========================================================= */}
            {/* 🟢 VIEW 1: FULL ADDRESS PAGE                              */}
            {/* ========================================================= */}
            {currentView === 'address' && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="address-view-wrapper"
                >
                    <header className="checkout-top-nav">
                        <div className="container-inner">
                            <button onClick={handleAddressBack} className="back-btn-pill" type="button" aria-label="Go Back">
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <h1 className="nav-title-text">Delivery Address</h1>
                        </div>
                    </header>

                    <div className="address-body-wrap">
                        <div className="address-card-box">
                            <div className="info-banner">
                                <div className="info-icon"><i className="fas fa-map-location-dot"></i></div>
                                <div>
                                    <strong>Shipping Details</strong>
                                    <span>Please enter accurate details for reliable courier delivery.</span>
                                </div>
                            </div>

                            <form onSubmit={handleSaveAddress} className="address-pure-form">
                                <div className="form-field-unit">
                                    <label>Customer Full Name *</label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-user input-icon"></i>
                                        <input type="text" value={addressData.name} onChange={e => setAddressData({...addressData, name: e.target.value})} required placeholder="Full Name" />
                                    </div>
                                </div>

                                <div className="form-field-unit">
                                    <label>Primary Mobile Number *</label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-phone-alt input-icon"></i>
                                        <input type="tel" value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value.replace(/\D/g, '')})} maxLength={11} required placeholder="03XXXXXXXXX" />
                                    </div>
                                </div>

                                <div className="form-field-unit">
                                    <label>Secondary Phone Number <span className="optional">(Optional)</span></label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-mobile-screen input-icon"></i>
                                        <input type="tel" value={addressData.phone2} onChange={e => setAddressData({...addressData, phone2: e.target.value.replace(/\D/g, '')})} maxLength={11} placeholder="Backup contact number" />
                                    </div>
                                </div>

                                <div className="input-group-duo">
                                    <div className="form-field-unit">
                                        <label>Province *</label>
                                        <div className="input-wrapper">
                                            <i className="fas fa-globe-asia input-icon"></i>
                                            <select value={addressData.province} onChange={e => setAddressData({...addressData, province: e.target.value})} required>
                                                <option value="" disabled>Select</option>
                                                {pakistanLocations.provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                            <i className="fas fa-chevron-down select-arrow"></i>
                                        </div>
                                    </div>
                                    <div className="form-field-unit">
                                        <label>City *</label>
                                        <div className="input-wrapper">
                                            <i className="fas fa-city input-icon"></i>
                                            <select value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} required disabled={!addressData.province}>
                                                <option value="" disabled>Select</option>
                                                {citiesForProvince.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <i className="fas fa-chevron-down select-arrow"></i>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-field-unit">
                                    <label>Area / Sector / Colony <span className="optional">(Optional)</span></label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-road input-icon"></i>
                                        <input type="text" value={addressData.area} onChange={e => setAddressData({...addressData, area: e.target.value})} placeholder="e.g. Model Town / Sector F-10" />
                                    </div>
                                </div>

                                <div className="form-field-unit">
                                    <label>Complete Street & House Address *</label>
                                    <div className="input-wrapper">
                                        <textarea value={addressData.street_address} onChange={e => setAddressData({...addressData, street_address: e.target.value})} required rows={3} placeholder="House number, Street name, Near Landmark"></textarea>
                                    </div>
                                </div>

                                <div className="address-btn-container">
                                    <button type="submit" disabled={isSavingAddress} className="save-address-btn">
                                        {isSavingAddress ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-check-circle"></i> Save & Use This Address</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {showDiscardModal && (
                        <div className="discard-modal-overlay">
                            <div className="discard-box">
                                <i className="fas fa-triangle-exclamation warn-icon"></i>
                                <h3>Save Address Changes?</h3>
                                <p>You have unsaved changes. Do you want to save them before going back?</p>
                                <div className="discard-actions">
                                    <button onClick={handleDiscardChanges} className="btn-no">Discard</button>
                                    <button onClick={() => handleSaveAddress()} className="btn-yes">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ========================================================= */}
            {/* 🟢 VIEW 2: 2-COLUMN DESKTOP / 1-COLUMN MOBILE CHECKOUT   */}
            {/* ========================================================= */}
            {currentView === 'summary' && (
                <div className="checkout-summary-view">
                    
                    {/* Top Navigation */}
                    <header className="checkout-top-nav">
                        <div className="container-inner">
                            <button onClick={() => router.back()} className="back-btn-pill" type="button" aria-label="Go Back">
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <h1 className="nav-title-text">Order Summary</h1>
                        </div>
                    </header>

                    <div className="checkout-layout-grid">
                        
                        {/* 🟢 LEFT COLUMN: Address + Packages + COD + Accordions */}
                        <div className="layout-left-col">
                            
                            {/* 1. Address Card */}
                            <div className="col-section-header">Your Address</div>
                            <div className="card-ui address-card" onClick={() => setCurrentView('address')}>
                                {isAddressValid ? (
                                    <div className="address-display">
                                        <div className="address-top-line">
                                            <span className="customer-name">{addressData.name}</span>
                                            <button className="pencil-btn" type="button" aria-label="Edit"><i className="fas fa-pencil"></i></button>
                                        </div>
                                        <p className="address-str">{addressData.street_address}, {addressData.area ? `${addressData.area}, ` : ''}{addressData.city}</p>
                                        <p className="phone-str">Phone: <span>{addressData.phone}</span></p>
                                        {addressData.phone2 && <p className="phone-str">Alt: <span>{addressData.phone2}</span></p>}
                                    </div>
                                ) : (
                                    <div className="empty-address-prompt">
                                        <div className="plus-icon"><i className="fas fa-plus"></i></div>
                                        <div>
                                            <strong>Add Delivery Address</strong>
                                            <p>Tap to enter customer shipping details</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 2. Packages List */}
                            {packages.map((pkg) => (
                                <div key={`pkg-${pkg.packageNumber}`} className="card-ui package-card">
                                    <div className="pkg-header">
                                        <span className="pkg-number">Package {pkg.packageNumber}/{totalPackageCount}</span>
                                        <span className="supplier-tag"><i className="fas fa-store"></i> By {pkg.supplierName}</span>
                                    </div>

                                    <div className="pkg-items-list">
                                        {pkg.items.map((item: any, idx: number) => {
                                            const img = item.displayDetails?.image_url?.[0] || item.image_urls?.[0] || '/placeholder.jpg';
                                            const title = item.displayDetails?.title || item.title;
                                            const color = item.options?.color && item.options.color !== 'Standard' ? item.options.color : 'Standard';
                                            const size = item.options?.size && item.options.size !== 'Standard' ? item.options.size : null;

                                            return (
                                                <div key={idx} className="item-row">
                                                    <div className="item-img-container">
                                                        <Image src={img} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
                                                    </div>
                                                    <div className="item-details">
                                                        <h4 className="item-title">{title}</h4>
                                                        <div className="item-meta">
                                                            <span>Color: <strong>{color}</strong></span>
                                                            {size && <span>Size: <strong>{size}</strong></span>}
                                                        </div>
                                                        <div className="item-pricing">
                                                            <span className="item-price">Rs. {Number(item.displayDetails?.price_each || item.price || 0).toLocaleString()}</span>
                                                            <span className="item-qty">Quantity: {item.quantity}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="dashed-line"></div>

                                    <div className="pkg-cost-rows">
                                        <div className="cost-row"><span>Wholesale Price</span><span>Rs. {pkg.wholesalePrice.toLocaleString()}</span></div>
                                        <div className="cost-row"><span>Delivery Charges</span><span>Rs. {pkg.deliveryFee.toLocaleString()}</span></div>
                                        <div className="cost-row"><span>Cash Handling Charges</span><span>Rs. {pkg.handlingFee.toLocaleString()}</span></div>
                                        <div className="cost-row pkg-total-line">
                                            <strong>Final Package Total</strong>
                                            <strong>Rs. {pkg.packageTotal.toLocaleString()}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* 3. Payment Option (COD) */}
                            <div className="card-ui payment-card">
                                <div className="cod-flex">
                                    <div className="radio-outer"><div className="radio-inner"></div></div>
                                    <div className="cod-badge-icon"><i className="fas fa-hand-holding-dollar"></i></div>
                                    <div className="cod-labels">
                                        <strong>Cash on delivery (COD)</strong>
                                        <span>Pay cash at your doorstep when parcel is delivered</span>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Accordions */}
                            <div className="card-ui accordions-card">
                                <div className="acc-section">
                                    <div className="acc-header" onClick={() => setDeliveryOpen(!deliveryOpen)}>
                                        <span className="acc-title"><i className="fas fa-truck-fast text-emerald"></i> Delivery Guarantee 🚚</span>
                                        <i className={`fas fa-chevron-down acc-arrow ${deliveryOpen ? 'open' : ''}`}></i>
                                    </div>
                                    {deliveryOpen && (
                                        <div className="acc-content">
                                            <div><i className="fas fa-circle-check text-emerald"></i> Fast delivery across all cities in Pakistan 🇵🇰</div>
                                            <div><i className="fas fa-circle-check text-emerald"></i> 3 - 6 business days courier delivery timeline</div>
                                            <div><i className="fas fa-circle-check text-emerald"></i> Complete delivery tracking support</div>
                                        </div>
                                    )}
                                </div>

                                <div className="solid-line"></div>

                                <div className="acc-section">
                                    <div className="acc-header" onClick={() => setReturnOpen(!returnOpen)}>
                                        <span className="acc-title"><i className="fas fa-shield-halved text-emerald"></i> Return Policy Protection 🛡️</span>
                                        <i className={`fas fa-chevron-down acc-arrow ${returnOpen ? 'open' : ''}`}></i>
                                    </div>
                                    {returnOpen && (
                                        <div className="acc-content">
                                            <div><i className="fas fa-circle-check text-emerald"></i> 7-day hassle-free replacement & return policy</div>
                                            <div><i className="fas fa-circle-check text-emerald"></i> Instant claim support from customer portal</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* 🟢 RIGHT COLUMN: Summary & Order Button */}
                        <div className="layout-right-col">
                            <div className="card-ui summary-sticky-card">
                                <h3 className="summary-title">Summary & Payment</h3>

                                {/* Coupon Box */}
                                <div className="coupon-block">
                                    {!appliedCoupon ? (
                                        <div>
                                            <label className="coupon-label"><i className="fas fa-gift text-orange"></i> Have a Promo Code?</label>
                                            <div className="coupon-input-flex">
                                                <input 
                                                    type="text" 
                                                    placeholder="ENTER CODE" 
                                                    value={couponInput} 
                                                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                                />
                                                <button onClick={handleApplyCoupon} disabled={!couponInput.trim() || isVerifyingCoupon}>
                                                    {isVerifyingCoupon ? '...' : 'Apply'}
                                                </button>
                                            </div>
                                            {couponFeedback && (
                                                <p className={`feedback-msg ${couponFeedback.type}`}>{couponFeedback.text}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="applied-pill">
                                            <div>
                                                <span className="pill-status"><i className="fas fa-circle-check"></i> COUPON APPLIED</span>
                                                <span className="pill-code">{appliedCoupon.code}</span>
                                            </div>
                                            <div className="pill-right">
                                                <span className="pill-discount">- Rs. {appliedCoupon.discount}</span>
                                                <button onClick={() => setAppliedCoupon(null)} className="pill-delete" title="Remove"><i className="fas fa-times"></i></button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="solid-line"></div>

                                {/* Breakdown Table */}
                                <div className="totals-table">
                                    <div className="total-row"><span>Price</span><span>Rs. {totalOrderWholesale.toLocaleString()}</span></div>
                                    <div className="total-row"><span>Total Delivery Charges</span><span>Rs. {totalOrderDelivery.toLocaleString()}</span></div>
                                    <div className="total-row"><span>Cash Handling Charges</span><span>Rs. {totalOrderHandling.toLocaleString()}</span></div>
                                    {appliedCoupon && (
                                        <div className="total-row discount-row">
                                            <span>Coupon Discount</span>
                                            <span>- Rs. {discountVal.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="solid-line"></div>
                                    <div className="total-row grand-total-row">
                                        <strong>Total Payable</strong>
                                        <strong className="grand-amount">Rs. {finalTotalPayable.toLocaleString()}</strong>
                                    </div>
                                </div>

                                {/* Desktop Button */}
                                <div className="desktop-btn-wrap">
                                    <button onClick={handlePlaceOrder} disabled={loading} className="order-now-btn">
                                        {loading ? <><i className="fas fa-circle-notch fa-spin"></i> Placing Order...</> : <><i className="fas fa-shield-check"></i> Order Now</>}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* 🟢 MOBILE STICKY BOTTOM BAR (Always Above Everything) */}
                    <div className="mobile-checkout-sticky-footer">
                        <div className="mobile-footer-flex">
                            <div className="mobile-price-details">
                                <span className="lbl">Total Payable Amount</span>
                                <span className="val">Rs. {finalTotalPayable.toLocaleString()}</span>
                            </div>
                            <button onClick={handlePlaceOrder} disabled={loading} className="mobile-order-btn">
                                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Order Now'}
                            </button>
                        </div>
                    </div>

                </div>
            )}

            {/* 🟢 ZERO-OVERFLOW PURE CSS */}
            <style jsx>{`
                * {
                    box-sizing: border-box !important;
                }

                .checkout-master-root {
                    min-height: 100vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', -apple-system, sans-serif;
                    width: 100%;
                    max-width: 100vw;
                    overflow-x: hidden !important;
                    position: relative;
                }

                /* NAVIGATION HEADER */
                .checkout-top-nav {
                    position: sticky; top: 0; z-index: 90;
                    background: #ffffff;
                    border-bottom: 1px solid #eef2f6;
                    padding: 10px 16px;
                    width: 100%;
                }
                .container-inner {
                    max-width: 1200px; margin: 0 auto;
                    display: flex; align-items: center; gap: 12px;
                    width: 100%;
                }
                .back-btn-pill {
                    width: 34px; height: 34px; border-radius: 50%;
                    border: none; background: #f1f5f9; color: #334155;
                    font-size: 13px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; flex-shrink: 0;
                }
                .nav-title-text { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0; }

                /* 🟢 2-COLUMN DESKTOP / 1-COLUMN MOBILE LAYOUT */
                .checkout-layout-grid {
                    width: 100%;
                    max-width: 1200px; 
                    margin: 12px auto 0;
                    padding: 0 12px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 14px;
                }

                .layout-left-col, .layout-right-col {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0;
                }

                @media (min-width: 1024px) {
                    .checkout-layout-grid {
                        flex-direction: row;
                        align-items: flex-start;
                        gap: 24px;
                        margin-top: 20px;
                        padding: 0 20px;
                    }
                    .layout-left-col { flex: 1.5; }
                    .layout-right-col { flex: 1; position: sticky; top: 80px; }
                }

                .col-section-header {
                    font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 8px;
                }

                /* CARDS */
                .card-ui {
                    background: #ffffff; border-radius: 14px; padding: 14px;
                    border: 1px solid #f1f5f9; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
                    margin-bottom: 12px; width: 100%; max-width: 100%;
                }

                /* ADDRESS CARD */
                .address-card { cursor: pointer; border: 1.5px solid #e2e8f0; }
                .address-top-line { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
                .customer-name { font-size: 15px; font-weight: 700; color: #0f172a; }
                .pencil-btn { color: #0284c7; background: #f0f9ff; border: none; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; }
                .address-str { font-size: 13px; color: #475569; margin: 0 0 4px 0; line-height: 1.4; word-break: break-word; }
                .phone-str { font-size: 12px; color: #64748b; margin: 0; font-weight: 500; }
                .empty-address-prompt { display: flex; align-items: center; gap: 12px; }
                .plus-icon { width: 38px; height: 38px; border-radius: 50%; background: #fff7ed; color: #f85606; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }

                /* PACKAGE CARD */
                .pkg-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 6px; }
                .pkg-number { font-size: 14px; font-weight: 800; color: #0f172a; }
                .supplier-tag { background: #f8fafc; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; color: #334155; }

                .item-row { display: flex; gap: 12px; margin-bottom: 10px; width: 100%; }
                .item-img-container { width: 60px; height: 60px; min-width: 60px; border-radius: 8px; overflow: hidden; position: relative; background: #f1f5f9; border: 1px solid #e2e8f0; flex-shrink: 0; }
                .item-details { flex: 1; min-width: 0; }
                .item-title { font-size: 12.5px; font-weight: 600; color: #1e293b; margin: 0 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .item-meta { font-size: 11px; color: #64748b; margin-bottom: 3px; display: flex; gap: 6px; }
                .item-pricing { display: flex; justify-content: space-between; align-items: center; }
                .item-price { font-size: 13.5px; font-weight: 700; color: #0f172a; }
                .item-qty { font-size: 11px; color: #64748b; background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; }

                .dashed-line { height: 1px; border-top: 1px dashed #cbd5e1; margin: 10px 0; width: 100%; }
                .solid-line { height: 1px; background: #f1f5f9; margin: 10px 0; width: 100%; }

                .pkg-cost-rows { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: #475569; width: 100%; }
                .cost-row { display: flex; justify-content: space-between; }
                .pkg-total-line { font-size: 13.5px; color: #0f172a; border-top: 1px dashed #e2e8f0; padding-top: 6px; margin-top: 2px; }

                /* PAYMENT CARD */
                .cod-flex { display: flex; align-items: center; gap: 12px; }
                .radio-outer { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #00b862; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .radio-inner { width: 8px; height: 8px; border-radius: 50%; background: #00b862; }
                .cod-badge-icon { width: 38px; height: 38px; border-radius: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
                .cod-labels strong { display: block; font-size: 13px; color: #0f172a; }
                .cod-labels span { font-size: 11px; color: #64748b; }

                /* ACCORDIONS */
                .acc-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 2px 0; }
                .acc-title { font-size: 12.5px; font-weight: 700; color: #059669; }
                .acc-arrow { font-size: 11px; color: #059669; transition: transform 0.2s; }
                .acc-arrow.open { transform: rotate(180deg); }
                .acc-content { padding-top: 8px; display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; color: #475569; }
                .text-emerald { color: #059669; margin-right: 4px; }

                /* SUMMARY SIDEBAR CARD */
                .summary-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
                .coupon-label { font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 6px; display: block; }
                .text-orange { color: #f85606; margin-right: 4px; }
                .coupon-input-flex { display: flex; gap: 6px; width: 100%; }
                .coupon-input-flex input { flex: 1; min-width: 0; padding: 8px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12px; font-family: monospace; font-weight: 700; text-transform: uppercase; outline: none; }
                .coupon-input-flex button { background: #f85606; color: white; border: none; padding: 0 14px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; flex-shrink: 0; }
                
                .feedback-msg { font-size: 11px; font-weight: 600; margin-top: 4px; }
                .feedback-msg.error { color: #dc2626; }
                .feedback-msg.success { color: #16a34a; }

                .applied-pill { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 10px; border-radius: 10px; }
                .pill-status { font-size: 9px; font-weight: 800; color: #16a34a; display: block; }
                .pill-code { font-size: 12px; font-weight: 800; color: #0f172a; font-family: monospace; }
                .pill-right { display: flex; align-items: center; gap: 6px; }
                .pill-discount { font-size: 13px; font-weight: 800; color: #dc2626; }
                .pill-delete { background: #fee2e2; color: #dc2626; border: none; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; }

                .totals-table { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: #475569; margin: 10px 0; width: 100%; }
                .total-row { display: flex; justify-content: space-between; }
                .discount-row { color: #dc2626; font-weight: 600; }
                .grand-total-row { font-size: 14px; color: #0f172a; padding-top: 4px; }
                .grand-amount { font-size: 18px; font-weight: 900; color: #00b862; }

                .desktop-btn-wrap { display: none; margin-top: 14px; }
                @media (min-width: 1024px) { .desktop-btn-wrap { display: block; } }

                .order-now-btn {
                    width: 100%; height: 48px;
                    background: #00b862; color: white; border: none;
                    border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    box-shadow: 0 4px 12px rgba(0, 184, 98, 0.3); transition: 0.2s;
                }
                .order-now-btn:hover { background: #009e53; }

                /* 🟢 🟢 🟢 THE MASTER FIX: MOBILE CHECKOUT STICKY FOOTER (Z-INDEX 10001) */
                .mobile-checkout-sticky-footer {
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    width: 100% !important;
                    z-index: 10001 !important; /* Higher than Bottom Nav's 9999 */
                    background: #ffffff !important;
                    border-top: 1px solid #e2e8f0 !important;
                    padding: 10px 14px max(10px, env(safe-area-inset-bottom)) 14px !important;
                    box-shadow: 0 -8px 25px rgba(0,0,0,0.12) !important;
                    display: block !important;
                }

                @media (min-width: 1024px) { 
                    .mobile-checkout-sticky-footer { display: none !important; } 
                }

                .checkout-summary-view {
                    width: 100%;
                    max-width: 100%;
                    padding-bottom: 120px !important; /* Breathing room for sticky bar */
                }

                .mobile-footer-flex {
                    max-width: 600px; margin: 0 auto;
                    display: flex; justify-content: space-between; align-items: center; gap: 12px;
                    width: 100%;
                }
                .mobile-price-details .lbl { font-size: 10px; color: #64748b; font-weight: 600; display: block; line-height: 1.2; }
                .mobile-price-details .val { font-size: 17px; font-weight: 900; color: #00b862; line-height: 1.2; }
                
                .mobile-order-btn {
                    flex: 1; max-width: 200px; height: 46px; 
                    background: #00b862 !important; color: white !important; border: none !important;
                    border-radius: 10px !important; font-size: 15px !important; font-weight: 800 !important; cursor: pointer !important;
                    box-shadow: 0 4px 12px rgba(0, 184, 98, 0.35) !important;
                    display: flex; align-items: center; justify-content: center;
                }

                /* FULL ADDRESS VIEW */
                .address-view-wrapper { min-height: 100vh; background: #f8fafc; padding-bottom: 40px; width: 100%; }
                .address-body-wrap { max-width: 600px; margin: 12px auto 0; padding: 0 12px; width: 100%; }
                .address-card-box { background: white; border-radius: 16px; padding: 16px; border: 1px solid #f1f5f9; width: 100%; }
                .info-banner { display: flex; align-items: center; gap: 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 10px 12px; margin-bottom: 16px; }
                .info-icon { font-size: 16px; color: #2563eb; flex-shrink: 0; }
                .info-banner strong { display: block; font-size: 12.5px; color: #1e3a8a; }
                .info-banner span { font-size: 11px; color: #3b82f6; }

                .address-pure-form { display: flex; flex-direction: column; gap: 12px; width: 100%; }
                .form-field-unit { display: flex; flex-direction: column; gap: 4px; width: 100%; }
                .input-group-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }
                .address-pure-form label { font-size: 12px; font-weight: 700; color: #334155; }
                .optional { font-size: 10px; color: #94a3b8; font-weight: 400; }
                
                .input-wrapper { position: relative; width: 100%; }
                .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 13px; }
                .select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 11px; pointer-events: none; }
                
                .address-pure-form input, .address-pure-form select, .address-pure-form textarea {
                    width: 100%; box-sizing: border-box; padding: 10px 12px 10px 36px;
                    background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
                    font-size: 13px; color: #1e293b; font-weight: 500; outline: none;
                }
                .address-pure-form textarea { padding: 10px 12px; resize: vertical; }
                .address-pure-form select { appearance: none; cursor: pointer; }
                .address-pure-form input:focus, .address-pure-form select:focus, .address-pure-form textarea:focus { border-color: #00b862; background: #ffffff; }

                .address-btn-container { margin-top: 10px; width: 100%; }
                .save-address-btn {
                    width: 100%; height: 48px; background: #00b862; color: white; border: none;
                    border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    box-shadow: 0 4px 12px rgba(0, 184, 98, 0.3);
                }

                /* DISCARD MODAL */
                .discard-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100002; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
                .discard-box { background: white; border-radius: 16px; padding: 20px; max-width: 320px; width: 100%; text-align: center; }
                .warn-icon { font-size: 32px; color: #f59e0b; margin-bottom: 10px; }
                .discard-box h3 { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
                .discard-box p { font-size: 12.5px; color: #64748b; line-height: 1.4; margin: 0 0 16px 0; }
                .discard-actions { display: flex; gap: 8px; }
                .btn-no { flex: 1; padding: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #475569; border-radius: 8px; font-weight: 700; cursor: pointer; }
                .btn-yes { flex: 1; padding: 10px; border: none; background: #00b862; color: white; border-radius: 8px; font-weight: 700; cursor: pointer; }

                .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
                .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #00b862; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}