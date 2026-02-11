"use client";
import { useState } from 'react';

interface Props {
  fieldLabel: string;
  initialValue: string;
  onClose: () => void;
  onSave: (newValue: string) => Promise<void>;
}

export default function EditDetailModal({ fieldLabel, initialValue, onClose, onSave }: Props) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onSave(value);
    setLoading(false);
    onClose();
  };

  const styles: { [key: string]: React.CSSProperties } = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '25px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
    header: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', marginBottom: '20px' },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    button: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.header}>Edit {fieldLabel}</h3>
        <input style={styles.input} value={value} onChange={(e) => setValue(e.target.value)} />
        <div style={styles.actions}>
          <button style={{...styles.button, background: '#e5e7eb', color: '#374151'}} onClick={onClose}>Cancel</button>
          <button style={{...styles.button, background: '#2563eb', color: 'white'}} onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}