// src/components/AuthForm.tsx (FINAL, CORRECTED VERSION)
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider'; // Import the named export
import Image from 'next/image';

// NOTE: You will need to re-add your 'pakistaniCities' import and 'styles' const
// from your original file if they are not in a separate file.

export default function AuthForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  // (Your other state variables like isPasswordVisible, brandName, city, etc.)
  const AUTH_BASE_URL = process.env.NEXT_PUBLIC_ORDER_API_URL?.replace(/\/api\/?$/, '') || '';
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${AUTH_BASE_URL}/auth/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      await login(data.token); // Call the login function from context

    } catch (error: any) {
      setError(error.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${AUTH_BASE_URL}/auth/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: `${firstName} ${lastName}`,
          email,
          password,
          phone
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // After successful registration, automatically log in
      await handleLogin();
      
    } catch (error: any) {
      setError(error.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // --- JSX (LOGIN VIEW) ---
  if (isLoginView) {
    return (
      <div className="auth-container">
        {/* Your entire Login JSX goes here. It should work without changes. */}
        <h3>Login to your Account</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="form-group">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button onClick={handleLogin} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <p className="auth-toggle" onClick={() => setIsLoginView(false)}>Don't have an account? Sign Up</p>
      </div>
    );
  }

  // --- JSX (SIGNUP VIEW) ---
  return (
    <div className="auth-container">
      {/* Your entire "beautiful" Signup JSX goes here. It should work as long as the `onChange` handlers are correct. */}
      <h3>Create Your Account</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="form-group">
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </div>
       <div className="form-group">
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
       <div className="form-group">
          <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="form-group">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button onClick={handleSignup} disabled={loading}>{loading ? 'Creating Account...' : 'Sign Up'}</button>
      <p className="auth-toggle" onClick={() => setIsLoginView(true)}>Already have an account? Login</p>
    </div>
  );
}