"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; 
import apiClient from '@/lib/apiClient';
import { BANK_LIST } from '@/lib/bankList';

const s = {
  page: { background: '#F0F4F8', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  header: {
    backgroundColor: '#fff',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky' as 'sticky',
    top: 0,
    zIndex: 50,
    borderBottom: '1px solid #E2E8F0',
  },
  headerTitle: { flex: 1, textAlign: 'center' as 'center', fontSize: '17px', fontWeight: '700', color: '#0F172A', marginRight: '40px' },
  backBtn: { fontSize: '18px', color: '#0F172A', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9' },
  
  container: { padding: '30px 20px', maxWidth: '480px', margin: '0 auto' },
  
  // Brand Header
  brandBox: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    marginBottom: '30px',
  },
  logoContainer: {
    width: '100px', height: '100px', borderRadius: '20px',
    background: '#fff', padding: '15px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  logo: { width: '100%', height: '100%', objectFit: 'contain' as 'contain' },
  title: { fontSize: '22px', fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: '14px', color: '#64748B', marginTop: '4px' },

  // Form
  form: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' },
  inputWrap: { position: 'relative' as 'relative' },
  inputIcon: { position: 'absolute' as 'absolute', left: '16px', top: '16px', color: '#94A3B8' },
  input: {
    width: '100%',
    padding: '14px 16px 14px 44px',
    borderRadius: '12px',
    border: '2px solid #E2E8F0',
    fontSize: '15px',
    color: '#0F172A',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#F8FAFC',
    fontWeight: '500'
  },

  // Submit
  btn: {
    width: '100%',
    backgroundColor: '#FF7F00', // Brand Orange
    color: '#fff',
    padding: '16px',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 12px rgba(255, 127, 0, 0.3)',
    transition: 'transform 0.1s',
  },
  
  errorMsg: {
    backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444',
    padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px',
    display: 'flex', alignItems: 'center', gap: '8px'
  }
};

export default function AddProviderPage() {
  const router = useRouter();
  const params = useParams();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({ name: '', number: '', iban: '' });

  useEffect(() => { if (params) setReady(true); }, [params]);

  if (!ready) return null;

  const bankConfig = BANK_LIST.find(b => b.id === params?.provider);
  if (!bankConfig) return <div style={{padding:'40px',textAlign:'center'}}>Provider Not Found</div>;

  const { name: providerName, logo, type } = bankConfig;
  const isWallet = type === 'wallet';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if(!form.name || !form.number) {
        setError("Please fill required fields.");
        return;
    }
    if(!isWallet && !form.iban) {
        setError("IBAN is required for bank accounts.");
        return;
    }

    setLoading(true);
    try {
        await apiClient('/wallet/payment-methods', 'POST', {
            provider_name: providerName,
            account_holder_name: form.name,
            account_number: form.number,
            iban: form.iban || null
        });
        router.push('/profile/profit-account');
    } catch (err: any) {
        setError(err.message || 'Failed to save');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <style jsx>{`
        input:focus { border-color: #FF7F00 !important; background: #fff !important; }
        .btn-anim:active { transform: scale(0.98); }
        .slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={s.header}>
        <Link href="/profile/profit-account/add" style={s.backBtn}><i className="fas fa-arrow-left"></i></Link>
        <span style={s.headerTitle}>Add Details</span>
      </div>

      <div style={s.container} className="slide-up">
        
        <div style={s.brandBox}>
            <div style={s.logoContainer}>
                <img src={logo} alt={providerName} style={s.logo} />
            </div>
            <div style={s.title}>{providerName}</div>
            <div style={s.subtitle}>{isWallet ? 'Mobile Wallet' : 'Bank Transfer'}</div>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
            {error && (
                <div style={s.errorMsg}>
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}

            <div style={s.field}>
                <label style={s.label}>Account Holder Name</label>
                <div style={s.inputWrap}>
                    <i className="fas fa-user" style={s.inputIcon}></i>
                    <input 
                        style={s.input} 
                        placeholder="e.g. Muhammad Ali"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                    />
                </div>
            </div>

            <div style={s.field}>
                <label style={s.label}>{isWallet ? 'Mobile Number' : 'Account Number'}</label>
                <div style={s.inputWrap}>
                    <i className="fas fa-hashtag" style={s.inputIcon}></i>
                    <input 
                        style={s.input} 
                        type={isWallet ? "tel" : "text"}
                        placeholder={isWallet ? "03001234567" : "Account Number"}
                        value={form.number}
                        onChange={e => setForm({...form, number: e.target.value})}
                    />
                </div>
            </div>

            <div style={s.field}>
                <label style={s.label}>
                    IBAN {isWallet && <span style={{fontWeight:400, color:'#94A3B8'}}>(Optional)</span>}
                </label>
                <div style={s.inputWrap}>
                    <i className="fas fa-globe" style={s.inputIcon}></i>
                    <input 
                        style={{...s.input, textTransform:'uppercase'}} 
                        placeholder="PK..."
                        value={form.iban}
                        onChange={e => setForm({...form, iban: e.target.value})}
                    />
                </div>
            </div>

            <button type="submit" style={s.btn} disabled={loading} className="btn-anim">
                {loading ? 'Adding...' : 'Save Account'}
            </button>
        </form>
      </div>
    </div>
  );
}