"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login'; // <-- NEW, MODERN LIBRARY
import { FaUser, FaEnvelope, FaLock, FaStore, FaEye, FaEyeSlash, FaCamera, FaGoogle, FaFacebook, FaShippingFast, FaTags, FaShieldAlt } from 'react-icons/fa';
import SuccessPopup from '@/components/SuccessPopup';

// THE HARDCODED DEFAULT PROFILE PICTURE URL
const DEFAULT_PROFILE_PIC_URL = "https://pub-1390981b409c46698da5dc6c45e08eaa.r2.dev/product/SJ10-285129/SJ10-285129-1-20260201-072541.webp";

export default function SignupPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({ fullName: '', brandName: '', email: '', password: '', confirmPassword: '' });
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({ pass: false, confirm: false });
  const [profilePicPreview, setProfilePicPreview] = useState(DEFAULT_PROFILE_PIC_URL); // <-- IT IS USED HERE
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAuthUrl = () => (process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004').replace(/\/$/, '').replace(/\/api$/, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      setIsSuccess(true);
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
    onError: () => setError("Google Signup Failed"),
  });

  const onFacebookSuccess = async (response: any) => {
    if (response.accessToken) {
      setLoading(true); setError('');
      try {
        const res = await fetch(`${getAuthUrl()}/auth/user/facebook`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: response.accessToken, userID: response.userID })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        await login(data.token);
      } catch (err: any) { setError("Facebook Signup Failed."); } 
      finally { setLoading(false); }
    }
  };

  const closePopupAndLogin = async () => {
    setIsSuccess(false);
    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      await login(data.token);
    } catch { router.push('/auth/login'); }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)', padding: '20px 10px', fontFamily: "'Poppins', sans-serif" },
    card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '460px', textAlign: 'center', boxSizing: 'border-box' },
    benefitsHeader: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '25px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' },
    benefitItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '12px', fontWeight: '500' },
    title: { fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '20px' },
    profilePicContainer: { position: 'relative', width: '100px', height: '100px', margin: '0 auto 20px auto', cursor: 'pointer' },
    profilePic: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    profilePicOverlay: { position: 'absolute', bottom: '0px', right: '0px', backgroundColor: '#2563eb', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid white' },
    inputWrapper: { position: 'relative', marginBottom: '15px' },
    inputIcon: { position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#9ca3af' },
    input: { width: '100%', padding: '14px 45px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', backgroundColor: '#f9fafb', boxSizing: 'border-box' },
    passwordIcon: { position: 'absolute', top: '50%', right: '15px', transform: 'translateY(-50%)', color: '#9ca3af', cursor: 'pointer' },
    button: { width: '100%', padding: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '10px', transition: 'transform 0.1s ease' },
    error: { color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '10px', marginBottom: '15px', fontSize: '14px' },
    footerText: { marginTop: '20px', fontSize: '14px', color: '#6b7280' },
    link: { color: '#2563eb', fontWeight: '600' },
    divider: { display: 'flex', alignItems: 'center', margin: '20px 0', color: '#9ca3af' },
    line: { flex: 1, height: '1px', backgroundColor: '#e5e7eb' },
    socialBtn: { width: '100%', padding: '12px', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s ease' }
  };
  
  return (
    <>
      <style>{`.button-active:active { transform: scale(0.98); } .social-btn-hover:hover { border-color: #9ca3af; background-color: #f9fafb; }`}</style>
      <div style={styles.container}>
        {isSuccess && <SuccessPopup message="Account Created Successfully!" onClose={closePopupAndLogin} />}
        <div style={styles.card}>
          <div style={styles.benefitsHeader}>
            <div style={styles.benefitItem}><FaShippingFast size={20} color="#f97316" /><span>Fast Delivery</span></div>
            <div style={styles.benefitItem}><FaTags size={20} color="#f97316" /><span>Best Prices</span></div>
            <div style={styles.benefitItem}><FaShieldAlt size={20} color="#f97316" /><span>Secure Signup</span></div>
          </div>
          <h1 style={styles.title}>Create Your SJ10 Account</h1>
          <div style={styles.profilePicContainer} onClick={() => fileInputRef.current?.click()}>
            <img src={profilePicPreview} alt="Profile" style={styles.profilePic} />
            <div style={styles.profilePicOverlay}><FaCamera /></div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={styles.inputWrapper}><FaUser style={styles.inputIcon} /><input name="fullName" placeholder="Full Name" style={styles.input} onChange={handleChange} required /></div>
            <div style={styles.inputWrapper}><FaStore style={styles.inputIcon} /><input name="brandName" placeholder="Brand Name (Optional)" style={styles.input} onChange={handleChange} /></div>
            <div style={styles.inputWrapper}><FaEnvelope style={styles.inputIcon} /><input name="email" type="email" placeholder="Email Address" style={styles.input} onChange={handleChange} required /></div>
            <PhoneInput country={'pk'} value={phone} onChange={setPhone} containerStyle={{ marginBottom: '15px' }} inputStyle={{...styles.input, paddingLeft: '50px', width: '100%'}} />
            <div style={styles.inputWrapper}><FaLock style={styles.inputIcon} /><input name="password" type={passwordVisibility.pass ? 'text' : 'password'} placeholder="Password" style={styles.input} onChange={handleChange} required /><div style={styles.passwordIcon} onClick={() => setPasswordVisibility(p => ({...p, pass: !p.pass}))}>{passwordVisibility.pass ? <FaEyeSlash /> : <FaEye />}</div></div>
            <div style={styles.inputWrapper}><FaLock style={styles.inputIcon} /><input name="confirmPassword" type={passwordVisibility.confirm ? 'text' : 'password'} placeholder="Confirm Password" style={styles.input} onChange={handleChange} required /><div style={styles.passwordIcon} onClick={() => setPasswordVisibility(p => ({...p, confirm: !p.confirm}))}>{passwordVisibility.confirm ? <FaEyeSlash /> : <FaEye />}</div></div>
            <button type="submit" style={styles.button} className="button-active" disabled={loading}>{loading ? 'Creating...' : 'CREATE ACCOUNT'}</button>
          </form>
          <div style={styles.divider}><div style={styles.line}></div><span>Or</span><div style={styles.line}></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <button style={styles.socialBtn} className="social-btn-hover" onClick={() => handleGoogleClick()} disabled={loading}><FaGoogle color="#DB4437" /> Google</button>
           <FacebookLogin
  appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''}
  onSuccess={onFacebookSuccess}
  onFail={(err) => setError("Facebook Signup Failed.")}
  render={({ onClick }) => (
    <button 
      style={styles.socialBtn} 
      className="social-btn-hover" 
      onClick={onClick} 
      disabled={loading} // Use your local loading state
    >
      <FaFacebook color="#1877F2" /> Facebook
    </button>
  )}
/>
          </div>
          <p style={styles.footerText}>Already have an account? <Link href="/auth/login" style={styles.link}>Login</Link></p>
        </div>
      </div>
    </>
  );
}