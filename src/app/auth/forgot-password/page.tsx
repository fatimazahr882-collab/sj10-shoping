"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
    // UI State
    const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
    
    // Data State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');

    // General State
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (step === 'otp') {
            otpRefs.current[0]?.focus();
        }
    }, [step]);
    
    // ==========================================================
    // ✅ THE FIX IS HERE: Re-added the .replace() to handle the /api prefix
    // ==========================================================
    const getAuthUrl = () => {
        const apiUrl = process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004';
        return apiUrl.replace(/\/$/, '').replace(/\/api$/, '');
    };

    // STEP 1: Send OTP to Email
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setMessage('');
        try {
             const res = await fetch(`${getAuthUrl()}/auth/user/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
             });
             const data = await res.json();
             if(!res.ok) throw new Error(data.message);
             setStep('otp');
        } catch(e: any) {
            setError(e.message || "Failed to send code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        if(otpString.length < 6) return setError("Please enter the full 6-digit code.");
        
        setLoading(true); setError(''); setMessage('');
        try {
            const res = await fetch(`${getAuthUrl()}/auth/user/verify-reset-otp`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpString })
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.message);
            
            setResetToken(data.resetToken);
            setStep('reset');

        } catch(e: any) {
            setError(e.message || "Verification failed. Please check the code.");
        } finally {
            setLoading(false);
        }
    };
    
    // STEP 3: Reset the Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return setError("Passwords do not match.");
        
        setLoading(true); setError(''); setMessage('');
        try {
            const res = await fetch(`${getAuthUrl()}/auth/user/reset-password`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword, confirmPassword })
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.message);
            
            setMessage("✅ Password reset successful! Redirecting to login...");
            setTimeout(() => router.push('/auth/login'), 2500);

        } catch(e: any) {
            setError(e.message || "Failed to reset password. Session may have expired.");
        } finally {
            setLoading(false);
        }
    };
    
    // OTP Input Handlers
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

    const styles: { [key: string]: React.CSSProperties } = {
        container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6', fontFamily: "'Segoe UI', sans-serif", padding: '20px' },
        card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px', textAlign: 'center' as const, },
        icon: { fontSize: '40px', marginBottom: '15px' },
        title: { fontSize: '22px', fontWeight: 'bold', color: '#111', marginBottom: '10px' },
        text: { color: '#666', fontSize: '14px', marginBottom: '25px', lineHeight: '1.5' },
        input: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px', fontSize: '15px', textAlign: 'left' as 'left' },
        button: { width: '100%', padding: '14px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' },
        success: { backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', fontWeight: 500 },
        error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', fontWeight: 500 },
        backLink: { display: 'block', marginTop: '20px', color: '#666', textDecoration: 'none', fontSize: '13px' },
        otpContainer: { display: 'flex', justifyContent: 'center', gap: '10px', margin: '30px 0' },
        otpInput: { width: '50px', height: '60px', fontSize: '24px', fontWeight: '700', textAlign: 'center', borderRadius: '12px', border: '2px solid #e5e7eb', outline: 'none', backgroundColor: '#f8fafc', color: '#f97316', transition: '0.2s' },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                
                {message && <div style={styles.success}>{message}</div>}
                {error && <div style={styles.error}>{error}</div>}

                {/* STEP 1: ENTER EMAIL */}
                {step === 'email' && (
                    <>
                        <div style={styles.icon}>🔐</div>
                        <h2 style={styles.title}>Forgot Your Password?</h2>
                        <p style={styles.text}>No problem! Enter your email below and we will send you a 6-digit code to reset it.</p>
                        <form onSubmit={handleSendOtp}>
                            <input style={styles.input} type="email" placeholder="example@gmail.com" required value={email} onChange={e => setEmail(e.target.value)} />
                            <button style={styles.button} disabled={loading}>{loading ? 'Sending...' : 'Send Recovery Code'}</button>
                        </form>
                    </>
                )}

                {/* STEP 2: VERIFY OTP */}
                {step === 'otp' && (
                    <>
                        <div style={styles.icon}>✉️</div>
                        <h2 style={styles.title}>Check Your Email</h2>
                        <p style={styles.text}>We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below.</p>
                        <form onSubmit={handleVerifyOtp}>
                            <div style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <input key={index} ref={el => { otpRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleOtpChange(index, e.target.value)} onKeyDown={e => handleOtpKeyDown(index, e)} style={styles.otpInput} autoFocus={index === 0} />
                                ))}
                            </div>
                            <button style={styles.button} disabled={loading}>{loading ? 'Verifying...' : 'Verify Code'}</button>
                        </form>
                    </>
                )}

                {/* STEP 3: RESET PASSWORD */}
                {step === 'reset' && (
                    <>
                        <div style={styles.icon}>🔑</div>
                        <h2 style={styles.title}>Create New Password</h2>
                        <p style={styles.text}>Your new password must be secure and different from previous passwords.</p>
                        <form onSubmit={handleResetPassword}>
                            <input style={styles.input} type="password" placeholder="New Password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            <input style={styles.input} type="password" placeholder="Confirm New Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            <button style={styles.button} disabled={loading}>{loading ? 'Saving...' : 'Reset Password'}</button>
                        </form>
                    </>
                )}

                {!message && <Link href="/auth/login" style={styles.backLink}>← Back to Login</Link>}
            </div>
        </div>
    );
}