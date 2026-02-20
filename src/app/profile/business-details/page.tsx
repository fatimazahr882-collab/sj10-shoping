"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuth } from '@/components/AuthProvider';
import apiClient from '@/lib/apiClient';
import ImageViewerModal from '@/components/ImageViewerModal';
import { 
  FaUser, FaStore, FaPhone, FaEnvelope, FaCamera, 
  FaPen, FaSpinner, FaTimes, FaCheck, FaChevronLeft, FaSave 
} from 'react-icons/fa';
import loading from '@/app/category/loading';

const fetcher = (url: string) => apiClient(url, 'GET');

export default function BusinessDetailsPage() {
  const { user: initialUser, isLoading: authLoading } = useAuth();
  const { data: user, error, mutate } = useSWR(initialUser ? 'user/profile' : null, fetcher, { fallbackData: initialUser });

  // --- State (FIXED: Added missing variable names) ---
  const [editState, setEditState] = useState({ fullName: '', brandName: '', phone: '' });
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false); // Tracks broken images
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIXED: Added missing dependency array
  useEffect(() => {
    if (user) {
      setEditState({
        fullName: user.full_name || '',
        brandName: user.brand_name || '',
        phone: user.phone || ''
      });
      // Reset image error state when user data is re-fetched
      setImageError(false);
    }
  }, [user]);

  // Auto-hide toast (FIXED: Added missing dependency array)
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const hasChanges = user ?
    (user.full_name !== editState.fullName) ||
    (user.brand_name !== editState.brandName) ||
    (user.phone !== editState.phone) ||
    !!profilePicFile
    : false;

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // FIXED: Syntax error in file selection
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
      setImageError(false); // Reset error if user uploads a new image
      setEditingField(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setLoading(true);
    let finalData: any = {};
    let newImageUrl = user.profile_pic;

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
      setToast({ msg: "Saved successfully!", type: 'success' });
    } catch (err) {
      setToast({ msg: "Could not save changes.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Determine which image to show
  const currentImageSrc = profilePicPreview || (user ? user.profile_pic : null);
  const showFallback = !currentImageSrc || imageError;

  // --- CSS Styles ---
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
      --primary: #2563eb;
      --primary-dark: #1d4ed8;
      --bg-page: #f3f4f6;
      --bg-card: #ffffff;
      --text-main: #111827;
      --text-sub: #6b7280;
      --border: #e5e7eb;
    }

    * { box-sizing: border-box; }

    .container {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      background-color: var(--bg-page);
      display: flex;
      justify-content: center;
      padding: 24px;
      padding-bottom: 140px; 
    }

    .card {
      background: var(--bg-card);
      width: 100%;
      max-width: 600px;
      border-radius: 20px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid var(--border);
      height: fit-content;
    }

    /* Animated Gradient Banner */
    .banner {
      height: 160px;
      background: linear-gradient(-45deg, #2563eb, #8b5cf6, #3b82f6, #06b6d4);
      background-size: 400% 400%;
      animation: gradientBG 10s ease infinite;
      position: relative;
    }

    @keyframes gradientBG {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .back-link {
      position: absolute;
      top: 20px;
      left: 20px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.2rem;
      transition: color 0.2s, transform 0.2s;
      background: rgba(0,0,0,0.2);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      backdrop-filter: blur(4px);
    }
    .back-link:hover { color: #fff; transform: scale(1.05); }

    /* Profile Section Overlapping */
    .profile-section {
      text-align: center;
      margin-top: -60px;
      position: relative;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .avatar-container {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto 16px;
      z-index: 10;
    }

    .avatar-img, .avatar-fallback {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 5px solid var(--bg-card);
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      cursor: pointer;
      background: #fff;
    }

    .avatar-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      color: var(--primary);
      font-size: 3rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .camera-icon {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: var(--primary);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--bg-card);
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .camera-icon:hover { transform: scale(1.1); background: var(--primary-dark); }
    .camera-icon:active { transform: scale(0.95); }

    .user-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin: 0; letter-spacing: -0.02em; }
    .user-subtitle { font-size: 0.95rem; color: var(--text-sub); margin-top: 4px; text-transform: capitalize; font-weight: 500;}

    /* Form List */
    .form-list {
      padding: 10px 24px 24px;
    }

    .form-item {
      display: flex;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid var(--border);
      transition: background 0.3s;
    }
    .form-item:last-child { border-bottom: none; }

    .icon-wrapper {
      width: 44px;
      height: 44px;
      background: #eff6ff;
      color: var(--primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      margin-right: 18px;
      flex-shrink: 0;
    }

    .content-wrapper { flex: 1; overflow: hidden; }

    .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-sub);
      font-weight: 600;
      margin-bottom: 6px;
    }

    .value {
      font-size: 1.05rem;
      font-weight: 500;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .input-edit {
      width: 100%;
      padding: 10px 14px;
      border: 2px solid var(--primary);
      border-radius: 8px;
      font-size: 1rem;
      color: var(--text-main);
      outline: none;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
      transition: all 0.2s;
    }

    .edit-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-sub);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-left: 12px;
      transition: all 0.2s;
    }
    .edit-btn:hover { border-color: var(--primary); color: var(--primary); background: #eff6ff; transform: translateY(-2px); }

    /* Floating Save Bar */
    .floating-footer {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 48px);
      max-width: 500px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      padding: 16px;
      border-radius: 100px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.6);
      z-index: 99999;
      display: flex;
      justify-content: center;
      animation: slideUpBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    .save-btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 50px;
      font-size: 1.05rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .save-btn:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4); }
    .save-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }

    /* Toast */
    .toast {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 14px 28px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 999999;
      animation: fadeInDown 0.4s ease-out;
      font-weight: 500;
    }
    .toast.success { background: #059669; }
    .toast.error { background: #dc2626; }

    @keyframes slideUpBounce { 
      from { transform: translate(-50%, 150%); opacity: 0; } 
      to { transform: translate(-50%, 0); opacity: 1; } 
    }
    @keyframes fadeInDown { 
      from { opacity: 0; transform: translate(-50%, -20px); } 
      to { opacity: 1; transform: translate(-50%, 0); } 
    }
    
    /* Mobile Responsive Tweaks */
    @media (max-width: 640px) {
      .container { padding: 0; padding-bottom: 120px; background: white; }
      .card { box-shadow: none; border: none; border-radius: 0; max-width: 100%; }
      .banner { border-radius: 0; height: 140px; }
      .floating-footer { bottom: 16px; width: calc(100% - 32px); padding: 12px; }
      .save-btn { font-size: 1rem; padding: 14px; }
      .form-list { padding: 0 20px; }
    }
  `;

  if (authLoading || !user) {
    return (
      <div className="container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <style>{css}</style>
        <FaSpinner className="animate-spin" style={{ fontSize: '2.5rem', color: '#2563eb' }} />
      </div>
    );
  }

  return (
    <div className="container">
      <style>{css}</style>

      {/* Image Modal */}
      {isImageViewerOpen && !showFallback && currentImageSrc && (
        <ImageViewerModal imageUrl={currentImageSrc as string} onClose={() => setImageViewerOpen(false)} />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <FaCheck /> : <FaTimes />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="card">
        {/* Animated Banner Header */}
        <div className="banner">
          <Link href="/profile" className="back-link"><FaChevronLeft /></Link>
        </div>

        {/* Profile Details Overlapping Header */}
        <div className="profile-section">
          <div className="avatar-container">
            {showFallback ? (
              <div 
                className="avatar-fallback" 
                title="Profile Picture"
              >
                {user.full_name ? user.full_name.charAt(0) : 'U'}
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
              <FaCamera size={16} />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png, image/jpeg, image/webp" 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
          
          <h1 className="user-title">{user.full_name}</h1>
          <p className="user-subtitle">{user.role}</p>
        </div>

        {/* Content */}
        <div className="form-list">
          
          {/* Full Name */}
          <div className="form-item">
            <div className="icon-wrapper"><FaUser /></div>
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
                <div className="value">{user.full_name}</div>
              )}
            </div>
            <button className="edit-btn" onClick={() => editingField === 'fullName' ? setEditingField(null) : setEditingField('fullName')}>
              {editingField === 'fullName' ? <FaTimes /> : <FaPen size={14} />}
            </button>
          </div>

          {/* Brand Name */}
          <div className="form-item">
            <div className="icon-wrapper"><FaStore /></div>
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
                <div className="value">{user.brand_name || 'Not Set'}</div>
              )}
            </div>
            <button className="edit-btn" onClick={() => editingField === 'brandName' ? setEditingField(null) : setEditingField('brandName')}>
              {editingField === 'brandName' ? <FaTimes /> : <FaPen size={14} />}
            </button>
          </div>

          {/* Phone */}
          <div className="form-item">
            <div className="icon-wrapper"><FaPhone /></div>
            <div className="content-wrapper">
              <div className="label">Phone Number</div>
              {editingField === 'phone' ? (
                <input 
                  className="input-edit"
                  value={editState.phone}
                  onChange={(e) => setEditState({...editState, phone: e.target.value})}
                  autoFocus
                />
              ) : (
                <div className="value">{user.phone || 'Not Set'}</div>
              )}
            </div>
            <button className="edit-btn" onClick={() => editingField === 'phone' ? setEditingField(null) : setEditingField('phone')}>
              {editingField === 'phone' ? <FaTimes /> : <FaPen size={14} />}
            </button>
          </div>

          {/* Email (Read Only) */}
          <div className="form-item">
            <div className="icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><FaEnvelope /></div>
            <div className="content-wrapper">
              <div className="label">Email Address</div>
              <div className="value" style={{ color: '#6b7280' }}>{user.email}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>Cannot be changed</div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      {hasChanges && (
        <div className="floating-footer">
          <button className="save-btn" onClick={handleSaveChanges} disabled={loading}>
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}