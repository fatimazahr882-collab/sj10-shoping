"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
// Icons: npm install react-icons
import { 
    FaArrowLeft, 
    FaBox, 
    FaCheckCircle, 
    FaTruck, 
    FaMapMarkerAlt,
    FaClipboardList,
    FaBarcode,
    FaWarehouse,
    FaRoute
} from 'react-icons/fa';

// ==========================================
// 1. TYPES
// ==========================================
type TrackingEvent = {
    status: string;
    description: string;
    timestamp: string;
    location?: string;
};

type TrackingData = {
    orderId: string;
    courier: { name: string; trackingNumber: string; };
    currentStatus: string;
    timeline: TrackingEvent[];
    metadata?: { [key: string]: any }; // Optional metadata
    customer: { name: string; city: string; address: string; };
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function TrackOrderPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchTracking = async () => {
            try {
                const res = await apiClient(`/orders/${id}/tracking`, 'GET');
                setData(res);
            } catch (err: any) {
                setError(err.message || "Tracking details not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchTracking();
    }, [id]);

    if (loading) return <LoadingSpinner />;
    
    if (error || !data) return <ErrorMessage message={error} onBack={() => router.back()} />;

    return (
        <div style={styles.page}>
            <style jsx global>{`
                body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #F0F2F5; }
                * { box-sizing: border-box; }
            `}</style>

            {/* --- HEADER --- */}
            <motion.header 
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={styles.header}
            >
                <button onClick={() => router.back()} style={styles.backButton}><FaArrowLeft /></button>
                <h1 style={styles.headerTitle}>Order Tracking</h1>
                <div style={{ width: 40 }}></div> {/* Spacer */}
            </motion.header>

            <AnimatePresence>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={styles.content}
                >
                    {/* --- COURIER INFO CARD --- */}
                    <CourierInfoCard courier={data.courier} status={data.currentStatus} />

                    {/* --- METADATA CARD --- */}
                    {/* FIX: Check if metadata exists before rendering */}
                    {data.metadata && Object.keys(data.metadata).length > 0 && (
                        <MetadataCard metadata={data.metadata} />
                    )}

                    {/* --- TIMELINE SECTION --- */}
                    <Timeline events={data.timeline} />
                    
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================
const CourierInfoCard = ({ courier, status }: { courier: TrackingData['courier'], status: string }) => {
    const getCourierIcon = (name: string) => {
        if (name.toLowerCase().includes('postex')) return <FaTruck size={24} color="#0A1E40" />;
        return <FaBox size={24} color="#0A1E40" />;
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={styles.glassCard}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={styles.iconCircle}>{getCourierIcon(courier.name)}</div>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{courier.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                        <FaBarcode /> {courier.trackingNumber}
                    </div>
                </div>
            </div>
            <div style={styles.statusBox}>
                <span style={{ fontSize: 12, color: '#1E40AF', fontWeight: 600 }}>Current Status</span>
                <span style={{ fontSize: 12, color: '#1E40AF', fontWeight: 800 }}>{status.toUpperCase().replace('_', ' ')}</span>
            </div>
        </motion.div>
    );
};

// FIX: Added '|| {}' to Object.entries to satisfy TypeScript
const MetadataCard = ({ metadata }: { metadata: TrackingData['metadata'] }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={styles.glassCard}
    >
        <h3 style={styles.sectionTitle}>Order Details</h3>
        <div style={styles.metaGrid}>
            {Object.entries(metadata || {}).map(([key, value]) => (
                <div key={key}>
                    <div style={styles.metaKey}>{key.replace(/_/g, ' ').toUpperCase()}</div>
                    <div style={styles.metaValue}>{value as React.ReactNode}</div>
                </div>
            ))}
        </div>
    </motion.div>
);

const Timeline = ({ events }: { events: TrackingEvent[] }) => {
    const getStatusIcon = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('delivered')) return <FaCheckCircle color="#16A34A" />;
        if (s.includes('transit') || s.includes('departed')) return <FaRoute color="#0891B2" />;
        if (s.includes('hub') || s.includes('warehouse')) return <FaWarehouse color="#4F46E5" />;
        if (s.includes('placed')) return <FaClipboardList color="#D97706" />;
        return <FaBox color="#6B7280" />;
    };

    const timelineVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={timelineVariants}
            style={styles.timelineContainer}
        >
            <div style={styles.timelineLine}></div>
            {events.map((event, index) => (
                <motion.div key={index} variants={itemVariants} style={styles.timelineItem}>
                    {/* Animated Dot */}
                    <motion.div style={{...styles.dotBase, ...(index === 0 ? styles.dotActive : styles.dotInactive)}}>
                        {index === 0 && (
                            <motion.div 
                                style={styles.dotPulse}
                                animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        )}
                        <div style={styles.dotIcon}>{getStatusIcon(event.status)}</div>
                    </motion.div>

                    {/* Content */}
                    <div style={styles.eventContent}>
                        <div style={styles.eventHeader}>
                            <span style={styles.eventStatus}>{event.status}</span>
                            <span style={styles.eventTime}>
                                {new Date(event.timestamp).toLocaleDateString('en-GB', {day:'numeric', month:'short'})} 
                                {' @ '}
                                {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <p style={styles.eventDesc}>{event.description}</p>
                        {event.location && (
                            <div style={styles.eventLoc}><FaMapMarkerAlt size={10} style={{marginRight:4}} /> {event.location}</div>
                        )}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

// ==========================================
// 4. UTILITY COMPONENTS
// ==========================================
const LoadingSpinner = () => (
    <div style={styles.center}><div style={{width:40, height:40, border:'4px solid #E5E7EB', borderTop:'4px solid #0A1E40', borderRadius:'50%', animation:'spin 1s linear infinite'}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div></div>
);
const ErrorMessage = ({ message, onBack }: { message: string | null, onBack: () => void }) => (
    <div style={styles.center}>
        <h2 style={{color: '#B91C1C'}}>Error</h2>
        <p style={{color: '#4B5563'}}>{message || "Could not load tracking information."}</p>
        <button onClick={onBack} style={{marginTop: 20, padding: '10px 20px', background: '#0A1E40', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer'}}>Go Back</button>
    </div>
);

// ==========================================
// 5. STYLES (Professional & Animated)
// ==========================================
const styles: {[key:string]: React.CSSProperties} = {
    page: { minHeight: '100vh', background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F2F5 300px)' },
    center: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    header: { background: 'transparent', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 },
    headerTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#1F2937' },
    backButton: { background: 'none', border: 'none', fontSize: 20, color: '#4B5563', cursor: 'pointer', width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' },
    content: { maxWidth: 600, margin: '0 auto', padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 20 },
    glassCard: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)' },
    iconCircle: { width: 52, height: 52, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statusBox: { background: '#EFF6FF', padding: '12px 16px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
    sectionTitle: { margin: '0 0 16px 0', fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom:'1px solid #E5E7EB', paddingBottom:8 },
    metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    metaKey: { fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' },
    metaValue: { fontSize: 14, color: '#1F2937', fontWeight: 500, marginTop: 2 },
    timelineContainer: { position: 'relative', paddingLeft: 8 },
    timelineLine: { position: 'absolute', left: 23, top: 12, bottom: 20, width: 3, background: '#E5E7EB', borderRadius: 2 },
    timelineItem: { display: 'flex', gap: 16, marginBottom: 4, position: 'relative' },
    dotBase: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 2 },
    dotActive: { background: '#DCFCE7' },
    dotInactive: { background: '#F3F4F6' },
    dotIcon: { fontSize: 14, position: 'relative', zIndex: 3 },
    dotPulse: { position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#16A34A', zIndex: 1 },
    eventContent: { flex: 1, padding: '12px 16px', background: '#FFF', borderRadius: 12, border: '1px solid #F3F4F6', marginBottom: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.03)' },
    eventHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    eventStatus: { fontSize: 15, fontWeight: 700, color: '#111827' },
    eventTime: { fontSize: 11, color: '#6B7280', textAlign: 'right', whiteSpace: 'nowrap', paddingLeft: 10 },
    eventDesc: { fontSize: 13, color: '#4B5563', margin: 0, lineHeight: '1.5' },
    eventLoc: { fontSize: 11, color: '#6B7280', marginTop: 6, display: 'flex', alignItems: 'center', fontWeight: 500 },
};