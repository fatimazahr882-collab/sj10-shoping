"use client";

import React, { useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaArrowLeft, FaCamera, FaTimes, FaSpinner, 
    FaCheckCircle, FaExclamationTriangle, FaWhatsapp, FaShieldAlt, FaBoxOpen, FaSyncAlt
} from 'react-icons/fa';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/AuthProvider';

const fetcher = (url: string) => apiClient(url, 'GET');

// 🟢 7 RETURN REASONS
const RETURN_REASONS = [
    { id: "missing", label: "Missing Item" },
    { id: "different", label: "Different Item" },
    { id: "defected", label: "Defected Item" },
    { id: "size", label: "Size Issue" },
    { id: "description", label: "Description Issue" },
    { id: "quality", label: "Quality Issue" },
    { id: "color", label: "Color Issue" }
];

// 🟢 UNIVERSAL TOKEN SCANNER
const getUniversalAuthToken = (userContext: any): string => {
    if (typeof window === 'undefined') return '';
    try {
        if (userContext?.token) return userContext.token;
        if (userContext?.accessToken) return userContext.accessToken;
    } catch (e) {}
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            const val = localStorage.getItem(key);
            if (!val) continue;
            if (val.startsWith('eyJ') && val.split('.').length === 3) return val;
            if (val.startsWith('{') || val.startsWith('[')) {
                try {
                    const parsed = JSON.parse(val);
                    if (parsed.token?.startsWith('eyJ')) return parsed.token;
                    if (parsed.accessToken?.startsWith('eyJ')) return parsed.accessToken;
                    if (parsed.state?.token) return parsed.state.token;
                    if (parsed.user?.token) return parsed.user.token;
                } catch (e) {}
            }
        }
    } catch (e) {}
    return '';
};

export default function ReturnOrderPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const orderId = String(params.orderId);
    const itemId = String(params.itemId);

    // States
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [comments, setComments] = useState<string>('');
    const [uploadedImages, setUploadedImages] = useState<Array<{ preview: string; url: string; isUploading: boolean }>>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    // 🟢 WHATSAPP REDIRECTION SUCCESS MODAL STATE
    const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Fetch User's Orders
    const { data: orders = [], isLoading } = useSWR<any[]>(user ? '/orders' : null, fetcher);

    // Find Target Order & Item
    const targetData = useMemo(() => {
        if (!orders || orders.length === 0) return null;
        const ord = orders.find((o: any) => o.orderId === orderId || o.orderId?.toLowerCase().startsWith(orderId.toLowerCase()));
        if (!ord) return null;

        for (const pkg of ord.packages) {
            const foundItem = pkg.items.find((it: any) => String(it.itemId) === itemId || String(it.productId) === itemId);
            if (foundItem) {
                return { order: ord, item: foundItem };
            }
        }
        return null;
    }, [orders, orderId, itemId]);

    // 🟢 INSTANT BACKGROUND IMAGE UPLOADER
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remainingSlots = 3 - uploadedImages.length;
        if (remainingSlots <= 0) {
            alert("Maximum 3 images allowed.");
            return;
        }

        const selectedFiles = Array.from(files).slice(0, remainingSlots);
        const authToken = getUniversalAuthToken(user);

        for (const file of selectedFiles) {
            const localPreview = URL.createObjectURL(file);
            setUploadedImages(prev => [...prev, { preview: localPreview, url: '', isUploading: true }]);

            try {
                const formData = new FormData();
                formData.append('images', file);

                const backendUrl = `${process.env.NEXT_PUBLIC_ORDER_API_URL || 'https://orders.sj10.pk/api'}/orders/return-images`;

                const headers: Record<string, string> = {};
                if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

                const res = await fetch(backendUrl, {
                    method: 'POST',
                    headers: headers,
                    credentials: 'include',
                    body: formData
                });

                const data = await res.json();

                if (res.ok && data.urls && data.urls.length > 0) {
                    const serverUrl = data.urls[0];
                    setUploadedImages(prev => 
                        prev.map(img => img.preview === localPreview ? { ...img, url: serverUrl, isUploading: false } : img)
                    );
                } else {
                    throw new Error(data.message || "Upload failed");
                }
            } catch (err: any) {
                alert("Image upload fail ho gayi: " + (err.message || "Network issue"));
                setUploadedImages(prev => prev.filter(img => img.preview !== localPreview));
            }
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // 🟢 SUBMIT RETURN REQUEST
    const handleSubmit = async () => {
        if (!selectedReason) {
            setErrorMessage("Barah-e-karam return ki wajah (reason) muntakhib karein.");
            return;
        }

        if (uploadedImages.some(img => img.isUploading)) {
            alert("Pictures abhi upload ho rahi hain. Barah-e-karam 2 second intezar karein.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const finalImageUrls = uploadedImages.map(img => img.url).filter(Boolean);

            await apiClient(`/orders/${targetData?.order.orderId || orderId}/items/${targetData?.item.itemId || itemId}/return`, 'POST', {
                reason: selectedReason,
                images: finalImageUrls,
                comments: comments.trim()
            });

            // Trigger WhatsApp Verification Redirection Modal
            setShowWhatsAppModal(true);

        } catch (err: any) {
            setErrorMessage(err.message || "Return request submit nahi ho saki. Please dobara koshish karein.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.spinner}></div>
                <p style={{ marginTop: 14, fontWeight: 800, color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>Preparing Return Hub...</p>
            </div>
        );
    }

    const item = targetData?.item;

    return (
        <div style={styles.page}>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');
                body { margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; background: #FFFFFF; color: #0F172A; }
                * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
                
                @keyframes spinLoader {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .upload-spin { animation: spinLoader 0.8s linear infinite; }

                @keyframes floatHeader {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-6px) rotate(2deg); }
                }
                .float-icon-1 { animation: floatHeader 4s ease-in-out infinite; }
                .float-icon-2 { animation: floatHeader 4s ease-in-out infinite 1.5s; }
            `}} />

            {/* 🟢 LUXURY ANIMATED HEADER */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <motion.button 
                        whileTap={{ scale: 0.88 }}
                        onClick={() => router.back()} 
                        style={styles.backBtn}
                    >
                        <FaArrowLeft size={16} color="#0B192C" />
                    </motion.button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="float-icon-1" style={{ fontSize: 16 }}>📦</span>
                        <h1 style={styles.headerTitle}>Return Order Hub</h1>
                        <span className="float-icon-2" style={{ fontSize: 16 }}>🛡️</span>
                    </div>

                    <div style={{ width: 40 }}></div>
                </div>
            </header>

            <main style={styles.mainContainer}>
                
                {/* 1. PRODUCT PREVIEW CARD */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={styles.productCard}>
                    <div style={styles.productImgWrapper}>
                        <img 
                            src={item?.image || 'https://via.placeholder.com/90'} 
                            alt={item?.title || 'Product'} 
                            style={styles.productImg} 
                        />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                        <div style={styles.itemIdText}>Item ID : {item?.sku || item?.productId || itemId}</div>
                        <div style={styles.productTitleText}>{item?.title || 'Product Item'}</div>
                        <div style={styles.variantText}>
                            Color: <strong style={{ color: '#0F172A' }}>{item?.options?.color || 'Standard'}</strong>
                            {item?.options?.size && ` • Size: ${item?.options?.size}`}
                        </div>
                    </div>

                    <div style={styles.qtyBadge}>
                        x{item?.quantity || 1}
                    </div>
                </motion.div>

                {/* 2. REASON SELECTION */}
                <div style={styles.sectionHeadingBox}>
                    <h2 style={styles.sectionTitle}>What's the reason for your wish to return the item?</h2>
                </div>

                <div style={styles.reasonsListBox}>
                    {RETURN_REASONS.map((r, idx) => {
                        const isSelected = selectedReason === r.label;
                        return (
                            <motion.div 
                                key={r.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedReason(r.label)}
                                style={{
                                    ...styles.reasonRow,
                                    borderBottom: idx === RETURN_REASONS.length - 1 ? 'none' : '1px solid #F1F5F9',
                                    background: isSelected ? 'rgba(255, 107, 0, 0.05)' : 'transparent'
                                }}
                            >
                                <div style={{
                                    ...styles.customRadio,
                                    borderColor: isSelected ? '#FF6B00' : '#CBD5E1',
                                    background: isSelected ? '#FF6B00' : '#FFFFFF'
                                }}>
                                    {isSelected && <div style={styles.radioInnerWhiteDot}></div>}
                                </div>

                                <span style={{
                                    ...styles.reasonLabelText,
                                    color: isSelected ? '#FF6B00' : '#1E293B',
                                    fontWeight: isSelected ? 900 : 600
                                }}>
                                    {r.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* 3. UPLOAD PICTURES */}
                <div style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 style={styles.uploadHeading}>Upload Proof Pictures</h3>
                        <span style={styles.counterText}>({uploadedImages.length}/3 attached)</span>
                    </div>

                    <div style={styles.uploadSlotsGrid}>
                        {uploadedImages.map((img, index) => (
                            <div key={index} style={styles.imageSlotActive}>
                                <img src={img.preview} alt="Upload proof" style={styles.previewImage} />
                                
                                {img.isUploading ? (
                                    <div style={styles.uploadingOverlay}>
                                        <FaSpinner size={18} color="#FFFFFF" className="upload-spin" />
                                    </div>
                                ) : (
                                    <motion.button 
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleRemoveImage(index)} 
                                        style={styles.deleteImgBtn}
                                    >
                                        <FaTimes size={11} color="#FFFFFF" />
                                    </motion.button>
                                )}
                            </div>
                        ))}

                        {uploadedImages.length < 3 && (
                            <motion.div 
                                whileHover={{ scale: 1.02, borderColor: '#FF6B00' }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => fileInputRef.current?.click()}
                                style={styles.imageSlotEmpty}
                            >
                                <div style={styles.uploadIconContainer}>
                                    <FaCamera size={22} color="#94A3B8" />
                                    <span style={styles.plusPill}>+</span>
                                </div>
                                <span style={styles.addPicText}>Add Photo</span>
                            </motion.div>
                        )}
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/*" 
                        multiple 
                        style={{ display: 'none' }} 
                    />
                </div>

                {/* 4. OPTIONAL DETAIL COMMENT */}
                <div style={{ marginTop: 24 }}>
                    <label style={styles.commentLabel}>Additional Comments (Optional)</label>
                    <textarea 
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Wajah tafseel se likhein (e.g. Suit ka kapra kharab hai ya size chota hai)..."
                        style={styles.textareaInput}
                        rows={3}
                    />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={styles.errorBox}>
                        <FaExclamationTriangle size={15} color="#DC2626" style={{ marginRight: 8, flexShrink: 0 }} />
                        <span>{errorMessage}</span>
                    </motion.div>
                )}

                {/* 5. VIBRANT SUBMIT BUTTON */}
                <div style={{ marginTop: 30 }}>
                    <motion.button 
                        whileHover={{ scale: 1.01, boxShadow: '0 8px 22px rgba(0, 192, 134, 0.4)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{
                            ...styles.submitBtn,
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        {isSubmitting ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <FaSpinner size={16} className="upload-spin" /> Submitting Request...
                            </span>
                        ) : (
                            "Submit Return Request"
                        )}
                    </motion.button>
                </div>
            </main>

            {/* 🟢 WHATSAPP REDIRECTION RED CARPET MODAL */}
            <AnimatePresence>
                {showWhatsAppModal && (
                    <div style={styles.modalOverlay}>
                        <motion.div 
                            initial={{ scale: 0.85, opacity: 0, y: 30 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.85, opacity: 0, y: 30 }}
                            style={styles.modalCard}
                        >
                            <div style={styles.modalWhatsAppIconBox}>
                                <FaWhatsapp size={42} color="#25D366" />
                            </div>

                            <h3 style={styles.modalTitle}>Almost Done! 📱</h3>
                            
                            <p style={styles.modalMessage}>
                                Aapki return request save ho chuki hai. Security verification ke liye ab aapko <strong>WhatsApp par ja kar '1' type karke reply karna hoga</strong>.
                            </p>

                            <div style={styles.modalTipBox}>
                                <FaSyncAlt size={14} color="#166534" style={{ marginRight: 6, flexShrink: 0 }} />
                                <span>Jab tak aap WhatsApp par '1' nahi likhenge, supplier ko alert nahi jayega!</span>
                            </div>

                            <motion.button 
                                whileTap={{ scale: 0.96 }}
                                onClick={() => router.push('/orders')} 
                                style={styles.modalDoneBtn}
                            >
                                Open My Orders & Check WhatsApp
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ==========================================
// 6. STYLES
// ==========================================
const styles: { [key: string]: React.CSSProperties } = {
    page: { minHeight: '100vh', backgroundColor: '#FFFFFF', paddingBottom: 60 },
    header: { 
        background: '#FFFFFF', borderBottom: '1px solid #F1F5F9', padding: '14px 18px', 
        position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' 
    },
    headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 540, margin: '0 auto' },
    backBtn: { background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    headerTitle: { margin: 0, fontSize: 17, fontWeight: 900, color: '#0B192C' },
    mainContainer: { maxWidth: 540, margin: '0 auto', padding: '16px 20px' },
    
    productCard: { 
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px', 
        borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: 22 
    },
    productImgWrapper: { width: 76, height: 76, borderRadius: 10, overflow: 'hidden', border: '1.5px solid #E2E8F0', flexShrink: 0, background: '#FFFFFF' },
    productImg: { width: '100%', height: '100%', objectFit: 'cover' },
    itemIdText: { fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.3px' },
    productTitleText: { fontSize: 14, fontWeight: 800, color: '#0F172A', lineHeight: 1.35, marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    variantText: { fontSize: 12, color: '#64748B', marginTop: 3 },
    qtyBadge: { fontSize: 19, fontWeight: 900, color: '#0B192C', padding: '0 8px' },

    sectionHeadingBox: { marginBottom: 14 },
    sectionTitle: { margin: 0, fontSize: 16, fontWeight: 900, color: '#0B192C', lineHeight: 1.4 },
    reasonsListBox: { border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden', background: '#FFFFFF' },
    reasonRow: { 
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 14px', 
        cursor: 'pointer', transition: 'background 0.2s ease' 
    },
    customRadio: { 
        width: 22, height: 22, borderRadius: '50%', border: '2px solid #CBD5E1', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' 
    },
    radioInnerWhiteDot: { width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF' },
    reasonLabelText: { fontSize: 14, letterSpacing: '0.2px' },

    uploadHeading: { margin: 0, fontSize: 15, fontWeight: 900, color: '#0B192C' },
    counterText: { fontSize: 12, color: '#64748B', fontWeight: 700 },
    uploadSlotsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 },
    imageSlotEmpty: { 
        aspectRatio: '1/1', borderRadius: 12, border: '2px dashed #CBD5E1', 
        background: '#F8FAFC', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 6 
    },
    uploadIconContainer: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    plusPill: { position: 'absolute', top: -6, right: -8, fontSize: 14, fontWeight: 900, color: '#94A3B8' },
    addPicText: { fontSize: 11, fontWeight: 800, color: '#64748B' },
    imageSlotActive: { 
        aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', 
        position: 'relative', border: '1.5px solid #CBD5E1', background: '#0F172A' 
    },
    previewImage: { width: '100%', height: '100%', objectFit: 'cover' },
    uploadingOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    deleteImgBtn: { 
        position: 'absolute', top: 5, right: 5, width: 22, height: 22, 
        borderRadius: '50%', background: '#EF4444', border: 'none', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' 
    },

    commentLabel: { display: 'block', fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 8 },
    textareaInput: { 
        width: '100%', padding: '12px 14px', borderRadius: 12, 
        border: '1.5px solid #E2E8F0', background: '#F8FAFC', outline: 'none', 
        fontSize: 13, color: '#0F172A', fontFamily: 'inherit', resize: 'vertical' 
    },
    errorBox: { display: 'flex', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: 10, color: '#DC2626', fontSize: 12, fontWeight: 700, marginTop: 14 },

    submitBtn: { 
        width: '100%', background: '#00C086', color: '#FFFFFF', border: 'none', 
        padding: '16px', borderRadius: 12, fontSize: 16, fontWeight: 900, cursor: 'pointer' 
    },

    modalOverlay: { 
        position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.65)', 
        backdropFilter: 'blur(4px)', zIndex: 100000, display: 'flex', 
        alignItems: 'center', justifyContent: 'center', padding: 20 
    },
    modalCard: { background: '#FFFFFF', width: '100%', maxWidth: 400, borderRadius: 20, padding: '30px 24px', textAlign: 'center', boxShadow: '0 20px 30px rgba(0,0,0,0.15)' },
    modalWhatsAppIconBox: { width: 68, height: 68, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
    modalTitle: { margin: '0 0 8px', fontSize: 20, fontWeight: 900, color: '#0F172A' },
    modalMessage: { margin: '0 0 18px', fontSize: 13, color: '#475569', lineHeight: 1.5 },
    modalTipBox: { display: 'flex', alignItems: 'center', background: '#F0FDF4', padding: '10px 12px', borderRadius: 10, border: '1px solid #BBF7D0', color: '#166534', fontSize: 11, fontWeight: 700, textAlign: 'left', marginBottom: 22 },
    modalDoneBtn: { width: '100%', background: '#0B192C', color: '#FFFFFF', border: 'none', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: 'pointer' },

    loadingScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    spinner: { width: 36, height: 36, border: '3.5px solid #E2E8F0', borderTop: '3.5px solid #00C086', borderRadius: '50%', animation: 'spinLoader 0.8s linear infinite' }
};