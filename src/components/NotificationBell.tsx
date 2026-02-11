"use client";

import { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaBoxOpen, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
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
        try {
            const data = await apiClient('/notifications', 'GET');
            if (data && data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Bell Error:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
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
            await apiClient('/notifications/read', 'PUT', { notificationIds: unreadIds });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        }
    };

    const handleToggle = () => {
        if (!isOpen) markAllRead();
        setIsOpen(!isOpen);
    };

    const getIcon = (type: string) => {
        if (type === 'order_dispatched') return <FaBoxOpen color="#3B82F6" size={16} />;
        if (type === 'alert') return <FaExclamationTriangle color="#EF4444" size={16} />;
        return <FaInfoCircle color="#9CA3AF" size={16} />;
    };

    return (
        <div style={styles.container} ref={dropdownRef}>
            {/* Bell Icon */}
            <button onClick={handleToggle} style={styles.bellButton}>
                <FaBell size={20} color="#4B5563" />
                {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount}</span>
                )}
            </button>

            {/* Dropdown Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={styles.dropdown}
                    >
                        {/* Header */}
                        <div style={styles.header}>
                            <h3 style={styles.headerTitle}>Notifications</h3>
                            <button onClick={markAllRead} style={styles.markReadBtn}>
                                <FaCheck size={10} style={{marginRight:4}} /> Mark all read
                            </button>
                        </div>

                        {/* List */}
                        <div style={styles.list}>
                            {notifications.length === 0 ? (
                                <div style={styles.empty}>No notifications yet.</div>
                            ) : (
                                notifications.map((note) => (
                                    <div 
                                        key={note.id}
                                        onClick={() => {
                                            if(note.action_url) router.push(note.action_url);
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            ...styles.item,
                                            backgroundColor: note.is_read === 0 ? '#EFF6FF' : '#FFF'
                                        }}
                                    >
                                        <div style={styles.iconContainer}>
                                            {getIcon(note.type)}
                                        </div>
                                        <div style={{flex:1}}>
                                            <p style={styles.itemTitle}>{note.title}</p>
                                            <p style={styles.itemBody}>{note.body}</p>
                                            <span style={styles.time}>
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div style={styles.footer}>
                            <button 
                                onClick={() => { router.push('/notifications'); setIsOpen(false); }}
                                style={styles.viewAllBtn}
                            >
                                View All History
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- CSS STYLES ---
const styles: {[key:string]: React.CSSProperties} = {
    container: { position: 'relative' },
    bellButton: { position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' },
    badge: {
        position: 'absolute', top: 0, right: 0,
        background: '#EF4444', color: 'white',
        fontSize: '10px', fontWeight: 'bold',
        height: '16px', width: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%', border: '2px solid white'
    },
    dropdown: {
        position: 'absolute', right: 0, top: '40px',
        width: '320px', background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: '1px solid #E5E7EB',
        zIndex: 1000, overflow: 'hidden'
    },
    header: {
        padding: '12px 16px', borderBottom: '1px solid #F3F4F6',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#F9FAFB'
    },
    headerTitle: { fontSize: '14px', fontWeight: 800, color: '#111827', margin: 0 },
    markReadBtn: {
        background: 'none', border: 'none', color: '#2563EB',
        fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center'
    },
    list: { maxHeight: '350px', overflowY: 'auto' },
    empty: { padding: '30px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' },
    item: {
        padding: '12px 16px', borderBottom: '1px solid #F3F4F6',
        cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start',
        transition: 'background 0.2s'
    },
    iconContainer: { marginTop: '2px' },
    itemTitle: { fontSize: '13px', fontWeight: 700, color: '#1F2937', margin: '0 0 4px 0' },
    itemBody: { fontSize: '12px', color: '#4B5563', margin: 0, lineHeight: '1.4' },
    time: { fontSize: '10px', color: '#9CA3AF', display: 'block', marginTop: '6px' },
    footer: { padding: '10px', textAlign: 'center', background: '#F9FAFB', borderTop: '1px solid #E5E7EB' },
    viewAllBtn: { background: 'none', border: 'none', color: '#1E40AF', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
};