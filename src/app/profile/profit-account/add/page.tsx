"use client";

import Link from 'next/link';
import { BANK_LIST } from '@/lib/bankList';

const s = {
  page: { background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' as 'border-box' },
  header: {
    backgroundColor: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center',
    position: 'sticky' as 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #E2E8F0',
  },
  headerTitle: { flex: 1, textAlign: 'center' as 'center', fontSize: '18px', fontWeight: '700', color: '#0F172A', marginRight: '36px' },
  backBtn: { fontSize: '18px', color: '#0F172A', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9' },
  content: { padding: '24px 20px', maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' as 'border-box' },
  sectionTitle: { fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' as 'uppercase', letterSpacing: '1px', marginBottom: '16px', marginTop: '30px', paddingLeft: '4px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '16px' },
  card: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '20px 10px', display: 'flex',
    flexDirection: 'column' as 'column', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.04)', border: '2px solid transparent',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', aspectRatio: '1 / 1.15',
  },
  imgBox: { width: '60px', height: '60px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '8px' },
  img: { width: '100%', height: '100%', objectFit: 'contain' as 'contain' },
  name: { fontSize: '13px', fontWeight: '600', color: '#334155', textAlign: 'center' as 'center', lineHeight: '1.3' }
};

export default function AddProfitAccountPage() {
  return (
    <div style={s.page}>
      <style jsx>{`
        * { box-sizing: border-box; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 15px 25px -5px rgba(255, 127, 0, 0.15); border-color: rgba(255, 127, 0, 0.5); }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={s.header}>
        <Link href="/profile/profit-account" style={s.backBtn}><i className="fas fa-arrow-left"></i></Link>
        <span style={s.headerTitle}>Select Provider</span>
      </div>

      <div style={s.content}>
        <div className="fade-in" style={{animationDelay: '0s'}}>
            <div style={s.sectionTitle}>Mobile Wallets</div>
            <div style={s.grid}>
                {BANK_LIST.filter(b => b.type === 'wallet').map((bank) => (
                    <Link key={bank.id} href={`/profile/profit-account/add/${bank.id}`} style={s.card} className="card-hover">
                        <div style={s.imgBox}>
                            <img src={bank.logo} alt={bank.name} style={s.img} />
                        </div>
                        <span style={s.name}>{bank.name}</span>
                    </Link>
                ))}
            </div>
        </div>

        <div className="fade-in" style={{animationDelay: '0.15s'}}>
            <div style={s.sectionTitle}>Bank Accounts</div>
            <div style={s.grid}>
                {BANK_LIST.filter(b => b.type === 'bank').map((bank) => (
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