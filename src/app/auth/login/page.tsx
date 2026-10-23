"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, 
  FaShoppingBag, FaShippingFast, FaShieldAlt, FaWhatsapp, 
  FaArrowLeft, FaTimes, FaSpinner, FaRocket
} from 'react-icons/fa';

// 🟢 COLORFUL GOOGLE ICON
const ColorfulGoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const TICKER_ITEMS = [
  { icon: "🛡️", text: "256-Bit Secure Encrypted Login" },
  { icon: "🚚", text: "Fast Nationwide Delivery on all Orders" },
  { icon: "⭐", text: "100% Verified Wholesale Identity" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  // Navigation Steps: 'login' | 'googlePhone' | 'verifyPhoneOtp'
  const [step, setStep] = useState<'login' | 'googlePhone' | 'verifyPhoneOtp'>('login');
  
  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verification Data
  const [googleData, setGoogleData] = useState<any>(null);
  const [targetPhone, setTargetPhone] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Modals & Celebrations
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [celebrationName, setCelebrationName] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  // 🟢 404 ERROR FIX: URL Helper to match your backend exactly!
  // Removed `/api` from the end so it correctly hits `/auth/user/...`
  const getAuthUrl = () => {
    let url = process.env.NEXT_PUBLIC_ORDER_API_URL || 'https://orders.sj10.pk/api';
    return url.replace(/\/api$/, '').replace(/\/$/, ''); 
  };

  // Live Security Ticker Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % TICKER_ITEMS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // 🟢 CELEBRATION HANDOFF (Instant Navigation without Lag!)
  const performInstantHandoff = async (token: string, userName?: string) => {
    setCelebrationName(userName || email.split('@')[0] || 'Partner');
    setShowCelebration(true);
    setTimeout(async () => {
      await login(token);
    }, 800);
  };

  // =========================================================================
  // 1. STANDARD EMAIL/PASSWORD LOGIN (WITH UNVERIFIED SHIELD)
  // =========================================================================
  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();

      // 🟢 ZERO-BYPASS SHIELD: Agar WhatsApp phone verify hona baki hai
      if (data.requiresVerification) {
        if (data.pendingStep === 'phone' || data.pendingStep === 'both') {
          setTargetPhone(data.phone || '');
          setEmail(data.email || email);
          setStep('verifyPhoneOtp');
          setLoading(false);
          return;
        }
      }

      if (!res.ok) throw new Error(data.message || "Invalid credentials.");

      await performInstantHandoff(data.token || data.accessToken, data.user?.full_name);

    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
      setLoading(false);
    }
  };

  // =========================================================================
  // 2. GOOGLE LOGIN HANDLER
  // =========================================================================
  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${getAuthUrl()}/auth/user/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token })
        });
        
        const data = await res.json();

        // Agar phone verification zaroori hai
        if (data.requiresPhone) {
          setGoogleData(data.googleData);
          setEmail(data.googleData.email);
          setStep('googlePhone');
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error(data.message);
        await performInstantHandoff(data.token || data.accessToken, data.user?.full_name);

      } catch (err: any) {
        setError(err.message || "Google Login Failed.");
        setLoading(false);
      }
    },
    onError: () => setError("Google Authentication Cancelled")
  });

  // Google Phone Submit (Dispatches WhatsApp Code)
  const handleGooglePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.substring(1);
    else if (!cleanPhone.startsWith('92')) cleanPhone = '92' + cleanPhone;

    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/google-complete-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...googleData, phone: cleanPhone })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Phone submission failed');

      setTargetPhone(cleanPhone);
      setStep('verifyPhoneOtp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 3. OTP VERIFICATION HANDLER
  // =========================================================================
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpValues];
    next[idx] = val;
    setOtpValues(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpValues.join('');
    if (code.length < 6) return setError("Please enter the complete 6-digit WhatsApp code.");

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, whatsappOtp: code, otp: code })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      await performInstantHandoff(data.token || data.accessToken);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* 🟢 THE FIX FOR FOUC: Using native HTML style tag for instant styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');
        body { margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; background: #FFFFFF; color: #0F172A; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        .login-wrapper { display: flex; min-height: 100vh; width: 100%; background: #ffffff; position: relative; }

        @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .float-1 { animation: floatSlow 3s ease-in-out infinite; }
        .float-2 { animation: floatSlow 3s ease-in-out infinite 0.7s; }
        .float-3 { animation: floatSlow 3s ease-in-out infinite 1.4s; }

        @keyframes rotateNeon { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .neon-google-border {
          position: relative; padding: 2px; border-radius: 14px; overflow: hidden; display: flex;
          align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .neon-google-border:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(66, 133, 244, 0.2); }
        .neon-google-border::before {
          content: ''; position: absolute; inset: -60%;
          background: conic-gradient(#4285F4, #34A853, #FBBC05, #EA4335, #4285F4);
          animation: rotateNeon 3s linear infinite;
        }
        .neon-google-inner {
          position: relative; width: 100%; background: #FFFFFF; border-radius: 12px; padding: 13px 18px;
          display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 800; font-size: 14px; color: #0F172A; z-index: 1;
        }

        .login-left-panel { display: none; }
        @media (min-width: 992px) {
          .login-wrapper { height: 100vh; overflow: hidden; }
          .login-left-panel {
            display: flex; flex-direction: column; justify-content: space-between;
            width: 44%; max-width: 580px;
            background: linear-gradient(135deg, #0A1E40 0%, #1E3A8A 50%, #2563EB 100%);
            color: white; padding: 45px; position: relative; z-index: 1;
          }
          .login-left-panel::after {
            content: ''; position: absolute; width: 450px; height: 450px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            top: -100px; left: -100px; border-radius: 50%; pointer-events: none;
          }
          .login-right-panel { height: 100vh; overflow-y: auto; }
        }

        .login-right-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 30px 20px; background: #FFFFFF; }
        .form-card { width: 100%; max-width: 460px; padding: 10px; }

        .input-group { margin-bottom: 18px; position: relative; text-align: left; }
        .input-label { display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px; }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 16px; color: #94A3B8; font-size: 16px; pointer-events: none; }
        .base-input {
          width: 100%; padding: 14px 16px 14px 44px; border-radius: 12px;
          border: 1.5px solid #E2E8F0; background: #F8FAFC; font-size: 14px;
          outline: none; font-weight: 600; color: #0F172A; transition: all 0.2s;
        }
        .base-input:focus { border-color: #2563EB; background: #FFFFFF; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
        
        .chip-email-helper {
          position: absolute; right: 10px; background: #E0F2FE; color: #0284C7;
          border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 800; cursor: pointer;
        }

        .submit-btn {
          width: 100%; padding: 14px; background: #0B192C; color: white;
          border: none; border-radius: 12px; font-size: 15px; font-weight: 800;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 14px rgba(11,25,44,0.2);
        }
        .submit-btn:hover:not(:disabled) { background: #1E293B; transform: translateY(-2px); }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .otp-row { display: flex; gap: 8px; justify-content: center; margin: 20px 0; }
        .otp-box {
          width: 50px; height: 56px; border-radius: 12px; border: 2px solid #E2E8F0;
          text-align: center; font-size: 22px; font-weight: 900; color: #0F172A;
          background: #F8FAFC; outline: none; transition: all 0.2s;
        }
        .otp-box:focus { border-color: #2563EB; background: #FFF; box-shadow: 0 0 0 4px rgba(37,99,235,0.12); }
      `}} />

      {/* ========================================================= */}
      {/* 🟦 LEFT DESKTOP PANEL (Royalty Seller & Reseller Center) */}
      {/* ========================================================= */}
      <div className="login-left-panel">
        <div>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(5px)', marginBottom: 35 }}>
            <span style={{ fontSize: 13 }}>{TICKER_ITEMS[tickerIndex].icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#E0F2FE' }}>{TICKER_ITEMS[tickerIndex].text}</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.15, margin: '0 0 12px', letterSpacing: '-0.8px' }}>
            Pakistan's Premier Reselling Hub
          </h1>
          <p style={{ color: '#BFDBFE', fontSize: 14, lineHeight: 1.6, margin: '0 0 40px' }}>
            Access factory wholesale rates, set your profit margin, and enjoy automated doorstep COD delivery.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaShoppingBag size={20} color="#FDE047" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Factory Direct Rates</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#BFDBFE' }}>Source trending fashion & tech directly from verified manufacturers.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaShippingFast size={20} color="#38BDF8" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Automated Courier Network</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#BFDBFE' }}>TCS, Leopards & PostEx integrated with live AI parcel tracking.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaShieldAlt size={20} color="#4ADE80" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>7-Day Customer Warranty</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#BFDBFE' }}>Zero-risk shopping with WhatsApp-verified returns.</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaCheckCircle color="#4ADE80" /> 256-Bit SSL
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaCheckCircle color="#4ADE80" /> Inspected COD
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaCheckCircle color="#4ADE80" /> Safe Identity
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ⬜ RIGHT FORM PANEL                                       */}
      {/* ========================================================= */}
      <div className="login-right-panel">
        <div className="form-card">

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginBottom: 18 }}>
            <div className="float-1" style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaShoppingBag color="#2563EB" size={18} />
            </div>
            <div className="float-2" style={{ width: 52, height: 52, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(16,185,129,0.15)', border: '2px solid #BBF7D0' }}>
              <FaShieldAlt color="#10B981" size={24} />
            </div>
            <div className="float-3" style={{ width: 42, height: 42, borderRadius: 12, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaShippingFast color="#F97316" size={18} />
            </div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900, textAlign: 'center', margin: '0 0 6px', color: '#0F172A' }}>
            {step === 'login' ? "Welcome Back!" : step === 'googlePhone' ? "One Last Step!" : "Verify WhatsApp"}
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.4 }}>
            {step === 'login' 
              ? "Securely sign in to access your store and orders." 
              : step === 'googlePhone' 
                ? "Enter your WhatsApp number to secure COD order tracking." 
                : `Enter the 6-digit pin sent to: ${targetPhone || phone}`}
          </p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>
              ⚠️ {error}
            </motion.div>
          )}

          {step === 'login' && (
            <form onSubmit={handleStandardLogin}>
              <div className="input-group">
                <label className="input-label">Email Address *</label>
                <div className="input-wrap">
                  <FaEnvelope className="input-icon" />
                  <input 
                    type="email" 
                    className="base-input" 
                    placeholder="name@gmail.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                  {email.length > 2 && !email.includes('@') && (
                    <span 
                      className="chip-email-helper"
                      onClick={() => setEmail(`${email}@gmail.com`)}
                    >
                      + @gmail.com
                    </span>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password *</label>
                <div className="input-wrap">
                  <FaLock className="input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="base-input" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <div 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{ position: 'absolute', right: 14, color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div 
                  onClick={() => setIsWhatsAppModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                >
                  <FaWhatsapp color="#25D366" size={16} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#16A34A' }}>
                    Login with WhatsApp OTP
                  </span>
                </div>

                <Link href="/auth/forgot-password" style={{ fontSize: 12, fontWeight: 700, color: '#F97316', textDecoration: 'none' }}>
                  Forgot?
                </Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <FaSpinner className="upload-spin" size={16} /> : "Sign In Securely"}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0', color: '#94A3B8' }}>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }}></div>
                <span style={{ padding: '0 12px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Or continue with</span>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }}></div>
              </div>

              <div className="neon-google-border" onClick={() => !loading && handleGoogleClick()}>
                <div className="neon-google-inner">
                  <ColorfulGoogleIcon />
                  <span>Continue with Google</span>
                </div>
              </div>

              <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748B' }}>
                New to SJ10? <Link href="/auth/signup" style={{ color: '#2563EB', fontWeight: 800, textDecoration: 'none' }}>Create Free Account</Link>
              </p>
            </form>
          )}

          {step === 'googlePhone' && (
            <form onSubmit={handleGooglePhoneSubmit}>
              <div className="input-group">
                <label className="input-label">WhatsApp Active Number *</label>
                <div className="input-wrap">
                  <FaWhatsapp className="input-icon" color="#25D366" size={18} />
                  <input 
                    type="tel" 
                    className="base-input" 
                    placeholder="03XXXXXXXXX" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={13}
                    required 
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" style={{ background: '#25D366', marginTop: 10 }} disabled={loading}>
                {loading ? <FaSpinner className="upload-spin" size={16} /> : "Send WhatsApp OTP →"}
              </button>

              <p style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="button" onClick={() => setStep('login')} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  ← Back to Login
                </button>
              </p>
            </form>
          )}

          {step === 'verifyPhoneOtp' && (
            <form onSubmit={handleVerifyOtpSubmit}>
              <div className="otp-row">
                {otpValues.map((val, idx) => (
                  <input 
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(idx, e)}
                    className="otp-box"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <button type="submit" className="submit-btn" style={{ background: '#059669', marginTop: 10 }} disabled={loading}>
                {loading ? <FaSpinner className="upload-spin" size={16} /> : "Verify & Complete Login"}
              </button>

              <p style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="button" onClick={() => setStep('login')} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  ← Cancel & Return
                </button>
              </p>
            </form>
          )}

        </div>
      </div>

      <AnimatePresence>
        {isWhatsAppModalOpen && (
          <WhatsAppLoginModal 
            onClose={() => setIsWhatsAppModalOpen(false)}
            onSuccess={(token: string, name: string) => {
              setIsWhatsAppModalOpen(false);
              performInstantHandoff(token, name);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.92)', backdropFilter: 'blur(10px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 30 }} 
              animate={{ scale: 1, y: 0 }} 
              style={{ background: 'white', borderRadius: 24, padding: '35px 25px', textAlign: 'center', maxWidth: 380, width: '100%', boxShadow: '0 25px 50px rgba(0, 184, 98, 0.35)' }}
            >
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(16,185,129,0.4)' }}>
                <FaRocket color="white" size={32} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
                Welcome, {celebrationName}! 🚀
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px' }}>
                Opening your marketplace dashboard...
              </p>
              <div style={{ width: 140, height: 4, background: '#E2E8F0', borderRadius: 10, margin: '0 auto', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#10B981', animation: 'pulseGlow 1s infinite' }}></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// =========================================================================
// 💬 WHATSAPP DIRECT LOGIN MODAL
// =========================================================================
function WhatsAppLoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (token: string, name: string) => void }) {
  const [waStep, setWaStep] = useState<1 | 2>(1);
  const [waPhone, setWaPhone] = useState('');
  const [waOtp, setWaOtp] = useState(['', '', '', '', '', '']);
  const waOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(45);

  // 🟢 FIXED URL HELPER (Bypasses /api for this specific route structure)
  const getAuthUrl = () => {
    let url = process.env.NEXT_PUBLIC_ORDER_API_URL || 'https://orders.sj10.pk/api';
    return url.replace(/\/api$/, '').replace(/\/$/, ''); 
  };

  useEffect(() => {
    let t: any;
    if (waStep === 2 && countdown > 0) {
      t = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(t);
  }, [waStep, countdown]);

  const handleSendWaOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let clean = waPhone.replace(/\D/g, '');
    if (clean.startsWith('923')) clean = '0' + clean.substring(2);
    else if (clean.startsWith('3') && clean.length === 10) clean = '0' + clean;

    if (!/^03[0-9]{9}$/.test(clean)) {
      setLoading(false);
      return setError("Please enter an active 11-digit number (03XXXXXXXXX)");
    }

    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/login-whatsapp-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send WhatsApp code");

      setWaStep(2);
      setCountdown(45);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWaOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = waOtp.join('');
    if (code.length < 6) return setError("Enter complete 6-digit code.");

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/login-whatsapp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waPhone, otp: code })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      onSuccess(data.token || data.accessToken, data.user?.full_name || 'Partner');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.65)', backdropFilter: 'blur(4px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 420, padding: 25, position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaWhatsapp color="#15803D" size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>
              {waStep === 1 ? "Login via WhatsApp" : "Enter WhatsApp PIN"}
            </h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaTimes color="#64748B" size={12} />
          </button>
        </div>

        {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>{error}</div>}

        {waStep === 1 ? (
          <form onSubmit={handleSendWaOtp}>
            <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 14px' }}>
              Enter your registered WhatsApp number to receive an instant verification code:
            </p>
            <input 
              type="tel" 
              placeholder="03XXXXXXXXX" 
              value={waPhone} 
              onChange={e => setWaPhone(e.target.value)} 
              maxLength={11}
              style={{ width: '100%', padding: '13px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, fontWeight: 700, outline: 'none', marginBottom: 16, background: '#F8FAFC' }} 
              required 
              autoFocus 
            />
            <button type="submit" style={{ width: '100%', padding: 13, background: '#25D366', color: 'white', border: 'none', borderRadius: 10, fontWeight: 900, cursor: 'pointer' }} disabled={loading}>
              {loading ? "Sending PIN..." : "Send WhatsApp PIN →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyWaOtp}>
            <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 14px', textAlign: 'center' }}>
              Enter 6-digit pin sent to <strong>{waPhone}</strong>:
            </p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
              {waOtp.map((v, i) => (
                <input 
                  key={i} 
                  ref={el => { waOtpRefs.current[i] = el; }} 
                  maxLength={1} 
                  type="text" 
                  inputMode="numeric" 
                  value={v} 
                  onChange={e => {
                    const next = [...waOtp]; next[i] = e.target.value; setWaOtp(next);
                    if (e.target.value && i < 5) waOtpRefs.current[i+1]?.focus();
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !waOtp[i] && i > 0) waOtpRefs.current[i-1]?.focus();
                  }}
                  style={{ width: 44, height: 50, textAlign: 'center', fontSize: 20, fontWeight: 900, border: '2px solid #25D366', borderRadius: 10, background: '#F8FAFC' }} 
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <button type="submit" style={{ width: '100%', padding: 13, background: '#10B981', color: 'white', border: 'none', borderRadius: 10, fontWeight: 900, cursor: 'pointer' }} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Open Account"}
            </button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#64748B', fontWeight: 700 }}>
              {countdown > 0 ? `Resend code in ${countdown}s` : <span onClick={handleSendWaOtp} style={{ color: '#2563EB', cursor: 'pointer' }}>Resend Code</span>}
            </div>
          </form>
        )}

      </motion.div>
    </div>
  );
}