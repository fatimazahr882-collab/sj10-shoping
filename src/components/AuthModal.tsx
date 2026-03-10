// src/components/AuthModal.tsx
"use client";

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthProvider';
import SuccessPopup from './SuccessPopup';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { login } = useAuth();
  
  // All hooks are now correctly at the top, before any return statements
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const getAuthUrl = () => (process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004').replace(/\/$/, '').replace(/\/api$/, '');

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
        setLoginSuccess(true);
      } catch (err: any) { setError("Google Login Failed."); } 
      finally { setLoading(false); }
    },
    onError: () => setError("Google Login error. Please try again.")
  });
  
  // This is the correct place for the early return
  if (!isOpen && !loginSuccess) return null;

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
      
      if (!isLoginView) {
        const loginRes = await fetch(`${getAuthUrl()}/auth/user/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error("Signup successful, but auto-login failed.");
        await login(loginData.token);
      } else {
        await login(data.token);
      }
      setLoginSuccess(true);
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <>
      {loginSuccess && <SuccessPopup message="Login Successful!" onClose={onClose} />}
      <div className="modal-overlay" onClick={onClose}>
        <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}><i className="fas fa-times"></i></button>
          
          <h2 className="title">{isLoginView ? 'Welcome to SJ10' : 'Create an Account'}</h2>
          <p className="subtitle">{isLoginView ? 'Login with your email & password' : 'Join Pakistan\'s #1 Marketplace'}</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLoginView && (
              <>
                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                <input type="tel" placeholder="Phone Number (e.g. 03001234567)" value={phone} onChange={e => setPhone(e.target.value)} required />
              </>
            )}
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="password-wrapper">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} eye-icon`} onClick={() => setShowPassword(!showPassword)}></i>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Please wait...' : (isLoginView ? 'LOGIN' : 'CREATE ACCOUNT')}
            </button>
          </form>

          <div className="divider"><span>OR</span></div>

          <button type="button" className="google-btn" onClick={() => handleGoogleClick()} disabled={loading}>
            <i className="fab fa-google"></i> Continue with Google
          </button>

          <p className="toggle-text">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLoginView(!isLoginView); setError(''); }}>
              {isLoginView ? "Sign Up" : "Login"}
            </span>
          </p>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
        .auth-modal-content { background: white; padding: 35px; border-radius: 12px; width: 90%; max-width: 380px; position: relative; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .close-button { position: absolute; top: 12px; right: 15px; background: none; border: none; font-size: 18px; cursor: pointer; color: #9ca3af; }
        .title { font-size: 24px; font-weight: 800; color: #1f2937; margin-bottom: 5px; text-align: center; }
        .subtitle { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 25px; }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .auth-form input {
          width: 100%; padding: 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: 0.2s;
          box-sizing: border-box; /* This is the fix for the input going outside */
        }
        .auth-form input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
        .password-wrapper { position: relative; }
        .password-wrapper input { padding-right: 40px; }
        .eye-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; cursor: pointer; }
        .primary-btn { width: 100%; background: #f97316; color: white; padding: 14px; border: none; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; }
        .divider { text-align: center; margin: 25px 0; border-bottom: 1px solid #e2e8f0; line-height: 0.1em; }
        .divider span { background: #fff; padding: 0 10px; color: #9ca3af; font-size: 12px; }
        .google-btn { 
            width: 100%; background: white; border: 1px solid #d1d5db; padding: 12px; border-radius: 8px;
            font-weight: 600; color: #374151; display: flex; justify-content: center; align-items: center; 
            gap: 10px; cursor: pointer; transition: all 0.2s;
        }
        .google-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #4285F4; }
        .google-btn i { color: #DB4437; font-size: 18px; }
        .toggle-text { text-align: center; font-size: 14px; margin-top: 25px; color: #6b7280; }
        .toggle-text span { color: #f97316; font-weight: 600; cursor: pointer; }
        .error-box { background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 15px; text-align: center; }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </>
  );
}