// src/app/profile/page.tsx
"use client";

import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useState } from 'react';
import apiClient from '@/lib/apiClient';
import DashboardStats from '@/components/DashboardStats';

// Define the User type to match what our useAuth hook provides
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
      await apiClient('api/user/profile', 'PUT', { phone });
      onComplete();
    } catch (updateError: any) {
      setError(`Error saving profile: ${updateError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .onboarding-container {
                    max-width: 550px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    animation: fadeIn 0.5s ease-out forwards;
                }
                .onboarding-header h3 {
                    font-size: 1.5rem;
                    color: #1a202c;
                    text-align: center;
                    margin-bottom: 0.5rem;
                }
                .onboarding-header p {
                    text-align: center;
                    color: #4a5568;
                    margin-bottom: 1.5rem;
                }
                .form-group {
                    margin-bottom: 1.25rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #2d3748;
                }
                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border: 1px solid #cbd5e0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #4299e1;
                    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
                }
                .error-message {
                    color: #e53e3e;
                    background-color: #fff5f5;
                    border: 1px solid #fc8181;
                    padding: 0.75rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    text-align: center;
                }
                .submit-button {
                    width: 100%;
                    padding: 0.9rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #fff;
                    background-color: #2c5282;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .submit-button:disabled {
                    background-color: #a0aec0;
                    cursor: not-allowed;
                }
                .submit-button:hover:not(:disabled) {
                    background-color: #1a365d;
                }
            `}</style>

      <div className="page-content">
        <div className="onboarding-container">
          <div className="onboarding-header">
            <h3>Complete Your Profile</h3>
            <p>Welcome, {user.full_name || user.email}! Just a few more details to get started.</p>
          </div>
          <form onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <label htmlFor="phone">Phone (e.g., 03123456789)</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required pattern="^03[0-9]{9}$" />
            </div>
            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? 'Saving...' : 'Complete Signup'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}


// --- MAIN PROFILE PAGE COMPONENT ---
export default function ProfilePage() {
  const { user, isLoading, signOut } = useAuth();

  const refreshProfile = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <>
        <header className="page-header"><h3 className="header-title">My Account</h3></header>
        <div className="page-content" style={{ padding: '20px', textAlign: 'center' }}><p>Loading your account...</p></div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <header className="page-header"><h3 className="header-title">My Account</h3></header>
        <div className="page-content" style={{ padding: '20px', textAlign: 'center' }}>
          <p>Please log in to see your profile.</p>
          <Link href="/auth">Go to Login</Link>
        </div>
      </>
    );
  }

  if (user && !user.phone) {
    return (
      <>
        <header className="page-header"><h3 className="header-title">Complete Your Account</h3></header>
        <OnboardingFormComponent user={user} onComplete={refreshProfile} />
      </>
    );
  }

  // --- MAIN PROFILE DASHBOARD UI ---
  return (
    <>
      <header className="page-header"><h3 className="header-title">My Account</h3></header>
      <div id="user-view" className="page-content" style={{ display: 'block' }}>
        <DashboardStats />
        
        <div className="profile-options-list">
          <h4>Account</h4>
          
          <Link href="/profile/business-details" className="profile-option-item">
            <i className="fas fa-store"></i>
            <span>Business Details</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
          
          <Link href="/profile/my-earnings" className="profile-option-item">
            <i className="fas fa-coins" style={{color: '#FF7F00'}}></i>
            <span>My Earnings</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
          
          <Link href="/profile/profit-account" className="profile-option-item">
            <i className="fas fa-wallet"></i>
            <span>Profit Account</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
          
          <Link href="/chats" className="profile-option-item">
            <i className="fas fa-comments"></i>
            <span>Supplier Chats</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>

          <Link href="/favorites" className="profile-option-item">
            <i className="fas fa-heart" style={{color: '#ff0000'}}></i>
            <span>My Favorites</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
          
          <Link href="/profile/followed-shops" className="profile-option-item">
            <i className="fas fa-store-alt" style={{color: '#9333ea'}}></i>
            <span>Followed Shops</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>

          {/* --- HELP & SUPPORT SECTION UPDATED --- */}
          <h4>Help & Support</h4>

          <Link href="/about-us" className="profile-option-item">
            <i className="fas fa-info-circle" style={{color: '#3b82f6'}}></i>
            <span>About Us</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>

          <Link href="/shipping-policy" className="profile-option-item">
            <i className="fas fa-truck-fast" style={{color: '#f59e0b'}}></i>
            <span>Shipping Policy</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>

          <Link href="/return-policy" className="profile-option-item">
            <i className="fas fa-undo" style={{color: '#ef4444'}}></i>
            <span>Return Policy</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
          
          <Link href="/terms" className="profile-option-item">
            <i className="fas fa-file-contract" style={{color: '#6b7280'}}></i>
            <span>Terms & Conditions</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
          
          <Link href="/privacy" className="profile-option-item">
            <i className="fas fa-user-shield" style={{color: '#10b981'}}></i>
            <span>Privacy Policy</span>
            <i className="fas fa-chevron-right chevron"></i>
          </Link>
        </div>

        <div className="social-media-links">
          <h4>Follow us on Social Media</h4>
          <div className="social-icons-container">
            <a href="https://whatsapp.com/channel/0029Vb6PEhOLNSa6Z6OtPS1U" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i></a>
            <a href="https://www.instagram.com/aounstore.shop?igsh=OTd4MTRsYjVxeTF2" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            <a href="https://www.tiktok.com/@aounstoreshop?_t=ZN-90EtZulBTaI&_r=1" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a>
            <a href="https://www.youtube.com/@aounstore" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        <button id="logout-button" onClick={signOut}>Logout</button>
      </div>
    </>
  );
}