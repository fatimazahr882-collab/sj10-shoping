"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaSearch, FaBoxOpen, FaTruck, 
    FaStar, FaCamera, FaTimes, FaEye,
    FaStore, FaUser, FaMapMarkerAlt, 
    FaMoneyBillWave, FaPalette, FaRuler,
    FaExternalLinkAlt, FaBan, FaChevronDown, 
    FaChevronUp, FaClock, FaLock, FaShoppingBag, 
    FaSignInAlt, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

// ==========================================
// 1. UTILS & FETCHER
// ==========================================
const createSlug = (title: string) => {
    return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

const fetcher = (url: string) => apiClient(url, 'GET');

// ==========================================
// 2. TYPES
// ==========================================
type OrderItem = {
    itemId: number;
    productId: number;
    title: string;
    image: string | null;
    quantity: number;
    variantString: string; 
    profit: number; 
    costPrice: number;
    options?: { color?: string; size?: string; [key: string]: any }; 
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
    
    // Auth Modal State for Guest View
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'In-Progress' | 'Delivered' | 'Returned' | 'Cancelled'>('In-Progress');
    const [search, setSearch] = useState('');

    // --- Review Modal State ---
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{
        id: number; 
        title: string; 
        img: string | null; 
        orderId: string;
    } | null>(null);
    const [existingReviewData, setExistingReviewData] = useState<ReviewData | null>(null);

    // --- SWR DATA FETCHING (Only fetch if user is logged in) ---
    const { data: orders = [], error, isLoading, mutate } = useSWR<Order[]>(
        user ? '/orders' : null, 
        fetcher, 
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 10000,
            dedupingInterval: 2000,
            keepPreviousData: true
        }
    );

    const { data: myReviews = [], mutate: mutateReviews } = useSWR<ReviewData[]>(
        user ? '/products/reviews/mine' : null, 
        fetcher
    );

    // Cancel Logic (Customer Cancel before dispatch)
    const handleCancel = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        
        const updatedOrders = orders.map(o => o.orderId === orderId ? { ...o, status: 'cancelled' } : o);
        mutate(updatedOrders, false); 
        
        try { 
            await apiClient('/orders/cancel', 'POST', { orderId }); 
            mutate();
        } 
        catch (e: any) { 
            alert(e.message || "Cannot cancel order at this stage."); 
            mutate();
        }
    };

    const handleReviewClick = (product: OrderItem, orderId: string) => {
        const review = myReviews.find(r => 
            String(r.product_id) === String(product.productId) && 
            String(r.order_id) === String(orderId)
        );
        setSelectedProduct(null);
        setExistingReviewData(null);
        setTimeout(() => {
            setSelectedProduct({ 
                id: product.productId, 
                title: product.title, 
                img: product.image,
                orderId: orderId 
            });
            setExistingReviewData(review || null);
            setReviewModalOpen(true);
        }, 10);
    };

    // Filter Logic
     const filteredOrders = orders.filter(o => {
        const s = (o.status || '').toLowerCase().trim();
        let matchTab = false;
        
        // 🟢 In-Progress includes Active & Partially Cancelled orders!
        if (activeTab === 'In-Progress') {
            matchTab = !['delivered', 'returned', 'rto', 'refused', 'cancelled', 'auto_cancelled'].includes(s);
        }
        else if (activeTab === 'Delivered') {
            matchTab = s.includes('delivered');
        }
        else if (activeTab === 'Returned') {
            matchTab = ['returned', 'rto', 'refused'].some(rs => s.includes(rs));
        }
        else if (activeTab === 'Cancelled') {
            // 🟢 STRICT: Only show if FULL Master order is cancelled!
            matchTab = s === 'cancelled' || s === 'auto_cancelled';
        }

        const searchLower = search.toLowerCase();
        const matchSearch = !search || 
            o.orderId.toLowerCase().includes(searchLower) || 
            o.customer?.name.toLowerCase().includes(searchLower) ||
            o.items?.some(i => i.title.toLowerCase().includes(searchLower));

        return matchTab && matchSearch;
    });

    return (
        <div style={styles.page}>
            <style jsx global>{`
                body { margin:0; padding:0; font-family:-apple-system, sans-serif; background:#F3F4F6; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
                .hover-scale:active { transform: scale(0.98); }
            `}</style>
            
            {/* TOP HEADER */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>My Orders</h1>
                    {user && <span style={styles.count}>{filteredOrders.length}</span>}
                </div>
            </header>

            {/* 🟢 GUEST / LOGGED OUT STATE */}
            {!user ? (
                <div style={styles.container}>
                    <motion.div 
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={styles.guestCard}
                    >
                        <div style={styles.guestIconCircle}>
                            <FaLock size={32} color="#0A1E40" />
                        </div>
                        <h2 style={styles.guestTitle}>Please Sign In to View Orders</h2>
                        <p style={styles.guestSubtitle}>
                            Log in to track your live parcels, check courier status, and manage past purchases.
                        </p>
                        
                        <motion.button 
                            style={styles.guestLoginBtn}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setIsAuthModalOpen(true)}
                        >
                            <FaSignInAlt style={{ marginRight: 8 }} /> Login / Register Account
                        </motion.button>
                    </motion.div>
                </div>
            ) : (
                /* 🟢 LOGGED IN STATE */
                <div style={styles.container}>
                    
                    {/* TABS */}
                    <div style={styles.tabs} className="no-scrollbar">
                        {['In-Progress', 'Delivered', 'Returned', 'Cancelled'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab as any)} 
                                style={activeTab === tab ? styles.tabActive : styles.tab}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    {/* SEARCH INPUT */}
                    <div style={styles.search}>
                        <FaSearch style={{color:'#9CA3AF', marginRight:8}} />
                        <input 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            placeholder={`Search Order ID or Product Name...`} 
                            style={styles.searchInput} 
                        />
                    </div>

                    {/* ORDERS LIST */}
                    <div style={styles.list}>
                        {isLoading && orders.length === 0 ? (
                            <>
                                <OrderSkeleton/>
                                <OrderSkeleton/>
                            </>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredOrders.length === 0 ? (
                                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} style={styles.empty}>
                                        <div style={styles.emptyIconCircle}>
                                            <FaShoppingBag size={35} color="#9CA3AF" />
                                        </div>
                                        <h3 style={{ color: '#1F2937', margin: '10px 0 4px', fontSize: 17, fontWeight: 700 }}>No Orders Found</h3>
                                        <p style={{ color: '#6B7280', margin: '0 0 16px', fontSize: 13 }}>You don't have any orders in "{activeTab}".</p>
                                        <button onClick={() => router.push('/')} style={styles.shopNowBtn}>
                                            Explore Products
                                        </button>
                                    </motion.div>
                                ) : (
                                    filteredOrders.map((order, index) => (
                                        <OrderCard 
                                            key={order.orderId} 
                                            order={order} 
                                            router={router} 
                                            onCancel={handleCancel}
                                            index={index} 
                                            onReviewClick={handleReviewClick}
                                            myReviews={myReviews}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            )}

            {/* REVIEW MODAL */}
            <AnimatePresence>
                {reviewModalOpen && selectedProduct && (
                    <ReviewModal 
                        product={selectedProduct} 
                        existingReview={existingReviewData}
                        userFullName={user?.full_name || 'Valued Customer'}
                        onClose={() => setReviewModalOpen(false)} 
                        onSuccess={() => mutateReviews()} 
                    />
                )}
            </AnimatePresence>

            {/* AUTH MODAL FOR GUESTS */}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
}

// ==============================================================
// 5. MULTI-VENDOR ORDER CARD WITH STORE PACKAGES & ACCORDION
// ==============================================================
function OrderCard({ order, router, onCancel, index, onReviewClick, myReviews }: any) {
    
    // Collapsible state for packages (Default: Expanded true)
    const [isExpanded, setIsExpanded] = useState(true);

    const goToProduct = (title: string) => {
        const slug = createSlug(title);
        router.push(`/products/${slug}`);
    };

const getStatusUI = (status: string, isPendingWA?: boolean) => {
        if (isPendingWA) {
            return { text: 'Awaiting WhatsApp Confirmation', bg: '#FEF3C7', col: '#B45309', border: '#FDE68A' };
        }
        const s = (status || '').toLowerCase().trim();
        
        // 🟢 Partially Cancelled Order Badge
        if (s === 'partially cancelled') {
            return { text: 'Partially Active', bg: '#EFF6FF', col: '#1D4ED8', border: '#BFDBFE' };
        }
        if (s.includes('delivered')) return { text: 'Delivered', bg: '#DCFCE7', col: '#16A34A', isDelivered: true };
        if (s.includes('return') || s.includes('rto')) return { text: 'Returned', bg: '#FEE2E2', col: '#DC2626' };
        if (s === 'cancelled' || s === 'auto_cancelled') return { text: 'Cancelled', bg: '#F3F4F6', col: '#6B7280' };
        
        return { text: 'In-Progress', bg: '#CFFAFE', col: '#0891B2' };
    };

    const ui = getStatusUI(order.status, order.isPendingWhatsApp);
    const isCancellable = ['processing', 'pending', 'pending_confirmation'].includes((order.status || '').toLowerCase()) && !order.canTrack;
    const hasMultiplePackages = order.packages && order.packages.length > 1;

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, y: 20, scale: 0.96 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }} 
            style={styles.card}
        >
            {/* CARD TOP HEADER */}
            <div style={styles.cardHeader}>
                <div>
                    <div style={{fontSize:13, fontWeight:700, color:'#FFF', letterSpacing:0.5}}>
                        ORDER #{order.orderId.substring(0,8).toUpperCase()}
                    </div>
                    <div style={{fontSize:11, color:'#93C5FD', marginTop:2}}>
                        {new Date(order.date).toLocaleDateString()}
                    </div>
                </div>

                {/* ACCORDION EXPAND TOGGLE */}
                {hasMultiplePackages && (
                    <button onClick={() => setIsExpanded(!isExpanded)} style={styles.accordionBtn}>
                        <span>{order.packages.length} Packages</span>
                        {isExpanded ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                    </button>
                )}
            </div>

            {/* UNCONFIRMED NOTICE BANNER */}
            {order.isPendingWhatsApp && (
                <div style={styles.unconfirmedBanner}>
                    <FaClock size={14} color="#D97706" style={{ flexShrink: 0 }} />
                    <span>Please reply <strong>'1'</strong> on WhatsApp to confirm parcel dispatch.</span>
                </div>
            )}

            {/* STATUS & PRICE ROW */}
            <div style={styles.statusRow}>
                <span style={{...styles.badge, background: ui.bg, color: ui.col, border: ui.border ? `1px solid ${ui.border}` : 'none'}}>
                    {ui.text}
                </span>
                <div style={{ textAlign: 'right' }}>
                    <span style={{fontSize:14, fontWeight:900, color:'#0A1E40'}}>
                        Rs. {Math.round(order.totalPrice).toLocaleString()}
                    </span>
                    {order.originalTotal && order.originalTotal > order.totalPrice && (
                        <span style={{ display: 'block', fontSize: 10, color: '#9CA3AF', textDecoration: 'line-through' }}>
                            Rs. {Math.round(order.originalTotal).toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            {/* CUSTOMER DESTINATION STRIP */}
            <div style={styles.customerStrip}>
                <FaMapMarkerAlt size={12} color="#64748B" style={{ marginRight: 6, flexShrink: 0 }} />
                <span>Deliver to: <strong>{order.customer?.name}</strong>, {order.customer?.city || 'Pakistan'}</span>
            </div>

            {/* 🟢 MULTI-VENDOR PACKAGES RENDER (WITH SUPPLIER AVATAR & INDEPENDENT TRACKING) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {order.packages && order.packages.length > 0 ? (
                            order.packages.map((pkg: PackageDetails, pIdx: number) => {
                                const pkgStatusLower = (pkg.status || '').toLowerCase();
                                const isPkgCancelled = pkgStatusLower === 'cancelled';
                                
                                return (
                                    <div key={pkg.shipmentId || pIdx} style={styles.packageWrapper}>
                                        
                                        {/* PACKAGE STORE HEADER */}
                                        <div style={styles.packageHeader}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {/* Round Supplier Profile Pic */}
                                                <div style={styles.supplierAvatarBox}>
                                                    {pkg.supplierPic ? (
                                                        <Image src={pkg.supplierPic} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
                                                    ) : (
                                                        <FaStore size={10} color="#0A1E40" />
                                                    )}
                                                </div>
                                                <div>
                                                    <span style={styles.storeNameText}>{pkg.supplierName}</span>
                                                    {hasMultiplePackages && <span style={styles.pkgNumBadge}>Package {pkg.packageNumber}</span>}
                                                </div>
                                            </div>

                                            {/* INDEPENDENT TRACK PACKAGE BUTTON */}
                                            {pkg.canTrack && (
                                                <motion.button 
                                                    onClick={() => router.push(`/orders/track/${pkg.shipmentId || order.orderId}`)} 
                                                    style={styles.packageTrackBtn}
                                                    whileHover={{ scale: 1.04 }}
                                                    whileTap={{ scale: 0.96 }}
                                                >
                                                    <FaTruck style={{marginRight:4}}/> Track
                                                </motion.button>
                                            )}
                                        </div>

                                        {/* CANCELLATION REASON IF CANCELLED BY SELLER */}
                                        {isPkgCancelled && (
                                            <div style={styles.cancelledPkgNotice}>
                                                <FaTimes size={11} color="#DC2626" />
                                                <span>Cancelled by Seller {pkg.cancellationReason ? `(${pkg.cancellationReason})` : ''}</span>
                                            </div>
                                        )}

                                        {/* PACKAGE ITEMS */}
                                        <div style={styles.packageItemsList}>
                                            {pkg.items.map((item: OrderItem, i: number) => {
                                                const isReviewed = myReviews?.some((r: any) => 
                                                    String(r.product_id) === String(item.productId) && 
                                                    String(r.order_id) === String(order.orderId)
                                                );

                                                let color = item.options?.color || 'Standard';
                                                let size = item.options?.size || 'Standard';

                                                return (
                                                    <div key={i} style={styles.product}>
                                                        <motion.div 
                                                            style={styles.imgBox}
                                                            whileHover={{ scale: 1.05 }}
                                                            onClick={() => goToProduct(item.title)}
                                                        >
                                                            {item.image ? (
                                                                <Image src={item.image} alt="item" fill style={{objectFit:'contain'}} unoptimized />
                                                            ) : (
                                                                <span style={{fontSize:10, color:'#9CA3AF'}}>No Img</span>
                                                            )}
                                                        </motion.div>

                                                        <div style={{flex:1, minWidth:0}}>
                                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                                                <div style={styles.productTitle} onClick={() => goToProduct(item.title)}>
                                                                    {item.title}
                                                                </div>
                                                                <span style={{fontSize:12, fontWeight:800, color:'#0A1E40', marginLeft:6}}>x{item.quantity}</span>
                                                            </div>
                                                            
                                                            <div style={{marginTop:4, display:'flex', flexWrap:'wrap', gap:4, alignItems:'center'}}>
                                                                {color !== 'Standard' && (
                                                                    <span style={styles.iconPill}><FaPalette size={9} /> {color}</span>
                                                                )}
                                                                {size !== 'Standard' && (
                                                                    <span style={styles.iconPill}><FaRuler size={9} /> {size}</span>
                                                                )}
                                                                <span style={{...styles.iconPill, background:'#ECFDF5', color:'#059669', border:'1px solid #A7F3D0'}}>
                                                                    Profit: Rs. {item.profit}
                                                                </span>
                                                            </div>

                                                            {ui.isDelivered && (
                                                                <div style={{marginTop:6, display:'flex', justifyContent:'flex-end'}}>
                                                                    <button 
                                                                        onClick={() => onReviewClick(item, order.orderId)}
                                                                        style={isReviewed ? styles.viewReviewBtn : styles.reviewBtn}
                                                                    >
                                                                        {isReviewed ? <><FaEye size={9}/> Your Review</> : <><FaStar size={9} color="#F59E0B"/> Review</>}
                                                                    </button>
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
                        ) : (
                            /* Fallback to Flat Items */
                            <div style={{ padding: '0 16px' }}>
                                {order.items.map((it: any, idx: number) => (
                                    <div key={idx} style={styles.product}>
                                        <div style={styles.imgBox}><Image src={it.image || '/no-image.png'} fill alt="" unoptimized /></div>
                                        <div style={{flex:1}}><div style={styles.productTitle}>{it.title}</div><span>x{it.quantity}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CARD BOTTOM ACTIONS */}
            {isCancellable && (
                <div style={styles.footer}>
                    <button onClick={() => onCancel(order.orderId)} style={styles.cancelBtn}>
                        <FaBan size={11} style={{marginRight:4}}/> Cancel Order
                    </button>
                </div>
            )}
        </motion.div>
    );
}

// ==========================================
// 6. REVIEW MODAL COMPONENT
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
        setSubmitting(true);
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('user_token');
            if (!token) throw new Error("Please log in again.");

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
                if (!uploadRes.ok) throw new Error("Image upload failed");
                const uploadData = await uploadRes.json();
                finalImageUrls = uploadData.urls;
            }

            await apiClient(`/products/${product.id}/reviews`, 'POST', {
                rating,
                comment,
                userName: userFullName,
                image_url: JSON.stringify(finalImageUrls),
                orderId: product.orderId 
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
                    <h3 style={{margin:0, fontSize:15, fontWeight:700, color:'#1F2937'}}>
                        {isReadOnly ? 'Your Review' : 'Rate Product'}
                    </h3>
                    <button onClick={onClose} style={{border:'none', background:'none', cursor:'pointer'}}><FaTimes size={16}/></button>
                </div>

                <div style={{display:'flex', gap:8, marginBottom:16, alignItems:'center', background:'#F9FAFB', padding:8, borderRadius:8}}>
                    <div style={{width:36, height:36, position:'relative', borderRadius:6, overflow:'hidden'}}>
                        {product.img ? <Image src={product.img} fill style={{objectFit:'cover'}} alt="" unoptimized /> : null}
                    </div>
                    <div style={{fontSize:12, fontWeight:600, color:'#374151', flex:1}}>{product.title}</div>
                </div>

                <div style={{display:'flex', justifyContent:'center', gap:8, marginBottom:16}}>
                    {[1,2,3,4,5].map(star => (
                        <FaStar 
                            key={star} size={24} 
                            color={star <= rating ? '#F59E0B' : '#E5E7EB'} 
                            style={{cursor: isReadOnly ? 'default' : 'pointer'}}
                            onClick={() => !isReadOnly && setRating(star)}
                        />
                    ))}
                </div>

                <textarea 
                    placeholder="Write your feedback..." 
                    style={{...styles.textArea, background: isReadOnly ? '#F3F4F6' : '#FFF'}}
                    value={comment}
                    disabled={isReadOnly}
                    onChange={(e) => setComment(e.target.value)}
                />

                {!isReadOnly && (
                    <button onClick={handleSubmit} disabled={submitting} style={styles.submitBtn}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                )}
            </motion.div>
        </motion.div>
    );
}

// ==========================================
// 7. STYLES
// ==========================================
const styles: {[key:string]: React.CSSProperties} = {
    page: { minHeight: '100vh', paddingBottom: 90, backgroundColor: '#F3F4F6' },
    header: { position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter:'blur(10px)', borderBottom: '1px solid #E5E7EB', padding: '14px 20px' },
    headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600, margin: '0 auto' },
    title: { margin: 0, fontSize: 20, fontWeight: 800, color: '#0A1E40' },
    count: { background: '#0A1E40', color: '#FFF', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
    container: { maxWidth: 600, margin: '0 auto', padding: '0 14px' },
    
    // GUEST STATE
    guestCard: { background: 'white', borderRadius: 20, padding: '40px 24px', textAlign: 'center', marginTop: 40, border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
    guestIconCircle: { width: 68, height: 68, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
    guestTitle: { fontSize: 18, fontWeight: 800, color: '#0A1E40', margin: '0 0 8px' },
    guestSubtitle: { fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: '0 auto 24px', maxWidth: 360 },
    guestLoginBtn: { background: 'linear-gradient(135deg, #0A1E40 0%, #1E3A8A 100%)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', boxShadow: '0 4px 15px rgba(10,30,64,0.2)' },
    
    // TABS & SEARCH
    tabs: { display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 0', position:'sticky', top:52, zIndex:40, background:'#F3F4F6' },
    tabActive: { padding: '7px 16px', borderRadius: 30, background: '#0A1E40', color: '#FFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, boxShadow:'0 4px 10px rgba(10,30,64,0.2)' },
    tab: { padding: '7px 16px', borderRadius: 30, background: '#FFF', color: '#64748B', border: '1px solid #E2E8F0', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
    search: { background: '#FFF', padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', marginBottom: 16 },
    searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: 13, color:'#1F2937' },
    list: { display: 'flex', flexDirection: 'column', gap: 14 },
    empty: { background: 'white', borderRadius: 16, padding: '40px 20px', textAlign: 'center', border: '1px solid #E2E8F0', marginTop: 20 },
    emptyIconCircle: { width: 60, height: 60, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' },
    shopNowBtn: { background: '#0A1E40', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    
    // CARD & PACKAGES
    card: { background: '#FFF', borderRadius: 18, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
    cardHeader: { background: 'linear-gradient(135deg, #0A1E40 0%, #1E3A8A 100%)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    accordionBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
    unconfirmedBanner: { display: 'flex', alignItems: 'center', gap: 8, background: '#FFFBEB', padding: '9px 14px', borderBottom: '1px solid #FDE68A', fontSize: 11.5, color: '#92400E' },
    statusRow: { padding: '10px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    badge: { padding: '3px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase' },
    customerStrip: { padding: '8px 16px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9', fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center' },
    
    // PACKAGE WRAPPER
    packageWrapper: { borderBottom: '1px solid #E2E8F0', padding: '10px 14px' },
    packageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    supplierAvatarBox: { width: 22, height: 22, borderRadius: '50%', background: '#EFF6FF', border: '1px solid #BFDBFE', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    storeNameText: { fontSize: 12, fontWeight: 800, color: '#0A1E40' },
    pkgNumBadge: { fontSize: 9, fontWeight: 700, color: '#64748B', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, marginLeft: 6 },
    packageTrackBtn: { background: '#0A1E40', color: 'white', border: 'none', padding: '5px 12px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' },
    cancelledPkgNotice: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '4px 8px', fontSize: 10.5, color: '#991B1B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
    
    packageItemsList: { display: 'flex', flexDirection: 'column', gap: 8 },
    product: { display: 'flex', gap: 10, alignItems: 'center' },
    imgBox: { width: 48, height: 48, borderRadius: 8, background: '#F8FAFC', position: 'relative', overflow: 'hidden', border:'1px solid #E2E8F0', flexShrink: 0, cursor: 'pointer' },
    productTitle: { fontSize: 12, color: '#1E293B', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260, cursor: 'pointer' },
    iconPill: { background: '#F1F5F9', color: '#475569', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 },
    footer: { padding: '10px 14px', background: '#FFF', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center' },
    cancelBtn: { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '6px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' },
    reviewBtn: { background: '#FFF', border: '1px solid #E5E7EB', color: '#374151', fontSize: 9.5, fontWeight: 600, padding: '3px 8px', borderRadius: 6, cursor: 'pointer' },
    viewReviewBtn: { background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 9.5, fontWeight: 600, padding: '3px 8px', borderRadius: 6, cursor: 'pointer' },
    
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalContent: { background: '#FFF', width: '100%', maxWidth: 360, borderRadius: 16, padding: 18 },
    textArea: { width: '100%', height: 70, border: '1px solid #E5E7EB', borderRadius: 8, padding: 8, fontSize: 13, resize: 'none', outline: 'none' },
    submitBtn: { width: '100%', background: '#0A1E40', color: '#FFF', padding: '10px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 10 }
};