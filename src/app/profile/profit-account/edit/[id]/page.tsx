"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { BANK_LIST } from '@/lib/bankList';

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({ provider_name: '', account_holder_name: '', account_number: '', iban: '' });
  const [touched, setTouched] = useState({ name: true, number: true, iban: true }); // True by default for edits

  useEffect(() => {
    if(params?.id) {
        apiClient(`/wallet/payment-methods/${params.id}`)
            .then(data => { setForm(data); setLoading(false); })
            .catch(() => setError("Failed to load details"));
    }
  }, [params]);

  const bankConfig = BANK_LIST.find(b => b.name === form.provider_name);
  const isWallet = bankConfig?.type === 'wallet';
  const logoUrl = bankConfig?.logo || '/banks/default.png';

  const isNameValid = /^[A-Za-z\s]{3,50}$/.test(form.account_holder_name);
  const isNumberValid = isWallet ? /^03\d{9}$/.test(form.account_number) : /^\d{8,24}$/.test(form.account_number);
  const isIbanValid = isWallet ? (!form.iban || /^PK\d{2}[A-Z]{4}\d{16}$/i.test(form.iban)) : /^PK\d{2}[A-Z]{4}\d{16}$/i.test(form.iban || '');
  const isFormValid = isNameValid && isNumberValid && isIbanValid;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSaving(true);
    try {
        await apiClient(`/wallet/payment-methods/${params?.id}`, 'PUT', {
           ...form,
           iban: form.iban ? form.iban.toUpperCase().trim() : null
        });
        router.push('/profile/profit-account');
    } catch (e) { setError('Failed to update'); } 
    finally { setSaving(false); }
  };

  const getInputStyles = (isValid: boolean, baseStyle: any) => {
    if (!isValid) return { ...baseStyle, borderColor: '#EF4444', backgroundColor: '#FEF2F2' };
    return { ...baseStyle, borderColor: '#22C55E', backgroundColor: '#F0FDF4' };
  };

  const s = {
    page: { background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' as 'border-box' },
    header: { backgroundColor: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', position: 'sticky' as 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #E2E8F0' },
    headerTitle: { flex: 1, textAlign: 'center' as 'center', fontSize: '18px', fontWeight: '700', color: '#0F172A', marginRight: '36px' },
    backBtn: { fontSize: '18px', color: '#0F172A', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9' },
    container: { padding: '30px 20px', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' as 'border-box', width: '100%' },
    form: { backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', boxSizing: 'border-box' as 'border-box', width: '100%' },
    field: { marginBottom: '22px', width: '100%', boxSizing: 'border-box' as 'border-box' },
    label: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' },
    inputWrap: { position: 'relative' as 'relative', width: '100%', boxSizing: 'border-box' as 'border-box' },
    inputIcon: { position: 'absolute' as 'absolute', left: '16px', top: '16px', color: '#94A3B8', fontSize: '16px' },
    input: { width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: '2px solid #E2E8F0', fontSize: '15px', color: '#0F172A', outline: 'none', transition: 'all 0.2s ease', backgroundColor: '#F8FAFC', fontWeight: '500', boxSizing: 'border-box' as 'border-box' },
    pkFlag: { position: 'absolute' as 'absolute', left: '14px', top: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: '#E2E8F0', padding: '4px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' },
    btn: { width: '100%', backgroundColor: isFormValid ? '#0F172A' : '#CBD5E1', color: '#fff', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: '700', border: 'none', cursor: isFormValid ? 'pointer' : 'not-allowed', marginTop: '10px', transition: 'all 0.2s ease', boxSizing: 'border-box' as 'border-box' },
    errorMsg: { backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', padding: '16px', borderRadius: '14px', fontSize: '14px', fontWeight: '500', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', boxSizing: 'border-box' as 'border-box' },
    logoBox: { margin: '0 auto 24px auto', width:'100px', height:'100px', background:'#fff', borderRadius:'20px', padding:'15px', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center' },
    logoImg: { width:'100%', height:'100%', objectFit:'contain' as 'contain' }
  };

  if(loading) return <div style={{padding:'40px',textAlign:'center'}}>Loading...</div>;

  return (
    <div style={s.page}>
        <style jsx>{`* { box-sizing: border-box; } .input-active:focus { border-color: #0F172A !important; background: #fff !important; }`}</style>
        <div style={s.header}>
            <Link href="/profile/profit-account" style={s.backBtn}><i className="fas fa-arrow-left"></i></Link>
            <span style={s.headerTitle}>Edit Details</span>
        </div>

        <div style={s.container}>
            <div style={s.logoBox}><img src={logoUrl} alt="Logo" style={s.logoImg} /></div>

            <form onSubmit={handleUpdate} style={s.form}>
                {error && <div style={s.errorMsg}><i className="fas fa-exclamation-circle"></i> {error}</div>}

                <div style={s.field}>
                    <div style={s.label}><span>Provider</span></div>
                    <div style={s.inputWrap}>
                        <i className="fas fa-university" style={s.inputIcon}></i>
                        <input style={{...s.input, background:'#E2E8F0', color:'#64748B', borderColor: '#CBD5E1'}} value={form.provider_name} disabled />
                    </div>
                </div>

                <div style={s.field}>
                    <div style={s.label}>
                        <span>Account Holder</span>
                        {!isNameValid && <span style={{color: '#EF4444', fontSize: '12px'}}>Invalid Name</span>}
                    </div>
                    <div style={s.inputWrap}>
                        <i className="fas fa-user" style={s.inputIcon}></i>
                        <input className="input-active" style={getInputStyles(isNameValid, s.input)} value={form.account_holder_name} onChange={e => setForm({...form, account_holder_name: e.target.value})} />
                    </div>
                </div>

                <div style={s.field}>
                    <div style={s.label}>
                        <span>Number</span>
                        {!isNumberValid && <span style={{color: '#EF4444', fontSize: '12px'}}>Invalid Number</span>}
                    </div>
                    <div style={s.inputWrap}>
                        {isWallet ? (
                          <>
                            <div style={s.pkFlag}>🇵🇰 +92</div>
                            <input className="input-active" style={getInputStyles(isNumberValid, {...s.input, paddingLeft: '90px'})} maxLength={11} value={form.account_number} onChange={e => setForm({...form, account_number: e.target.value.replace(/\D/g, '')})} />
                          </>
                        ) : (
                          <>
                            <i className="fas fa-hashtag" style={s.inputIcon}></i>
                            <input className="input-active" style={getInputStyles(isNumberValid, s.input)} value={form.account_number} onChange={e => setForm({...form, account_number: e.target.value.replace(/\D/g, '')})} />
                          </>
                        )}
                    </div>
                </div>

                <div style={s.field}>
                    <div style={s.label}>
                        <span>IBAN</span>
                        {!isIbanValid && <span style={{color: '#EF4444', fontSize: '12px'}}>Invalid PK IBAN</span>}
                    </div>
                    <div style={s.inputWrap}>
                        <i className="fas fa-globe" style={s.inputIcon}></i>
                        <input className="input-active" style={getInputStyles(isIbanValid, {...s.input, textTransform: 'uppercase'})} value={form.iban || ''} onChange={e => setForm({...form, iban: e.target.value.toUpperCase()})} placeholder="Optional for wallets" />
                    </div>
                </div>

                <button type="submit" style={s.btn} disabled={saving || !isFormValid}>
                    {saving ? 'Updating...' : 'Update Account'}
                </button>
            </form>
        </div>
    </div>
  );
}