"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ==========================================================
    //  THE FIX IS HERE
    // ==========================================================
    // This helper function removes the '/api' part from the URL,
    // so it correctly calls http://localhost:4004/auth/user/forgot-password
    const getAuthUrl = () => {
        const apiUrl = process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:4004';
        return apiUrl.replace(/\/$/, '').replace(/\/api$/, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const baseUrl = getAuthUrl();

        try {
             const res = await fetch(`${baseUrl}/auth/user/forgot-password`, { // <-- Use the corrected URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
             });
             const data = await res.json();
             
             if(!res.ok) throw new Error(data.message);
             
             setMessage("✅ Recovery link has been sent! Please check your email inbox and spam folder.");
        } catch(e: any) {
            setError(e.message || "Failed to send link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- INTERNAL STYLES (Kept the beautiful UI) ---
    const styles: { [key: string]: React.CSSProperties } = {
        container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6', fontFamily: "'Segoe UI', sans-serif", padding: '20px' },
        card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' as const, },
        icon: { fontSize: '40px', marginBottom: '15px' },
        title: { fontSize: '22px', fontWeight: 'bold', color: '#111', marginBottom: '10px' },
        text: { color: '#666', fontSize: '14px', marginBottom: '25px', lineHeight: '1.5' },
        input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px', fontSize: '15px' },
        button: { width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', },
        success: { backgroundColor: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' },
        error: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' },
        backLink: { display: 'block', marginTop: '20px', color: '#666', textDecoration: 'none', fontSize: '13px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.icon}>🔐</div>
                <h2 style={styles.title}>Forgot Your Password?</h2>
                <p style={styles.text}>No problem! Enter your email below and we will send you a link to reset it.</p>

                {message && <div style={styles.success}>{message}</div>}
                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input style={styles.input} type="email" placeholder="example@gmail.com" required value={email} onChange={e => setEmail(e.target.value)} />
                    <button style={styles.button} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Recovery Link'}
                    </button>
                </form>

                <Link href="/auth/login" style={styles.backLink}>
                    ← Back to Login
                </Link>
            </div>
        </div>
    );
}