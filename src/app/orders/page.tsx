"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaSearch, FaBoxOpen, FaLock, FaSignInAlt, FaTimes, 
    FaShieldAlt, FaBan, FaStar, FaRegStar, FaWhatsapp, 
    FaChevronRight, FaArrowLeft, FaStore, FaCalendarAlt, 
    FaMapMarkerAlt, FaTruck, FaExternalLinkAlt, FaCheck
} from 'react-icons/fa';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

// ==========================================
// 1. TYPES & HELPERS
// ==========================================
const fetcher = (url: string) => apiClient(url, 'GET');

const CANCEL_REASONS = [
    "Change of Mind / Ab nahi chahiye",
    "Ordered by Mistake / Ghalati se order ho gaya",
    "Test Order / Sirf check kar raha tha",
    "Found a better price elsewhere / Kahin aur sasta mil gaya",
    "Delivery time is too long / Delivery mein dair hai",
    "Other"
];

type OrderItem = {
    itemId: number;
    productId: string;
    title: string;
    slug?: string;                 
    sku?: string;                  
    image: string | null;
    quantity: number;
    variantString: string; 
    profit: number; 
    costPrice: number;             
    options?: { color?: string; size?: string; [key: string]: any }; 
    status?: string;               
    cancellationReason?: string | null;
    returnStatus?: string; 
};

type PackageDetails = {
    shipmentId: string;
    packageNumber: number;
    supplierId: string;
    supplierName: string;
    supplierPic: string | null;
    status: string;
    cancellationReason?: string | null;
    courier: { name: string | null; trackingNumber: string | null; };
    canTrack: boolean;
    packagePayable: number;
    items: OrderItem[];
};

type Order = {
    orderId: string;
    date: string;
    totalPrice: number;
    originalTotal?: number;
    deliveryFee: number;
    totalProfit: number;
    status: string; 
    confirmationStatus?: string;
    isPendingWhatsApp?: boolean;
    canTrack: boolean;
    canReturn?: boolean;
    daysLeftToReturn?: number;
    deliveredAt?: string | null;
    cancellationReason?: string | null;
    customer?: { name: string; phone: string; address: string; city: string; };
    packages: PackageDetails[];
    items: OrderItem[];
};

type ReviewData = {
    product_id: string;
    order_id?: string;
    rating: number;
    comment: string;
    image_urls: string[];
    created_at: string;
};

// ==========================================
// 2. SKELETON COMPONENT
// ==========================================
const OrderSkeleton = () => (
    <div style={styles.card}>
        <div style={{ ...styles.cardHeader, background: '#0B192C', height: 74 }}></div>
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ height: 18, width: '35%', background: '#E2E8F0', borderRadius: 8 }}></div>
                <div style={{ height: 28, width: '28%', background: '#E2E8F0', borderRadius: 14 }}></div>
            </div>
            <div style={{ height: 120, background: '#F8FAFC', borderRadius: 14, marginBottom: 18 }}></div>
            <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 92, height: 92, background: '#E2E8F0', borderRadius: 14, flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                    <div style={{ height: 18, width: '85%', background: '#E2E8F0', borderRadius: 6, marginBottom: 8 }}></div>
                    <div style={{ height: 14, width: '50%', background: '#E2E8F0', borderRadius: 6, marginBottom: 12 }}></div>
                    <div style={{ height: 14, width: '30%', background: '#E2E8F0', borderRadius: 6 }}></div>
                </div>
            </div>
        </div>
    </div>
);

// ==========================================
// 3. MAIN ORDERS PAGE
// ==========================================
export default function OrdersPage() {
    const router = useRouter();
    const { user } = useAuth();
    
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Processing');
    const [search, setSearch] = useState('');

    const [cancelModalState, setCancelModalState] = useState<{
        isOpen: boolean; mode: 'order' | 'item' | null; orderId: string | null; itemId: number | null;
    }>({ isOpen: false, mode: null, orderId: null, itemId: null });
    const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
    const [isCancelling, setIsCancelling] = useState(false);

    // 🟢 UNREVIEWED DELIVERED PRODUCT BOTTOM SHEET STATE
    const [unreviewedPrompt, setUnreviewedPrompt] = useState<{ order: Order; item: OrderItem } | null>(null);
    const [hasDismissedPrompt, setHasDismissedPrompt] = useState(false);
    const [popupHoverStar, setPopupHoverStar] = useState<number>(0);

    const { data: orders = [], isLoading, mutate } = useSWR<Order[]>(user ? '/orders' : null, fetcher, {
        revalidateOnFocus: true, refreshInterval: 12000, keepPreviousData: true
    });
    const { data: myReviews = [] } = useSWR<ReviewData[]>(user ? '/products/reviews/mine' : null, fetcher);

    // Cancel Handler
    const handleCancelSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cancelReason) return alert("Please select a cancellation reason.");

        setIsCancelling(true);
        try {
            if (cancelModalState.mode === 'order') {
                await apiClient('/orders/cancel', 'POST', { orderId: cancelModalState.orderId, reason: cancelReason });
            } else if (cancelModalState.mode === 'item') {
                await apiClient(`/orders/${cancelModalState.orderId}/items/${cancelModalState.itemId}/cancel`, 'PUT', { reason: cancelReason });
            }
            setCancelModalState({ isOpen: false, mode: null, orderId: null, itemId: null });
            mutate(); 
            alert("Order updated successfully!");
        } catch (err: any) {
            alert(err.message || "Cancellation failed. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    // 🟢 100% FIXED CATEGORIZATION
    const categorizedOrders = useMemo(() => {
        const cats: { [key: string]: Order[] } = { 
            Unconfirmed: [], Processing: [], Shipping: [], Delivered: [], Cancelled: [], Returned: [] 
        };
        
        orders.forEach(o => {
            const rawStatus = (o.packages[0]?.status || o.status || 'processing').toLowerCase().trim();
            const hasTracking = o.packages.some(p => p.courier?.trackingNumber && p.courier.trackingNumber.trim() !== '');

            if (rawStatus === 'delivered') {
                cats.Delivered.push(o);
            } else if (rawStatus.includes('return') || rawStatus.includes('rto') || rawStatus.includes('refused')) {
                cats.Returned.push(o);
            } else if (rawStatus === 'cancelled' || rawStatus === 'auto_cancelled') {
                cats.Cancelled.push(o);
            } else if (hasTracking || ['orderdispatched', 'order dispatched', 'intransit', 'in_transit', 'outfordelivery', 'out_for_delivery', 'shipped'].some(st => rawStatus.includes(st))) {
                cats.Shipping.push(o);
            } else if (o.isPendingWhatsApp || o.confirmationStatus === 'pending_whatsapp') {
                cats.Unconfirmed.push(o);
            } else {
                cats.Processing.push(o); 
            }
        });

        const searchLower = search.toLowerCase().trim();
        Object.keys(cats).forEach(k => {
            if (searchLower) {
                cats[k] = cats[k].filter(o => 
                    o.orderId.toLowerCase().includes(searchLower) || 
                    o.customer?.name.toLowerCase().includes(searchLower) ||
                    o.packages.some(p => p.items.some(i => i.title.toLowerCase().includes(searchLower)))
                );
            }
            cats[k].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });

        return cats;
    }, [orders, search]);

    // 🟢 AUTOMATIC UNREVIEWED DELIVERED PRODUCT DETECTION (Bottom Popup Trigger)
    useEffect(() => {
        if (!isLoading && orders.length > 0 && !hasDismissedPrompt && !unreviewedPrompt) {
            const deliveredOrders = orders.filter(o => 
                (o.packages[0]?.status || o.status || '').toLowerCase().trim() === 'delivered'
            );
            
            for (const ord of deliveredOrders) {
                for (const pkg of ord.packages) {
                    for (const it of pkg.items) {
                        if (it.status !== 'cancelled') {
                            const isReviewed = myReviews.some(
                                (r: any) => String(r.product_id) === String(it.productId)
                            );
                            if (!isReviewed) {
                                // Unreviewed delivered product found! Trigger modal after 1.2s delay
                                const timer = setTimeout(() => {
                                    setUnreviewedPrompt({ order: ord, item: it });
                                }, 1200);
                                return () => clearTimeout(timer);
                            }
                        }
                    }
                }
            }
        }
    }, [orders, myReviews, isLoading, hasDismissedPrompt, unreviewedPrompt]);

    const TABS = ['Unconfirmed', 'Processing', 'Shipping', 'Delivered', 'Cancelled', 'Returned'];

    return (
        <div style={styles.page}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');
                body { margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; background: #F8FAFC; color: #0F172A; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.15); }
                }
                .pulse-circle { animation: pulseGlow 2.5s infinite ease-in-out; }

                /* 🟢 HIGH-END MOVING DOTTED LOOP ANIMATION */
                @keyframes movingDottedRoute {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 28px; }
                }
                .animated-dotted-pipe {
                    width: 3px;
                    flex: 1;
                    min-height: 48px;
                    margin: 4px 0;
                    background: repeating-linear-gradient(
                        to bottom,
                        #2563EB 0px,
                        #2563EB 6px,
                        transparent 6px,
                        transparent 12px
                    );
                    background-size: 3px 24px;
                    animation: movingDottedRoute 1.2s linear infinite;
                }
            `}</style>
            
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <motion.button 
                        whileTap={{ scale: 0.88 }}
                        onClick={() => router.back()} 
                        style={styles.backBtn}
                    >
                        <FaArrowLeft size={16} color="#0B192C" />
                    </motion.button>
                    <h1 style={styles.title}>{activeTab} Orders</h1>
                    <div style={{ width: 40 }}></div>
                </div>
            </header>

            {!user ? (
                <div style={styles.container}>
                    <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} style={styles.guestCard}>
                        <div style={styles.guestIconCircle}><FaLock size={30} color="#0B192C" /></div>
                        <h2 style={styles.guestTitle}>Please Sign In</h2>
                        <p style={styles.guestSubtitle}>Sign in to view your live parcels, courier tracking, and access the 7-day return guarantee.</p>
                        <motion.button whileTap={{ scale: 0.96 }} style={styles.guestLoginBtn} onClick={() => setIsAuthModalOpen(true)}>
                            <FaSignInAlt style={{ marginRight: 8 }} size={16} /> Login / Register
                        </motion.button>
                    </motion.div>
                </div>
            ) : (
                <div style={styles.container}>
                    
                    {/* Search */}
                    <div style={styles.search}>
                        <FaSearch size={16} color="#94A3B8" style={{ marginRight: 12, flexShrink: 0 }} />
                        <input 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            placeholder={`Search Order ID, product, or customer...`} 
                            style={styles.searchInput} 
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={styles.clearSearchBtn}>
                                <FaTimes size={12} color="#64748B" />
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div style={styles.tabsWrapper} className="no-scrollbar">
                        {TABS.map(tab => {
                            const count = categorizedOrders[tab]?.length || 0;
                            const isActive = activeTab === tab;
                            return (
                                <motion.button 
                                    key={tab} 
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => setActiveTab(tab)} 
                                    style={isActive ? styles.tabActive : styles.tab}
                                >
                                    <span>{tab}</span>
                                    {count > 0 && (
                                        <span style={isActive ? styles.tabBadgeActive : styles.tabBadge}>
                                            {count}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Orders List */}
                    <div style={styles.list}>
                        {isLoading && orders.length === 0 ? (
                            <><OrderSkeleton/><OrderSkeleton/></>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {categorizedOrders[activeTab].length === 0 ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={styles.empty}>
                                        <div style={styles.emptyIconCircle}><FaBoxOpen size={42} color="#94A3B8" /></div>
                                        <h3 style={{ color: '#0F172A', margin: '12px 0 6px', fontSize: 18, fontWeight: 900 }}>No Orders Found</h3>
                                        <p style={{ color: '#64748B', margin: '0 0 22px', fontSize: 13, lineHeight: 1.5 }}>
                                            You currently do not have any orders under the "{activeTab}" status.
                                        </p>
                                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.push('/')} style={styles.shopNowBtn}>
                                            Explore Trending Catalogs
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    categorizedOrders[activeTab].map((order, index) => (
                                        <OrderCard 
                                            key={order.orderId} 
                                            order={order} 
                                            router={router} 
                                            index={index} 
                                            user={user}
                                            myReviews={myReviews}
                                            onCancelOrder={(oid: string) => setCancelModalState({ isOpen: true, mode: 'order', orderId: oid, itemId: null })}
                                            onCancelItem={(oid: string, iId: number) => setCancelModalState({ isOpen: true, mode: 'item', orderId: oid, itemId: iId })}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            )}

            {/* 🟢 UNREVIEWED DELIVERED PRODUCT RATING BOTTOM SHEET MODAL */}
            <AnimatePresence>
                {unreviewedPrompt && (
                    <div 
                        style={styles.bottomSheetOverlay} 
                        onClick={() => { setHasDismissedPrompt(true); setUnreviewedPrompt(null); }}
                    >
                        <motion.div 
                            initial={{ y: '100%', opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            exit={{ y: '100%', opacity: 0 }} 
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }} 
                            style={styles.bottomSheetCard}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Sheet Drag Handle */}
                            <div style={styles.sheetHandleBar}></div>

                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ECFDF5', color: '#059669', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 900, marginBottom: 6 }}>
                                        <FaCheck size={10} /> Delivered Parcel
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px' }}>
                                        Rate Your Purchase ⭐
                                    </h3>
                                    <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748B' }}>
                                        Aapka feedback doosre buyers ke liye bohot mufeed hai!
                                    </p>
                                </div>
                                <button 
                                    onClick={() => { setHasDismissedPrompt(true); setUnreviewedPrompt(null); }} 
                                    style={styles.sheetCloseBtn}
                                >
                                    <FaTimes size={13} color="#64748B" />
                                </button>
                            </div>

                            {/* Product Info Box */}
                            <div style={styles.sheetProductBox}>
                                <div style={styles.sheetImageWrapper}>
                                    <img 
                                        src={unreviewedPrompt.item.image || 'https://via.placeholder.com/90'} 
                                        alt={unreviewedPrompt.item.title} 
                                        style={styles.productImg} 
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800 }}>
                                        Order #{unreviewedPrompt.order.orderId.substring(0, 8).toUpperCase()} • Item #{unreviewedPrompt.item.sku || String(unreviewedPrompt.item.productId).substring(0,8)}
                                    </div>
                                    <div style={styles.sheetProductTitle}>
                                        {unreviewedPrompt.item.title}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                                        <span style={styles.specChip}>Color: {unreviewedPrompt.item.options?.color || 'Standard'}</span>
                                        <span style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>
                                            Rs. {Math.round(unreviewedPrompt.item.costPrice || (unreviewedPrompt.order.totalPrice / (unreviewedPrompt.order.items.length || 1))).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 🟢 BIG INTERACTIVE 5 STARS (32px) */}
                            <div style={{ textAlign: 'center', margin: '20px 0 16px' }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 10 }}>
                                    Tap stars to rate product:
                                </div>
                                <div style={{ display: 'inline-flex', gap: 10, justifyContent: 'center' }}>
                                    {[1, 2, 3, 4, 5].map(starNum => {
                                        const isFilled = starNum <= (popupHoverStar || 5);
                                        return (
                                            <motion.button 
                                                key={starNum}
                                                whileHover={{ scale: 1.25 }}
                                                whileTap={{ scale: 0.9 }}
                                                onMouseEnter={() => setPopupHoverStar(starNum)}
                                                onMouseLeave={() => setPopupHoverStar(0)}
                                                onClick={() => {
                                                    const oid = unreviewedPrompt.order.orderId;
                                                    const pid = unreviewedPrompt.item.productId;
                                                    router.push(`/orders/review/${oid}/${pid}?initialRating=${starNum}`);
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                            >
                                                {isFilled ? (
                                                    <FaStar color="#F59E0B" size={32} />
                                                ) : (
                                                    <FaRegStar color="#CBD5E1" size={32} />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Direct Button */}
                            <motion.button 
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    const oid = unreviewedPrompt.order.orderId;
                                    const pid = unreviewedPrompt.item.productId;
                                    router.push(`/orders/review/${oid}/${pid}`);
                                }}
                                style={styles.sheetSubmitBtn}
                            >
                                Write Detailed Review & Upload Photos
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Cancel Modal */}
            <AnimatePresence>
                {cancelModalState.isOpen && (
                    <div style={styles.modalOverlay} onClick={() => setCancelModalState({ ...cancelModalState, isOpen: false })}>
                        <motion.div 
                            initial={{ scale: 0.92, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.92, opacity: 0, y: 20 }} 
                            style={styles.modalContent} 
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #F1F5F9', paddingBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaShieldAlt size={18} color="#DC2626" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#0F172A' }}>
                                        {cancelModalState.mode === 'order' ? 'Cancel Entire Order' : 'Cancel Single Item'}
                                    </h3>
                                </div>
                                <button onClick={() => setCancelModalState({ ...cancelModalState, isOpen: false })} style={styles.modalCloseBtn}>
                                    <FaTimes size={13} color="#64748B" />
                                </button>
                            </div>
                            <form onSubmit={handleCancelSubmit}>
                                <div style={{ marginBottom: 22 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 8 }}>
                                        Reason for Cancellation *
                                    </label>
                                    <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} style={styles.selectInput} required>
                                        {CANCEL_REASONS.map((r, i) => <option key={i} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button type="button" onClick={() => setCancelModalState({ ...cancelModalState, isOpen: false })} style={styles.cancelGoBackBtn} disabled={isCancelling}>
                                        Go Back
                                    </button>
                                    <button type="submit" style={styles.cancelConfirmBtn} disabled={isCancelling}>
                                        {isCancelling ? 'Processing...' : 'Confirm Cancel'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
}

// ==============================================================
// 4. THE MASTER ORDER CARD (CLICKABLE PRODUCT + ANIMATED DOTTED LINE)
// ==============================================================
function OrderCard({ order, router, onCancelOrder, onCancelItem, index, myReviews, user }: any) {
    
    // Status Theme Styling
    const getStatusTheme = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('delivered')) return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', dot: '#10B981' };
        if (s.includes('return') || s.includes('cancel')) return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', dot: '#EF4444' };
        if (s.includes('transit') || s.includes('shipped') || s.includes('dispatched')) return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', dot: '#3B82F6' };
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', dot: '#F59E0B' };
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // WhatsApp Direct Link
    const rawCustomerPhone = order.customer?.phone || '';
    const cleanDigits = rawCustomerPhone.toString().replace(/\D/g, '');
    const waNumber = cleanDigits.startsWith('03') ? '92' + cleanDigits.substring(1) : (cleanDigits.startsWith('92') ? cleanDigits : '92' + cleanDigits);
    const shortId = order.orderId.substring(0, 8).toUpperCase();
    const waMessageText = encodeURIComponent(
        `Assalam-o-Alaikum ${order.customer?.name || 'Customer'}! 👋\n` +
        `Main *Saman Junction (SJ10)* ki taraf se rabta kar raha hoon aapke Order *#${shortId}* ke hawalay se.`
    );
    const directWhatsAppUrl = `https://wa.me/${waNumber}?text=${waMessageText}`;

    // Customer Avatar
    const customerPic = user?.profile_pic || user?.profilePic || null;
    const customerInitial = (order.customer?.name || 'C').charAt(0).toUpperCase();

    const isCancellable = ['processing', 'pending', 'pending_confirmation'].includes((order.status || '').toLowerCase().replace(/ /g, '_')) && !order.canTrack;
    const activeItemsCount = order.packages?.reduce((acc: number, pkg: any) => acc + pkg.items.filter((i: any) => i.status !== 'cancelled').length, 0) || 0;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 22 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.35, delay: index * 0.05 }} 
            style={styles.card}
        >
            {/* 🔵 LUXURY ROYAL NAVY HEADER */}
            <div style={styles.cardHeader}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={styles.orderIdText}>Order ID : {shortId}</span>
                        <span style={styles.pkgBadge}>({order.packages.length}/{order.packages.length})</span>
                    </div>
                    <div style={styles.orderDateText}>
                        <FaCalendarAlt size={12} style={{ marginRight: 6, opacity: 0.8 }} />
                        Order Date : {formatDate(order.date)}
                    </div>
                </div>

                {order.canTrack && (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => router.push(`/orders/track/${order.orderId}`)} 
                        style={styles.trackHeaderBtn}
                    >
                        <FaTruck size={14} /> Track Parcel
                    </motion.button>
                )}
            </div>

            {/* ⚪ CARD BODY */}
            {order.packages.map((pkg: PackageDetails, pIdx: number) => {
                const currentStatus = pkg.status || order.status;
                const statusTheme = getStatusTheme(currentStatus);

                return (
                    <div key={pkg.shipmentId || pIdx} style={styles.pkgSection}>
                        
                        {/* Status & Amount Meta Bar */}
                        <div style={styles.flexBetween}>
                            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>Status</span>
                            <div style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: statusTheme.bg, color: statusTheme.text, border: `1.5px solid ${statusTheme.border}`,
                                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 900, textTransform: 'capitalize' 
                            }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusTheme.dot }} className="pulse-circle"></span>
                                {currentStatus}
                            </div>
                        </div>

                        <div style={{ ...styles.flexBetween, marginTop: 12, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>Total Amount</span>
                            <span style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                                Rs. {Math.round(order.totalPrice).toLocaleString()}
                            </span>
                        </div>

                        {/* 🛣️ 🟢 ANIMATED DOTTED LOOP TIMELINE (ZERO OVERFLOW!) */}
                        <div style={styles.timelineModernBox}>
                            
                            {/* STEP 1: SUPPLIER NODE */}
                            <div style={styles.timelineStepRow}>
                                <div style={styles.timelineNodeCol}>
                                    <div style={styles.nodeIconCircle}>
                                        {pkg.supplierPic ? (
                                            <img src={pkg.supplierPic} alt={pkg.supplierName} style={styles.avatarImg} />
                                        ) : (
                                            <div style={styles.avatarFallbackNavy}>
                                                <FaStore size={14} color="#FFF" />
                                            </div>
                                        )}
                                    </div>
                                    {/* 🟢 BEAUTIFUL ANIMATED DOTTED MOVING PIPE */}
                                    <div className="animated-dotted-pipe"></div>
                                </div>

                                <div style={styles.timelineContentCol}>
                                    <div style={styles.metaLabelText}>SUPPLIER DISPATCH HUB</div>
                                    <div style={styles.supplierTitleText}>
                                        {pkg.supplierName}
                                        <span style={styles.verifiedStoreBadge}>Verified</span>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 2: CUSTOMER DESTINATION NODE */}
                            <div style={styles.timelineStepRow}>
                                <div style={styles.timelineNodeCol}>
                                    <div style={styles.nodeIconCircleCustomer}>
                                        {customerPic ? (
                                            <img src={customerPic} alt={order.customer?.name} style={styles.avatarImg} />
                                        ) : (
                                            <div style={styles.avatarFallbackGreen}>
                                                {customerInitial}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ ...styles.timelineContentCol, position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={styles.metaLabelText}>CUSTOMER DESTINATION</div>
                                        
                                        {/* WHATSAPP BADGE BUTTON */}
                                        <motion.a 
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.92 }}
                                            href={directWhatsAppUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Open Chat on WhatsApp"
                                            style={styles.whatsappLauncherBadge}
                                        >
                                            <FaWhatsapp size={18} color="#FFFFFF" />
                                            <span style={{ fontSize: 12, fontWeight: 900, color: '#FFFFFF', marginLeft: 6 }}>Chat</span>
                                        </motion.a>
                                    </div>

                                    <div style={styles.customerNameBold}>{order.customer?.name}</div>

                                    {/* Beautiful Glowing Location Pill */}
                                    <div style={styles.addressBox}>
                                        <div style={styles.locationPinCircle}>
                                            <FaMapMarkerAlt size={12} color="#EF4444" />
                                        </div>
                                        <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                                            {order.customer?.address}, {order.customer?.city}<br/>
                                            <strong style={{ color: '#0F172A', fontWeight: 800 }}>{order.customer?.phone}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Partner */}
                        <div style={styles.courierRow}>
                            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>Delivery Logistics</span>
                            <span style={{ fontSize: 13, fontWeight: 900, color: '#0B192C', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaTruck size={16} color="#2563EB" />
                                {pkg.courier?.name || 'Pending Rider Allocation'}
                            </span>
                        </div>

                        {/* 🛍️ PRODUCT ITEMS ROW (CLICKABLE TO DETAIL PAGE) */}
                        {pkg.items.map((item: OrderItem, iIdx: number) => {
                            const review = myReviews.find((r: any) => String(r.product_id) === String(item.productId));
                            const hasReviewed = !!review;
                            const rating = review ? review.rating : 0;
                            const isDelivered = currentStatus.toLowerCase().includes('delivered');
                            const canShowReturn = order.canReturn && (!item.returnStatus || item.returnStatus === 'none');
                            const isItemCancelled = item.status === 'cancelled';

                            // 🟢 PRODUCT CLICK ROUTER
                            const openProductDetail = () => {
                                router.push(`/products/${item.slug || item.productId}`);
                            };

                            return (
                                <div key={iIdx} style={{ ...styles.itemContainer, opacity: isItemCancelled ? 0.5 : 1 }}>
                                    
                                    {/* 🟢 CLICKABLE PRODUCT THUMBNAIL */}
                                    <motion.div 
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={openProductDetail}
                                        style={styles.imageWrapper}
                                        title="Click to view product details"
                                    >
                                        <img 
                                            src={item.image || 'https://via.placeholder.com/100'} 
                                            alt={item.title} 
                                            style={styles.productImg} 
                                        />
                                    </motion.div>

                                    {/* Product Details */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                {/* RETURN BUTTON BADGE */}
                                                {canShowReturn && !isItemCancelled && (
                                                    <motion.div 
                                                        whileHover={{ x: 3 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => router.push(`/orders/return/${order.orderId}/${item.itemId}`)}
                                                        style={styles.returnButtonBadge}
                                                    >
                                                        <span>Return/Refund</span>
                                                        <FaChevronRight size={10} style={{ marginLeft: 4 }} />
                                                    </motion.div>
                                                )}

                                                {item.returnStatus && item.returnStatus !== 'none' && (
                                                    <div style={styles.returnStateBadge}>
                                                        Return {item.returnStatus}
                                                    </div>
                                                )}

                                                <div style={styles.skuTag}>Item ID : {item.sku || String(item.productId).substring(0, 8)}</div>
                                            </div>

                                            {/* Quantity Pill */}
                                            <div style={styles.qtyTag}>x{item.quantity}</div>
                                        </div>

                                        {/* 🟢 CLICKABLE PRODUCT TITLE */}
                                        <div 
                                            onClick={openProductDetail}
                                            style={styles.itemTitleClickable}
                                            title="Click to view product details"
                                        >
                                            {item.title}
                                            <FaExternalLinkAlt size={10} color="#94A3B8" style={{ marginLeft: 6, opacity: 0.7 }} />
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                                            <span style={styles.specChip}>Color: {item.options?.color || 'Standard'}</span>
                                            <span style={styles.profitChip}>Profit: Rs. {Math.round(item.profit || 0)}</span>
                                        </div>

                                        {/* ⭐ 5-STAR RATING DESK (BIGGER 20px STARS & EXACT COLOR) */}
                                        {isDelivered && !isItemCancelled && (
                                            <motion.div 
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => router.push(`/orders/review/${order.orderId}/${item.productId}`)}
                                                style={styles.reviewInteractiveRow}
                                            >
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <span key={star}>
                                                            {star <= rating ? (
                                                                <FaStar color="#F59E0B" size={20} />
                                                            ) : (
                                                                <FaRegStar color="#CBD5E1" size={20} />
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span style={{ fontSize: 13, fontWeight: 900, color: hasReviewed ? '#059669' : '#2563EB', marginLeft: 8 }}>
                                                    {hasReviewed ? `${rating}★ Reviewed` : 'Write Review'}
                                                </span>
                                            </motion.div>
                                        )}

                                        {/* Single Item Cancellation */}
                                        {isCancellable && !isItemCancelled && activeItemsCount > 1 && (
                                            <motion.button 
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => onCancelItem(order.orderId, item.itemId)} 
                                                style={styles.cancelSingleItemBtn}
                                            >
                                                Cancel Item
                                            </motion.button>
                                        )}

                                        {isItemCancelled && (
                                            <div style={styles.cancelledNote}>
                                                Cancelled: {item.cancellationReason || 'Requested by Customer'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}

            {/* Cancel Entire Order Button */}
            {isCancellable && (
                <div style={styles.cardFooterBar}>
                    <motion.button 
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onCancelOrder(order.orderId)} 
                        style={styles.cancelMasterOrderBtn}
                    >
                        <FaBan size={14} /> Cancel Entire Order
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
}

// ==========================================
// 5. STYLES
// ==========================================
const styles: { [key: string]: React.CSSProperties } = {
    page: { minHeight: '100vh', paddingBottom: 110, backgroundColor: '#F8FAFC' },
    header: { 
        background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '14px 20px', 
        position: 'sticky', top: 0, zIndex: 60, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' 
    },
    headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 660, margin: '0 auto' },
    backBtn: { background: '#F1F5F9', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    title: { margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px' },
    container: { maxWidth: 660, margin: '0 auto', padding: '16px' },
    
    // TABS
    tabsWrapper: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 },
    tabActive: { 
        background: '#0B192C', color: '#FFFFFF', border: 'none', padding: '10px 18px', 
        borderRadius: 24, fontSize: 13, fontWeight: 800, cursor: 'pointer', flexShrink: 0, 
        display: 'flex', gap: 8, alignItems: 'center', boxShadow: '0 6px 16px rgba(11,25,44,0.22)' 
    },
    tab: { 
        background: '#FFFFFF', color: '#64748B', border: '1.5px solid #E2E8F0', padding: '10px 18px', 
        borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0, 
        display: 'flex', gap: 8, alignItems: 'center' 
    },
    tabBadgeActive: { background: '#3B82F6', color: '#FFF', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 900 },
    tabBadge: { background: '#F1F5F9', color: '#64748B', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 800 },
    
    // SEARCH
    search: { background: '#FFFFFF', padding: '12px 16px', borderRadius: 14, display: 'flex', alignItems: 'center', border: '1.5px solid #E2E8F0', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
    searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: 14, fontWeight: 600, color: '#0F172A', background: 'transparent' },
    clearSearchBtn: { border: 'none', background: '#F1F5F9', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    
    list: { display: 'flex', flexDirection: 'column', gap: 20 },
    empty: { background: '#FFFFFF', borderRadius: 20, padding: '60px 24px', textAlign: 'center', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' },
    emptyIconCircle: { width: 76, height: 76, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', border: '1px solid #E2E8F0' },
    shopNowBtn: { background: '#0B192C', color: '#FFF', border: 'none', padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' },
    
    // MASTER CARD
    card: { background: '#FFFFFF', borderRadius: 20, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04), 0 8px 10px -6px rgba(0,0,0,0.02)' },
    cardHeader: { 
        background: 'linear-gradient(135deg, #0B192C 0%, #1E293B 100%)', 
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
    },
    orderIdText: { fontSize: 15, fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.4px' },
    pkgBadge: { fontSize: 12, fontWeight: 800, color: '#93C5FD' },
    orderDateText: { fontSize: 12, color: '#CBD5E1', marginTop: 4, display: 'flex', alignItems: 'center', fontWeight: 600 },
    trackHeaderBtn: { background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#FFFFFF', fontWeight: 800, fontSize: 12, padding: '6px 14px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
    
    pkgSection: { padding: '20px' },
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    
    // 🟢 DOTTED TIMELINE
    timelineModernBox: { background: '#F8FAFC', borderRadius: 16, padding: '16px 18px', border: '1px solid #EDF2F7', marginTop: 16, marginBottom: 16 },
    timelineStepRow: { display: 'flex', alignItems: 'stretch' },
    timelineNodeCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 },
    nodeIconCircle: { width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '2px solid #0B192C', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', flexShrink: 0, zIndex: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' },
    nodeIconCircleCustomer: { width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', flexShrink: 0, zIndex: 3, boxShadow: '0 2px 6px rgba(16,185,129,0.2)' },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    avatarFallbackNavy: { width: '100%', height: '100%', background: '#0B192C', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    avatarFallbackGreen: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 },
    
    timelineContentCol: { paddingLeft: 14, paddingBottom: 16, flex: 1 },
    metaLabelText: { fontSize: 10, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase' },
    supplierTitleText: { fontSize: 14, fontWeight: 900, color: '#0F172A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 },
    verifiedStoreBadge: { background: '#EFF6FF', color: '#2563EB', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 10, border: '1px solid #DBEAFE' },
    
    customerNameBold: { fontSize: 14, fontWeight: 900, color: '#0F172A', marginTop: 2 },
    addressBox: { display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 6, background: '#FFFFFF', padding: '8px 12px', borderRadius: 10, border: '1px solid #E2E8F0' },
    locationPinCircle: { width: 24, height: 24, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    
    whatsappLauncherBadge: { 
        background: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', 
        padding: '5px 12px', borderRadius: 20, boxShadow: '0 4px 10px rgba(37,211,102,0.35)', cursor: 'pointer' 
    },
    
    courierRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 16 },
    
    // ITEMS ROW
    itemContainer: { display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px dashed #E2E8F0' },
    imageWrapper: { width: 92, height: 92, borderRadius: 14, overflow: 'hidden', border: '1.5px solid #E2E8F0', flexShrink: 0, background: '#F1F5F9', cursor: 'pointer', position: 'relative' },
    productImg: { width: '100%', height: '100%', objectFit: 'cover' },
    itemTitleClickable: { fontSize: 14, fontWeight: 800, color: '#0F172A', lineHeight: 1.4, marginTop: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' },
    returnButtonBadge: { 
        display: 'inline-flex', alignItems: 'center', background: '#EFF6FF', border: '1.5px solid #BFDBFE', 
        color: '#1D4ED8', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', marginBottom: 6 
    },
    returnStateBadge: { fontSize: 11, fontWeight: 800, color: '#DC2626', background: '#FEF2F2', padding: '3px 8px', borderRadius: 6, display: 'inline-block', marginBottom: 6 },
    skuTag: { fontSize: 11, color: '#94A3B8', fontWeight: 700 },
    qtyTag: { fontSize: 17, fontWeight: 900, color: '#0F172A', background: '#F1F5F9', padding: '3px 10px', borderRadius: 8 },
    specChip: { background: '#F1F5F9', color: '#475569', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },
    profitChip: { background: '#ECFDF5', color: '#059669', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, border: '1px solid #A7F3D0' },
    
    reviewInteractiveRow: { display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, background: '#F8FAFC', padding: '6px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', cursor: 'pointer' },
    cancelSingleItemBtn: { marginTop: 10, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer' },
    cancelledNote: { fontSize: 11, color: '#DC2626', fontWeight: 800, marginTop: 6 },
    
    cardFooterBar: { padding: '14px 20px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' },
    cancelMasterOrderBtn: { width: '100%', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
    
    // 🟢 RATING BOTTOM SHEET MODAL STYLES
    bottomSheetOverlay: { 
        position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.65)', backdropFilter: 'blur(5px)', 
        zIndex: 100000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' 
    },
    bottomSheetCard: { 
        background: '#FFFFFF', width: '100%', maxWidth: 540, borderTopLeftRadius: 24, borderTopRightRadius: 24, 
        padding: '16px 22px 28px', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)', position: 'relative' 
    },
    sheetHandleBar: { width: 44, height: 4, borderRadius: 3, background: '#CBD5E1', margin: '0 auto 16px' },
    sheetCloseBtn: { border: 'none', background: '#F1F5F9', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    sheetProductBox: { display: 'flex', gap: 14, background: '#F8FAFC', padding: 12, borderRadius: 14, border: '1px solid #E2E8F0', marginTop: 10 },
    sheetImageWrapper: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', border: '1px solid #CBD5E1', flexShrink: 0 },
    sheetProductTitle: { fontSize: 13, fontWeight: 800, color: '#0F172A', marginTop: 2, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    sheetSubmitBtn: { width: '100%', background: '#0B192C', color: '#FFFFFF', border: 'none', padding: '13px', borderRadius: 12, fontSize: 13, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(11,25,44,0.2)' },

    // GUEST & CANCEL MODALS
    guestCard: { background: '#FFFFFF', borderRadius: 20, padding: '50px 24px', textAlign: 'center', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' },
    guestIconCircle: { width: 68, height: 68, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' },
    guestTitle: { fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 10px' },
    guestSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 26, lineHeight: 1.5 },
    guestLoginBtn: { background: '#0B192C', color: '#FFFFFF', border: 'none', padding: '14px 30px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' },
    
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.65)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 },
    modalContent: { background: '#FFFFFF', width: '100%', maxWidth: 440, borderRadius: 20, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
    modalCloseBtn: { border: 'none', background: '#F1F5F9', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    selectInput: { width: '100%', padding: '12px', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: 13, background: '#F8FAFC', outline: 'none', fontWeight: 600 },
    cancelGoBackBtn: { flex: 1, padding: '12px', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 10, fontWeight: 800, color: '#475569', cursor: 'pointer' },
    cancelConfirmBtn: { flex: 1.5, padding: '12px', background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: 10, fontWeight: 900, cursor: 'pointer' }
};