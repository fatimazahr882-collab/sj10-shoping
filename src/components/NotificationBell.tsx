// src/components/NotificationBell.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
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

    return (
        <div style={styles.container} ref={dropdownRef}>
            <button 
                onClick={handleToggle} 
                style={styles.bellButton}
                aria-label="Notifications"
            >
                {/* Instant SVG Icon (No FontAwesome Delay) */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={styles.dropdown}
                    >
                        <div style={styles.header}>
                            <h3 style={styles.headerTitle}>Notifications</h3>
                            <button onClick={markAllRead} style={styles.markReadBtn}>
                                Mark all read
                            </button>
                        </div>

                        <div style={styles.list}>
                            {notifications.length === 0 ? (
                                <div style={styles.empty}>
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
                                        <div style={{flex: 1}}>
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
    bellButton: { 
        position: 'relative', 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '50%',
        width: '30px', 
        height: '30px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        transition: 'all 0.2s'
    },
    badge: {
        position: 'absolute', top: -3, right: -3,
        background: '#EF4444', color: 'white',
        fontSize: '9px', fontWeight: 800,
        height: '16px', minWidth: '16px',
        padding: '0 4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '10px', border: '2px solid white'
    },
    dropdown: {
        position: 'absolute', right: 0, top: '40px',
        width: '320px', background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        border: '1px solid #E2E8F0',
        zIndex: 100005, // 🟢 Always on top of everything
        overflow: 'hidden'
    },
    header: {
        padding: '12px 16px', borderBottom: '1px solid #F1F5F9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#F8FAFC'
    },
    headerTitle: { fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 },
    markReadBtn: {
        background: 'none', border: 'none', color: '#2563EB',
        fontSize: '11px', fontWeight: 700, cursor: 'pointer'
    },
    list: { maxHeight: '300px', overflowY: 'auto' },
    empty: { padding: '30px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px', fontWeight: 500 },
    item: {
        padding: '12px 16px', borderBottom: '1px solid #F1F5F9',
        cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'flex-start'
    },
    itemTitle: { fontSize: '12.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' },
    itemBody: { fontSize: '11.5px', color: '#475569', margin: 0, lineHeight: '1.4' },
    time: { fontSize: '10px', color: '#94A3B8', display: 'block', marginTop: '4px', fontWeight: 600 },
    footer: { padding: '10px', textAlign: 'center', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' },
    viewAllBtn: { background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
};