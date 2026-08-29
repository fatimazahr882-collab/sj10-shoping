"use client";

import { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaBoxOpen, FaInfoCircle, FaExclamationTriangle, FaTruck, FaTimesCircle, FaGift } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

type Notification = {
    id: string;
    title: string;
    body: string;
    type: string;
    is_read: number;
    action_url: string;
    created_at: string;
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
        if (!token) return; 

        try {
            const data = await apiClient('/notifications', 'GET');
            if (data && data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount || data.notifications.filter((n: Notification) => n.is_read === 0).length);
            }
        } catch (error) {}
    };

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
        if (!token) return;

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 25000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllRead = async () => {
        const unreadIds = notifications.filter(n => n.is_read === 0).map(n => n.id);
        if (unreadIds.length > 0) {
            try {
                await apiClient('/notifications/read', 'PUT', { notificationIds: unreadIds });
            } catch (e) {}
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        }
    };

    const handleToggle = () => {
        if (!isOpen) markAllRead();
        setIsOpen(!isOpen);
    };

    const getIcon = (type: string) => {
        const t = (type || '').toLowerCase();
        if (t.includes('dispatch') || t.includes('shipping')) return <FaTruck color="#3B82F6" size={16} />;
        if (t.includes('cancel')) return <FaTimesCircle color="#EF4444" size={16} />;
        if (t.includes('reward') || t.includes('coupon')) return <FaGift color="#F59E0B" size={16} />;
        if (t.includes('delivered') || t.includes('order')) return <FaBoxOpen color="#10B981" size={16} />;
        return <FaInfoCircle color="#64748B" size={16} />;
    };

    return (
        <div style={styles.container} ref={dropdownRef}>
            <button 
                onClick={handleToggle} 
                style={styles.bellButton}
                aria-label="Notifications"
            >
                <FaBell size={20} color="#334155" />
                {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={styles.dropdown}
                    >
                        <div style={styles.header}>
                            <h3 style={styles.headerTitle}>Notifications</h3>
                            <button onClick={markAllRead} style={styles.markReadBtn}>
                                <FaCheck size={10} style={{marginRight:4}} /> Mark read
                            </button>
                        </div>

                        <div style={styles.list}>
                            {notifications.length === 0 ? (
                                <div style={styles.empty}>
                                    <FaBoxOpen size={30} color="#CBD5E1" style={{ display: 'block', margin: '0 auto 8px' }} />
                                    No notifications yet.
                                </div>
                            ) : (
                                notifications.map((note) => (
                                    <div 
                                        key={note.id}
                                        onClick={() => {
                                            if (note.action_url) router.push(note.action_url);
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            ...styles.item,
                                            backgroundColor: note.is_read === 0 ? '#F0F9FF' : '#FFF'
                                        }}
                                    >
                                        <div style={styles.iconContainer}>
                                            {getIcon(note.type)}
                                        </div>
                                        <div style={{flex:1}}>
                                            <p style={styles.itemTitle}>{note.title}</p>
                                            <p style={styles.itemBody}>{note.body}</p>
                                            <span style={styles.time}>
                                                {new Date(note.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={styles.footer}>
                            <button 
                                onClick={() => { router.push('/orders'); setIsOpen(false); }}
                                style={styles.viewAllBtn}
                            >
                                View Order Updates 📦
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const styles: {[key:string]: React.CSSProperties} = {
    container: { position: 'relative' },
    bellButton: { position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    badge: {
        position: 'absolute', top: 2, right: 2,
        background: '#EF4444', color: 'white',
        fontSize: '9px', fontWeight: 800,
        height: '16px', minWidth: '16px',
        padding: '0 4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '10px', border: '2px solid white'
    },
    dropdown: {
        position: 'absolute', right: 0, top: '42px',
        width: '320px', background: 'white',
        borderRadius: '16px',
        boxShadow: '0 15px 35px -5px rgba(0,0,0,0.15)',
        border: '1px solid #E2E8F0',
        zIndex: 1000, overflow: 'hidden'
    },
    header: {
        padding: '14px 16px', borderBottom: '1px solid #F1F5F9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#F8FAFC'
    },
    headerTitle: { fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 },
    markReadBtn: {
        background: 'none', border: 'none', color: '#2563EB',
        fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center'
    },
    list: { maxHeight: '340px', overflowY: 'auto' },
    empty: { padding: '36px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px', fontWeight: 500 },
    item: {
        padding: '12px 16px', borderBottom: '1px solid #F1F5F9',
        cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start',
        transition: 'background 0.2s'
    },
    iconContainer: { marginTop: '2px', background: '#F8FAFC', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    itemTitle: { fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '0 0 3px 0' },
    itemBody: { fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.4' },
    time: { fontSize: '10px', color: '#94A3B8', display: 'block', marginTop: '6px', fontWeight: 600 },
    footer: { padding: '10px', textAlign: 'center', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' },
    viewAllBtn: { background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
};