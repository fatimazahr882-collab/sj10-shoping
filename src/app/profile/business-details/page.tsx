"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuth } from '@/components/AuthProvider';
import apiClient from '@/lib/apiClient';
import ImageViewerModal from '@/components/ImageViewerModal';
import { FaUser, FaStore, FaPhone, FaEnvelope, FaCamera, FaPen, FaSpinner, FaTimes } from 'react-icons/fa';

const fetcher = (url: string) => apiClient(url, 'GET');

export default function BusinessDetailsPage() {
  const { user: initialUser, isLoading: authLoading } = useAuth();
  const { data: user, error, mutate } = useSWR(initialUser ? 'user/profile' : null, fetcher, { fallbackData: initialUser });

  const [editState, setEditState] = useState({ fullName: '', brandName: '', phone: '' });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setEditState({
        fullName: user.full_name || '',
        brandName: user.brand_name || '',
        phone: user.phone || ''
      });
      setProfilePicPreview(user.profile_pic || null);
    }
  }, [user]);

  const hasChanges = user ?
    (user.full_name !== editState.fullName) ||
    (user.brand_name !== editState.brandName) ||
    (user.phone !== editState.phone) ||
    !!profilePicFile
    : false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
      setEditingField(null); // Close any open input fields
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    let finalData: any = {};
    let newImageUrl = user?.profile_pic;

    try {
      if (profilePicFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', profilePicFile);
        const uploadRes = await apiClient('user/profile/avatar', 'POST', avatarFormData);
        newImageUrl = uploadRes.newImageUrl;
      }
      
      if (user.full_name !== editState.fullName) finalData.fullName = editState.fullName;
      if (user.brand_name !== editState.brandName) finalData.brandName = editState.brandName;
      if (user.phone !== editState.phone) finalData.phone = editState.phone;
      if (newImageUrl !== user.profile_pic) finalData.profilePic = newImageUrl;
      
      if (Object.keys(finalData).length > 0) {
        await apiClient('user/profile', 'PUT', finalData);
      }
      
      await mutate();
      setProfilePicFile(null);
      setEditingField(null);
      alert("Profile updated successfully!");

    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };
  
  const cancelEdit = () => setEditingField(null);

  const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: '700px', margin: '40px auto', padding: '0 15px', fontFamily: "'Poppins', sans-serif" },
    card: { background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    profileHeader: { padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', borderBottom: '1px solid #f0f0f0' },
    profilePicContainer: { position: 'relative' },
    profilePic: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '6px solid white', boxShadow: '0 5px 25px rgba(0,0,0,0.15)', cursor: 'pointer' },
    picOverlay: { position: 'absolute', bottom: '5px', right: '5px', width: '36px', height: '36px', background: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', cursor: 'pointer' },
    userName: { fontSize: '2rem', fontWeight: '600', color: '#111' },
    userRole: { fontSize: '1rem', color: '#6b7280', textTransform: 'capitalize', marginTop: '-10px' },
    detailsBody: { padding: '20px 30px' },
    detailItem: { display: 'flex', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #f0f0f0' },
    detailIcon: { color: '#f97316', fontSize: '1.2rem', marginRight: '20px' },
    detailContent: { flex: 1, textAlign: 'left' },
    detailLabel: { fontSize: '0.8rem', color: '#888' },
    detailValue: { fontSize: '1.1rem', color: '#1f2937', fontWeight: '500' },
    input: { width: '100%', padding: '8px', border: 'none', borderBottom: '2px solid #2563eb', background: 'transparent', fontSize: '1.1rem', fontWeight: '500', outline: 'none' },
    actionButtons: { display: 'flex', gap: '10px' },
    editButton: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '10px', borderRadius: '50%' },
    saveChangesButton: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', padding: '15px 30px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 5px 20px rgba(22, 163, 74, 0.4)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideUp 0.3s ease-out' },
    loader: { textAlign: 'center', padding: '50px' }
  };

  if (authLoading || !user) return <div style={styles.loader}>Loading Your Profile...</div>;
  if (error) return <div style={styles.loader}>Failed to load profile. Please <Link href="/auth/login">log in</Link> again.</div>;

  return (
    <>
      <style>{`@keyframes slideUp { from { transform: translate(-50%, 100px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`}</style>
      {isImageViewerOpen && profilePicPreview && <ImageViewerModal imageUrl={profilePicPreview} onClose={() => setImageViewerOpen(false)} />}
      <div style={styles.container}>
        <div style={styles.card}>
          <header style={styles.profileHeader}>
            <div style={styles.profilePicContainer}>
              {/* FIX for empty src warning: only render if profilePicPreview is not null */}
              {profilePicPreview && <img src={profilePicPreview} alt="Profile" style={styles.profilePic} onClick={() => setImageViewerOpen(true)} />}
              <div style={styles.picOverlay} onClick={() => fileInputRef.current?.click()}><FaCamera /></div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            </div>
            <h1 style={styles.userName}>{user.full_name}</h1>
            <p style={styles.userRole}>{user.role}</p>
          </header>
          <div style={styles.detailsBody}>
            {/* Full Name */}
            <div style={styles.detailItem}>
              <FaUser style={styles.detailIcon} />
              <div style={styles.detailContent}>
                <p style={styles.detailLabel}>Full Name</p>
                {editingField === 'fullName' ? <input style={styles.input} value={editState.fullName} onChange={(e) => setEditState({...editState, fullName: e.target.value})} autoFocus /> : <p style={styles.detailValue}>{user.full_name}</p>}
              </div>
              <div style={styles.actionButtons}>{editingField === 'fullName' ? <button style={styles.editButton} onClick={cancelEdit}><FaTimes /></button> : <button style={styles.editButton} onClick={() => setEditingField('fullName')}><FaPen /></button>}</div>
            </div>
            {/* Brand Name */}
            <div style={styles.detailItem}>
              <FaStore style={styles.detailIcon} />
              <div style={styles.detailContent}>
                <p style={styles.detailLabel}>Brand Name</p>
                {editingField === 'brandName' ? <input style={styles.input} value={editState.brandName} placeholder="e.g., Aoun's Store" onChange={(e) => setEditState({...editState, brandName: e.target.value})} autoFocus /> : <p style={styles.detailValue}>{user.brand_name || 'Not Set'}</p>}
              </div>
              <div style={styles.actionButtons}>{editingField === 'brandName' ? <button style={styles.editButton} onClick={cancelEdit}><FaTimes /></button> : <button style={styles.editButton} onClick={() => setEditingField('brandName')}><FaPen /></button>}</div>
            </div>
            {/* Phone */}
            <div style={styles.detailItem}>
              <FaPhone style={styles.detailIcon} />
              <div style={styles.detailContent}>
                <p style={styles.detailLabel}>Phone</p>
                {editingField === 'phone' ? <input style={styles.input} value={editState.phone} onChange={(e) => setEditState({...editState, phone: e.target.value})} autoFocus /> : <p style={styles.detailValue}>{user.phone}</p>}
              </div>
              <div style={styles.actionButtons}>{editingField === 'phone' ? <button style={styles.editButton} onClick={cancelEdit}><FaTimes /></button> : <button style={styles.editButton} onClick={() => setEditingField('phone')}><FaPen /></button>}</div>
            </div>
            {/* Email */}
            <div style={{...styles.detailItem, borderBottom: 'none'}}>
              <FaEnvelope style={styles.detailIcon} /><div style={styles.detailContent}><p style={styles.detailLabel}>Email</p><p style={styles.detailValue}>{user.email} (Cannot be changed)</p></div>
            </div>
          </div>
        </div>
        {hasChanges && <button style={styles.saveChangesButton} onClick={handleSaveChanges} disabled={loading}>{loading ? <FaSpinner className="animate-spin" /> : 'Save Changes'}</button>}
      </div>
    </>
  );
}