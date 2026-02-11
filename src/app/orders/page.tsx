"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr'; // ✅ SWR Import (Already installed in your project usually)
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaSearch, FaBoxOpen, FaTruck, 
    FaStar, FaCamera, FaTimes, FaEye,
    FaStore, FaUser, FaMapMarkerAlt, 
    FaMoneyBillWave, FaPalette, FaRuler,
    FaExternalLinkAlt, FaBan
} from 'react-icons/fa';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/AuthProvider';

// ==========================================
// 1. UTILS
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

type Order = {
    orderId: string;
    date: string;
    totalPrice: number;
    deliveryFee: number;
    totalProfit: number;
    status: string; 
    canTrack: boolean;
    supplierName: string;
    customer?: { name: string; phone: string; address: string; city: string; };
    courier?: { name: string | null; trackingNumber: string | null; };
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
    const [activeTab, setActiveTab] = useState<'In-Progress' | 'Delivered' | 'Returned' | 'Cancelled'>('In-Progress');
    const [search, setSearch] = useState('');

    // --- Modal State ---
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{
        id: number; 
        title: string; 
        img: string | null; 
        orderId: string;
    } | null>(null);
    const [existingReviewData, setExistingReviewData] = useState<ReviewData | null>(null);

    // --- SWR DATA FETCHING (THE MAGIC PART) ---
    // 1. Get Orders with Revalidation
    const { data: orders = [], error, isLoading, mutate } = useSWR<Order[]>('/orders', fetcher, {
        revalidateOnFocus: true,      // Tab par wapis aane par update karega
        revalidateOnReconnect: true,  // Internet wapis aane par update karega
        refreshInterval: 10000,       // Har 10 second baad background mein check karega
        dedupingInterval: 2000,       // 2 sec tak duplicate requests rokega
        keepPreviousData: true        // Loading ke waqt purana data dikhata rahega!
    });

    // 2. Get Reviews
    const { data: myReviews = [], mutate: mutateReviews } = useSWR<ReviewData[]>('/products/reviews/mine', fetcher);

    // Cancel Logic
    const handleCancel = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        
        // Optimistic UI Update (Turant UI update, baad mein server sync)
        const updatedOrders = orders.map(o => o.orderId === orderId ? { ...o, status: 'cancelled' } : o);
        mutate(updatedOrders, false); 
        
        try { 
            await apiClient('/orders/cancel', 'POST', { orderId }); 
            mutate(); // Re-fetch actual data from server to be 100% sure
        } 
        catch (e) { 
            alert("Cannot cancel order at this stage."); 
            mutate(); // Revert changes
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
        const s = (o.status || '').toLowerCase();
        let matchTab = false;
        if (activeTab === 'In-Progress') matchTab = !['delivered', 'returned', 'rto', 'refused', 'cancelled'].includes(s);
        else if (activeTab === 'Delivered') matchTab = s.includes('delivered');
        else if (activeTab === 'Returned') matchTab = ['returned', 'rto', 'refused'].some(rs => s.includes(rs));
        else if (activeTab === 'Cancelled') matchTab = s.includes('cancelled');

        const searchLower = search.toLowerCase();
        const matchSearch = !search || 
            o.orderId.toLowerCase().includes(searchLower) || 
            o.customer?.name.toLowerCase().includes(searchLower) ||
            o.items.some(i => i.title.toLowerCase().includes(searchLower));

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
            
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>My Orders</h1>
                    <span style={styles.count}>{filteredOrders.length}</span>
                </div>
            </header>

            <div style={styles.container}>
                <div style={styles.tabs} className="no-scrollbar">
                    {['In-Progress', 'Delivered', 'Returned', 'Cancelled'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} style={activeTab === tab ? styles.tabActive : styles.tab}>
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div style={styles.search}>
                    <FaSearch style={{color:'#9CA3AF', marginRight:8}} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ID, Name or Product`} style={styles.searchInput} />
                </div>

                <div style={styles.list}>
                    {/* Only show skeleton on VERY first load when no cache exists */}
                    {isLoading && orders.length === 0 ? (
                        <>
                            <OrderSkeleton/>
                            <OrderSkeleton/>
                        </>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredOrders.length === 0 ? (
                                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} style={styles.empty}>
                                    <FaBoxOpen size={40} color="#D1D5DB" />
                                    <p style={{color:'#9CA3AF', marginTop:10}}>No orders found.</p>
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
        </div>
    );
}

// ==========================================
// 5. ORDER CARD COMPONENT
// ==========================================
function OrderCard({ order, router, onCancel, index, onReviewClick, myReviews }: any) {
    
    const goToProduct = (title: string) => {
        const slug = createSlug(title);
        router.push(`/products/${slug}`);
    };

    const getStatusUI = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s.includes('delivered')) return { text: 'Delivered', bg: '#DCFCE7', col: '#16A34A', isDelivered: true };
        if (s.includes('return') || s.includes('rto')) return { text: 'Returned', bg: '#FEE2E2', col: '#DC2626' };
        if (s.includes('cancel')) return { text: 'Cancelled', bg: '#F3F4F6', col: '#6B7280' };
        return { text: 'In Transit', bg: '#CFFAFE', col: '#0891B2' };
    };

    const ui = getStatusUI(order.status);
    const isCancellable = ['processing', 'pending'].includes((order.status || '').toLowerCase());

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }} 
            style={styles.card}
        >
            <div style={styles.cardHeader}>
                <div>
                    <div style={{fontSize:13, fontWeight:700, color:'#FFF', letterSpacing:0.5}}>ID: {order.orderId.substring(0,8).toUpperCase()}</div>
                    <div style={{fontSize:11, color:'#93C5FD', marginTop:2}}>{new Date(order.date).toLocaleDateString()}</div>
                </div>
                
                {/* TRACK BUTTON (LOOP ANIMATION) */}
                {order.canTrack && (
                    <motion.button 
                        onClick={() => router.push(`/orders/track/${order.orderId}`)} 
                        style={styles.trackBtn}
                        animate={{ 
                            scale: [1, 1.05, 1],
                            boxShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 10px rgba(255,255,255,0.4)", "0px 0px 0px rgba(255,255,255,0)"]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <FaTruck style={{marginRight:5}}/> Track Order
                    </motion.button>
                )}
            </div>

            <div style={styles.statusRow}>
                <span style={{...styles.badge, background: ui.bg, color: ui.col}}>{ui.text}</span>
                <span style={{fontSize:14, fontWeight:800, color:'#111827'}}>Total: Rs. {Math.round(order.totalPrice).toLocaleString()}</span>
            </div>

            <div style={styles.timeline}>
                <div style={styles.line}></div>
                <div style={styles.timelineItem}>
                    <div style={{...styles.dotSupplier, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <FaStore size={8} color="#0A1E40"/>
                    </div>
                    <div style={{fontSize:13, color:'#4B5563', fontWeight:500}}>Supplier: <span style={{fontWeight:600}}>{order.supplierName}</span></div>
                </div>
                <div style={{...styles.timelineItem, marginBottom:0}}>
                    <div style={{...styles.dotCustomer, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <FaUser size={8} color="#FFF"/>
                    </div>
                    <div>
                        <div style={{fontSize:13, color:'#111827', fontWeight:700}}>Customer: {order.customer?.name}</div>
                        <div style={{fontSize:11, color:'#6B7280', display:'flex', alignItems:'center', marginTop:2}}>
                            <FaMapMarkerAlt size={10} style={{marginRight:4}}/> 
                            {order.customer?.city || 'Pakistan'} - {order.customer?.address?.substring(0, 30)}...
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.products}>
                {order.items.map((item: any, i: number) => {
                    const isReviewed = myReviews?.some((r: any) => 
                        String(r.product_id) === String(item.productId) && 
                        String(r.order_id) === String(order.orderId)
                    );

                    let color = 'Standard';
                    let size = 'Standard';
                    if (item.variantString) {
                        const parts = item.variantString.split('|');
                        parts.forEach((p: string) => {
                            if (p.toLowerCase().includes('color')) color = p.split(':')[1]?.trim();
                            if (p.toLowerCase().includes('size')) size = p.split(':')[1]?.trim();
                        });
                    }

                    return (
                        <div key={i} style={styles.product}>
                            
                            {/* CLICKABLE IMAGE (REDIRECTS TO PRODUCT) */}
                            <motion.div 
                                style={styles.imgBox}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => goToProduct(item.title)}
                                className="hover-scale"
                            >
                                {item.image ? (
                                    <Image 
                                        src={item.image} alt="item" fill style={{objectFit:'contain'}} unoptimized 
                                        onError={(e) => { e.currentTarget.src = '/no-image.png' }}
                                    />
                                ) : (
                                    <span style={{fontSize:10, color:'#9CA3AF'}}>No Img</span>
                                )}
                            </motion.div>

                            <div style={{flex:1}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                    
                                    {/* CLICKABLE TITLE (REDIRECTS TO PRODUCT) */}
                                    <div 
                                        style={styles.productTitle} 
                                        onClick={() => goToProduct(item.title)}
                                    >
                                        {item.title}
                                        <FaExternalLinkAlt size={9} color="#6B7280" style={{marginLeft:5, opacity:0.6}}/>
                                    </div>
                                    
                                    <span style={{fontSize:12, fontWeight:700, marginLeft:5}}>x{item.quantity}</span>
                                </div>
                                
                                <div style={{marginTop:6, display:'flex', flexWrap:'wrap', gap:6, alignItems:'center'}}>
                                    {color !== 'Standard' && (
                                        <span style={styles.iconPill}>
                                            <FaPalette size={10} color="#6B7280" /> {color}
                                        </span>
                                    )}
                                    {size !== 'Standard' && (
                                        <span style={styles.iconPill}>
                                            <FaRuler size={10} color="#6B7280" /> {size}
                                        </span>
                                    )}
                                    <span style={{...styles.iconPill, background:'#ECFDF5', color:'#059669', border:'1px solid #A7F3D0'}}>
                                        <FaMoneyBillWave size={10} /> Profit: Rs. {item.profit}
                                    </span>
                                </div>

                                {ui.isDelivered && (
                                    <div style={{marginTop:8, display:'flex', justifyContent:'flex-end'}}>
                                        <button 
                                            onClick={() => onReviewClick(item, order.orderId)}
                                            style={isReviewed ? styles.viewReviewBtn : styles.reviewBtn}
                                        >
                                            {isReviewed ? (
                                                <><FaEye size={10} style={{marginRight:4}}/> Your Review</>
                                            ) : (
                                                <><FaStar size={10} style={{marginRight:4, color:'#F59E0B'}}/> Write Review</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isCancellable && (
                <div style={styles.footer}>
                    {/* CANCEL BUTTON (LOOP ANIMATION) */}
                    <motion.button 
                        onClick={() => onCancel(order.orderId)} 
                        style={styles.cancelBtn}
                        animate={{ 
                            opacity: [1, 0.8, 1],
                            scale: [1, 1.02, 1] 
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <FaBan size={12} style={{marginRight:6}}/> Cancel Order
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
}

// ... Review Modal same as before (No Changes) ...
function ReviewModal({ product, existingReview, userFullName, onClose, onSuccess }: any) {
    const isReadOnly = !!existingReview; 
    
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<File[]>([]);
    
    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
        } else {
            setRating(5);
            setComment('');
        }
        setImages([]); 
    }, [existingReview]);

    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

            const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/${product.id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    rating,
                    comment,
                    userName: userFullName,
                    image_url: JSON.stringify(finalImageUrls),
                    orderId: product.orderId 
                })
            });

            if (!reviewRes.ok) throw new Error("Failed to save review");
            
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
                
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:15}}>
                    <h3 style={{margin:0, fontSize:16, fontWeight:700, color:'#1F2937'}}>
                        {isReadOnly ? 'Your Review' : 'Rate Product'}
                    </h3>
                    <button onClick={onClose} style={{border:'none', background:'none', padding:5, cursor:'pointer'}}>
                        <FaTimes size={18} color="#9CA3AF"/>
                    </button>
                </div>

                <div style={{display:'flex', gap:10, marginBottom:20, alignItems:'center', background:'#F9FAFB', padding:10, borderRadius:8}}>
                    <div style={{width:40, height:40, position:'relative', borderRadius:6, overflow:'hidden'}}>
                        {product.img ? <Image src={product.img} fill style={{objectFit:'cover'}} alt="prod" unoptimized /> : null}
                    </div>
                    <div style={{fontSize:12, fontWeight:600, color:'#374151', flex:1}}>{product.title}</div>
                </div>

                <div style={{display:'flex', justifyContent:'center', gap:10, marginBottom:20}}>
                    {[1,2,3,4,5].map(star => (
                        <FaStar 
                            key={star} size={28} 
                            color={star <= rating ? '#F59E0B' : '#E5E7EB'} 
                            style={{cursor: isReadOnly ? 'default' : 'pointer', transition:'color 0.2s'}}
                            onClick={() => !isReadOnly && setRating(star)}
                        />
                    ))}
                </div>

                <textarea 
                    placeholder="Describe your experience..." 
                    style={{...styles.textArea, background: isReadOnly ? '#F3F4F6' : '#FFF'}}
                    value={comment}
                    disabled={isReadOnly}
                    onChange={(e) => setComment(e.target.value)}
                />

                <div style={{marginTop:15}}>
                    <div style={{display:'flex', gap:10, marginBottom:10}}>
                        
                        {isReadOnly && existingReview && existingReview.image_urls && existingReview.image_urls.map((url: string, i: number) => (
                            <div key={i} style={{width:60, height:60, position:'relative', borderRadius:8, overflow:'hidden', border:'1px solid #E5E7EB'}}>
                                <Image src={url} fill style={{objectFit:'cover'}} alt="review" unoptimized/>
                            </div>
                        ))}

                        {!isReadOnly && images.map((file, i) => (
                            <div key={i} style={{width:50, height:50, position:'relative', borderRadius:8, overflow:'hidden'}}>
                                <Image src={URL.createObjectURL(file)} fill style={{objectFit:'cover'}} alt="upload" unoptimized/>
                                <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} style={styles.imgRemoveBtn}><FaTimes size={8}/></button>
                            </div>
                        ))}

                        {!isReadOnly && images.length < 3 && (
                            <div onClick={() => fileInputRef.current?.click()} style={styles.addImgBox}>
                                <FaCamera color="#6B7280" />
                                <span style={{fontSize:9, marginTop:2, color:'#6B7280'}}>Add</span>
                            </div>
                        )}
                    </div>
                    {!isReadOnly && <input type="file" accept="image/*" multiple ref={fileInputRef} style={{display:'none'}} onChange={handleFileChange} />}
                </div>

                {!isReadOnly && (
                    <button onClick={handleSubmit} disabled={submitting} style={{...styles.submitBtn, opacity: submitting ? 0.7 : 1}}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                )}

                {isReadOnly && (
                    <button onClick={onClose} style={{...styles.submitBtn, background:'#E5E7EB', color:'#374151'}}>Close</button>
                )}

            </motion.div>
        </motion.div>
    );
}

// ==========================================
// 7. STYLES
// ==========================================
const styles: {[key:string]: React.CSSProperties} = {
    page: { minHeight: '100vh', paddingBottom: 80, backgroundColor: '#F3F4F6' },
    loaderContainer: { height: '100vh', display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', background:'#FFF' },
    logoLoader: { width: 80, height: 80, borderRadius: '20%', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' },
    header: { position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter:'blur(10px)', borderBottom: '1px solid #E5E7EB', padding: '16px 20px' },
    headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600, margin: '0 auto' },
    title: { margin: 0, fontSize: 22, fontWeight: 800, color: '#0A1E40', letterSpacing:-0.5 },
    count: { background: '#0A1E40', color: '#FFF', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
    container: { maxWidth: 600, margin: '0 auto', padding: '0 16px' },
    tabs: { display: 'flex', gap: 10, overflowX: 'auto', padding: '16px 4px', position:'sticky', top:64, zIndex:40, background:'#F3F4F6' },
    tabActive: { padding: '8px 18px', borderRadius: 50, background: '#0A1E40', color: '#FFF', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0, boxShadow:'0 4px 12px rgba(10,30,64,0.2)' },
    tab: { padding: '8px 18px', borderRadius: 50, background: '#FFF', color: '#6B7280', border: '1px solid #E5E7EB', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
    search: { background: '#FFF', padding: 12, borderRadius: 16, display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', marginBottom: 20, boxShadow:'0 2px 4px rgba(0,0,0,0.02)' },
    searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: 14, color:'#1F2937' },
    list: { display: 'flex', flexDirection: 'column', gap: 16 },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 80 },
    card: { background: '#FFF', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' },
    cardHeader: { background: 'linear-gradient(135deg, #0A1E40 0%, #1E3A8A 100%)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    trackBtn: { background: 'rgba(255,255,255,0.2)', backdropFilter:'blur(4px)', border:'1px solid rgba(255,255,255,0.3)', color:'#FFF', padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center' },
    statusRow: { padding: '12px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    badge: { padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing:0.5 },
    timeline: { padding: '16px 18px', position: 'relative', borderBottom:'1px solid #F3F4F6' },
    line: { position: 'absolute', left: 26, top: 28, bottom: 30, width: 2, background: '#E5E7EB' },
    timelineItem: { display: 'flex', alignItems: 'flex-start', marginBottom: 20, position:'relative', zIndex:2 },
    dotSupplier: { width: 22, height: 22, background: '#FFF', border: '2px solid #0A1E40', borderRadius: '50%', marginRight: 12, marginTop: 0, flexShrink:0, zIndex:2 },
    dotCustomer: { width: 22, height: 22, background: '#0A1E40', borderRadius: '50%', marginRight: 12, marginTop: 0, flexShrink:0, zIndex:2 },
    products: { padding: '6px 18px' },
    product: { padding: '12px 0', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: 14 },
    // CLICKABLE IMAGE STYLE
    imgBox: { width: 60, height: 60, borderRadius: 12, background: '#F8FAFC', position: 'relative', overflow: 'hidden', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
    // CLICKABLE TITLE STYLE
    productTitle: { fontSize:13, color:'#374151', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center' },
    iconPill: { background:'#F1F5F9', color:'#4B5563', fontSize:10, padding:'3px 8px', borderRadius:6, fontWeight:600, display:'flex', alignItems:'center', gap:4 },
    footer: { padding: '12px 18px', background: '#FFF', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center' },
    cancelBtn: { display: 'flex', alignItems: 'center', background: '#FEF2F2', color: '#DC2626', border: 'none', padding: '10px 24px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
    reviewBtn: { background: '#FFF', border: '1px solid #E5E7EB', color: '#374151', fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow:'0 1px 2px rgba(0,0,0,0.05)' },
    viewReviewBtn: { background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center' },
    modalOverlay: { position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalContent: { background: '#FFF', width: '100%', maxWidth: 400, borderRadius: 20, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
    textArea: { width: '100%', height: 80, border: '1px solid #E5E7EB', borderRadius: 12, padding: 12, fontFamily: 'inherit', fontSize: 14, resize: 'none', outline: 'none' },
    submitBtn: { width: '100%', background: '#0A1E40', color: '#FFF', padding: '12px', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 15 },
    addImgBox: { width: 50, height: 50, border: '1px dashed #D1D5DB', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    imgRemoveBtn: { position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#FFF', border: 'none', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderBottomLeftRadius: 6 }
};