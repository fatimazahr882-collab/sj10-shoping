"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import PhoneInput from 'react-phone-input-2';
// @ts-ignore
import 'react-phone-input-2/lib/style.css';
import { useGoogleLogin } from '@react-oauth/google';
import { FaUser, FaEnvelope, FaLock, FaStore, FaEye, FaEyeSlash, FaCamera, FaGoogle, FaShippingFast, FaTags, FaShieldAlt, FaGift, FaWhatsapp, FaExclamationTriangle } from 'react-icons/fa';
import SuccessPopup from '@/components/SuccessPopup';

const DEFAULT_PROFILE_PIC_URL = "https://media.sj10.pk/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp";

function SignupFormContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- View State ---
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // --- Form States ---
  const [formData, setFormData] = useState({ 
    fullName: '', 
    brandName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    referralCode: '' 
  });
  const [phone, setPhone] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState({ pass: false, confirm: false });
  const [profilePicPreview, setProfilePicPreview] = useState(DEFAULT_PROFILE_PIC_URL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🟢 DUAL OTP STATES
  const [hasWhatsApp, setHasWhatsApp] = useState(true);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [whatsappOtp, setWhatsappOtp] = useState(['', '', '', '', '', '']);
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const whatsappOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- General & Error States ---
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getAuthUrl = () => (process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004').replace(/\/$/, '').replace(/\/api$/, '');

  // Auto-detect referral code from URL
  useEffect(() => {
    const urlRef = searchParams.get('ref') || searchParams.get('referralCode');
    if (urlRef) {
      setFormData(prev => ({ ...prev, referralCode: urlRef.toUpperCase() }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'referralCode' ? value.toUpperCase() : value 
    });
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfilePicPreview(URL.createObjectURL(file));
  };

  // 1. Submit Registration -> Dispatches Dual OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      return setFieldErrors({ confirmPassword: "Passwords do not match." });
    }

    setLoading(true); 
    try {
      let rawPhone = phone.replace(/\D/g, '');
      if (rawPhone.startsWith('9292')) rawPhone = rawPhone.substring(2);
      if (rawPhone.startsWith('9203')) rawPhone = '92' + rawPhone.substring(3);
      if (rawPhone.startsWith('03')) rawPhone = '92' + rawPhone.substring(1);
      if (rawPhone.startsWith('3') && rawPhone.length === 10) rawPhone = '92' + rawPhone;
      const finalFormattedPhone = rawPhone.startsWith('92') ? `+${rawPhone}` : `+92${rawPhone}`;

      const res = await fetch(`${getAuthUrl()}/auth/user/register`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          phone: finalFormattedPhone
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.field) {
          setFieldErrors({ [data.field]: data.message });
        } else {
          setGlobalError(data.message);
        }
        return;
      }
      
      // 🟢 Save WhatsApp presence & Open OTP Screen
      setHasWhatsApp(data.hasWhatsApp ?? true);
      setStep('otp');

    } catch (err: any) { 
      setGlobalError(err.message || "Server connection failed."); 
    } finally { 
      setLoading(false); 
    }
  };

  // 2. OTP Change Handlers
  const handleOtpChange = (type: 'email' | 'whatsapp', index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    if (type === 'email') {
      const newOtp = [...emailOtp];
      newOtp[index] = value.substring(value.length - 1);
      setEmailOtp(newOtp);
      if (value && index < 5) emailOtpRefs.current[index + 1]?.focus();
      if (fieldErrors.emailOtp) setFieldErrors(prev => ({ ...prev, emailOtp: '' }));
    } else {
      const newOtp = [...whatsappOtp];
      newOtp[index] = value.substring(value.length - 1);
      setWhatsappOtp(newOtp);
      if (value && index < 5) whatsappOtpRefs.current[index + 1]?.focus();
      if (fieldErrors.whatsappOtp) setFieldErrors(prev => ({ ...prev, whatsappOtp: '' }));
    }
  };

  const handleOtpKeyDown = (type: 'email' | 'whatsapp', index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (type === 'email' && !emailOtp[index] && index > 0) {
        emailOtpRefs.current[index - 1]?.focus();
      } else if (type === 'whatsapp' && !whatsappOtp[index] && index > 0) {
        whatsappOtpRefs.current[index - 1]?.focus();
      }
    }
  };

  // 3. Submit OTPs -> Verify & Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setFieldErrors({});

    const emailOtpStr = emailOtp.join('');
    const whatsappOtpStr = whatsappOtp.join('');

    if (emailOtpStr.length < 6) {
      return setFieldErrors(prev => ({ ...prev, emailOtp: "Please enter the 6-digit email code." }));
    }

    if (hasWhatsApp && whatsappOtpStr.length < 6) {
      return setFieldErrors(prev => ({ ...prev, whatsappOtp: "Please enter the 6-digit WhatsApp code." }));
    }

    setLoading(true);
    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/verify-email`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          emailOtp: emailOtpStr,
          whatsappOtp: hasWhatsApp ? whatsappOtpStr : null
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.field) {
          setFieldErrors({ [data.field]: data.message });
        } else {
          setGlobalError(data.message);
        }
        return;
      }
      
      setIsSuccess(true);
      setTimeout(() => login(data.token), 2000);

    } catch (err: any) { 
      setGlobalError(err.message || "Verification failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  // 4. Google Login
  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); 
      setGlobalError('');
      try {
        const res = await fetch(`${getAuthUrl()}/auth/user/google`, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            accessToken: tokenResponse.access_token,
            referralCode: formData.referralCode
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        await login(data.token);
      } catch (err: any) { 
        setGlobalError("Google Signup Failed."); 
      } finally { 
        setLoading(false); 
      }
    },
    onError: () => setGlobalError("Google Signup error"),
  });

  const styles: { [key: string]: React.CSSProperties } = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)', padding: '20px 10px', fontFamily: "'Poppins', sans-serif" },
    card: { backgroundColor: '#ffffff', padding: '35px 30px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '480px', textAlign: 'center', boxSizing: 'border-box', animation: 'slideIn 0.4s ease-out' },
    benefitsHeader: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '25px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' },
    benefitItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '12px', fontWeight: '500' },
    title: { fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '8px' },
    subtitle: { fontSize: '0.9rem', color: '#6b7280', marginBottom: '25px' },
    profilePicContainer: { position: 'relative', width: '90px', height: '90px', margin: '0 auto 20px auto', cursor: 'pointer' },
    profilePic: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    profilePicOverlay: { position: 'absolute', bottom: '0px', right: '0px', backgroundColor: '#2563eb', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid white' },
    inputWrapper: { position: 'relative', marginBottom: '15px', textAlign: 'left' },
    inputIcon: { position: 'absolute', top: '16px', left: '15px', color: '#9ca3af' },
    input: { width: '100%', padding: '14px 45px', borderRadius: '12px', border: '2px solid #d1d5db', fontSize: '1rem', outline: 'none', backgroundColor: '#f9fafb', boxSizing: 'border-box', transition: 'border-color 0.2s' },
    passwordIcon: { position: 'absolute', top: '16px', right: '15px', color: '#9ca3af', cursor: 'pointer' },
    button: { width: '100%', padding: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '10px', transition: 'transform 0.1s ease' },
    globalError: { color: '#dc2626', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' },
    inlineError: { color: '#dc2626', fontSize: '12px', fontWeight: '600', margin: '4px 0 0 4px', textAlign: 'left' },
    footerText: { marginTop: '20px', fontSize: '14px', color: '#6b7280' },
    link: { color: '#2563eb', fontWeight: '700', cursor: 'pointer', textDecoration: 'none' },
    divider: { display: 'flex', alignItems: 'center', margin: '20px 0', color: '#9ca3af' },
    line: { flex: 1, height: '1px', backgroundColor: '#e5e7eb' },
    socialBtn: { width: '100%', padding: '15px', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s ease' },
    
    // OTP Specific
    otpSection: { textAlign: 'left', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' },
    otpSectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' },
    otpContainer: { display: 'flex', justifyContent: 'center', gap: '8px' },
    otpInput: { width: '42px', height: '52px', fontSize: '20px', fontWeight: '800', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', transition: '0.2s' },
  };

  return (
    <>
      <style>{`
        .button-active:active { transform: scale(0.98); } 
        .social-btn-hover:hover { border-color: #9ca3af; background-color: #f9fafb; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .otp-focus:focus { border-color: #f85606 !important; box-shadow: 0 0 0 3px rgba(248, 86, 6, 0.15) !important; }
        .input-error { border-color: #dc2626 !important; background-color: #fef2f2 !important; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div style={styles.container}>
        {isSuccess && <SuccessPopup message="Account Verified! Welcome to SJ10 🎉" onClose={() => {}} />}
        
        <div style={styles.card}>
          {globalError && <p style={styles.globalError}><i className="fas fa-exclamation-circle"></i> {globalError}</p>}

          {/* ========================================================= */}
          {/* STEP 1: REGISTRATION FORM */}
          {/* ========================================================= */}
          {step === 'form' && (
            <>
              <div style={styles.benefitsHeader}>
                <div style={styles.benefitItem}><FaShippingFast size={20} color="#f97316" /><span>Fast Delivery</span></div>
                <div style={styles.benefitItem}><FaTags size={20} color="#f97316" /><span>Best Prices</span></div>
                <div style={styles.benefitItem}><FaShieldAlt size={20} color="#f97316" /><span>Secure Signup</span></div>
              </div>
              
              <h1 style={styles.title}>Create Your Account</h1>
              
              <div style={styles.profilePicContainer} onClick={() => fileInputRef.current?.click()}>
                <img src={profilePicPreview} alt="Profile" style={styles.profilePic} />
                <div style={styles.profilePicOverlay}><FaCamera size={14} /></div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
              </div>
              
              <form onSubmit={handleRegisterSubmit}>
                
                {/* Full Name */}
                <div style={styles.inputWrapper}>
                  <FaUser style={styles.inputIcon} />
                  <input name="fullName" placeholder="Full Name" style={styles.input} className={fieldErrors.fullName ? 'input-error' : ''} onChange={handleChange} required />
                  {fieldErrors.fullName && <p style={styles.inlineError}>{fieldErrors.fullName}</p>}
                </div>
                
                {/* Brand Name */}
                <div style={styles.inputWrapper}>
                  <FaStore style={styles.inputIcon} />
                  <input name="brandName" placeholder="Brand Name (Optional)" style={styles.input} className={fieldErrors.brandName ? 'input-error' : ''} onChange={handleChange} />
                  {fieldErrors.brandName && <p style={styles.inlineError}>{fieldErrors.brandName}</p>}
                </div>
                
                {/* Email */}
                <div style={styles.inputWrapper}>
                  <FaEnvelope style={styles.inputIcon} />
                  <input name="email" type="email" placeholder="Email Address" style={styles.input} className={fieldErrors.email ? 'input-error' : ''} onChange={handleChange} required />
                  {fieldErrors.email && <p style={styles.inlineError}>{fieldErrors.email}</p>}
                </div>
                
                {/* Phone */}
                <div style={styles.inputWrapper}>
                  <PhoneInput country={'pk'} value={phone} onChange={handlePhoneChange} containerStyle={{ marginBottom: fieldErrors.phone ? '4px' : '0' }} inputStyle={{...styles.input, paddingLeft: '50px', width: '100%', borderColor: fieldErrors.phone ? '#dc2626' : '#d1d5db', backgroundColor: fieldErrors.phone ? '#fef2f2' : '#f9fafb'}} />
                  {fieldErrors.phone && <p style={styles.inlineError}>{fieldErrors.phone}</p>}
                </div>

                {/* Referral Code */}
                <div style={styles.inputWrapper}>
                  <FaGift style={styles.inputIcon} />
                  <input 
                    name="referralCode" 
                    placeholder="Referral Code (Optional)" 
                    value={formData.referralCode}
                    style={{...styles.input, textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600}} 
                    onChange={handleChange} 
                  />
                  {formData.referralCode && (
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'block', marginTop: '4px', marginLeft: '4px' }}>
                      ✓ Referral code applied!
                    </span>
                  )}
                </div>
                
                {/* Password */}
                <div style={styles.inputWrapper}>
                  <FaLock style={styles.inputIcon} />
                  <input name="password" type={passwordVisibility.pass ? 'text' : 'password'} placeholder="Password" style={styles.input} className={fieldErrors.password ? 'input-error' : ''} onChange={handleChange} required />
                  <div style={styles.passwordIcon} onClick={() => setPasswordVisibility(p => ({...p, pass: !p.pass}))}>{passwordVisibility.pass ? <FaEyeSlash /> : <FaEye />}</div>
                  {fieldErrors.password && <p style={styles.inlineError}>{fieldErrors.password}</p>}
                </div>
                
                {/* Confirm Password */}
                <div style={styles.inputWrapper}>
                  <FaLock style={styles.inputIcon} />
                  <input name="confirmPassword" type={passwordVisibility.confirm ? 'text' : 'password'} placeholder="Confirm Password" style={styles.input} className={fieldErrors.confirmPassword ? 'input-error' : ''} onChange={handleChange} required />
                  <div style={styles.passwordIcon} onClick={() => setPasswordVisibility(p => ({...p, confirm: !p.confirm}))}>{passwordVisibility.confirm ? <FaEyeSlash /> : <FaEye />}</div>
                  {fieldErrors.confirmPassword && <p style={styles.inlineError}>{fieldErrors.confirmPassword}</p>}
                </div>
                
                <button type="submit" style={styles.button} className="button-active" disabled={loading}>
                  {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'CREATE ACCOUNT'}
                </button>
              </form>
              
              <div style={styles.divider}><div style={styles.line}></div><span style={{padding: '0 10px', fontSize:'12px'}}>Or continue with</span><div style={styles.line}></div></div>
              
              <button style={styles.socialBtn} className="social-btn-hover button-active" onClick={() => handleGoogleClick()} disabled={loading}>
                <FaGoogle color="#DB4437" /> Sign up with Google
              </button>
              
              <p style={styles.footerText}>Already have an account? <Link href="/auth/login" style={styles.link}>Login</Link></p>
            </>
          )}

          {/* ========================================================= */}
          {/* STEP 2: 🟢 DUAL SECURITY OTP VERIFICATION SCREEN */}
          {/* ========================================================= */}
          {step === 'otp' && (
            <>
              <div style={{width:'70px', height:'70px', background:'#fff7ed', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', border:'2px solid #ffedd5'}}>
                  <i className="fas fa-shield-halved" style={{fontSize:'30px', color:'#f85606'}}></i>
              </div>
              <h1 style={{...styles.title, fontSize:'1.5rem'}}>Security Verification</h1>
              <p style={styles.subtitle}>
                {hasWhatsApp 
                  ? "Enter the 6-digit codes sent to your Email & WhatsApp." 
                  : "We sent a 6-digit code to your Email."}
              </p>

              {/* ⚠️ Notice if WhatsApp was not found */}
              {!hasWhatsApp && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '10px 14px', color: '#92400e', fontSize: '12px', textAlign: 'left', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <FaExclamationTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>WhatsApp was not detected on your mobile number. Please verify using your Email code only.</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                
                {/* 1. EMAIL OTP SECTION */}
                <div style={styles.otpSection}>
                  <div style={styles.otpSectionHeader}>
                    <FaEnvelope color="#2563eb" />
                    <span>Email Code <small style={{ color: '#64748b' }}>({formData.email})</small></span>
                  </div>
                  
                  <div style={styles.otpContainer}>
                    {emailOtp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => { emailOtpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange('email', index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown('email', index, e)}
                        style={styles.otpInput}
                        className="otp-focus"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  {fieldErrors.emailOtp && <p style={styles.inlineError}>{fieldErrors.emailOtp}</p>}
                </div>

                {/* 2. WHATSAPP OTP SECTION (ONLY IF WHATSAPP FOUND) */}
                {hasWhatsApp && (
                  <div style={styles.otpSection}>
                    <div style={styles.otpSectionHeader}>
                      <FaWhatsapp color="#16a34a" size={16} />
                      <span>WhatsApp Code <small style={{ color: '#64748b' }}>({phone})</small></span>
                    </div>
                    
                    <div style={styles.otpContainer}>
                      {whatsappOtp.map((digit, index) => (
                        <input
                          key={index}
                          ref={el => { whatsappOtpRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange('whatsapp', index, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown('whatsapp', index, e)}
                          style={styles.otpInput}
                          className="otp-focus"
                        />
                      ))}
                    </div>
                    {fieldErrors.whatsappOtp && <p style={styles.inlineError}>{fieldErrors.whatsappOtp}</p>}
                  </div>
                )}

                <button 
                  type="submit" 
                  style={{...styles.button, background: '#f85606'}} 
                  className="button-active" 
                  disabled={loading}
                >
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 'VERIFY & COMPLETE REGISTRATION'}
                </button>
              </form>

              <p style={styles.footerText}>
                Need to change details? <span style={styles.link} onClick={() => setStep('form')}>Go Back</span>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><i className="fas fa-circle-notch fa-spin text-orange-500 text-3xl"></i></div>}>
      <SignupFormContent />
    </Suspense>
  );
}