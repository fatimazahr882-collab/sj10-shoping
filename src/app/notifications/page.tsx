"use client";

import { useEffect, useState } from "react";
import { FaBell, FaBoxOpen, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import apiClient from "@/lib/apiClient";
import Loader from "@/components/SjLoader";
import { useRouter } from "next/navigation";

// Types
type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: number;
  created_at: string;
  action_url: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiClient("/notifications", "GET"); 
      setNotifications(data.notifications || []);
      
      const unreadIds = (data.notifications || [])
        .filter((n: Notification) => n.is_read === 0)
        .map((n: Notification) => n.id);
        
      if (unreadIds.length > 0) {
        await apiClient("/notifications/read", "PUT", { notificationIds: unreadIds });
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order_dispatched": return <FaBoxOpen color="#2563EB" size={20} />;
      case "alert": return <FaExclamationCircle color="#DC2626" size={20} />;
      case "success": return <FaCheckCircle color="#16A34A" size={20} />;
      default: return <FaBell color="#6B7280" size={20} />;
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Notification History</h1>
          <span style={styles.badgeCount}>
            {notifications.length} Total
          </span>
        </div>

        <div style={styles.list}>
          {notifications.length === 0 ? (
            <div style={styles.emptyCard}>
              <FaBell style={{marginBottom:15, color:'#D1D5DB'}} size={40} />
              <p style={{color:'#6B7280'}}>No notifications yet.</p>
            </div>
          ) : (
            notifications.map((note) => (
              <div 
                key={note.id}
                onClick={() => note.action_url && router.push(note.action_url)}
                style={{
                    ...styles.card,
                    backgroundColor: note.is_read === 0 ? '#EFF6FF' : '#FFF',
                    borderColor: note.is_read === 0 ? '#BFDBFE' : '#F3F4F6'
                }}
              >
                <div style={styles.iconBox}>
                  {getIcon(note.type)}
                </div>
                <div style={{flex:1}}>
                  <h3 style={{...styles.cardTitle, color: note.is_read === 0 ? '#1E3A8A' : '#1F2937'}}>
                    {note.title}
                  </h3>
                  <p style={styles.cardBody}>
                    {note.body}
                  </p>
                  <p style={styles.timestamp}>
                    {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
                  </p>
                </div>
                {note.is_read === 0 && (
                  <div style={styles.unreadDot}></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- CSS STYLES ---
const styles: {[key:string]: React.CSSProperties} = {
    page: { minHeight: '100vh', background: '#F9FAFB', paddingTop: '80px', paddingBottom: '40px' },
    container: { maxWidth: '700px', margin: '0 auto', padding: '0 16px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 },
    badgeCount: { background: '#DBEAFE', color: '#1E40AF', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    emptyCard: { background: '#FFF', padding: '60px', borderRadius: '16px', textAlign: 'center', border: '1px solid #E5E7EB', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    card: { 
        padding: '16px', borderRadius: '12px', border: '1px solid', 
        display: 'flex', gap: '16px', cursor: 'pointer', position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.1s ease-in-out'
    },
    iconBox: { 
        width: '40px', height: '40px', borderRadius: '50%', background: '#F3F4F6', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
    },
    cardTitle: { fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0' },
    cardBody: { fontSize: '13px', color: '#4B5563', lineHeight: '1.5', margin: 0 },
    timestamp: { fontSize: '11px', color: '#9CA3AF', marginTop: '8px' },
    unreadDot: { 
        position: 'absolute', top: '16px', right: '16px', 
        width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' 
    }
};