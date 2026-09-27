"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import PhoneInput from 'react-phone-input-2';
// @ts-ignore
import 'react-phone-input-2/lib/style.css';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  FaUser, FaEnvelope, FaLock, FaStore, FaEye, FaEyeSlash, 
  FaCamera, FaShoppingBag, FaShippingFast, FaShieldAlt,
  FaPhoneAlt, FaWhatsapp
} from 'react-icons/fa';
import SuccessPopup from '@/components/SuccessPopup';

const DEFAULT_PROFILE_PIC_URL = "https://media.sj10.pk/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp";

// 🟢 COLORFUL GOOGLE ICON
const ColorfulGoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function SignupPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'form' | 'googlePhone' | 'otp'>('form');

  // --- Form States ---
  const [formData, setFormData] = useState({ fullName: '', brandName: '', email: '', password: '', confirmPassword: '' });
  const [phone, setPhone] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState({ pass: false, confirm: false });
  const [profilePicPreview, setProfilePicPreview] = useState(DEFAULT_PROFILE_PIC_URL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Google & OTP Verification States ---
  const [googleData, setGoogleData] = useState<any>(null);
  const [hasWhatsApp, setHasWhatsApp] = useState(true); // 🟢 Tracks if WhatsApp OTP was sent

  // 🟢 DUAL OTP ARRAYS
  const [emailOtpValues, setEmailOtpValues] = useState(Array(6).fill(''));
  const [whatsappOtpValues, setWhatsappOtpValues] = useState(Array(6).fill(''));
  
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const whatsappOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- General & Error States ---
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getAuthUrl = () => (process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004').replace(/\/$/, '').replace(/\/api$/, '');

  const formatPhoneForBackend = (inputPhone: string) => {
    let clean = inputPhone.replace(/\D/g, '');
    if (clean.startsWith('03')) return `+92${clean.slice(1)}`;
    if (clean.startsWith('923')) return `+${clean}`;
    return `+92${clean}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData,[e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfilePicPreview(URL.createObjectURL(file));
  };

  // 1. Submit Normal Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      return setFieldErrors({ confirmPassword: "Passwords do not match." });
    }

    setLoading(true); 
    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: `+${phone}` })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.field) setFieldErrors({ [data.field]: data.message });
        else setGlobalError(data.message);
        return; 
      }
      
      // 🟢 API tells us if WhatsApp OTP was successfully sent
      setHasWhatsApp(data.hasWhatsApp ?? true);
      setStep('otp');
    } catch (err: any) { 
      setGlobalError(err.message || "Server connection failed."); 
    } finally { 
      setLoading(false); 
    }
  };

  // 2. Google Click
  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setGlobalError('');
      try {
        const res = await fetch(`${getAuthUrl()}/auth/user/google`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token })
        });
        const data = await res.json();
        
        if (data.requiresPhone) {
           setGoogleData(data.googleData);
           setFormData(prev => ({ ...prev, email: data.googleData.email })); 
           setStep('googlePhone');
           setLoading(false);
           return;
        }

        if (!res.ok) throw new Error(data.message);
        await login(data.token);
      } catch (err: any) { setGlobalError("Google Signup Failed."); } 
      finally { setLoading(false); }
    },
    onError: () => setGlobalError("Google Signup error"),
  });

  // 3. Submit Google Phone
  const handleGooglePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setGlobalError('');
    const formattedPhone = formatPhoneForBackend(phone);

    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/google-complete-signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...googleData, phone: formattedPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Phone verification failed');
      
      // 🟢 API tells us if WhatsApp OTP was successfully sent
      setHasWhatsApp(data.hasWhatsApp ?? true);
      setStep('otp');
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 4. DUAL OTP HANDLERS (Email + WhatsApp)
  const handleOTPChange = (type: 'email' | 'whatsapp', idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    if (type === 'email') {
      const next = [...emailOtpValues]; next[idx] = val; setEmailOtpValues(next);
      if (val && idx < 5) emailOtpRefs.current[idx + 1]?.focus();
    } else {
      const next = [...whatsappOtpValues]; next[idx] = val; setWhatsappOtpValues(next);
      if (val && idx < 5) whatsappOtpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOTPKey = (type: 'email' | 'whatsapp', idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (type === 'email' && !emailOtpValues[idx] && idx > 0) {
        emailOtpRefs.current[idx - 1]?.focus();
      } else if (type === 'whatsapp' && !whatsappOtpValues[idx] && idx > 0) {
        whatsappOtpRefs.current[idx - 1]?.focus();
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailCode = emailOtpValues.join('');
    const whatsappCode = whatsappOtpValues.join('');

    if (emailCode.length < 6) return setGlobalError("Please enter the complete 6-digit Email code.");
    if (hasWhatsApp && whatsappCode.length < 6) return setGlobalError("Please enter the complete 6-digit WhatsApp code.");
    
    setLoading(true); setGlobalError('');
    try {
      // 🟢 THE FIX: Sending BOTH emailOtp and whatsappOtp explicitly!
      const payload = { 
        email: formData.email, 
        emailOtp: emailCode, 
        whatsappOtp: hasWhatsApp ? whatsappCode : null 
      };

      const res = await fetch(`${getAuthUrl()}/auth/user/verify-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification Failed');
      
      setIsSuccess(true);
      setTimeout(() => login(data.token), 2000); 

    } catch (err: any) { setGlobalError(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="signup-wrapper">
      {isSuccess && <SuccessPopup message="Email Verified! Welcome to SJ10 🎉" onClose={() => {}} />}
      
      {/* 🟦 LEFT DESKTOP PANEL (Seller Center Style) */}
      <div className="signup-left">
        <h1 className="panel-title">Join SJ10 Marketplace</h1>
        <p className="panel-subtitle">Create your free account to unlock wholesale prices, fast delivery, and start your reselling journey.</p>
        
        <div className="feature-item">
          <div className="feature-icon"><FaShoppingBag /></div>
          <div className="feature-text">
            <h3>Premium Shopping</h3>
            <p>Access thousands of high-quality products at direct wholesale rates.</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon"><FaShippingFast /></div>
          <div className="feature-text">
            <h3>Fast Cash on Delivery</h3>
            <p>Get your parcels delivered within 3-7 days anywhere in Pakistan safely.</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon"><FaShieldAlt /></div>
          <div className="feature-text">
            <h3>Zero Investment Reselling</h3>
            <p>Share products, set your profit margin, and earn money directly from home.</p>
          </div>
        </div>
      </div>

      {/* ⬜ RIGHT FORM PANEL */}
      <div className="signup-right">
        <div className="signup-card">

          {/* ========================================================= */}
          {/* STEP 1: REGISTRATION FORM */}
          {/* ========================================================= */}
          {step === 'form' && (
            <>
              {/* 🟢 BEAUTIFUL ANIMATED HEADER ICONS */}
              <div className="animated-header-icons">
                 <div className="icon-circle bounce-1"><FaShoppingBag /></div>
                 <div className="icon-circle bounce-2"><FaShieldAlt /></div>
                 <div className="icon-circle bounce-3"><FaShippingFast /></div>
              </div>

              <div className="brand-label">SJ10 SHOPPING</div>
              <h1 className="reg-title">Create Account</h1>
              <p className="reg-subtitle">Join us to experience the best online shopping.</p>

              {globalError && <div className="error-box"><i className="fas fa-exclamation-circle"></i> {globalError}</div>}
              
              <form onSubmit={handleRegisterSubmit}>
                
                {/* Profile Pic Upload */}
                <div className="avatar-wrap">
                  <div className="avatar-ring" onClick={() => fileInputRef.current?.click()}>
                    <img src={profilePicPreview} alt="Profile" />
                    <div className="camera-overlay"><FaCamera size={14}/></div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                </div>
                
                {/* Inputs */}
                <div className="two-col">
                    <div className="input-group">
                      <label>Full Name <span className="req">*</span></label>
                      <div className="input-icon-wrap">
                        <FaUser className="input-icon" />
                        <input name="fullName" placeholder="e.g. Ali Raza" className={`reg-input ${fieldErrors.fullName ? 'error-border' : ''}`} onChange={handleChange} required />
                      </div>
                      {fieldErrors.fullName && <span className="inline-error">{fieldErrors.fullName}</span>}
                    </div>
                    
                    <div className="input-group">
                      <label>Brand/Shop Name <span className="opt">(Optional)</span></label>
                      <div className="input-icon-wrap">
                        <FaStore className="input-icon" />
                        <input name="brandName" placeholder="For Resellers" className={`reg-input ${fieldErrors.brandName ? 'error-border' : ''}`} onChange={handleChange} />
                      </div>
                    </div>
                </div>
                
                <div className="input-group">
                  <label>Email Address <span className="req">*</span></label>
                  <div className="input-icon-wrap">
                    <FaEnvelope className="input-icon" />
                    <input name="email" type="email" placeholder="example@gmail.com" className={`reg-input ${fieldErrors.email ? 'error-border' : ''}`} onChange={handleChange} required />
                  </div>
                  {fieldErrors.email && <span className="inline-error">{fieldErrors.email}</span>}
                </div>
                
                <div className="input-group">
                  <label>WhatsApp / Phone <span className="req">*</span></label>
                  <div className="input-icon-wrap phone-wrap-custom">
                    <PhoneInput 
                      country={'pk'} 
                      value={phone} 
                      onChange={handlePhoneChange} 
                      inputClass={`reg-input ${fieldErrors.phone ? 'error-border' : ''}`} 
                    />
                  </div>
                  {fieldErrors.phone && <span className="inline-error">{fieldErrors.phone}</span>}
                </div>
                
                <div className="two-col">
                    <div className="input-group">
                      <label>Password <span className="req">*</span></label>
                      <div className="input-icon-wrap">
                        <FaLock className="input-icon" />
                        <input name="password" type={passwordVisibility.pass ? 'text' : 'password'} placeholder="Min. 6 chars" className={`reg-input pw-input ${fieldErrors.password ? 'error-border' : ''}`} onChange={handleChange} required />
                        <span className="pw-toggle" onClick={() => setPasswordVisibility(p => ({...p, pass: !p.pass}))}>{passwordVisibility.pass ? <FaEyeSlash /> : <FaEye />}</span>
                      </div>
                    </div>
                    
                    <div className="input-group">
                      <label>Confirm Password <span className="req">*</span></label>
                      <div className="input-icon-wrap">
                        <FaLock className="input-icon" />
                        <input name="confirmPassword" type={passwordVisibility.confirm ? 'text' : 'password'} placeholder="Re-enter" className={`reg-input pw-input ${fieldErrors.confirmPassword ? 'error-border' : ''}`} onChange={handleChange} required />
                        <span className="pw-toggle" onClick={() => setPasswordVisibility(p => ({...p, confirm: !p.confirm}))}>{passwordVisibility.confirm ? <FaEyeSlash /> : <FaEye />}</span>
                      </div>
                      {fieldErrors.confirmPassword && <span className="inline-error">{fieldErrors.confirmPassword}</span>}
                    </div>
                </div>
                
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'CREATE ACCOUNT'}
                </button>
              </form>

              {/* 🟢 COLORFUL GOOGLE BUTTON (MOVED DOWN) */}
              <div className="or-divider" style={{marginTop: '25px', marginBottom: '20px'}}>Or continue with</div>
              
              <button type="button" className="social-btn" onClick={() => handleGoogleClick()} disabled={loading}>
                <ColorfulGoogleIcon /> Continue with Google
              </button>
              
              <p className="bottom-link">Already have an account? <Link href="/auth/login">Login Here</Link></p>
            </>
          )}

          {/* ========================================================= */}
          {/* STEP 1.5: GOOGLE REQUIRE PHONE STEP */}
          {/* ========================================================= */}
          {step === 'googlePhone' && (
             <div className="step-container slide-in">
               <div className="icon-shield-wrap" style={{background: 'white', border: 'none'}}>
                 <ColorfulGoogleIcon />
               </div>
               <h2 className="reg-title">One Last Step!</h2>
               <p className="reg-subtitle">We need your WhatsApp number for order tracking and COD verification.</p>

               {globalError && <div className="error-box"><i className="fas fa-exclamation-circle"></i> {globalError}</div>}

               <form onSubmit={handleGooglePhoneSubmit} style={{width: '100%', textAlign: 'left'}}>
                 <div className="input-group">
                   <label>WhatsApp / Phone Number <span className="req">*</span></label>
                   <div className="input-icon-wrap">
                     <FaPhoneAlt className="input-icon" style={{color: '#16a34a'}} />
                     <input type="tel" className="reg-input" placeholder="03XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} maxLength={13} required autoFocus />
                   </div>
                 </div>
                 <button type="submit" className="btn-primary" disabled={loading} style={{marginTop: '15px'}}>
                   {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'SEND OTP'}
                 </button>
               </form>
             </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: DUAL OTP VERIFICATION SCREEN (SELLER CENTER STYLE)*/}
          {/* ========================================================= */}
          {step === 'otp' && (
            <div className="step-container slide-in">
              <div className="icon-shield-wrap" style={{background: '#eff6ff', borderColor: '#bfdbfe'}}>
                  <FaShieldAlt size={30} color="#2563eb" />
              </div>
              <h2 className="reg-title">Security Verification</h2>
              <p className="reg-subtitle">
                {hasWhatsApp 
                  ? "Enter the 6-digit codes sent to your Email & WhatsApp." 
                  : "We sent a 6-digit verification code to your Email."}
              </p>

              {globalError && <div className="error-box"><i className="fas fa-exclamation-circle"></i> {globalError}</div>}

              <form onSubmit={handleVerifyOtp} style={{width: '100%'}}>
                
                {/* 1. EMAIL OTP SECTION */}
                <div className="otp-section-card">
                  <div className="otp-section-header">
                    <FaEnvelope color="#2563eb" />
                    <span>Email Code <small>({formData.email})</small></span>
                  </div>
                  <div className="otp-fields">
                    {emailOtpValues.map((val, idx) => (
                      <input
                        key={idx} 
                        ref={el => { emailOtpRefs.current[idx] = el; }}
                        className="otp-digit" 
                        maxLength={1} 
                        inputMode="numeric" 
                        value={val}
                        onChange={e => handleOTPChange('email', idx, e.target.value)}
                        onKeyDown={e => handleOTPKey('email', idx, e)}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. WHATSAPP OTP SECTION (ONLY IF WHATSAPP FOUND) */}
                {hasWhatsApp && (
                  <div className="otp-section-card">
                    <div className="otp-section-header">
                      <FaWhatsapp color="#16a34a" size={16} />
                      <span>WhatsApp Code <small>({phone})</small></span>
                    </div>
                    <div className="otp-fields">
                      {whatsappOtpValues.map((val, idx) => (
                        <input
                          key={idx} 
                          ref={el => { whatsappOtpRefs.current[idx] = el; }}
                          className="otp-digit" 
                          maxLength={1} 
                          inputMode="numeric" 
                          value={val}
                          onChange={e => handleOTPChange('whatsapp', idx, e.target.value)}
                          onKeyDown={e => handleOTPKey('whatsapp', idx, e)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '20px' }}>
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 'VERIFY & LOGIN'}
                </button>
              </form>

              <p className="bottom-link" style={{ marginTop: '20px' }}>
                Didn't receive the code? <span onClick={() => setStep('form')} style={{cursor:'pointer', color:'#2563eb', fontWeight:600}}>Change Details</span>
              </p>
            </div>
          )}

        </div>
      </div>

      {/* 🟢 CSS STYLING MATCHING SELLER CENTER */}
      <style jsx global>{`
        /* Core Reset & Font */
        .signup-wrapper { display: flex; min-height: 100vh; width: 100%; background: #ffffff; font-family: 'Poppins', sans-serif; position: relative; }

        /* 🟢 ANIMATED HEADER ICONS */
        .animated-header-icons { display: flex; justify-content: center; gap: 20px; margin-bottom: 25px; }
        .icon-circle { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; color: white; box-shadow: 0 5px 15px rgba(0,0,0,0.15); }
        .bounce-1 { background: linear-gradient(135deg, #f85606, #ea580c); animation: float 3s ease-in-out infinite; }
        .bounce-2 { background: linear-gradient(135deg, #3b82f6, #1d4ed8); animation: float 3s ease-in-out infinite 0.5s; }
        .bounce-3 { background: linear-gradient(135deg, #10b981, #059669); animation: float 3s ease-in-out infinite 1s; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        /* 🟦 LEFT DESKTOP PANEL */
        .signup-left { display: none; }
        @media (min-width: 992px) {
          .signup-wrapper { height: 100vh; overflow: hidden; }
          .signup-left { display: flex; flex-direction: column; justify-content: center; width: 45%; max-width: 600px; background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; padding: 60px; position: relative; z-index: 1; }
          .signup-left::before { content: ''; position: absolute; width: 500px; height: 500px; background: rgba(255, 255, 255, 0.05); border-radius: 50%; top: -150px; left: -150px; z-index: -1; }
          .signup-right { height: 100vh; }
        }

        .panel-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 15px; line-height: 1.2; letter-spacing: -0.5px; }
        .panel-subtitle { font-size: 1rem; color: #bfdbfe; margin-bottom: 40px; line-height: 1.6; }
        .feature-item { display: flex; align-items: flex-start; gap: 18px; margin-bottom: 25px; }
        .feature-icon { width: 48px; height: 48px; background: rgba(255, 255, 255, 0.15); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; backdrop-filter: blur(5px); }
        .feature-text h3 { font-size: 1.1rem; font-weight: 600; margin: 0 0 4px 0; }
        .feature-text p { font-size: 0.9rem; color: #bfdbfe; margin: 0; line-height: 1.4; }

        /* ⬜ RIGHT FORM PANEL */
        .signup-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 20px; background: #ffffff; min-height: 100vh; overflow-y: auto; }
        .signup-card { width: 100%; max-width: 520px; padding: 10px 20px; }

        .brand-label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #2563eb; text-align: center; margin-bottom: 8px; letter-spacing: 1.5px; }
        .reg-title { font-size: 1.8rem; font-weight: 800; text-align: center; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.5px; }
        .reg-subtitle { font-size: 0.95rem; color: #64748b; text-align: center; margin: 0 0 30px 0; }

        .error-box { background: #fef2f2; border: 1px solid #fecaca; color: #ef4444; padding: 12px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

        .social-btn { width: 100%; padding: 15px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 1rem; font-weight: 600; display: flex; justify-content: center; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s ease; color: #334155; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .social-btn:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.05); }

        .or-divider { display: flex; align-items: center; color: #64748b; font-size: 13px; font-weight: 500; }
        .or-divider::before, .or-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; margin: 0 12px; }

        /* Profile Pic */
        .avatar-wrap { display: flex; flex-direction: column; align-items: center; margin-bottom: 25px; position: relative; }
        .avatar-ring { width: 90px; height: 90px; border-radius: 50%; border: 3px solid #e2e8f0; position: relative; cursor: pointer; overflow: hidden; transition: transform 0.2s; background: #f8fafc; }
        .avatar-ring:hover { transform: scale(1.05); border-color: #2563eb; }
        .avatar-ring img { width: 100%; height: 100%; object-fit: cover; }
        .camera-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); color: white; height: 25px; display: flex; justify-content: center; align-items: center; }

        /* Inputs */
        .two-col { display: flex; gap: 12px; }
        @media (max-width: 600px) { .two-col { flex-direction: column; gap: 0; } }
        
        .input-group { margin-bottom: 18px; position: relative; text-align: left; width: 100%; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .req { color: #ef4444; margin-left: 2px; }
        .opt { color: #94a3b8; font-weight: 400; font-size: 0.8rem; }
        
        .input-icon-wrap { position: relative; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 16px; z-index: 2; transition: color 0.2s; }
        
        .reg-input { width: 100%; padding: 14px 16px 14px 44px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 0.95rem; font-family: 'Poppins', sans-serif; transition: all 0.25s ease; outline: none; color: #0f172a; font-weight: 500; }
        .reg-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        .reg-input:focus + .input-icon { color: #2563eb; }
        .error-border { border-color: #ef4444 !important; background: #fef2f2 !important; }
        .inline-error { color: #dc2626; font-size: 11px; font-weight: 600; margin-top: 4px; display: block; }

        .pw-toggle { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; cursor: pointer; font-size: 16px; z-index: 2; }
        .pw-input { padding-right: 40px; }

        .phone-wrap-custom .react-tel-input .form-control { width: 100%; padding: 14px 16px 14px 55px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 0.95rem; font-family: 'Poppins', sans-serif; height: 52px; font-weight: 500; }
        .phone-wrap-custom .react-tel-input .form-control:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        .phone-wrap-custom .react-tel-input .flag-dropdown { background: transparent; border: none; padding-left: 10px; }
        .phone-wrap-custom .react-tel-input .selected-flag:hover, .phone-wrap-custom .react-tel-input .selected-flag:focus { background: transparent; }

        /* Button */
        .btn-primary { width: 100%; padding: 15px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.25s ease; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); margin-top: 10px; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35); }
        .btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .bottom-link { text-align: center; margin-top: 20px; font-size: 14px; color: #64748b; }
        .bottom-link a { color: #2563eb; font-weight: 600; text-decoration: none; transition: 0.2s; }
        .bottom-link a:hover { color: #1d4ed8; text-decoration: underline; }

        /* 🟢 STEP CONTAINERS & DUAL OTP */
        .step-container { text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center; padding-top: 10px; }
        .icon-shield-wrap { width: 70px; height: 70px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; border: 2px solid #dbeafe; }
        
        .otp-section-card { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 16px 12px; margin-bottom: 16px; text-align: left; }
        .otp-section-header { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 12px; padding-left: 4px; }
        .otp-section-header small { color: #64748b; font-weight: 500; }
        
        .otp-fields { display: flex; gap: 6px; justify-content: space-between; width: 100%; }
        .otp-digit { width: calc(100% / 6 - 5px); height: 50px; border-radius: 10px; border: 2px solid #e2e8f0; background: #ffffff; text-align: center; font-size: 20px; font-weight: 700; color: #2563eb; outline: none; transition: all 0.2s ease; }
        .otp-digit:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12); transform: translateY(-2px); }

        .slide-in { animation: slideIn 0.3s ease-out forwards; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}