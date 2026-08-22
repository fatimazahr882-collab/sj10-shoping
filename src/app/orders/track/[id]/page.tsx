"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaArrowLeft, FaBox, FaCheckCircle, FaTruck, 
    FaMapMarkerAlt, FaClipboardList, FaBarcode, 
    FaWarehouse, FaRoute, FaStore, FaClock, FaTimesCircle
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

type PackageOverview = {
    shipmentId: string;
    packageNumber: number;
    supplierName: string;
    supplierPic: string | null;
    status: string;
    courier: { name: string | null; trackingNumber: string | null; };
};

type TrackingData = {
    orderId: string;
    activeShipmentId?: string;
    packageNumber: number;
    supplier: { name: string; avatar: string | null; };
    courier: { name: string; trackingNumber: string; };
    currentStatus: string;
    timeline: TrackingEvent[];
    customer: { name: string; city: string; address: string; };
    allPackages?: PackageOverview[];
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function TrackOrderPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<TrackingData | null>(null);
    const [activePackageId, setActivePackageId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchTracking = async () => {
            setLoading(true);
            try {
                const targetId = activePackageId || id;
                const res = await apiClient(`/orders/${targetId}/tracking`, 'GET');
                setData(res);
            } catch (err: any) {
                setError(err.message || "Tracking details not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchTracking();
    }, [id, activePackageId]);

    if (loading && !data) return <LoadingSpinner />;
    if (error || !data) return <ErrorMessage message={error} onBack={() => router.back()} />;

    const hasMultiplePackages = data.allPackages && data.allPackages.length > 1;

    return (
        <div style={styles.page}>
            <style jsx global>{`
                body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F0F2F5; }
                * { box-sizing: border-box; }
            `}</style>

            {/* HEADER */}
            <header style={styles.header}>
                <button onClick={() => router.back()} style={styles.backButton}><FaArrowLeft /></button>
                <h1 style={styles.headerTitle}>Tracking Timeline</h1>
                <div style={{ width: 40 }}></div>
            </header>

            <div style={styles.content}>
                
                {/* 🟢 MULTI-PACKAGE SWITCHER PILLS (If Order has multiple shipments) */}
                {hasMultiplePackages && (
                    <div style={styles.packageSwitcher}>
                        {data.allPackages?.map((pkg) => {
                            const isCurrent = (activePackageId || data.activeShipmentId) === pkg.shipmentId;
                            return (
                                <button
                                    key={pkg.shipmentId}
                                    onClick={() => setActivePackageId(pkg.shipmentId)}
                                    style={isCurrent ? styles.activePkgTab : styles.pkgTab}
                                >
                                    <FaStore size={10} style={{ marginRight: 4 }} />
                                    Package {pkg.packageNumber} ({pkg.supplierName.split(' ')[0]})
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* SUPPLIER & PACKAGE HERO CARD */}
                <div style={styles.supplierHeroCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={styles.avatarBox}>
                            {data.supplier?.avatar ? (
                                <Image src={data.supplier.avatar} fill alt="" style={{ objectFit: 'cover' }} unoptimized />
                            ) : (
                                <FaStore size={14} color="#0A1E40" />
                            )}
                        </div>
                        <div>
                            <span style={styles.packageNumTag}>Package {data.packageNumber} of {data.allPackages?.length || 1}</span>
                            <h2 style={styles.storeTitleText}>{data.supplier?.name}</h2>
                        </div>
                    </div>

                    <span style={{
                        ...styles.statusPill, 
                        background: data.currentStatus.includes('delivered') ? '#DCFCE7' : data.currentStatus.includes('cancel') ? '#FEE2E2' : '#EFF6FF',
                        color: data.currentStatus.includes('delivered') ? '#15803D' : data.currentStatus.includes('cancel') ? '#991B1B' : '#1D4ED8'
                    }}>
                        {data.currentStatus.toUpperCase().replace('_', ' ')}
                    </span>
                </div>

                {/* COURIER & TRACKING NUMBER CARD */}
                <div style={styles.courierCard}>
                    <div style={styles.iconCircle}>
                        <FaTruck size={20} color="#0A1E40" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Courier Partner</span>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{data.courier?.name || 'Awaiting Courier'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Tracking ID</span>
                        <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13, color: '#0A1E40' }}>
                            {data.courier?.trackingNumber || 'Pending'}
                        </div>
                    </div>
                </div>

                {/* TIMELINE EVENTS */}
                <div style={styles.timelineContainer}>
                    <div style={styles.timelineLine}></div>
                    {data.timeline.map((event, index) => (
                        <div key={index} style={styles.timelineItem}>
                            <div style={{...styles.dotBase, ...(index === 0 ? styles.dotActive : styles.dotInactive)}}>
                                {getStatusIcon(event.status)}
                            </div>

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
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

// Icon Helper
const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return <FaCheckCircle color="#16A34A" size={13} />;
    if (s.includes('transit') || s.includes('departed')) return <FaRoute color="#0891B2" size={13} />;
    if (s.includes('hub') || s.includes('warehouse')) return <FaWarehouse color="#4F46E5" size={13} />;
    if (s.includes('placed')) return <FaClipboardList color="#D97706" size={13} />;
    return <FaBox color="#6B7280" size={13} />;
};

const LoadingSpinner = () => (
    <div style={styles.center}><div style={{width:35, height:35, border:'3px solid #E5E7EB', borderTop:'3px solid #0A1E40', borderRadius:'50%', animation:'spin 0.8s linear infinite'}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div></div>
);

const ErrorMessage = ({ message, onBack }: { message: string | null, onBack: () => void }) => (
    <div style={styles.center}>
        <h3 style={{color: '#B91C1C', margin: '0 0 6px'}}>Tracking Unavailable</h3>
        <p style={{color: '#4B5563', fontSize: 13, margin: 0}}>{message || "Could not load tracking information."}</p>
        <button onClick={onBack} style={{marginTop: 15, padding: '8px 18px', background: '#0A1E40', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700}}>Go Back</button>
    </div>
);

// ==========================================
// 3. STYLES
// ==========================================
const styles: {[key:string]: React.CSSProperties} = {
    page: { minHeight: '100vh', background: '#F8FAFC', paddingBottom: 60 },
    center: { height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    header: { background: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50 },
    headerTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: '#0A1E40' },
    backButton: { background: 'none', border: 'none', fontSize: 16, color: '#4B5563', cursor: 'pointer' },
    content: { maxWidth: 540, margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 },
    
    // SWITCHER
    packageSwitcher: { display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 },
    activePkgTab: { background: '#0A1E40', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' },
    pkgTab: { background: 'white', color: '#64748B', border: '1px solid #E2E8F0', padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' },

    // HERO CARD
    supplierHeroCard: { background: 'white', borderRadius: 16, padding: '14px 16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
    avatarBox: { width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', border: '1.5px solid #BFDBFE', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    packageNumTag: { fontSize: 9.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' },
    storeTitleText: { fontSize: 14, fontWeight: 800, color: '#0A1E40', margin: '2px 0 0' },
    statusPill: { padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' },

    // COURIER CARD
    courierCard: { background: 'white', borderRadius: 14, padding: '12px 16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 },
    iconCircle: { width: 38, height: 38, borderRadius: 10, background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

    // TIMELINE
    timelineContainer: { position: 'relative', paddingLeft: 4, marginTop: 10 },
    timelineLine: { position: 'absolute', left: 19, top: 10, bottom: 20, width: 2, background: '#E2E8F0' },
    timelineItem: { display: 'flex', gap: 14, marginBottom: 12, position: 'relative' },
    dotBase: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 2, border: '2px solid white' },
    dotActive: { background: '#DCFCE7' },
    dotInactive: { background: '#F1F5F9' },
    eventContent: { flex: 1, padding: '10px 14px', background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0' },
    eventHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 },
    eventStatus: { fontSize: 13, fontWeight: 700, color: '#0F172A' },
    eventTime: { fontSize: 10, color: '#64748B' },
    eventDesc: { fontSize: 11.5, color: '#475569', margin: 0, lineHeight: 1.4 },
    eventLoc: { fontSize: 10, color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center' }
};