"use client";

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthProvider';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { login } = useAuth();
  
  const[isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const[password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const[showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation & Feedback States
  const[error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const getAuthUrl = () => (process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004').replace(/\/$/, '').replace(/\/api$/, '');

  // Triggers the beautiful animated toast and safely closes the modal
  const triggerSuccessAndClose = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
      onClose(); // Auto close the modal after 1.5 seconds
    }, 1500);
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
        triggerSuccessAndClose("Successfully Logged In with Google! 🎉");
      } catch (err: any) { setError("Google Login Failed."); } 
      finally { setLoading(false); }
    },
    onError: () => setError("Google Login error. Please try again.")
  });
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    
    // Validations for Sign Up
    if (!isLoginView) {
      if (password !== confirmPassword) {
        setError("Passwords do not match!");
        setLoading(false);
        return;
      }
      
      // Strict Pakistani Phone Validation
      const phoneRegex = /^03\d{9}$/;
      if (!phoneRegex.test(phone)) {
        setError("Invalid Phone! Must be 11 digits starting with 03 (e.g. 03001234567)");
        setLoading(false);
        return;
      }
    }

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
        // Auto Login after successful signup
        const loginRes = await fetch(`${getAuthUrl()}/auth/user/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error("Signup successful, but auto-login failed.");
        
        await login(loginData.token);
        triggerSuccessAndClose("Account Successfully Created! 🎉");
      } else {
        await login(data.token);
        triggerSuccessAndClose("Successfully Logged In! 🎉");
      }
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={!toastMessage ? onClose : undefined}>
        
        {/* BEAUTIFUL SUCCESS TOAST (Replaces the form instantly on success) */}
        {toastMessage && (
          <div className="success-toast">
            <div className="toast-icon-circle"><i className="fas fa-check"></i></div>
            <div className="toast-text">{toastMessage}</div>
          </div>
        )}

        {/* MAIN FORM MODAL (Hidden while toast is showing) */}
        {!toastMessage && (
          <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={onClose}><i className="fas fa-times"></i></button>
            
            <h2 className="title">{isLoginView ? 'Welcome to SJ10' : 'Create an Account'}</h2>
            <p className="subtitle">{isLoginView ? 'Login with your email & password' : 'Join Pakistan\'s #1 Marketplace'}</p>

            {error && <div className="error-box"><i className="fas fa-exclamation-circle"></i> {error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLoginView && (
                <>
                  <div className="input-group">
                    <i className="fas fa-user input-icon"></i>
                    <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <i className="fas fa-phone-alt input-icon"></i>
                    <input type="tel" placeholder="Phone (e.g. 03001234567)" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={11} required />
                  </div>
                </>
              )}
              
              <div className="input-group">
                <i className="fas fa-envelope input-icon"></i>
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="password-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input type={showPassword ? "text" : "password"} placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} eye-icon`} onClick={() => setShowPassword(!showPassword)}></i>
              </div>

              {!isLoginView && (
                <div className="password-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} eye-icon`} onClick={() => setShowConfirmPassword(!showConfirmPassword)}></i>
                </div>
              )}

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : (isLoginView ? 'LOGIN' : 'CREATE ACCOUNT')}
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
        )}
      </div>

      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(10, 30, 64, 0.7); z-index: 100000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
        .auth-modal-content { background: white; padding: 35px; border-radius: 16px; width: 90%; max-width: 400px; position: relative; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
        
        /* BEAUTIFUL SUCCESS TOAST */
        .success-toast {
          background: linear-gradient(135deg, #1E3A8A 0%, #f85606 100%);
          padding: 20px 40px; border-radius: 50px;
          display: flex; align-items: center; gap: 15px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
          animation: dropDownToast 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .toast-icon-circle { width: 36px; height: 36px; background: white; color: #f85606; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 18px; }
        .toast-text { color: white; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; }

        .close-button { position: absolute; top: 15px; right: 15px; background: #f1f5f9; border: none; font-size: 16px; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #64748b; transition: 0.2s; }
        .close-button:hover { background: #fef2f2; color: #dc2626; }

        .title { font-size: 26px; font-weight: 800; color: #1e293b; margin: 0 0 5px 0; text-align: center; letter-spacing: -0.5px; }
        .subtitle { font-size: 14px; color: #64748b; text-align: center; margin-bottom: 25px; }
        
        .auth-form { display: flex; flex-direction: column; gap: 14px; }
        
        /* Inputs */
        .input-group, .password-wrapper { position: relative; width: 100%; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 15px; }
        .auth-form input {
          width: 100%; padding: 14px 14px 14px 44px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; transition: 0.2s; box-sizing: border-box; background: #f8fafc; color: #1e293b; font-weight: 500;
        }
        .auth-form input:focus { border-color: #f85606; background: white; box-shadow: 0 0 0 4px rgba(248, 86, 6, 0.1); }
        .password-wrapper input { padding-right: 44px; }
        .eye-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; cursor: pointer; transition: 0.2s; }
        .eye-icon:hover { color: #f85606; }

        /* Buttons */
        .primary-btn { width: 100%; background: linear-gradient(90deg, #f85606, #ff8a00); color: white; padding: 15px; border: none; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(248, 86, 6, 0.3); margin-top: 5px; }
        .primary-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(248, 86, 6, 0.4); }
        .primary-btn:active { transform: scale(0.98); }

        /* Social */
        .divider { text-align: center; margin: 25px 0; border-bottom: 1px solid #e2e8f0; line-height: 0.1em; }
        .divider span { background: #fff; padding: 0 10px; color: #94a3b8; font-size: 12px; font-weight: 600; }
        .google-btn { 
            width: 100%; background: white; border: 1px solid #e2e8f0; padding: 14px; border-radius: 10px;
            font-weight: 600; color: #334155; display: flex; justify-content: center; align-items: center; 
            gap: 10px; cursor: pointer; transition: all 0.2s; font-size: 14px;
        }
        .google-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: #cbd5e1; }
        .google-btn i { color: #DB4437; font-size: 18px; }

        .toggle-text { text-align: center; font-size: 14px; margin-top: 25px; color: #64748b; font-weight: 500; }
        .toggle-text span { color: #f85606; font-weight: 700; cursor: pointer; text-decoration: underline transparent; transition: 0.2s; }
        .toggle-text span:hover { text-decoration-color: #f85606; }

        /* Error Box */
        .error-box { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; font-weight: 500; line-height: 1.4; }

        /* Animations */
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes dropDownToast { from { transform: translateY(-30px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
    </>
  );
}