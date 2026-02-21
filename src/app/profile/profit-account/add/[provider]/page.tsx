"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; 
import apiClient from '@/lib/apiClient';
import { BANK_LIST } from '@/lib/bankList';

export default function AddProviderPage() {
  const router = useRouter();
  const params = useParams();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({ name: '', number: '', iban: '' });
  const [touched, setTouched] = useState({ name: false, number: false, iban: false });

  useEffect(() => { if (params) setReady(true); }, [params]);

  if (!ready) return null;

  const bankConfig = BANK_LIST.find(b => b.id === params?.provider);
  if (!bankConfig) return <div style={{padding:'40px',textAlign:'center'}}>Provider Not Found</div>;

  const { name: providerName, logo, type } = bankConfig;
  const isWallet = type === 'wallet';

  // --- Real-time Validation Rules ---
  // Name: Only letters and spaces, 3 to 50 chars
  const isNameValid = /^[A-Za-z\s]{3,50}$/.test(form.name);
  
  // Number: 
  // Wallet strictly 11 digits starting with 03 (e.g. 03001234567)
  // Bank strictly 8 to 24 digits (Standard accounts)
  const isNumberValid = isWallet 
    ? /^03\d{9}$/.test(form.number) 
    : /^\d{8,24}$/.test(form.number);

  // IBAN:
  // Bank strictly requires standard PK IBAN: PK + 2 digits + 4 chars + 16 chars (24 total)
  // Wallet: Optional (valid if empty, or must match IBAN format if typed)
  const isIbanValid = isWallet 
    ? (form.iban === '' || /^PK\d{2}[A-Z]{4}\d{16}$/i.test(form.iban))
    : /^PK\d{2}[A-Z]{4}\d{16}$/i.test(form.iban);

  const isFormValid = isNameValid && isNumberValid && isIbanValid;

  const handleBlur = (field: string) => setTouched({ ...touched, [field]: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTouched({ name: true, number: true, iban: true });

    if (!isFormValid) {
        setError("Please fix the highlighted errors before saving.");
        return;
    }

    setLoading(true);
    try {
        await apiClient('/wallet/payment-methods', 'POST', {
            provider_name: providerName,
            account_holder_name: form.name.trim(),
            account_number: form.number.trim(),
            iban: form.iban ? form.iban.toUpperCase().trim() : null
        });
        router.push('/profile/profit-account');
    } catch (err: any) {
        setError(err.message || 'Failed to save account');
    } finally {
        setLoading(false);
    }
  };

  // --- Dynamic Input Styling Helper ---
  const getInputStyles = (isValid: boolean, isTouched: boolean, baseStyle: any) => {
    if (!isTouched) return baseStyle;
    if (!isValid) return { ...baseStyle, borderColor: '#EF4444', backgroundColor: '#FEF2F2', boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)' };
    return { ...baseStyle, borderColor: '#22C55E', backgroundColor: '#F0FDF4', boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.15)' };
  };

  const s = {
    page: { background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' as 'border-box' },
    header: { backgroundColor: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', position: 'sticky' as 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #E2E8F0' },
    headerTitle: { flex: 1, textAlign: 'center' as 'center', fontSize: '18px', fontWeight: '700', color: '#0F172A', marginRight: '36px' },
    backBtn: { fontSize: '18px', color: '#0F172A', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9' },
    container: { padding: '30px 20px', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' as 'border-box', width: '100%' },
    
    brandBox: { display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', marginBottom: '30px' },
    logoContainer: { width: '90px', height: '90px', borderRadius: '20px', background: '#fff', padding: '15px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    logo: { width: '100%', height: '100%', objectFit: 'contain' as 'contain' },
    title: { fontSize: '24px', fontWeight: '800', color: '#1E293B', textAlign: 'center' as 'center' },
    subtitle: { fontSize: '15px', color: '#64748B', marginTop: '6px', fontWeight: '500' },
  
    form: { backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', boxSizing: 'border-box' as 'border-box', width: '100%' },
    field: { marginBottom: '22px', width: '100%', boxSizing: 'border-box' as 'border-box' },
    label: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' },
    inputWrap: { position: 'relative' as 'relative', width: '100%', boxSizing: 'border-box' as 'border-box' },
    inputIcon: { position: 'absolute' as 'absolute', left: '16px', top: '16px', color: '#94A3B8', fontSize: '16px' },
    input: { width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: '2px solid #E2E8F0', fontSize: '15px', color: '#0F172A', outline: 'none', transition: 'all 0.2s ease', backgroundColor: '#F8FAFC', fontWeight: '500', boxSizing: 'border-box' as 'border-box' },
    
    pkFlag: { position: 'absolute' as 'absolute', left: '14px', top: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: '#E2E8F0', padding: '4px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' },
    
    btn: { width: '100%', backgroundColor: isFormValid ? '#FF7F00' : '#CBD5E1', color: '#fff', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: '700', border: 'none', cursor: isFormValid ? 'pointer' : 'not-allowed', marginTop: '10px', boxShadow: isFormValid ? '0 10px 20px -5px rgba(255, 127, 0, 0.4)' : 'none', transition: 'all 0.2s ease', boxSizing: 'border-box' as 'border-box' },
    errorMsg: { backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', padding: '16px', borderRadius: '14px', fontSize: '14px', fontWeight: '500', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', boxSizing: 'border-box' as 'border-box' }
  };

  return (
    <div style={s.page}>
      <style jsx>{`
        * { box-sizing: border-box; }
        .input-active:focus { border-color: #FF7F00 !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(255,127,0,0.1); }
        .btn-anim:active { transform: scale(0.98); }
        .slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={s.header}>
        <Link href="/profile/profit-account/add" style={s.backBtn}><i className="fas fa-arrow-left"></i></Link>
        <span style={s.headerTitle}>Account Details</span>
      </div>

      <div style={s.container} className="slide-up">
        <div style={s.brandBox}>
            <div style={s.logoContainer}><img src={logo} alt={providerName} style={s.logo} /></div>
            <div style={s.title}>{providerName}</div>
            <div style={s.subtitle}>{isWallet ? 'Mobile Wallet' : 'Bank Transfer'}</div>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
            {error && <div style={s.errorMsg}><i className="fas fa-exclamation-circle"></i> {error}</div>}

            {/* Name Field */}
            <div style={s.field}>
                <div style={s.label}>
                    <span>Account Holder Name</span>
                    {touched.name && !isNameValid && <span style={{color: '#EF4444', fontSize: '12px'}}>Invalid Name</span>}
                </div>
                <div style={s.inputWrap}>
                    <i className="fas fa-user" style={s.inputIcon}></i>
                    <input 
                        className="input-active"
                        style={getInputStyles(isNameValid, touched.name, s.input)}
                        placeholder="e.g. Muhammad Ali"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        onBlur={() => handleBlur('name')}
                    />
                </div>
            </div>

            {/* Account Number / Phone Field */}
            <div style={s.field}>
                <div style={s.label}>
                    <span>{isWallet ? 'Mobile Number' : 'Account Number'}</span>
                    {touched.number && !isNumberValid && <span style={{color: '#EF4444', fontSize: '12px'}}>{isWallet ? 'Must be 11 digits (03XXXXXXXXX)' : 'Invalid Format'}</span>}
                </div>
                <div style={s.inputWrap}>
                    {isWallet ? (
                        <>
                          <div style={s.pkFlag}>🇵🇰 +92</div>
                          <input 
                              className="input-active"
                              style={getInputStyles(isNumberValid, touched.number, {...s.input, paddingLeft: '90px'})}
                              type="tel"
                              maxLength={11}
                              placeholder="03001234567"
                              value={form.number}
                              onChange={e => setForm({...form, number: e.target.value.replace(/\D/g, '')})}
                              onBlur={() => handleBlur('number')}
                          />
                        </>
                    ) : (
                        <>
                          <i className="fas fa-hashtag" style={s.inputIcon}></i>
                          <input 
                              className="input-active"
                              style={getInputStyles(isNumberValid, touched.number, s.input)}
                              type="text"
                              placeholder="Enter Account Number"
                              value={form.number}
                              onChange={e => setForm({...form, number: e.target.value.replace(/\D/g, '')})}
                              onBlur={() => handleBlur('number')}
                          />
                        </>
                    )}
                </div>
            </div>

            {/* IBAN Field */}
            <div style={s.field}>
                <div style={s.label}>
                    <span>IBAN {isWallet && <span style={{fontWeight:400, color:'#94A3B8'}}>(Optional)</span>}</span>
                    {touched.iban && !isIbanValid && <span style={{color: '#EF4444', fontSize: '12px'}}>Invalid PK IBAN</span>}
                </div>
                <div style={s.inputWrap}>
                    <i className="fas fa-globe" style={s.inputIcon}></i>
                    <input 
                        className="input-active"
                        style={getInputStyles(isIbanValid, touched.iban, {...s.input, textTransform:'uppercase', letterSpacing: '1px'})} 
                        placeholder="PK20HABB0000000000000000"
                        maxLength={24}
                        value={form.iban}
                        onChange={e => setForm({...form, iban: e.target.value.toUpperCase()})}
                        onBlur={() => handleBlur('iban')}
                    />
                </div>
                {!isWallet && <div style={{fontSize: '12px', color: '#64748B', marginTop: '6px'}}>Strictly required. Must be 24 characters starting with PK.</div>}
            </div>

            <button type="submit" style={s.btn} disabled={!isFormValid || loading} className={isFormValid ? "btn-anim" : ""}>
                {loading ? 'Adding Account...' : 'Save Account'}
            </button>
        </form>
      </div>
    </div>
  );
}