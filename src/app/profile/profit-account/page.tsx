"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { BANK_LIST } from '@/lib/bankList';
import { useRouter } from 'next/navigation';

// --- Styles ---
const s = {
  page: { backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' },
  header: {
    backgroundColor: '#fff',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky' as 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid #E2E8F0',
    backdropFilter: 'blur(10px)',
  },
  headerTitle: { fontSize: '18px', fontWeight: '700', color: '#0F172A', marginLeft: '16px' },
  backBtn: { 
    fontSize: '18px', color: '#0F172A', textDecoration: 'none', 
    width: '36px', height: '36px', borderRadius: '50%', 
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F1F5F9' 
  },
  
  content: { padding: '20px', maxWidth: '600px', margin: '0 auto' },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative' as 'relative',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid #F1F5F9',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  
  logoBox: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
    padding: '8px',
    flexShrink: 0,
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'contain' as 'contain' },
  
  info: { flex: 1, overflow: 'hidden' },
  bankName: { fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' },
  holderName: { fontSize: '13px', color: '#64748B', marginBottom: '2px', textTransform: 'capitalize' as 'capitalize' },
  accountNum: { fontSize: '14px', color: '#334155', fontFamily: 'monospace', fontWeight: '600', letterSpacing: '0.5px' },
  iban: { fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' },
  
  actions: { display: 'flex', flexDirection: 'column' as 'column', gap: '8px', marginLeft: '10px' },
  actionBtn: {
    width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
    transition: '0.2s'
  },
  
  fab: {
    position: 'fixed' as 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#FF7F00',
    color: '#fff',
    padding: '16px 24px',
    borderRadius: '50px',
    fontWeight: '600',
    boxShadow: '0 10px 15px -3px rgba(255, 127, 0, 0.4)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 50,
    transition: 'transform 0.2s',
  }
};

export default function ProfitAccountPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = () => {
    setLoading(true);
    apiClient('/wallet/payment-methods')
      .then(data => setAccounts(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this account?")) return;
    try {
        await apiClient(`/wallet/payment-methods/${id}`, 'DELETE');
        setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (e) { alert("Failed to delete"); }
  };

  // Helper to find logo based on saved provider name
  const getLogo = (providerName: string) => {
    const bank = BANK_LIST.find(b => b.name.toLowerCase() === providerName?.toLowerCase());
    return bank ? bank.logo : '/banks/default.png'; // Make sure you have a default icon just in case
  };

  return (
    <div style={s.page}>
      <style jsx>{`
        .card-anim:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .edit-btn { background: #EFF6FF; color: #3B82F6; }
        .edit-btn:hover { background: #DBEAFE; }
        .del-btn { background: #FEF2F2; color: #EF4444; }
        .del-btn:hover { background: #FEE2E2; }
        .fab-anim:active { transform: scale(0.95); }
      `}</style>

      <div style={s.header}>
        <Link href="/profile" style={s.backBtn}><i className="fas fa-arrow-left"></i></Link>
        <span style={s.headerTitle}>My Profit Accounts</span>
      </div>

      <div style={s.content}>
        {loading ? (
           <div style={{textAlign:'center', marginTop:'50px', color:'#94A3B8'}}>
             <i className="fas fa-circle-notch fa-spin"></i> Loading...
           </div>
        ) : accounts.length > 0 ? (
          <div style={{display:'flex', flexDirection:'column'}}>
            {accounts.map((acc: any, i) => (
              <div key={acc.id} style={{...s.card, animationDelay: `${i*0.1}s`}} className="card-anim slide-up">
                <div style={s.logoBox}>
                  {/* Fallback image logic included */}
                  <img 
                    src={getLogo(acc.provider_name)} 
                    alt={acc.provider_name} 
                    style={s.logoImg} 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Bank'; }}
                  />
                </div>
                
                <div style={s.info}>
                  <div style={s.bankName}>{acc.provider_name}</div>
                  <div style={s.holderName}>{acc.account_holder_name}</div>
                  <div style={s.accountNum}>{acc.account_number}</div>
                  {acc.iban && <span style={s.iban}>IBAN: {acc.iban}</span>}
                </div>

                <div style={s.actions}>
                  <Link href={`/profile/profit-account/edit/${acc.id}`} style={s.actionBtn} className="edit-btn">
                    <i className="fas fa-pen"></i>
                  </Link>
                  <button onClick={() => handleDelete(acc.id)} style={s.actionBtn} className="del-btn">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '80px' }}>
             <div style={{ width: '100px', height: '100px', background: '#FFF7ED', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <i className="fas fa-wallet" style={{ fontSize: '40px', color: '#FF7F00' }}></i>
             </div>
             <h3 style={{ color: '#0F172A', fontWeight: '700' }}>No Accounts Added</h3>
             <p style={{ color: '#64748B', maxWidth: '300px', margin: '10px auto' }}>Add a bank account or wallet to withdraw your profits instantly.</p>
          </div>
        )}
      </div>

      <Link href="/profile/profit-account/add" style={s.fab} className="fab-anim">
        <i className="fas fa-plus"></i> Add New
      </Link>
    </div>
  );
}