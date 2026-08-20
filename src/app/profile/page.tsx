"use client";

import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useState } from 'react';
import apiClient from '@/lib/apiClient';
import DashboardStats from '@/components/DashboardStats';
import SpinWheel from '@/components/SpinWheel'; // 🟢 Yeh import add karein

// --- TYPES ---
type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

type OnboardingFormProps = {
  user: UserProfile;
  onComplete: () => void;
};

// --- ONBOARDING COMPONENT ---
function OnboardingFormComponent({ user, onComplete }: OnboardingFormProps) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Please fill out all required fields.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await apiClient('user/profile', 'PUT', { phone }); 
      onComplete();
    } catch (updateError: any) {
      setError(`Error saving profile: ${updateError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h3>Complete Your Profile</h3>
          <p>Welcome, {user.full_name || user.email}! Just a few more details to get started.</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="phone">Phone (e.g., 03001234567)</label>
            <input 
               id="phone" 
               type="tel" 
               value={phone} 
               onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
               maxLength={11}
               required 
            />
          </div>
          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Complete Signup'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- SHARED COMPONENT: Help, Policies & Blogs ---
const HelpAndSupportSection = () => (
  <div className="help-support-section">
    <h4>Help, Policies & Guides</h4>
    
    <Link href="/about-us" className="profile-option-item slide-in-left" style={{ animationDelay: '0.1s' }}>
      <i className="fas fa-info-circle" style={{color: '#3b82f6'}}></i>
      <span>About Us</span>
      <i className="fas fa-chevron-right chevron"></i>
    </Link>

    <Link href="/shipping-policy" className="profile-option-item slide-in-right" style={{ animationDelay: '0.2s' }}>
      <i className="fas fa-truck-fast" style={{color: '#f59e0b'}}></i>
      <span>Shipping Policy</span>
      <i className="fas fa-chevron-right chevron"></i>
    </Link>

    <Link href="/return-policy" className="profile-option-item slide-in-left" style={{ animationDelay: '0.3s' }}>
      <i className="fas fa-undo" style={{color: '#ef4444'}}></i>
      <span>Return Policy</span>
      <i className="fas fa-chevron-right chevron"></i>
    </Link>
    
    <Link href="/terms" className="profile-option-item slide-in-right" style={{ animationDelay: '0.4s' }}>
      <i className="fas fa-file-contract" style={{color: '#6b7280'}}></i>
      <span>Terms & Conditions</span>
      <i className="fas fa-chevron-right chevron"></i>
    </Link>
    
    <Link href="/privacy" className="profile-option-item slide-in-left" style={{ animationDelay: '0.5s' }}>
      <i className="fas fa-user-shield" style={{color: '#10b981'}}></i>
      <span>Privacy Policy</span>
      <i className="fas fa-chevron-right chevron"></i>
    </Link>

    <Link href="/profile/blog" className="profile-option-item blog-highlight slide-in-right" style={{ animationDelay: '0.6s' }}>
      <i className="fas fa-newspaper" style={{color: '#8b5cf6'}}></i>
      <span>SJ10 Earning Guides & Blogs</span>
      <div className="new-badge-small">NEW</div>
      <i className="fas fa-chevron-right chevron"></i>
    </Link>
  </div>
);

// --- SHARED COMPONENT: Social Media Icons ---
// FIX: Reduced size and added strict styling
const SocialMediaLinks = () => (
  <div className="social-media-links mt-5">
    <h4>Follow us on Social Media</h4>
    <div className="social-icons-container">
      <a href="https://whatsapp.com/channel/0029Vb6PEhOLNSa6Z6OtPS1U" target="_blank" rel="noreferrer" className="social-icon whatsapp">
        <i className="fab fa-whatsapp"></i>
      </a>
      <a href="https://www.instagram.com/aounstore.shop?igsh=OTd4MTRsYjVxeTF2" target="_blank" rel="noreferrer" className="social-icon instagram">
        <i className="fab fa-instagram"></i>
      </a>
      <a href="https://www.tiktok.com/@aounstoreshop?_t=ZN-90EtZulBTaI&_r=1" target="_blank" rel="noreferrer" className="social-icon tiktok">
        <i className="fab fa-tiktok"></i>
      </a>
      <a href="https://www.youtube.com/@aounstore" target="_blank" rel="noreferrer" className="social-icon youtube">
        <i className="fab fa-youtube"></i>
      </a>
    </div>
  </div>
);

// --- MAIN PROFILE PAGE COMPONENT ---
export default function ProfilePage() {
  const { user, isLoading, signOut } = useAuth();

  const refreshProfile = () => {
    window.location.reload();
  };

  // --- GLOBAL CSS INJECTION ---
  const GlobalProfileStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
      .profile-wrapper { background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
      
      /* Safe padding bottom to prevent overlap with bottom navigation */
      .pb-safe { padding-bottom: 120px !important; }
      
      /* FIX: Ensure Header scrolls up with the page */
      .profile-header-normal { 
        position: relative !important; 
        background: #fff; padding: 15px 20px; 
        border-bottom: 1px solid #e2e8f0; 
      }
      .profile-header-normal .header-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }

      /* Logged Out Hero */
      .logged-out-hero { background: white; padding: 30px 20px; border-radius: 16px; text-align: center; margin: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
      .icon-circle { width: 60px; height: 60px; background: #eff6ff; color: #3b82f6; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 26px; margin: 0 auto 15px; }
      .logged-out-hero h2 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 10px; }
      .logged-out-hero p { font-size: 13px; color: #64748b; margin: 0 0 20px; line-height: 1.6; }
      
      /* Login Button Loop Animation */
      .animated-login-btn { 
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: linear-gradient(135deg, #f85606 0%, #ff8a00 100%);
        color: white; padding: 14px 30px; border-radius: 50px; font-weight: 700; font-size: 15px;
        text-decoration: none; width: 100%; max-width: 250px; margin: 0 auto;
        box-shadow: 0 4px 15px rgba(248, 86, 6, 0.3);
        animation: pulse-glow 2s infinite; 
        transition: transform 0.2s;
      }
      .animated-login-btn:active { transform: scale(0.95); }
      
      @keyframes pulse-glow {
        0% { box-shadow: 0 0 0 0 rgba(248, 86, 6, 0.5); transform: scale(1); }
        50% { box-shadow: 0 0 0 8px rgba(248, 86, 6, 0); transform: scale(1.02); }
        100% { box-shadow: 0 0 0 0 rgba(248, 86, 6, 0); transform: scale(1); }
      }

      /* Profile Options (Policies & Links) */
      .profile-options-list, .help-support-section { padding: 0 15px; margin-top: 20px; }
      .profile-options-list h4, .help-support-section h4 { font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 12px; padding-left: 5px; }
      
      .profile-option-item {
          display: flex; align-items: center; padding: 15px; background-color: #fff;
          border-radius: 12px; margin-bottom: 10px; text-decoration: none; color: #334155;
          font-weight: 600; font-size: 13px; transition: all 0.2s; border: 1px solid #f1f5f9;
          box-shadow: 0 2px 4px rgba(0,0,0,0.01);
          opacity: 0; animation-fill-mode: forwards;
      }
      .profile-option-item:hover { background-color: #f8fafc; border-color: #e2e8f0; transform: translateX(5px); }
      .profile-option-item i:first-child { font-size: 16px; width: 25px; text-align: center; margin-right: 12px; }
      .profile-option-item .chevron { margin-left: auto; color: #94a3b8; font-size: 12px; }
      
      /* Highlighted Blog Link */
      .blog-highlight { border-color: #c4b5fd; background: #faf5ff; }
      .blog-highlight:hover { background: #f3e8ff; border-color: #a855f7; }
      .new-badge-small { background: #ef4444; color: white; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 10px; margin-left: auto; margin-right: 10px; animation: pop 1s infinite alternate; }
      @keyframes pop { from { transform: scale(1); } to { transform: scale(1.1); } }

      /* Slide Animations */
      .slide-in-left { animation-name: slideInLeft; animation-duration: 0.4s; animation-timing-function: ease-out; }
      .slide-in-right { animation-name: slideInRight; animation-duration: 0.4s; animation-timing-function: ease-out; }
      @keyframes slideInLeft { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

      /* Logout Button - Animated & Clean */
      .logout-btn-container { padding: 15px; margin-top: 10px; }
      .accurate-logout-btn {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        background-color: white; color: #ef4444; border: 2px solid #fee2e2;
        padding: 14px; border-radius: 12px; width: 100%; cursor: pointer;
        font-size: 14px; font-weight: 700; transition: all 0.2s;
      }
      .accurate-logout-btn:hover { background-color: #fef2f2; border-color: #fca5a5; transform: translateY(-2px); }
      .accurate-logout-btn:active { transform: scale(0.97); }

      /* Social Media Icons FIX: Reduced size and colors preserved */
      .social-media-links { padding: 0 15px; text-align: center; margin-top: 20px; }
      .social-media-links h4 { font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 12px; }
      .social-icons-container { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
      
      .social-icon {
        width: 40px; height: 40px; border-radius: 50%;
        display: flex; justify-content: center; align-items: center;
        color: white; font-size: 20px; text-decoration: none;
        transition: transform 0.3s ease;
      }
      .social-icon:hover { transform: translateY(-3px) scale(1.1); }
      
      .social-icon.whatsapp { background-color: #25D366; box-shadow: 0 4px 8px rgba(37, 211, 102, 0.3); }
      .social-icon.instagram { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); box-shadow: 0 4px 8px rgba(220, 39, 67, 0.3); }
      .social-icon.tiktok { background-color: #000000; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); }
      .social-icon.youtube { background-color: #FF0000; box-shadow: 0 4px 8px rgba(255, 0, 0, 0.3); }

      /* Loading */
      .loading-state { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; gap: 15px; font-weight: 500; }
      
      /* Onboarding */
      .onboarding-container { max-width: 500px; margin: 30px auto; padding: 25px; background: white; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
      .onboarding-header { text-align: center; margin-bottom: 20px; }
      .onboarding-header h3 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 10px; }
      .form-group label { display: block; font-weight: 600; font-size: 13px; margin-bottom: 8px; color: #334155; }
      .form-group input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; transition: 0.3s; background: #f8fafc; margin-bottom: 20px; }
      .form-group input:focus { border-color: #3b82f6; background: white; }
      .submit-button { width: 100%; padding: 14px; background: #0f172a; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s; }
      .submit-button:active { transform: scale(0.98); }
      .error-message { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 500; margin-bottom: 15px; border: 1px solid #fecaca; }
    `}} />
  );

  // --- STATE 1: LOADING ---
  if (isLoading) {
    return (
      <div className="profile-wrapper">
        <GlobalProfileStyles />
        <header className="profile-header-normal"><h3 className="header-title">My Account</h3></header>
        <div className="loading-state">
           <i className="fas fa-circle-notch fa-spin fa-2x text-blue-600"></i>
           <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // --- STATE 2: LOGGED OUT ---
  if (!user) {
    return (
      <div className="profile-wrapper">
        <GlobalProfileStyles />
        <header className="profile-header-normal"><h3 className="header-title">My Account</h3></header>
        <div className="page-content pb-safe">
          
          <div className="logged-out-hero">
            <div className="icon-circle">
              <i className="fas fa-user-lock"></i>
            </div>
            <h2>Welcome to SJ10!</h2>
            <p>Log in to track your orders, manage your profit account, and start your reselling business.</p>
            
            <Link href="/auth?view=login" className="animated-login-btn">
              <i className="fas fa-sign-in-alt"></i> Login / Sign Up
            </Link>
          </div>

          <HelpAndSupportSection />
          <SocialMediaLinks />
        </div>
      </div>
    );
  }

  // --- STATE 3: LOGGED IN, BUT NO PHONE NUMBER ---
  if (user && !user.phone) {
    return (
      <div className="profile-wrapper">
        <GlobalProfileStyles />
        <header className="profile-header-normal"><h3 className="header-title">Complete Your Account</h3></header>
        <OnboardingFormComponent user={user} onComplete={refreshProfile} />
      </div>
    );
  }

  // --- STATE 4: FULLY LOGGED IN (DASHBOARD) ---
  return (
    <div className="profile-wrapper">
      <GlobalProfileStyles />
      <header className="profile-header-normal"><h3 className="header-title">My Account</h3></header>
      
      <div id="user-view" className="page-content pb-safe">
        
        <DashboardStats />
          <SpinWheel /> {/* 🟢 Yahan Banner place kar dein */}
        
        <div className="profile-options-list">
          <h4>Account Management</h4>
          {/* Isko Profile Options List mein add karein */}
          <Link href="/profile/rewards" className="profile-option-item slide-in-left" style={{ animationDelay: '0.25s', border: '1px solid #fed7aa', background: '#fff7ed' }}>
            <i className="fas fa-gift text-orange-500"></i>
            <span style={{ color: '#ea580c', fontWeight: 800 }}>My Rewards & Coupons</span>
            <div className="new-badge-small" style={{ background: '#ea580c' }}>WIN</div>
            <i className="fas fa-chevron-right chevron" style={{ color: '#fdba74' }}></i>
          </Link>

          {/* 🟢 INVITE & EARN LINK IN PROFILE OPTIONS LIST */}
          <Link 
            href="/profile/referrals" 
            className="profile-option-item slide-in-left" 
            style={{ 
              animationDelay: '0.3s', 
              border: '1.5px solid #bfdbfe', 
              background: '#eff6ff' 
            }}
          >
            <i className="fas fa-users-line" style={{ color: '#2563eb' }}></i>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#1e3a8a', fontWeight: 800 }}>Invite & Earn</span>
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600 }}>Get Rs. 100 per friend (Rs. 50 x 2)</span>
            </div>
            <div className="new-badge-small" style={{ background: '#2563eb' }}>EARN</div>
            <i className="fas fa-chevron-right chevron" style={{ color: '#93c5fd' }}></i>
          </Link>
          <Link href="/profile/business-details" className="profile-option-item slide-in-left" style={{ animationDelay: '0.1s' }}>
            <i className="fas fa-store text-blue-500"></i>
            <span>Business Details</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
          
          <Link href="/profile/my-earnings" className="profile-option-item slide-in-right" style={{ animationDelay: '0.2s' }}>
            <i className="fas fa-coins" style={{color: '#FF7F00'}}></i>
            <span>My Earnings</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
          
          <Link href="/profile/profit-account" className="profile-option-item slide-in-left" style={{ animationDelay: '0.3s' }}>
            <i className="fas fa-wallet text-emerald-500"></i>
            <span>Profit Account</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
          
          <Link href="/chats" className="profile-option-item slide-in-right" style={{ animationDelay: '0.4s' }}>
            <i className="fas fa-comments text-purple-500"></i>
            <span>Supplier Chats</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>

          <Link href="/favorites" className="profile-option-item slide-in-left" style={{ animationDelay: '0.5s' }}>
            <i className="fas fa-heart" style={{color: '#ef4444'}}></i>
            <span>My Favorites</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
          
          <Link href="/profile/followed-shops" className="profile-option-item slide-in-right" style={{ animationDelay: '0.6s' }}>
            <i className="fas fa-store-alt" style={{color: '#9333ea'}}></i>
            <span>Followed Shops</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
        </div>

        <HelpAndSupportSection />
        <SocialMediaLinks />

        <div className="logout-btn-container">
          <button onClick={signOut} className="accurate-logout-btn">
            <i className="fas fa-sign-out-alt"></i> Secure Logout
          </button>
        </div>

      </div>
    </div>
  );
}