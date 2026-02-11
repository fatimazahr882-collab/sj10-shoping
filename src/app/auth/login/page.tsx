"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { 
  FaGoogle, FaFacebook, FaEnvelope, FaLock, FaEye, FaEyeSlash, 
  FaCheckCircle, FaShoppingBag, FaShippingFast, FaShieldAlt, FaMapMarkerAlt 
} from 'react-icons/fa';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getAuthUrl = () => (process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004').replace(/\/$/, '').replace(/\/api$/, '');

  const handleLoginSuccess = async (token: string) => {
    setIsSuccess(true);
    // Smooth delay to show success animation before routing
    setTimeout(async () => {
      await login(token);
    }, 1800);
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
        await handleLoginSuccess(data.token);
      } catch (err: any) { setError("Google Login Failed."); setLoading(false); } 
    },
    onError: () => setError("Google Login Failed"),
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
        await handleLoginSuccess(data.token);
      } catch (err: any) { setError("Facebook Login Failed."); setLoading(false); } 
    }
  };

  // --- STYLES & THEME ---
  const styles: { [key: string]: React.CSSProperties } = {
    container: { 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      // Advanced Mesh Gradient Background
      background: 'radial-gradient(at 0% 0%, hsla(213,94%,88%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(27,100%,92%,1) 0, transparent 50%), #ffffff',
      fontFamily: "'Poppins', sans-serif",
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    },
    
    // Animated Hero Section (Top)
    heroSection: {
      textAlign: 'center',
      marginBottom: '35px',
      animation: 'fadeInDown 0.8s ease-out forwards',
      zIndex: 2
    },
    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'white',
      padding: '8px 20px',
      borderRadius: '50px',
      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.15)',
      color: '#2563eb', // Blue
      fontWeight: '600',
      fontSize: '0.85rem',
      marginBottom: '20px',
      border: '1px solid #e0f2fe'
    },
    iconsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '30px',
      marginBottom: '15px'
    },
    heroTitle: {
      fontSize: '2.2rem',
      fontWeight: '800',
      color: '#1e293b',
      letterSpacing: '-1px',
      margin: '0 0 5px 0',
      background: 'linear-gradient(to right, #1e3a8a, #ea580c)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },

    // Main Card
    card: { 
      backgroundColor: 'rgba(255, 255, 255, 0.85)', 
      backdropFilter: 'blur(20px)',
      padding: '45px', 
      borderRadius: '32px', 
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', 
      width: '100%', 
      maxWidth: '460px', 
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      animation: 'slideUp 0.8s ease-out forwards',
      animationDelay: '0.2s',
      opacity: 0, // Starts invisible for animation
      position: 'relative',
      zIndex: 10
    },
    title: { fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '8px' },
    subtitle: { fontSize: '0.95rem', color: '#6b7280', marginBottom: '30px' },
    
    // Inputs
    inputGroup: { position: 'relative', marginBottom: '20px', textAlign: 'left' },
    inputIcon: { position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '18px', zIndex: 2 },
    eyeIcon: { position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', color: '#9ca3af', cursor: 'pointer', zIndex: 2, padding: '5px' },
    input: { 
      width: '100%', 
      padding: '16px 55px', 
      borderRadius: '16px', 
      border: '2px solid #e5e7eb', 
      fontSize: '1rem', 
      outline: 'none', 
      backgroundColor: '#f9fafb', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: '#1f2937',
      fontWeight: '500'
    },
    
    // Forgot Password
    forgotContainer: { display: 'flex', justifyContent: 'flex-end', marginTop: '-8px', marginBottom: '25px' },
    forgotLink: { color: '#f97316', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none', transition: 'color 0.2s' },

    // Primary Button
    button: { 
      width: '100%', 
      padding: '18px', 
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
      color: 'white', 
      border: 'none', 
      borderRadius: '16px', 
      fontSize: '1.1rem', 
      fontWeight: '600', 
      cursor: 'pointer', 
      boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    
    // Divider
    divider: { display: 'flex', alignItems: 'center', margin: '30px 0', color: '#9ca3af', fontSize: '13px', fontWeight: '500' },
    line: { flex: 1, height: '1px', backgroundColor: '#e5e7eb' },
    
    // Social Buttons Area
    socialGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    
    // Google
    googleBtn: { 
      width: '100%', padding: '15px', border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: '14px', cursor: 'pointer', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#374151', fontWeight: '600', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'all 0.3s ease' 
    },
    // Facebook
    fbBtn: { 
      width: '100%', padding: '15px', border: 'none', backgroundColor: '#1877F2', borderRadius: '14px', cursor: 'pointer', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#fff', fontWeight: '600', 
      boxShadow: '0 4px 6px -1px rgba(24, 119, 242, 0.25)', transition: 'all 0.3s ease' 
    },

    footerText: { marginTop: '30px', fontSize: '14px', color: '#6b7280' },
    link: { color: '#2563eb', fontWeight: '700', textDecoration: 'none' },
    error: { color: '#ef4444', backgroundColor: '#fef2f2', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },

    // Popup
    popupOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    popupCard: { backgroundColor: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', textAlign: 'center', border: '2px solid #22c55e', animation: 'zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
  };

  return (
    <>
      {/* Import Poppins Font & CSS Animations */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
        @keyframes pulse-soft { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

        .btn-hover:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.3); }
        .btn-active:active { transform: scale(0.97); }
        .social-hover:hover { transform: translateY(-3px); }
        
        .input-focus:focus { border-color: #2563eb !important; background-color: #fff !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        
        .float-anim-1 { animation: float 4s ease-in-out infinite; color: #f97316; font-size: 2.2rem; }
        .float-anim-2 { animation: float 4s ease-in-out infinite 1.5s; color: #2563eb; font-size: 2.2rem; }
        .float-anim-3 { animation: float 4s ease-in-out infinite 0.5s; color: #10b981; font-size: 2.2rem; }
        
        .link-anim:hover { color: #ea580c !important; text-decoration: underline; }
      `}</style>

      <div style={styles.container}>
        
        {/* Success Popup */}
        {isSuccess && (
          <div style={styles.popupOverlay}>
            <div style={styles.popupCard}>
              <FaCheckCircle size={65} color="#22c55e" style={{marginBottom: '15px', animation: 'pulse-soft 1s infinite'}} />
              <h2 style={{margin: '0 0 10px', color:'#111827', fontWeight: 700}}>Login Successful!</h2>
              <p style={{color:'#6b7280', margin: 0}}>Redirecting to marketplace...</p>
            </div>
          </div>
        )}

        {/* Hero Content - Animated */}
        <div style={styles.heroSection}>
          <div style={styles.iconsContainer}>
            <FaShoppingBag className="float-anim-1" />
            <FaShieldAlt className="float-anim-2" />
            <FaShippingFast className="float-anim-3" />
          </div>
          <div style={styles.heroBadge}>
            <FaMapMarkerAlt size={14} /> <span>Trusted Across Pakistan</span>
          </div>
          <h1 style={styles.heroTitle}>Premium Shopping</h1>
          <p style={{color: '#64748b', fontSize: '1rem', marginTop: '5px'}}>
            Your world of fashion & tech awaits.
          </p>
        </div>

        {/* Login Card */}
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Please enter your details to sign in.</p>

          {error && <p style={styles.error}>⚠️ {error}</p>}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <FaEnvelope style={styles.inputIcon} />
              <input 
                type="email" 
                style={styles.input} 
                className="input-focus"
                placeholder="Email Address" 
                required 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>

            <div style={styles.inputGroup}>
              <FaLock style={styles.inputIcon} />
              <input 
                type={showPassword ? "text" : "password"} 
                style={styles.input} 
                className="input-focus"
                placeholder="Password" 
                required 
                onChange={e => setPassword(e.target.value)} 
              />
              <div style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </div>
            </div>

            <div style={styles.forgotContainer}>
              <Link href="/auth/forgot-password" style={styles.forgotLink} className="link-anim">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" style={styles.button} className="btn-hover btn-active" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In Securely'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.line}></div>
            <span style={{padding: '0 15px'}}>Or continue with</span>
            <div style={styles.line}></div>
          </div>

          <div style={styles.socialGrid}>
            <button 
              style={styles.googleBtn} 
              className="social-hover btn-active" 
              onClick={() => handleGoogleClick()} 
              disabled={loading}
            >
              <FaGoogle size={20} color="#DB4437" /> 
              <span>Google</span>
            </button>

            <FacebookLogin
              appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''}
              onSuccess={onFacebookSuccess}
              onFail={(err) => setError("Facebook Login Failed.")}
              render={({ onClick }) => (
                <button 
                  // MERGED STYLE PROP HERE TO FIX RED LINE ERROR
                  style={{...styles.fbBtn}} 
                  className="social-hover btn-active" 
                  onClick={onClick} 
                  disabled={loading}
                >
                  <FaFacebook size={20} color="#fff" /> 
                  <span>Facebook</span>
                </button>
              )}
            />
          </div>

          <p style={styles.footerText}>
            New to SJ10? <Link href="/auth/signup" style={styles.link} className="link-anim">Create an Account</Link>
          </p>
        </div>
      </div>
    </>
  );
}