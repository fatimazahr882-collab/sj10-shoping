"use client";

// 🟢 FIX: Added useRef here to fix the red line error!
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaSearch, FaBoxOpen, FaTruck, 
    FaStar, FaCamera, FaTimes, FaEye,
    FaStore, FaLock, FaShoppingBag, 
    FaSignInAlt, FaPalette, FaRuler,
    FaBan, FaChevronDown, FaChevronUp, 
    FaClock, FaMoneyBillWave, FaTimesCircle, FaShieldAlt
} from 'react-icons/fa';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

// ==========================================
// 1. UTILS & FETCHER
// ==========================================
const createSlug = (title: string) => title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
const fetcher = (url: string) => apiClient(url, 'GET');

const CANCEL_REASONS = [
    "Change of Mind / Ab nahi chahiye",
    "Ordered by Mistake / Ghalati se order ho gaya",
    "Test Order / Sirf check kar raha tha",
    "Found a better price elsewhere / Kahin aur sasta mil gaya",
    "Delivery time is too long / Delivery mein dair hai",
    "Other"
];

// ==========================================
// 2. TYPES
// ==========================================
type OrderItem = {
    itemId: number;
    productId: number;
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
    cancellationReason?: string | null;
    customer?: { name: string; phone: string; address: string; city: string; };
    packages: PackageDetails[];
    items: OrderItem[];
};

type ReviewData = {
    product_id: number;
    order_id?: string;
    rating: number;
    comment: string;
    image_urls: string[];
    created_at: string;
};

// ==========================================
// 3. SKELETON LOADER
// ==========================================
const OrderSkeleton = () => (
    <div style={styles.card}>
        <div style={{...styles.cardHeader, background:'#E5E7EB', height:50}}></div>
        <div style={{padding:16}}>
            <div style={{height:20, width:'60%', background:'#F3F4F6', borderRadius:4, marginBottom:10}}></div>
            <div style={{height:15, width:'40%', background:'#F3F4F6', borderRadius:4, marginBottom:20}}></div>
            <div style={{display:'flex', gap:10}}>
                <div style={{width:60, height:60, background:'#F3F4F6', borderRadius:8}}></div>
                <div style={{flex:1}}>
                    <div style={{height:15, width:'80%', background:'#F3F4F6', borderRadius:4, marginBottom:8}}></div>
                    <div style={{height:15, width:'50%', background:'#F3F4F6', borderRadius:4}}></div>
                </div>
            </div>
        </div>
    </div>
);

// ==========================================
// 4. MAIN PAGE COMPONENT
// ==========================================
export default function OrdersPage() {
    const router = useRouter();
    const { user } = useAuth();
    
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Processing');
    const [search, setSearch] = useState('');

    // --- Review Modal State ---
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [autoReviewPrompt, setAutoReviewPrompt] = useState<{product: OrderItem, orderId: string} | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<{
        id: number; title: string; img: string | null; orderId: string;
    } | null>(null);
    const [existingReviewData, setExistingReviewData] = useState<ReviewData | null>(null);

    // --- 🟢 CANCEL MODAL STATE ---
    const [cancelModalState, setCancelModalState] = useState<{
        isOpen: boolean; mode: 'order' | 'item' | null; orderId: string | null; itemId: number | null;
    }>({ isOpen: false, mode: null, orderId: null, itemId: null });
    const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
    const [isCancelling, setIsCancelling] = useState(false);

    // --- SWR DATA FETCHING ---
    const { data: orders = [], isLoading, mutate } = useSWR<Order[]>(user ? '/orders' : null, fetcher, {
        revalidateOnFocus: true, refreshInterval: 10000, keepPreviousData: true
    });
    const { data: myReviews = [], mutate: mutateReviews } = useSWR<ReviewData[]>(user ? '/products/reviews/mine' : null, fetcher);

    // Auto-Review Prompt Logic
    useEffect(() => {
        if (!user || orders.length === 0 || myReviews.length === 0) return;
        const promptShown = sessionStorage.getItem('auto_review_prompt_shown');
        if (promptShown) return;

        for (const order of orders) {
            const s = (order.status || '').toLowerCase().replace(/\s/g, '');
            if (s.includes('delivered')) {
                for (const pkg of order.packages) {
                    for (const item of pkg.items) {
                        const isReviewed = myReviews.some(r => String(r.product_id) === String(item.productId) && String(r.order_id) === String(order.orderId));
                        if (!isReviewed && item.status !== 'cancelled') {
                            setAutoReviewPrompt({ product: item, orderId: order.orderId });
                            sessionStorage.setItem('auto_review_prompt_shown', 'true');
                            return;
                        }
                    }
                }
            }
        }
    }, [orders, myReviews, user]);

    // 🟢 SUBMIT CANCELLATION (Order OR Item)
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
            mutate(); // Re-fetch exact data from server
            alert("Cancellation successful! Bill and inventory updated.");
        } catch (err: any) {
            alert(err.message || "Cancellation failed. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleReviewClick = (product: OrderItem, orderId: string) => {
        const review = myReviews.find(r => String(r.product_id) === String(product.productId) && String(r.order_id) === String(orderId));
        setSelectedProduct(null); setExistingReviewData(null); setAutoReviewPrompt(null);
        setTimeout(() => {
            setSelectedProduct({ id: product.productId, title: product.title, img: product.image, orderId: orderId });
            setExistingReviewData(review || null);
            setReviewModalOpen(true);
        }, 10);
    };

    // Filter Logic
    const categorizedOrders = useMemo(() => {
        const cats: {[key:string]: Order[]} = { Unconfirmed: [], Processing: [], Shipping: [], Delivered: [], Cancelled: [], Returned: [] };
        
        orders.forEach(o => {
            const s = (o.status || '').toLowerCase().trim();
            if (o.isPendingWhatsApp && s !== 'cancelled' && s !== 'auto_cancelled') cats.Unconfirmed.push(o);
            else if (s === 'processing' || s === 'pending' || s === 'partially cancelled') cats.Processing.push(o);
            else if (['orderdispatched', 'order dispatched', 'intransit', 'in_transit', 'outfordelivery', 'out_for_delivery', 'shipped', 'booked'].includes(s)) cats.Shipping.push(o);
            else if (s.includes('delivered')) cats.Delivered.push(o);
            else if (['returned', 'rto', 'refused'].includes(s)) cats.Returned.push(o);
            else if (s === 'cancelled' || s === 'auto_cancelled') cats.Cancelled.push(o);
            else cats.Processing.push(o); 
        });

        const searchLower = search.toLowerCase();
        if (searchLower) {
            Object.keys(cats).forEach(k => {
                cats[k] = cats[k].filter(o => 
                    o.orderId.toLowerCase().includes(searchLower) || 
                    o.customer?.name.toLowerCase().includes(searchLower) ||
                    o.packages.some(p => p.items.some(i => i.title.toLowerCase().includes(searchLower)))
                );
            });
        }
        return cats;
    }, [orders, search]);

    const TABS = ['Unconfirmed', 'Processing', 'Shipping', 'Delivered', 'Cancelled', 'Returned'];

    return (
        <div style={styles.page}>
            <style jsx global>{`
                body { margin:0; padding:0; font-family:-apple-system, sans-serif; background:#F8FAFC; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
            `}</style>
            
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>My Orders</h1>
                    {user && <span style={styles.count}>{orders.length} Total</span>}
                </div>
            </header>

            {!user ? (
                <div style={styles.container}>
                    <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} style={styles.guestCard}>
                        <div style={styles.guestIconCircle}><FaLock size={32} color="#0A1E40" /></div>
                        <h2 style={styles.guestTitle}>Please Sign In</h2>
                        <p style={styles.guestSubtitle}>Log in to track your live parcels, check courier status, and manage past purchases.</p>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={styles.guestLoginBtn} onClick={() => setIsAuthModalOpen(true)}>
                            <FaSignInAlt style={{ marginRight: 8 }} /> Login / Register
                        </motion.button>
                    </motion.div>
                </div>
            ) : (
                <div style={styles.container}>
                    <div style={styles.tabs} className="no-scrollbar">
                        {TABS.map(tab => {
                            const count = categorizedOrders[tab].length;
                            return (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={activeTab === tab ? styles.tabActive : styles.tab}>
                                    <span style={{ position: 'relative', zIndex: 2 }}>{tab}</span>
                                    {count > 0 && (
                                        <motion.span 
                                            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                                            transition={{ type: 'spring', repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
                                            style={activeTab === tab ? styles.tabBadgeActive : styles.tabBadge}
                                        >
                                            {count}
                                        </motion.span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    <div style={styles.search}>
                        <FaSearch style={{color:'#9CA3AF', marginRight:8}} />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search Order ID or Product Name...`} style={styles.searchInput} />
                    </div>

                    <div style={styles.list}>
                        {isLoading && orders.length === 0 ? (
                            <><OrderSkeleton/><OrderSkeleton/></>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {categorizedOrders[activeTab].length === 0 ? (
                                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} style={styles.empty}>
                                        <div style={styles.emptyIconCircle}><FaBoxOpen size={35} color="#9CA3AF" /></div>
                                        <h3 style={{ color: '#1F2937', margin: '10px 0 4px', fontSize: 17, fontWeight: 700 }}>No Orders Here</h3>
                                        <p style={{ color: '#6B7280', margin: '0 0 16px', fontSize: 13 }}>You don't have any orders in "{activeTab}".</p>
                                        <button onClick={() => router.push('/')} style={styles.shopNowBtn}>Start Shopping</button>
                                    </motion.div>
                                ) : (
                                    categorizedOrders[activeTab].map((order, index) => (
                                        <OrderCard 
                                            key={order.orderId} 
                                            order={order} 
                                            router={router} 
                                            index={index} 
                                            onReviewClick={handleReviewClick} 
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

            {/* 🟢 CANCEL MODAL (ORDER & ITEM) */}
            <AnimatePresence>
                {cancelModalState.isOpen && (
                    <div style={styles.modalOverlay} onClick={() => setCancelModalState({ ...cancelModalState, isOpen: false })}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                            style={styles.modalContent} 
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FaShieldAlt size={20} color="#DC2626" />
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                                        {cancelModalState.mode === 'order' ? 'Cancel Entire Order' : 'Cancel Single Item'}
                                    </h3>
                                </div>
                                <button onClick={() => setCancelModalState({ ...cancelModalState, isOpen: false })} style={{ border: 'none', background: '#F1F5F9', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <FaTimes size={12} color="#64748B" />
                                </button>
                            </div>

                            <form onSubmit={handleCancelSubmit}>
                                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 15 }}>
                                    {cancelModalState.mode === 'order' 
                                        ? `Please select a reason for cancelling Order #${cancelModalState.orderId?.substring(0,8).toUpperCase()}. Your coupon will be restored.`
                                        : `Select a reason for cancelling this item. Its price will be deducted from your total bill.`}
                                </p>

                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Cancellation Reason *</label>
                                    <select 
                                        value={cancelReason} 
                                        onChange={e => setCancelReason(e.target.value)} 
                                        style={{ width: '100%', padding: '12px', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: 13, background: '#F8FAFC', outline: 'none' }} 
                                        required
                                    >
                                        {CANCEL_REASONS.map((r, i) => <option key={i} value={r}>{r}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" onClick={() => setCancelModalState({ ...cancelModalState, isOpen: false })} style={{ flex: 1, padding: 12, background: 'white', border: '1px solid #CBD5E1', borderRadius: 10, color: '#475569', fontWeight: 700, cursor: 'pointer' }} disabled={isCancelling}>
                                        Go Back
                                    </button>
                                    <button type="submit" style={{ flex: 1.5, padding: 12, background: '#DC2626', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }} disabled={isCancelling}>
                                        {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {reviewModalOpen && selectedProduct && (
                    <ReviewModal 
                        product={selectedProduct} existingReview={existingReviewData}
                        userFullName={user?.full_name || 'Valued Customer'}
                        onClose={() => setReviewModalOpen(false)} onSuccess={() => mutateReviews()} 
                    />
                )}
            </AnimatePresence>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
}

// ==============================================================
// 5. MULTI-VENDOR ORDER CARD
// ==============================================================
function OrderCard({ order, router, onCancelOrder, onCancelItem, index, onReviewClick, myReviews }: any) {
    const [isExpanded, setIsExpanded] = useState(true);
    
    const goToProduct = (item: OrderItem) => {
        if (item.slug) router.push(`/products/${item.slug}`);
        else router.push(`/products/${createSlug(item.title)}`);
    };

    const getStatusUI = (status: string, isPendingWA?: boolean) => {
        if (isPendingWA) return { text: 'Awaiting WhatsApp Confirmation', bg: '#FEF3C7', col: '#B45309', border: '#FDE68A' };
        const s = (status || '').toLowerCase().trim();
        if (s === 'partially cancelled') return { text: 'Partially Active', bg: '#EFF6FF', col: '#1D4ED8', border: '#BFDBFE' };
        if (s.includes('delivered')) return { text: 'Delivered', bg: '#DCFCE7', col: '#16A34A', isDelivered: true };
        if (s.includes('return') || s.includes('rto')) return { text: 'Returned', bg: '#FEE2E2', col: '#DC2626' };
        if (s === 'cancelled' || s === 'auto_cancelled') return { text: 'Cancelled', bg: '#F3F4F6', col: '#6B7280' };
        if (['orderdispatched', 'intransit', 'outfordelivery', 'shipped'].includes(s.replace(/_/g, ''))) return { text: 'Shipping', bg: '#E0E7FF', col: '#4338CA', border: '#C7D2FE' };
        return { text: 'Processing', bg: '#CFFAFE', col: '#0891B2' };
    };

    const ui = getStatusUI(order.status, order.isPendingWhatsApp);
    
    // 🟢 SAFE CANCELLATION LOGIC
    const isCancellable = ['processing', 'pending', 'pending_confirmation'].includes((order.status || '').toLowerCase().replace(/ /g, '_')) && !order.canTrack;
    
    // Calculate how many items are still active
    const activeItemsCount = order.packages?.reduce((acc: number, pkg: any) => 
        acc + pkg.items.filter((i: any) => i.status !== 'cancelled').length, 0
    ) || 0;

    const hasMultiplePackages = order.packages && order.packages.length > 1;

    return (
        <motion.div 
            layout initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.05 }} style={{...styles.card, borderLeft: order.isPendingWhatsApp ? '5px solid #F59E0B' : 'none'}}
        >
            <div style={styles.cardHeader}>
                <div>
                    <div style={{fontSize:13, fontWeight:700, color:'#FFF', letterSpacing:0.5}}>ORDER #{order.orderId.substring(0,8).toUpperCase()}</div>
                    <div style={{fontSize:11, color:'#93C5FD', marginTop:2}}>{new Date(order.date).toLocaleDateString()}</div>
                </div>
                {hasMultiplePackages && (
                    <button onClick={() => setIsExpanded(!isExpanded)} style={styles.accordionBtn}>
                        <span>{order.packages.length} Packages</span>
                        {isExpanded ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                    </button>
                )}
            </div>

            {order.isPendingWhatsApp && (
                <div style={styles.unconfirmedBanner}>
                    <FaClock size={14} color="#D97706" style={{ flexShrink: 0 }} />
                    <span>Please reply <strong>'1'</strong> on WhatsApp to confirm parcel dispatch.</span>
                </div>
            )}

            <div style={styles.statusRow}>
                <span style={{...styles.badge, background: ui.bg, color: ui.col, border: ui.border ? `1px solid ${ui.border}` : 'none'}}>
                    {ui.text}
                </span>
                <div style={{ textAlign: 'right' }}>
                    <span style={{fontSize:14, fontWeight:900, color:'#0A1E40'}}>Rs. {Math.round(order.totalPrice).toLocaleString()}</span>
                    {order.originalTotal && order.originalTotal > order.totalPrice && (
                        <span style={{ display: 'block', fontSize: 10, color: '#9CA3AF', textDecoration: 'line-through' }}>Rs. {Math.round(order.originalTotal).toLocaleString()}</span>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                        {order.packages && order.packages.length > 0 ? (
                            order.packages.map((pkg: PackageDetails, pIdx: number) => {
                                const isPkgCancelled = (pkg.status || '').toLowerCase() === 'cancelled';
                                return (
                                    <div key={pkg.shipmentId || pIdx} style={styles.packageWrapper}>
                                        <div style={styles.packageHeader}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={styles.supplierAvatarBox}>
                                                    {pkg.supplierPic ? <Image src={pkg.supplierPic} alt="" fill style={{ objectFit: 'cover' }} unoptimized /> : <FaStore size={10} color="#0A1E40" />}
                                                </div>
                                                <div>
                                                    <span style={styles.storeNameText}>{pkg.supplierName}</span>
                                                    {hasMultiplePackages && <span style={styles.pkgNumBadge}>Package {pkg.packageNumber}</span>}
                                                </div>
                                            </div>
                                            {pkg.canTrack && (
                                                <button onClick={() => router.push(`/orders/track/${pkg.shipmentId || order.orderId}`)} style={styles.packageTrackBtn}>
                                                    <FaTruck style={{marginRight:4}}/> Track
                                                </button>
                                            )}
                                        </div>

                                        {isPkgCancelled && (
                                            <div style={styles.cancelledPkgNotice}>
                                                <FaTimes size={11} color="#DC2626" />
                                                <span>Cancelled by Seller {pkg.cancellationReason ? `(${pkg.cancellationReason})` : ''}</span>
                                            </div>
                                        )}

                                        <div style={styles.packageItemsList}>
                                            {pkg.items.map((item: OrderItem, i: number) => {
                                                const isReviewed = myReviews?.some((r: any) => String(r.product_id) === String(item.productId) && String(r.order_id) === String(order.orderId));
                                                const isItemCancelled = item.status === 'cancelled';
                                                
                                                let color = item.options?.color || 'Standard';
                                                let size = item.options?.size || 'Standard';

                                                return (
                                                    <div key={i} style={{...styles.product, opacity: isItemCancelled ? 0.6 : 1, filter: isItemCancelled ? 'grayscale(100%)' : 'none', background: isItemCancelled ? '#F8FAFC' : 'transparent', padding: isItemCancelled ? '12px' : '12px 0', borderRadius: isItemCancelled ? '12px' : '0', border: isItemCancelled ? '1px dashed #CBD5E1' : 'none', borderBottom: isItemCancelled ? 'none' : '1px solid #F3F4F6', marginBottom: isItemCancelled ? '8px' : '0'}}>
                                                        <motion.div style={styles.imgBox} whileHover={!isItemCancelled ? { scale: 1.05 } : {}} onClick={() => !isItemCancelled && goToProduct(item)}>
                                                            {item.image ? <Image src={item.image} alt="" fill style={{objectFit:'contain'}} unoptimized /> : <span style={{fontSize:10, color:'#9CA3AF'}}>No Img</span>}
                                                        </motion.div>

                                                        <div style={{flex:1, minWidth:0}}>
                                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                                                <div style={{...styles.productTitle, textDecoration: isItemCancelled ? 'line-through' : 'none'}} onClick={() => !isItemCancelled && goToProduct(item)}>{item.title}</div>
                                                                <span style={{fontSize:12, fontWeight:800, color: isItemCancelled ? '#94A3B8' : '#0A1E40', marginLeft:6}}>x{item.quantity}</span>
                                                            </div>

                                                            <div style={{fontSize: 13, fontWeight: 800, color: isItemCancelled ? '#94A3B8' : '#0F172A', marginTop: 2, textDecoration: isItemCancelled ? 'line-through' : 'none'}}>
                                                                Rs. {item.costPrice.toLocaleString()}
                                                            </div>
                                                            
                                                            <div style={{marginTop:4, display:'flex', flexWrap:'wrap', gap:4, alignItems:'center'}}>
                                                                {color !== 'Standard' && <span style={styles.iconPill}><FaPalette size={9} /> {color}</span>}
                                                                {size !== 'Standard' && <span style={styles.iconPill}><FaRuler size={9} /> {size}</span>}
                                                                {item.profit > 0 && (
                                                                    <span style={{...styles.iconPill, background: isItemCancelled ? '#F1F5F9' : '#ECFDF5', color: isItemCancelled ? '#94A3B8' : '#059669', border: isItemCancelled ? '1px solid #E2E8F0' : '1px solid #A7F3D0', textDecoration: isItemCancelled ? 'line-through' : 'none'}}>
                                                                        <FaMoneyBillWave size={9} style={{marginRight:2}}/> Profit: Rs. {item.profit}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            {isItemCancelled && (
                                                                <div style={{ marginTop: '8px', fontSize: '11px', color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                    <FaTimes size={12} /> Cancelled: {item.cancellationReason || 'Item Cancelled'}
                                                                </div>
                                                            )}

                                                            {!isItemCancelled && ui.isDelivered && (
                                                                <div style={{marginTop:6, display:'flex', justifyContent:'flex-end'}}>
                                                                    <button onClick={() => onReviewClick(item, order.orderId)} style={isReviewed ? styles.viewReviewBtn : styles.reviewBtn}>
                                                                        {isReviewed ? <><FaEye size={9}/> Your Review</> : <><FaStar size={9} color="#F59E0B"/> Write Review</>}
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* 🟢 CUSTOMER SINGLE ITEM CANCEL BUTTON */}
                                                            {isCancellable && !isItemCancelled && activeItemsCount > 1 && (
                                                                <div style={{marginTop:6, display:'flex', justifyContent:'flex-end'}}>
                                                                    <motion.button 
                                                                        whileHover={{ scale: 1.05, background: '#FCA5A5' }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => onCancelItem(order.orderId, item.itemId)}
                                                                        style={{...styles.cancelItemBtn}}
                                                                    >
                                                                        <FaTimesCircle size={10} style={{marginRight:4}}/> Cancel Item
                                                                    </motion.button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🟢 CUSTOMER ENTIRE ORDER CANCEL BUTTON */}
            {isCancellable && (
                <div style={styles.footer}>
                    <button onClick={() => onCancelOrder(order.orderId)} style={styles.cancelBtn}>
                        <FaBan size={11} style={{marginRight:6}}/> Cancel Entire Order
                    </button>
                </div>
            )}
        </motion.div>
    );
}

// ==========================================
// 6. REVIEW MODAL
// ==========================================
function ReviewModal({ product, existingReview, userFullName, onClose, onSuccess }: any) {
    const isReadOnly = !!existingReview; 
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
        }
    }, [existingReview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (images.length + newFiles.length > 3) return alert("Max 3 images.");
            setImages([...images, ...newFiles]);
        }
    };

    const handleSubmit = async () => {
        if (!comment.trim()) return alert("Please write a comment for your review.");
        setSubmitting(true);
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('user_token');
            if (!token) throw new Error("Session expired. Please log in again.");

            let finalImageUrls: string[] = [];

            if (images.length > 0) {
                const imageFormData = new FormData();
                images.forEach(img => imageFormData.append('images', img));
                imageFormData.append('productId', product.id.toString());
                imageFormData.append('orderId', product.orderId);

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/upload/review-images`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: imageFormData
                });
                if (!uploadRes.ok) throw new Error("Image upload failed.");
                const uploadData = await uploadRes.json();
                finalImageUrls = uploadData.urls;
            }

            await apiClient(`/products/${product.id}/reviews`, 'POST', {
                rating, comment, userName: userFullName, image_url: JSON.stringify(finalImageUrls), orderId: product.orderId 
            });

            alert("Review submitted successfully!");
            onSuccess(); 
            onClose();
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={styles.modalOverlay}>
            <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}} style={styles.modalContent}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                    <h3 style={{margin:0, fontSize:15, fontWeight:700, color:'#1F2937'}}>{isReadOnly ? 'Your Review' : 'Rate Product'}</h3>
                    <button onClick={onClose} style={{border:'none', background:'#F1F5F9', borderRadius:'50%', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><FaTimes size={12} color="#64748B"/></button>
                </div>
                
                <textarea placeholder="Write your feedback..." style={{...styles.textArea, background: isReadOnly ? '#F8FAFC' : '#FFF'}} value={comment} disabled={isReadOnly} onChange={(e) => setComment(e.target.value)} />
                {!isReadOnly && <button onClick={handleSubmit} disabled={submitting} style={styles.submitBtn}>{submitting ? 'Submitting...' : 'Submit Feedback'}</button>}
            </motion.div>
        </motion.div>
    );
}

// ==========================================
// 7. STYLES
// ==========================================
const styles: {[key:string]: React.CSSProperties} = {
    page: { minHeight: '100vh', paddingBottom: 90, backgroundColor: '#F8FAFC' },
    header: { position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)', borderBottom: '1px solid #F1F5F9', padding: '14px 20px' },
    headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600, margin: '0 auto' },
    title: { margin: 0, fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing:-0.5 },
    count: { background: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800 },
    container: { maxWidth: 600, margin: '0 auto', padding: '0 14px' },
    
    guestCard: { background: 'white', borderRadius: 20, padding: '40px 24px', textAlign: 'center', marginTop: 40, border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' },
    guestIconCircle: { width: 70, height: 70, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border:'2px solid #BFDBFE' },
    guestTitle: { fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 10px' },
    guestSubtitle: { fontSize: 14, color: '#64748B', lineHeight: 1.5, margin: '0 auto 24px', maxWidth: 360 },
    guestLoginBtn: { background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', border: 'none', padding: '16px 30px', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' },
    
    tabs: { display: 'flex', gap: 10, overflowX: 'auto', padding: '16px 0', position:'sticky', top:52, zIndex:40, background:'#F8FAFC' },
    tabActive: { padding: '8px 18px', borderRadius: 30, background: '#0F172A', color: '#FFF', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0, boxShadow:'0 4px 12px rgba(15,23,42,0.2)', display:'flex', alignItems:'center', gap:8 },
    tab: { padding: '8px 18px', borderRadius: 30, background: '#FFF', color: '#64748B', border: '1px solid #E2E8F0', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0, display:'flex', alignItems:'center', gap:8 },
    tabBadgeActive: { background: '#3B82F6', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 10, fontWeight: 800, position:'relative', zIndex:2 },
    tabBadge: { background: '#F1F5F9', color: '#64748B', fontSize: 10, padding: '2px 6px', borderRadius: 10, fontWeight: 800, position:'relative', zIndex:2 },
    search: { background: '#FFF', padding: '12px 16px', borderRadius: 16, display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', marginBottom: 20, boxShadow:'0 2px 4px rgba(0,0,0,0.01)' },
    searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: 14, color:'#1F2937', fontWeight:500 },
    list: { display: 'flex', flexDirection: 'column', gap: 16 },
    empty: { background: 'white', borderRadius: 20, padding: '50px 20px', textAlign: 'center', border: '1px solid #E2E8F0', marginTop: 20 },
    emptyIconCircle: { width: 70, height: 70, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', border:'2px dashed #E2E8F0' },
    shopNowBtn: { background: '#0F172A', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 10 },
    
    card: { background: '#FFF', borderRadius: 20, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)' },
    cardHeader: { background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    accordionBtn: { background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backdropFilter:'blur(4px)' },
    unconfirmedBanner: { display: 'flex', alignItems: 'center', gap: 10, background: '#FFFBEB', padding: '12px 16px', borderBottom: '1px solid #FDE68A', fontSize: 12.5, color: '#92400E' },
    statusRow: { padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    badge: { padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing:0.5 },
    customerStrip: { padding: '10px 18px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9', fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center' },
    
    packageWrapper: { borderBottom: '1px solid #F1F5F9', padding: '14px 18px' },
    packageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    supplierAvatarBox: { width: 28, height: 28, borderRadius: '50%', background: '#EFF6FF', border: '2px solid #BFDBFE', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    storeNameText: { fontSize: 13, fontWeight: 800, color: '#0F172A' },
    pkgNumBadge: { fontSize: 10, fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: 6, marginLeft: 8 },
    packageTrackBtn: { background: '#2563EB', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 10, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', boxShadow:'0 2px 8px rgba(37,99,235,0.3)' },
    cancelledPkgNotice: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', fontSize: 11.5, color: '#991B1B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontWeight:600 },
    
    packageItemsList: { display: 'flex', flexDirection: 'column', gap: 10 },
    product: { display: 'flex', gap: 12, alignItems: 'center', transition: 'all 0.3s ease' },
    imgBox: { width: 55, height: 55, borderRadius: 10, background: '#F8FAFC', position: 'relative', overflow: 'hidden', border:'1px solid #E2E8F0', flexShrink: 0, cursor: 'pointer' },
    productTitle: { fontSize: 13, color: '#1E293B', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220, cursor: 'pointer' },
    iconPill: { background: '#F1F5F9', color: '#475569', fontSize: 10, padding: '3px 8px', borderRadius: 6, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 },
    footer: { padding: '14px 18px', background: '#FFF', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center' },
    
    cancelBtn: { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '10px 24px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer', display:'flex', alignItems:'center', transition:'background 0.2s', width: '100%', justifyContent: 'center' },
    cancelItemBtn: { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '5px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', display:'flex', alignItems:'center', transition:'background 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    
    reviewBtn: { background: '#FFF', border: '1px solid #E2E8F0', color: '#374151', fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
    viewReviewBtn: { background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' },
    
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 100001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter:'blur(6px)' },
    modalContent: { background: '#FFF', width: '100%', maxWidth: 400, borderRadius: 24, padding: 24, boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)' },
    textArea: { width: '100%', height: 90, border: '1px solid #CBD5E1', borderRadius: 12, padding: 12, fontSize: 14, resize: 'none', outline: 'none', fontWeight:500 },
    submitBtn: { width: '100%', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 20, boxShadow:'0 4px 15px rgba(37,99,235,0.3)' },

    autoReviewPrompt: { position: 'fixed', bottom: 80, left: 20, right: 20, maxWidth: 400, margin: '0 auto', background: '#FFF', borderRadius: 20, padding: 20, zIndex: 90, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0' },
    closePromptBtn: { position: 'absolute', top: 12, right: 12, background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' },
    promptReviewBtn: { width: '100%', background: '#F59E0B', color: 'white', border: 'none', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 800, marginTop: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 10px rgba(245,158,11,0.3)' }
};