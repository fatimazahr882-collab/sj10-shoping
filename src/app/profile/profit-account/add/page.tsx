"use client";

import Link from 'next/link';
import { BANK_LIST } from '@/lib/bankList';

const s = {
  page: { background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
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
  
  content: { padding: '24px 20px', maxWidth: '600px', margin: '0 auto' },
  sectionTitle: { 
    fontSize: '13px', fontWeight: '700', color: '#64748B', 
    textTransform: 'uppercase' as 'uppercase', letterSpacing: '0.8px', 
    marginBottom: '16px', marginTop: '24px', paddingLeft: '4px' 
  },
  
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
    gap: '16px' 
  },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '16px 8px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid transparent',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    aspectRatio: '1 / 1.1',
  },
  imgBox: { 
    width: '56px', height: '56px', 
    marginBottom: '12px', 
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '4px' 
  },
  img: { width: '100%', height: '100%', objectFit: 'contain' as 'contain' },
  name: { fontSize: '12px', fontWeight: '600', color: '#334155', textAlign: 'center' as 'center', lineHeight: '1.3' }
};

export default function AddProfitAccountPage() {
  return (
    <div style={s.page}>
      <style jsx>{`
        .card-hover:hover { 
            transform: translateY(-4px); 
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border-color: #FF7F00;
        }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={s.header}>
        <Link href="/profile/profit-account" style={s.backBtn}><i className="fas fa-arrow-left"></i></Link>
        <span style={s.headerTitle}>Select Method</span>
      </div>

      <div style={s.content}>
        
        <div className="fade-in" style={{animationDelay: '0s'}}>
            <div style={s.sectionTitle}>Mobile Wallets</div>
            <div style={s.grid}>
                {BANK_LIST.filter(b => b.type === 'wallet').map((bank, i) => (
                    <Link key={bank.id} href={`/profile/profit-account/add/${bank.id}`} style={s.card} className="card-hover">
                        <div style={s.imgBox}>
                            <img src={bank.logo} alt={bank.name} style={s.img} />
                        </div>
                        <span style={s.name}>{bank.name}</span>
                    </Link>
                ))}
            </div>
        </div>

        <div className="fade-in" style={{animationDelay: '0.1s'}}>
            <div style={s.sectionTitle}>Bank Accounts</div>
            <div style={s.grid}>
                {BANK_LIST.filter(b => b.type === 'bank').map((bank, i) => (
                    <Link key={bank.id} href={`/profile/profit-account/add/${bank.id}`} style={s.card} className="card-hover">
                        <div style={s.imgBox}>
                            <img src={bank.logo} alt={bank.name} style={s.img} />
                        </div>
                        <span style={s.name}>{bank.name}</span>
                    </Link>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}