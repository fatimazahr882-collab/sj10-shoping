"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { 
  FaGoogle, FaFacebook, FaEnvelope, FaLock, FaEye, FaEyeSlash, 
  FaCheckCircle, FaShoppingBag, FaShippingFast, FaShieldAlt, FaMapMarkerAlt, FaWhatsapp
} from 'react-icons/fa';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  // --- STEPS: 'login' -> 'google_phone' -> 'google_otp' ---
  const [step, setStep] = useState<'login' | 'google_phone' | 'google_otp'>('login');
  const [googleEmail, setGoogleEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getAuthUrl = () => (process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004').replace(/\/$/, '').replace(/\/api$/, '');

  const handleLoginSuccess = async (token: string) => {
    setIsSuccess(true);
    setTimeout(async () => {
      await login(token);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true); setError('');
    try {
      const res = await fetch(`${getAuthUrl()}/auth/user/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await handleLoginSuccess(data.token);
    } catch (err: any) { setError(err.message); setLoading(false); } 
  };

  // 🟢 GOOGLE LOGIN: AGAR NUMBER NA HO TO USI CARD MEIN WHATSAPP NUMBER MANGO
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

        // 🛑 Number nahi hai toh WhatsApp phone step par le jao
        if (data.requiresPhone) {
            setGoogleEmail(data.email);
            setStep('google_phone');
            setLoading(false);
            return;
        }

        await handleLoginSuccess(data.token);
      } catch (err: any) { setError("Google Login Failed."); setLoading(false); } 
    },
    onError: () => setError("Google Login Failed"),
  });

  // 🟢 GOOGLE USER SUBMITS WHATSAPP NUMBER
  const handleSendGoogleWhatsAppOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true); setError('');
      try {
          const res = await fetch(`${getAuthUrl()}/auth/user/google-phone-otp`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: googleEmail, phone })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          
          setStep('google_otp');
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  // 🟢 1-TAP PASTE FEATURE
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // 🟢 VERIFY GOOGLE OTP
  const handleVerifyGoogleOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      const otpString = otp.join('');
      if (otpString.length < 6) return setError("Please enter the full 6-digit code.");

      setLoading(true); setError('');
      try {
          const res = await fetch(`${getAuthUrl()}/auth/user/verify-email`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: googleEmail, otp: otpString })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          await handleLoginSuccess(data.token);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

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
        await handleLoginSuccess(data.token);
      } catch (err: any) { setError("Facebook Login Failed."); setLoading(false); } 
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .otp-input { width: 45px; height: 55px; font-size: 22px; font-weight: 700; text-align: center; border-radius: 12px; border: 2px solid #e5e7eb; outline: none; background: #f8fafc; color: #25D366; transition: 0.2s; }
        .otp-input:focus { border-color: #25D366 !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(37, 211, 102, 0.1); }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', padding: '20px', fontFamily: "'Poppins', sans-serif" }}>
        
        {isSuccess && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <FaCheckCircle size={60} color="#22c55e" style={{ marginBottom: '15px' }} />
              <h2 style={{ margin: 0, color: '#111827', fontWeight: 700 }}>Login Successful!</h2>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>Redirecting to SJ10...</p>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', width: '100%', maxWidth: '440px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          
          {error && <p style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', border: '1px solid #fee2e2' }}>⚠️ {error}</p>}

          {/* ========================================================= */}
          {/* STEP 1: NORMAL LOGIN SCREEN                               */}
          {/* ========================================================= */}
          {step === 'login' && (
            <>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#111827', margin: '0 0 5px' }}>Welcome Back</h1>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '25px' }}>Sign in to your SJ10 account</p>

              <form onSubmit={handleSubmit}>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <FaEnvelope style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <FaLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '14px 44px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }} />
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af' }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  {loading ? 'Signing in...' : 'Sign In Securely'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0', color: '#9ca3af', fontSize: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                <span style={{ padding: '0 10px' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              </div>

              <button onClick={() => handleGoogleClick()} disabled={loading} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '600', color: '#374151' }}>
                <FaGoogle color="#DB4437" /> Continue with Google
              </button>

              <p style={{ marginTop: '25px', fontSize: '13px', color: '#6b7280' }}>
                New to SJ10? <Link href="/auth/signup" style={{ color: '#2563eb', fontWeight: '700' }}>Create an Account</Link>
              </p>
            </>
          )}

          {/* ========================================================= */}
          {/* STEP 2: GOOGLE USER -> WHATSAPP NUMBER SCREEN             */}
          {/* ========================================================= */}
          {step === 'google_phone' && (
            <>
              <div style={{ width: '65px', height: '65px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <FaWhatsapp size={35} color="#25D366" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>WhatsApp Verification</h2>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '25px' }}>
                Please enter your active WhatsApp number to complete registration.
              </p>

              <form onSubmit={handleSendGoogleWhatsAppOtp}>
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <FaWhatsapp style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#25D366', fontSize: '20px' }} />
                  <input 
                    type="tel" 
                    placeholder="WhatsApp Number (e.g. 03368361990)" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    maxLength={13} 
                    required 
                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1.5px solid #25D366', outline: 'none', boxSizing: 'border-box', fontSize: '15px' }} 
                  />
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: '#25D366', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)' }}>
                  {loading ? 'Sending Code...' : 'Send WhatsApp OTP'}
                </button>
              </form>
            </>
          )}

          {/* ========================================================= */}
          {/* STEP 3: 1-TAP PASTE OTP VERIFICATION SCREEN               */}
          {/* ========================================================= */}
          {step === 'google_otp' && (
            <>
              <div style={{ width: '65px', height: '65px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <FaWhatsapp size={35} color="#25D366" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>Verify WhatsApp</h2>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '25px' }}>
                We sent a 6-digit code on WhatsApp to <br/><strong>{phone}</strong>
              </p>

              <form onSubmit={handleVerifyGoogleOtp}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '25px' }}>
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
                      onPaste={handleOtpPaste} // 🟢 1-TAP PASTE FEATURE
                      className="otp-input"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: '#25D366', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>

              <p style={{ marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
                Wrong number? <span onClick={() => setStep('google_phone')} style={{ color: '#25D366', fontWeight: '700', cursor: 'pointer' }}>Change Number</span>
              </p>
            </>
          )}

        </div>
      </div>
    </>
  );
}