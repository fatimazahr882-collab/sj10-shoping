"use client";
import { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface SuccessPopupProps {
  message: string;
  onClose: () => void;
}

export default function SuccessPopup({ message, onClose }: SuccessPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Automatically close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    popup: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '16px',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      animation: 'zoomIn 0.3s ease-out',
    },
    icon: {
      color: '#22c55e', // Green
      fontSize: '60px',
      marginBottom: '20px',
    },
    message: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
    }
  };

  return (
    <>
      <style>{`
        @keyframes zoomIn {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
          <FaCheckCircle style={styles.icon} />
          <p style={styles.message}>{message}</p>
        </div>
      </div>
    </>
  );
}