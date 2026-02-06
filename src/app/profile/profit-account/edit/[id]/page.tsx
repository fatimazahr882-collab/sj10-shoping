"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { BANK_LIST } from '@/lib/bankList';

const s = {
  // ... (Reuse styles from Add Page for consistency)
  page: { background: '#F0F4F8', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  header: { backgroundColor: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', position: 'sticky' as 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #E2E8F0' },
  headerTitle: { flex: 1, textAlign: 'center' as 'center', fontSize: '17px', fontWeight: '700', color: '#0F172A', marginRight: '40px' },
  backBtn: { fontSize: '18px', color: '#0F172A', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9' },
  container: { padding: '30px 20px', maxWidth: '480px', margin: '0 auto' },
  form: { backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' },
  inputWrap: { position: 'relative' as 'relative' },
  inputIcon: { position: 'absolute' as 'absolute', left: '16px', top: '16px', color: '#94A3B8' },
  input: { width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '15px', color: '#0F172A', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#F8FAFC', fontWeight: '500' },
  btn: { width: '100%', backgroundColor: '#0F172A', color: '#fff', padding: '16px', borderRadius: '14px', fontSize: '16px', fontWeight: '700', border: 'none', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(15, 23, 66, 0.2)', transition: 'transform 0.1s' },
  errorMsg: { backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
  // Edit specific
  logoBox: { margin: '0 auto 20px auto', width:'80px', height:'80px', background:'#fff', borderRadius:'16px', padding:'12px', boxShadow:'0 4px 10px rgba(0,0,0,0.05)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoImg: { width:'100%', height:'100%', objectFit:'contain' as 'contain' }
};

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({ 
    provider_name: '', 
    account_holder_name: '', 
    account_number: '', 
    iban: '' 
  });

  useEffect(() => {
    if(params?.id) {
        apiClient(`/wallet/payment-methods/${params.id}`)
            .then(data => {
                setForm(data);
                setLoading(false);
            })
            .catch(() => setError("Failed to load details"));
    }
  }, [params]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        await apiClient(`/wallet/payment-methods/${params?.id}`, 'PUT', form);
        router.push('/profile/profit-account');
    } catch (e) {
        setError('Failed to update');
    } finally {
        setSaving(false);
    }
  };

  // Get logo dynamically
  const logoUrl = BANK_LIST.find(b => b.name === form.provider_name)?.logo || '/banks/default.png';

  if(loading) return <div style={{padding:'40px',textAlign:'center'}}>Loading...</div>;

  return (
    <div style={s.page}>
        <div style={s.header}>
            <Link href="/profile/profit-account" style={s.backBtn}><i className="fas fa-arrow-left"></i></Link>
            <span style={s.headerTitle}>Edit Details</span>
        </div>

        <div style={s.container}>
            <div style={s.logoBox}>
                <img src={logoUrl} alt="Logo" style={s.logoImg} />
            </div>

            <form onSubmit={handleUpdate} style={s.form}>
                {error && <div style={s.errorMsg}>{error}</div>}

                <div style={s.field}>
                    <label style={s.label}>Provider</label>
                    <div style={s.inputWrap}>
                        <i className="fas fa-university" style={s.inputIcon}></i>
                        <input style={{...s.input, background:'#E2E8F0', color:'#64748B'}} value={form.provider_name} disabled />
                    </div>
                </div>

                <div style={s.field}>
                    <label style={s.label}>Account Holder</label>
                    <div style={s.inputWrap}>
                        <i className="fas fa-user" style={s.inputIcon}></i>
                        <input style={s.input} value={form.account_holder_name} onChange={e => setForm({...form, account_holder_name: e.target.value})} />
                    </div>
                </div>

                <div style={s.field}>
                    <label style={s.label}>Number</label>
                    <div style={s.inputWrap}>
                        <i className="fas fa-hashtag" style={s.inputIcon}></i>
                        <input style={s.input} value={form.account_number} onChange={e => setForm({...form, account_number: e.target.value})} />
                    </div>
                </div>

                <div style={s.field}>
                    <label style={s.label}>IBAN</label>
                    <div style={s.inputWrap}>
                        <i className="fas fa-globe" style={s.inputIcon}></i>
                        <input style={s.input} value={form.iban || ''} onChange={e => setForm({...form, iban: e.target.value})} placeholder="Optional" />
                    </div>
                </div>

                <button type="submit" style={s.btn} disabled={saving}>
                    {saving ? 'Updating...' : 'Update Account'}
                </button>
            </form>
        </div>
    </div>
  );
}