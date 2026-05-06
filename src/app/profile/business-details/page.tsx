"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuth } from '@/components/AuthProvider';
import apiClient from '@/lib/apiClient';
import ImageViewerModal from '@/components/ImageViewerModal';

// --- LIGHTWEIGHT SVG ICONS ---
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const StoreIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const PhoneIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MailIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const MapPinIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const CameraIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const PenIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const TimesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevronLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;

// Fetcher for SWR
const fetcher = (url: string) => apiClient(url, 'GET');

// --- INSTANT SKELETON LOADER UI ---
const SkeletonLoader = () => (
  <div className="page-wrapper">
    <div className="card" style={{ padding: '0 0 24px 0' }}>
      <div className="shimmer" style={{ width: '100%', height: '160px', borderRadius: '16px 16px 0 0' }}></div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        <div className="shimmer" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white' }}></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '15px 0 30px' }}>
         <div className="shimmer" style={{ width: '180px', height: '24px', borderRadius: '6px', marginBottom: '8px' }}></div>
         <div className="shimmer" style={{ width: '120px', height: '16px', borderRadius: '6px' }}></div>
      </div>
      <div style={{ padding: '0 24px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '25px', alignItems: 'center' }}>
            <div className="shimmer" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
              <div className="shimmer" style={{ width: '80px', height: '12px', marginBottom: '8px', borderRadius: '4px' }}></div>
              <div className="shimmer" style={{ width: '180px', height: '20px', borderRadius: '6px' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- GLOBAL CSS INJECTION COMPONENT ---
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    .page-wrapper { min-height: 100vh; background: #f8fafc; display: flex; justify-content: center; padding: 24px; padding-bottom: 120px; font-family: 'Poppins', sans-serif; }
    .card { background: white; width: 100%; max-width: 600px; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); overflow: hidden; height: fit-content; }
    
    .shimmer { background: #f1f5f9; background-image: linear-gradient(to right, #f1f5f9 0%, #e2e8f0 20%, #f1f5f9 40%, #f1f5f9 100%); background-repeat: no-repeat; background-size: 800px 100%; animation: shimmer 1.5s infinite linear forwards; }
    @keyframes shimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }

    .banner { height: 160px; background: linear-gradient(-45deg, #1e3a8a, #3b82f6, #0ea5e9, #1e3a8a); background-size: 400% 400%; animation: gradientBG 10s ease infinite; position: relative; }
    @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    
    .back-link { position: absolute; top: 20px; left: 20px; color: white; background: rgba(0,0,0,0.2); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); transition: 0.2s; }
    .back-link:hover { background: rgba(0,0,0,0.3); transform: scale(1.05); }

    .profile-section { text-align: center; margin-top: -60px; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9; }
    .avatar-container { position: relative; width: 120px; height: 120px; margin: 0 auto 16px; z-index: 10; }
    .avatar-img, .avatar-fallback { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); cursor: pointer; }
    .avatar-fallback { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #eff6ff, #bfdbfe); color: #2563eb; font-size: 40px; font-weight: 800; }
    
    .camera-icon { position: absolute; bottom: 0; right: 0; background: #2563eb; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .camera-icon:hover { transform: scale(1.1); background: #1d4ed8; }

    .user-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
    .user-subtitle { font-size: 14px; color: #64748b; margin-top: 4px; font-weight: 500; }

    .form-list { padding: 10px 24px 24px; }
    .form-item { display: flex; align-items: center; padding: 20px 0; border-bottom: 1px solid #f1f5f9; }
    .form-item:last-child { border-bottom: none; }
    
    .icon-wrapper { width: 44px; height: 44px; background: #eff6ff; color: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0; }
    .read-only-icon { background: #fef3c7; color: #d97706; }
    
    .content-wrapper { flex: 1; overflow: hidden; }
    .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 700; margin-bottom: 6px; }
    .value { font-size: 16px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .read-only-text { color: #4b5563; }
    .empty-text { color: #9ca3af; font-style: italic; font-weight: 500; }
    .hint-text { font-size: 0.75rem; color: #9ca3af; margin-top: 4px; font-weight: 500; }
    
    .input-edit { width: 100%; padding: 12px 14px; border: 2px solid #3b82f6; border-radius: 8px; font-size: 15px; font-weight: 500; color: #0f172a; outline: none; background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
    
    .edit-btn { background: transparent; border: 1px solid #e2e8f0; color: #64748b; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 12px; transition: 0.2s; flex-shrink: 0; }
    .edit-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }

    /* FLOATING ACTION BUTTON */
    .floating-footer { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); width: calc(100% - 48px); max-width: 500px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); padding: 12px; border-radius: 100px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.8); z-index: 99999; animation: slideUpBounce 0.4s ease-out forwards; }
    .save-btn { background: #2563eb; color: white; border: none; padding: 16px; border-radius: 50px; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; transition: 0.2s; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); }
    .save-btn:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
    .save-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }

    .toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); padding: 14px 24px; border-radius: 50px; display: flex; align-items: center; gap: 10px; font-weight: 600; color: white; z-index: 99999; animation: dropDown 0.3s ease-out; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
    .toast.success { background: #10b981; }
    .toast.error { background: #ef4444; }

    @keyframes slideUpBounce { from { transform: translate(-50%, 150%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
    @keyframes dropDown { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .slide-up { animation: slideUp 0.4s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 640px) {
      .page-wrapper { padding: 0; padding-bottom: 120px; background: white; }
      .card { border: none; border-radius: 0; box-shadow: none; }
      .floating-footer { bottom: 20px; width: calc(100% - 32px); padding: 10px; }
      .save-btn { padding: 14px; font-size: 15px; }
      .form-list { padding: 0 16px 24px; }
    }
  `}} />
);

export default function BusinessDetailsPage() {
  const { user: initialUser, isLoading: authLoading } = useAuth();
  
  const { data: user, error, mutate, isLoading: isSWRisLoading } = useSWR(
    initialUser ? 'user/profile' : null, 
    fetcher, 
    { fallbackData: initialUser, revalidateOnFocus: false }
  );

  // --- States ---
  const [editState, setEditState] = useState({ fullName: '', brandName: '', phone: '', address: '' });
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with fetched user data
  useEffect(() => {
    if (user) {
      setEditState({
        fullName: user.full_name || '',
        brandName: user.brand_name || '',
        phone: user.phone || '',
        address: user.address || '' // Ensure address is captured if available in DB
      });
      setImageError(false);
    }
  }, [user]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Check if any changes were made
  const hasChanges = user ? (
    (user.full_name !== editState.fullName) ||
    ((user.brand_name || '') !== editState.brandName) ||
    ((user.phone || '') !== editState.phone) ||
    ((user.address || '') !== editState.address) ||
    !!profilePicFile
  ) : false;

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
      setImageError(false);
      setEditingField(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!user || loading) return;
    setLoading(true);
    let finalData: any = {};
    let newImageUrl = user.profile_pic;

    try {
      // 1. Upload Image if changed
      if (profilePicFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', profilePicFile);
        const uploadRes = await apiClient('user/profile/avatar', 'POST', avatarFormData);
        newImageUrl = uploadRes.newImageUrl;
      }
      
      // 2. Prepare changed data (Exclude Address from Payload to prevent 400 Error)
      if (user.full_name !== editState.fullName) finalData.fullName = editState.fullName;
      if ((user.brand_name || '') !== editState.brandName) finalData.brandName = editState.brandName;
      if ((user.phone || '') !== editState.phone) finalData.phone = editState.phone;
      if (newImageUrl !== user.profile_pic) finalData.profilePic = newImageUrl;
      
      // 3. Save to backend (Only allowed fields)
      if (Object.keys(finalData).length > 0) {
        await apiClient('user/profile', 'PUT', finalData);
      }
      
      // Update UI
      await mutate();
      setProfilePicFile(null);
      setEditingField(null);
      setToast({ msg: "Saved successfully!", type: 'success' });
    } catch (err) {
      setToast({ msg: "Could not save changes. Try again.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const currentImageSrc = profilePicPreview || (user ? user.profile_pic : null);
  const showFallback = !currentImageSrc || imageError;

  // --- Show INSTANT Skeleton Loader ---
  if (authLoading || isSWRisLoading || (!user && !error)) {
    return (
      <>
        <GlobalStyles />
        <SkeletonLoader />
      </>
    );
  }

  return (
    <div className="page-wrapper">
      <GlobalStyles />
      
      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckIcon /> : <TimesIcon />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Image Zoom Modal */}
      {isImageViewerOpen && !showFallback && currentImageSrc && (
        <ImageViewerModal imageUrl={currentImageSrc as string} onClose={() => setImageViewerOpen(false)} />
      )}

      <div className="card slide-up">
        {/* Animated Gradient Banner */}
        <div className="banner">
          <Link href="/profile" className="back-link"><ChevronLeftIcon /></Link>
        </div>

        {/* Profile Avatar Section */}
        <div className="profile-section">
          <div className="avatar-container">
            {showFallback ? (
              <div className="avatar-fallback" title="Profile Picture">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
            ) : (
              <img 
                src={currentImageSrc as string} 
                alt="Avatar" 
                className="avatar-img"
                onError={() => setImageError(true)}
                onClick={() => setImageViewerOpen(true)}
              />
            )}
            
            <label className="camera-icon" title="Change Profile Picture">
              <CameraIcon />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png, image/jpeg, image/webp" 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
          <h1 className="user-title">{user?.full_name}</h1>
          <p className="user-subtitle">Business Account</p>
        </div>

        {/* Form Fields */}
        <div className="form-list">
          
          {/* Full Name */}
          <div className="form-item">
            <div className="icon-wrapper"><UserIcon /></div>
            <div className="content-wrapper">
              <div className="label">Full Name</div>
              {editingField === 'fullName' ? (
                <input 
                  className="input-edit"
                  value={editState.fullName}
                  onChange={(e) => setEditState({...editState, fullName: e.target.value})}
                  autoFocus
                />
              ) : (
                <div className="value">{user?.full_name}</div>
              )}
            </div>
            <button className="edit-btn" onClick={() => editingField === 'fullName' ? setEditingField(null) : setEditingField('fullName')}>
              {editingField === 'fullName' ? <TimesIcon /> : <PenIcon />}
            </button>
          </div>

          {/* Brand Name */}
          <div className="form-item">
            <div className="icon-wrapper"><StoreIcon /></div>
            <div className="content-wrapper">
              <div className="label">Brand Name</div>
              {editingField === 'brandName' ? (
                <input 
                  className="input-edit"
                  value={editState.brandName}
                  placeholder="e.g. My Shop"
                  onChange={(e) => setEditState({...editState, brandName: e.target.value})}
                  autoFocus
                />
              ) : (
                <div className="value">{user?.brand_name || <span className="empty-text">Not Set</span>}</div>
              )}
            </div>
            <button className="edit-btn" onClick={() => editingField === 'brandName' ? setEditingField(null) : setEditingField('brandName')}>
              {editingField === 'brandName' ? <TimesIcon /> : <PenIcon />}
            </button>
          </div>

          {/* Phone */}
          <div className="form-item">
            <div className="icon-wrapper"><PhoneIcon /></div>
            <div className="content-wrapper">
              <div className="label">Phone Number</div>
              {editingField === 'phone' ? (
                <input 
                  className="input-edit"
                  type="tel"
                  maxLength={11}
                  value={editState.phone}
                  onChange={(e) => setEditState({...editState, phone: e.target.value.replace(/\D/g, '')})}
                  autoFocus
                />
              ) : (
                <div className="value">{user?.phone || <span className="empty-text">Not Set</span>}</div>
              )}
            </div>
            <button className="edit-btn" onClick={() => editingField === 'phone' ? setEditingField(null) : setEditingField('phone')}>
              {editingField === 'phone' ? <TimesIcon /> : <PenIcon />}
            </button>
          </div>

          {/* Address */}
          <div className="form-item">
            <div className="icon-wrapper"><MapPinIcon /></div>
            <div className="content-wrapper">
              <div className="label">Store Address</div>
              {editingField === 'address' ? (
                <input 
                  className="input-edit"
                  type="text"
                  placeholder="Street, City"
                  value={editState.address}
                  onChange={(e) => setEditState({...editState, address: e.target.value})}
                  autoFocus
                />
              ) : (
                <div className="value">{editState.address || <span className="empty-text">Not Set</span>}</div>
              )}
            </div>
            <button className="edit-btn" onClick={() => editingField === 'address' ? setEditingField(null) : setEditingField('address')}>
              {editingField === 'address' ? <TimesIcon /> : <PenIcon />}
            </button>
          </div>

          {/* Email (Read Only) */}
          <div className="form-item">
            <div className="icon-wrapper read-only-icon"><MailIcon /></div>
            <div className="content-wrapper">
              <div className="label">Email Address</div>
              <div className="value read-only-text">{user?.email}</div>
              <div className="hint-text">Verified • Cannot be changed</div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Save Button - Fully visible on Mobile & Desktop */}
      {hasChanges && (
        <div className="floating-footer">
          <button className="save-btn" onClick={handleSaveChanges} disabled={loading}>
            {loading ? (
                <div style={{animation: 'spin 1s linear infinite', display: 'flex'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>
            ) : <CheckIcon />}
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      )}

    </div>
  );
}