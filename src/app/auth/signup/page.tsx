"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useGoogleLogin } from '@react-oauth/google';
import { FaUser, FaEnvelope, FaLock, FaStore, FaEye, FaEyeSlash, FaCamera, FaGoogle, FaShippingFast, FaTags, FaShieldAlt } from 'react-icons/fa';
import SuccessPopup from '@/components/SuccessPopup';

const DEFAULT_PROFILE_PIC_URL = "https://media.sj10.pk/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp";

export default function SignupPage() {
  const { login } = useAuth();
  const router = useRouter();

  // --- View State ---
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // --- Form States ---
  const [formData, setFormData] = useState({ fullName: '', brandName: '', email: '', password: '', confirmPassword: '' });
  const [phone, setPhone] = useState('');
  const[passwordVisibility, setPasswordVisibility] = useState({ pass: false, confirm: false });
  const[profilePicPreview, setProfilePicPreview] = useState(DEFAULT_PROFILE_PIC_URL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- OTP States ---
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- General States ---
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getAuthUrl = () => (process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004').replace(/\/$/, '').replace(/\/api$/, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfilePicPreview(URL.createObjectURL(file));
  };

  // 1. Submit Registration -> Send OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
    setLoading(true); setError('');
    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: `+${phone}` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Move to OTP screen
      setStep('otp');
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  // 2. Handle OTP Input Logic
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // 3. Submit OTP -> Verify & Auto Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return setError("Please enter the complete 6-digit code.");
    
    setLoading(true); setError('');
    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/verify-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otpString })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setIsSuccess(true);
      setTimeout(() => login(data.token), 2000); // Login after success popup

    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

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
      } catch (err: any) { setError("Google Signup Failed."); } 
      finally { setLoading(false); }
    },
    onError: () => setError("Google Signup error"),
  });

  const styles: { [key: string]: React.CSSProperties } = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)', padding: '20px 10px', fontFamily: "'Poppins', sans-serif" },
    card: { backgroundColor: '#ffffff', padding: '35px 30px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '460px', textAlign: 'center', boxSizing: 'border-box', animation: 'slideIn 0.4s ease-out' },
    benefitsHeader: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '25px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' },
    benefitItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '12px', fontWeight: '500' },
    title: { fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '10px' },
    subtitle: { fontSize: '0.95rem', color: '#6b7280', marginBottom: '25px' },
    profilePicContainer: { position: 'relative', width: '90px', height: '90px', margin: '0 auto 20px auto', cursor: 'pointer' },
    profilePic: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    profilePicOverlay: { position: 'absolute', bottom: '0px', right: '0px', backgroundColor: '#2563eb', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid white' },
    inputWrapper: { position: 'relative', marginBottom: '15px' },
    inputIcon: { position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#9ca3af' },
    input: { width: '100%', padding: '14px 45px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', backgroundColor: '#f9fafb', boxSizing: 'border-box' },
    passwordIcon: { position: 'absolute', top: '50%', right: '15px', transform: 'translateY(-50%)', color: '#9ca3af', cursor: 'pointer' },
    button: { width: '100%', padding: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '10px', transition: 'transform 0.1s ease' },
    error: { color: '#dc2626', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' },
    footerText: { marginTop: '20px', fontSize: '14px', color: '#6b7280' },
    link: { color: '#2563eb', fontWeight: '700', cursor: 'pointer', textDecoration: 'none' },
    divider: { display: 'flex', alignItems: 'center', margin: '20px 0', color: '#9ca3af' },
    line: { flex: 1, height: '1px', backgroundColor: '#e5e7eb' },
    socialBtn: { width: '100%', padding: '15px', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s ease' },
    
    // OTP Specific Styles
    otpContainer: { display: 'flex', justifyContent: 'center', gap: '10px', margin: '30px 0' },
    otpInput: { width: '50px', height: '60px', fontSize: '24px', fontWeight: '700', textAlign: 'center', borderRadius: '12px', border: '2px solid #e5e7eb', outline: 'none', backgroundColor: '#f8fafc', color: '#f97316', transition: '0.2s' },
  };
  
  return (
    <>
      <style>{`
        .button-active:active { transform: scale(0.98); } 
        .social-btn-hover:hover { border-color: #9ca3af; background-color: #f9fafb; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .otp-focus:focus { border-color: #f97316 !important; background-color: #fff !important; box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div style={styles.container}>
        {isSuccess && <SuccessPopup message="Email Verified! Welcome to SJ10 🎉" onClose={() => {}} />}
        
        <div style={styles.card}>
          {error && <p style={styles.error}><i className="fas fa-exclamation-circle"></i> {error}</p>}

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
                <div style={styles.inputWrapper}><FaUser style={styles.inputIcon} /><input name="fullName" placeholder="Full Name" style={styles.input} onChange={handleChange} required /></div>
                <div style={styles.inputWrapper}><FaStore style={styles.inputIcon} /><input name="brandName" placeholder="Brand Name (Optional)" style={styles.input} onChange={handleChange} /></div>
                <div style={styles.inputWrapper}><FaEnvelope style={styles.inputIcon} /><input name="email" type="email" placeholder="Email Address" style={styles.input} onChange={handleChange} required /></div>
                <PhoneInput country={'pk'} value={phone} onChange={setPhone} containerStyle={{ marginBottom: '15px' }} inputStyle={{...styles.input, paddingLeft: '50px', width: '100%'}} />
                
                <div style={styles.inputWrapper}><FaLock style={styles.inputIcon} /><input name="password" type={passwordVisibility.pass ? 'text' : 'password'} placeholder="Password" style={styles.input} onChange={handleChange} required /><div style={styles.passwordIcon} onClick={() => setPasswordVisibility(p => ({...p, pass: !p.pass}))}>{passwordVisibility.pass ? <FaEyeSlash /> : <FaEye />}</div></div>
                <div style={styles.inputWrapper}><FaLock style={styles.inputIcon} /><input name="confirmPassword" type={passwordVisibility.confirm ? 'text' : 'password'} placeholder="Confirm Password" style={styles.input} onChange={handleChange} required /><div style={styles.passwordIcon} onClick={() => setPasswordVisibility(p => ({...p, confirm: !p.confirm}))}>{passwordVisibility.confirm ? <FaEyeSlash /> : <FaEye />}</div></div>
                
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
          {/* STEP 2: OTP VERIFICATION SCREEN */}
          {/* ========================================================= */}
          {step === 'otp' && (
            <>
              <div style={{width:'80px', height:'80px', background:'#fff7ed', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                  <i className="fas fa-envelope-open-text" style={{fontSize:'35px', color:'#f85606'}}></i>
              </div>
              <h1 style={styles.title}>Verify Your Email</h1>
              <p style={styles.subtitle}>
                We sent a 6-digit code to <br/><strong style={{color:'#1e293b'}}>{formData.email}</strong>
              </p>

              <form onSubmit={handleVerifyOtp}>
                <div style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      style={styles.otpInput}
                      className="otp-focus"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button type="submit" style={{...styles.button, background: '#f85606'}} className="button-active" disabled={loading}>
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 'VERIFY & LOGIN'}
                </button>
              </form>

              <p style={styles.footerText}>
                Didn't receive the code? <span style={styles.link} onClick={() => setStep('form')}>Change Email</span>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}