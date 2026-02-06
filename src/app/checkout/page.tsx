"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { pakistanLocations } from '@/lib/locations';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/AuthProvider';

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [checkoutState, setCheckoutState] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [customerArea, setCustomerArea] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    
    useEffect(() => {
        const storedState = sessionStorage.getItem('checkoutState');
        if (storedState) {
            setCheckoutState(JSON.parse(storedState));
        } else {
            router.push('/cart');
        }
    }, [router]);

    const citiesForProvince = useMemo(() => {
        if (!selectedProvince) return [];
        return pakistanLocations.cities[selectedProvince as keyof typeof pakistanLocations.cities]?.sort() || [];
    }, [selectedProvince]);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkoutState) return;
        setLoading(true);

        const payload: any = {
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail || 'no-email@provided.com',
            customer_city: `${selectedProvince} - ${selectedCity}`,
            customer_address: `${customerAddress}, Area: ${customerArea}`,
        };

        if (checkoutState.isDirectBuy) {
            payload.items = checkoutState.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                profit: item.options?.profit || 0,
                // ✅ Pass the EXACT options object we built in place-order
                options: item.options 
            }));
        } else {
            // Cart Logic
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
            console.error(error);
            alert("Failed to place order: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    if (!checkoutState) return <div>Loading checkout...</div>;

    const getImgUrl = (item: any) => {
        if (item.displayDetails?.image_url) {
             const img = item.displayDetails.image_url;
             return Array.isArray(img) ? img[0] : (typeof img === 'string' && img.startsWith('[') ? JSON.parse(img)[0] : img);
        }
        if (Array.isArray(item.image_urls) && item.image_urls.length > 0) return item.image_urls[0];
        return '/placeholder.jpg';
    };

    const getTitle = (item: any) => item.displayDetails?.title || item.title || "Product";
    
    // Display Helper for options
    const renderVariantDetails = (item: any) => {
        const opts = item.options || {};
        // Show color/size if they exist and are not "Standard" (optional visual cleanup)
        // or just show them always:
        if (opts.color || opts.size) {
            return (
                <div style={{fontSize:'12px', color:'#666', marginTop:'4px'}}>
                    {opts.color} | {opts.size}
                </div>
            );
        }
        return null;
    };

    return (
        <div id="checkout-page" className="page active">
            <header className="page-header">
                <button className="back-button" onClick={() => router.back()} type="button"><i className="fas fa-arrow-left"></i></button>
                <h3 className="header-title">Checkout</h3>
            </header>
            <div className="page-content">
                <form onSubmit={handlePlaceOrder}>
                    <div className="checkout-layout">
                        {/* Left Column - Form */}
                        <div className="checkout-left-column">
                            <div className="checkout-card">
                                <h4>Shipping Information</h4>
                                <div className="checkout-form">
                                    <div className="form-group"><label>Full Name</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required /><i className="fas fa-user"></i></div>
                                    <div className="form-group"><label>Phone Number</label><input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required /><i className="fas fa-phone"></i></div>
                                    <div className="form-group"><label>Email (Optional)</label><input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} /><i className="fas fa-envelope"></i></div>
                                    <div className="form-group"><label>Province</label><select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)} required><option value="">Select Province</option>{pakistanLocations.provinces.map(p => <option key={p} value={p}>{p}</option>)}</select><i className="fas fa-globe-asia"></i></div>
                                    <div className="form-group"><label>City</label><select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} required disabled={!selectedProvince}><option value="">Select City</option>{citiesForProvince.map(c => <option key={c} value={c}>{c}</option>)}</select><i className="fas fa-city"></i></div>
                                    <div className="form-group"><label>Area</label><input type="text" value={customerArea} onChange={e => setCustomerArea(e.target.value)} required /><i className="fas fa-road"></i></div>
                                    <div className="form-group"><label>Address</label><input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} required placeholder="House #, Street" /><i className="fas fa-map-marker-alt"></i></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Summary */}
                        <div className="checkout-right-column">
                            <div className="checkout-card">
                                <h4>Order Summary</h4>
                                {checkoutState.items.map((item: any, index: number) => (
                                    <div key={index} className="checkout-order-summary-item">
                                        <div style={{width:'60px', height:'60px', position:'relative', borderRadius:'8px', overflow:'hidden', flexShrink: 0}}>
                                            <Image src={getImgUrl(item)} alt="Product" fill style={{objectFit:'cover'}} unoptimized />
                                        </div>
                                        <div className="details">
                                            <p className="title">{getTitle(item)}</p>
                                            <p>Qty: {item.quantity}</p>
                                            {renderVariantDetails(item)}
                                        </div>
                                        <span className="price">Rs. {Number(item.displayDetails?.subtotal || item.totalPrice || 0).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="price-summary">
                                    <div className="summary-row total">
                                        <span>Grand Total</span>
                                        <span>Rs. {Number(checkoutState.totalPrice).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                             <button type="submit" className="styled-bottom-button" style={{ marginTop: '20px' }} disabled={loading}>
                                {loading ? 'Placing Order...' : `Place Order`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}