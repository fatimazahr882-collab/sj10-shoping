// src/components/AuthModal.tsx
"use client";

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthProvider';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { login } = useAuth();
  
  // 1. ALL STATES MUST BE DECLARED FIRST
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const[loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthUrl = () => (process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004').replace(/\/$/, '').replace(/\/api$/, '');

  // 2. GOOGLE HOOK MUST BE CALLED HERE (Before any early returns)
  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setError('');
      try {
        const res = await fetch(`${getAuthUrl()}/auth/user/google`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        await login(data.token);
        onClose();
      } catch (err: any) { setError("Google Login Failed."); } 
      finally { setLoading(false); }
    },
  });

  // 3. EARLY RETURN GOES HERE (This fixes the React Hook Error!)
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const endpoint = isLoginView ? '/auth/user/login' : '/auth/user/register';
    const body = isLoginView 
      ? { email, password } 
      : { fullName, email, password, phone };

    try {
      const res = await fetch(`${getAuthUrl()}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');
      
      await login(data.token);
      onClose(); // Close modal on success
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}><i className="fas fa-times"></i></button>
        
        <h2>{isLoginView ? 'Welcome to SJ10' : 'Create SJ10 Account'}</h2>
        <p className="subtitle">{isLoginView ? 'Login to manage your orders' : 'Join Pakistan\'s #1 Marketplace'}</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLoginView && (
            <>
              <div className="input-group">
                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="input-group">
                <input type="tel" placeholder="Phone Number (e.g. 03001234567)" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </>
          )}

          <div className="input-group">
            <i className="fas fa-envelope input-icon"></i>
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <i className="fas fa-lock input-icon"></i>
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} eye-icon`} onClick={() => setShowPassword(!showPassword)}></i>
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Please wait...' : (isLoginView ? 'LOGIN' : 'SIGN UP')}
          </button>
        </form>

        <div className="divider"><span>OR</span></div>

        <button type="button" className="google-btn" onClick={() => handleGoogleClick()} disabled={loading}>
          <i className="fab fa-google text-red-500"></i> Continue with Google
        </button>

        <p className="toggle-text">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>

      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 100000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
        .auth-modal-content { background: white; padding: 30px; border-radius: 8px; width: 100%; max-width: 400px; position: relative; animation: popIn 0.2s ease-out; }
        .close-button { position: absolute; top: 10px; right: 15px; background: transparent; border: none; font-size: 18px; cursor: pointer; color: #999; }
        .close-button:hover { color: #333; }
        h2 { font-size: 20px; font-weight: 700; color: #212121; margin-bottom: 5px; text-align: left; }
        .subtitle { font-size: 12px; color: #757575; text-align: left; margin-bottom: 20px; }
        .input-group { position: relative; margin-bottom: 15px; }
        .input-group input { width: 100%; padding: 12px 14px 12px 40px; border: 1px solid #e0e0e0; border-radius: 2px; font-size: 14px; outline: none; }
        .input-group input:focus { border-color: #f85606; }
        .input-icon { position: absolute; left: 14px; top: 15px; color: #9e9e9e; font-size: 14px; }
        .eye-icon { position: absolute; right: 14px; top: 15px; color: #9e9e9e; cursor: pointer; }
        .primary-btn { width: 100%; background: #f85606; color: white; padding: 12px; border: none; border-radius: 2px; font-weight: bold; font-size: 14px; cursor: pointer; transition: 0.2s; }
        .primary-btn:hover { background: #d04604; }
        .divider { text-align: center; margin: 20px 0; border-bottom: 1px solid #e0e0e0; line-height: 0.1em; }
        .divider span { background: #fff; padding: 0 10px; color: #9e9e9e; font-size: 12px; }
        .google-btn { width: 100%; background: white; border: 1px solid #e0e0e0; padding: 10px; border-radius: 2px; font-weight: bold; color: #424242; display: flex; justify-content: center; align-items: center; gap: 10px; cursor: pointer; }
        .google-btn:hover { background: #f5f5f5; }
        .toggle-text { text-align: center; font-size: 12px; margin-top: 20px; color: #757575; }
        .toggle-text span { color: #f85606; font-weight: bold; cursor: pointer; }
        .error-box { background: #ffebee; color: #c62828; padding: 10px; border-radius: 2px; font-size: 13px; margin-bottom: 15px; text-align: left; border: 1px solid #ffcdd2; }
        @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}