"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import apiClient from '@/lib/apiClient';
import { BANK_LIST } from '@/lib/bankList';

// --- Types ---
type PaymentMethod = {
  id: string;
  provider_name: string;
  account_holder_name: string;
  account_number: string;
};

type Transaction = {
  id: number;
  amount: string;
  type: 'credit' | 'debit';
  reason: string;
  description: string;
  created_at: string;
  bank_name?: string;
  withdrawal_status?: string;
};

// --- Styles Object (Strict Typed) ---
const s: { [key: string]: React.CSSProperties } = {
  page: { background: '#F8F9FA', minHeight: '100vh', fontFamily: "'Poppins', sans-serif", paddingBottom: '40px' },
  
  // Hero Section (Blue Theme)
  hero: {
    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', // Blue Gradient
    color: '#fff',
    padding: '20px 24px 60px 24px',
    borderBottomLeftRadius: '35px',
    borderBottomRightRadius: '35px',
    position: 'relative',
    boxShadow: '0 15px 30px -10px rgba(30, 58, 138, 0.4)',
    overflow: 'hidden'
  },
  // Decorative Circles
  bgCircle1: { position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' },
  
  headerNav: { display: 'flex', alignItems: 'center', marginBottom: '25px', position: 'relative', zIndex: 10 },
  backBtn: { 
    color: '#fff', fontSize: '18px', background: 'rgba(255,255,255,0.2)', 
    width: '40px', height: '40px', borderRadius: '12px', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', 
    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' 
  },
  pageTitle: { fontSize: '18px', fontWeight: '600', marginLeft: '16px', letterSpacing: '0.5px' },

  // Stats
  lifetimeBox: { position: 'relative', zIndex: 10, animation: 'fadeIn 0.6s ease-out' },
  lifetimeLabel: { fontSize: '12px', fontWeight: '600', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '5px' },
  lifetimeValue: { fontSize: '42px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '25px', textShadow: '0 4px 15px rgba(0,0,0,0.15)' },

  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', position: 'relative', zIndex: 10 },
  statCard: {
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
    borderRadius: '18px', padding: '16px', border: '1px solid rgba(255,255,255,0.15)',
    display: 'flex', flexDirection: 'column', gap: '5px'
  },
  statLabel: { fontSize: '12px', color: '#DBEAFE', fontWeight: '500' },
  statVal: { fontSize: '18px', fontWeight: '700', color: '#fff' },

  // Main Content
  container: { padding: '0 20px', marginTop: '-40px', position: 'relative', zIndex: 20 },
  
  // Available Balance Card (Floating)
  balanceCard: {
    background: '#ffffff', borderRadius: '24px', padding: '25px',
    boxShadow: '0 20px 40px -5px rgba(0,0,0,0.08)',
    textAlign: 'center', marginBottom: '30px',
    animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  availLabel: { color: '#64748B', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  availAmount: { color: '#0F172A', fontSize: '38px', fontWeight: '800', margin: '10px 0 20px', letterSpacing: '-1px' },
  
  // Withdraw Button (Orange Theme)
  withdrawBtn: {
    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', // Orange Gradient
    color: '#fff', border: 'none', padding: '16px', borderRadius: '16px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(234, 88, 12, 0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: '100%', transition: 'transform 0.1s'
  },

  // Transactions Section
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1E293B', marginBottom: '16px', paddingLeft: '5px' },
  txList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  
  txCard: {
    background: '#fff', borderRadius: '16px', padding: '16px',
    display: 'flex', alignItems: 'center', gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9',
    position: 'relative', overflow: 'hidden'
  },
  
  iconBox: {
    width: '48px', height: '48px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', flexShrink: 0
  },

  // Status Badges
  statusBadge: {
    fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
    textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '4px',
    display: 'inline-flex', alignItems: 'center', gap: '4px'
  },
  statusPending: { background: '#FFF7ED', color: '#F97316', border: '1px solid #FFEDD5' },
  statusApproved: { background: '#ECFDF5', color: '#10B981', border: '1px solid #D1FAE5' },
  statusRejected: { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2' },

  // Modal / Bottom Sheet
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.65)', zIndex: 100, backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'flex-end', animation: 'fadeIn 0.2s ease-out'
  },
  sheet: {
    background: '#fff', width: '100%', 
    borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
    animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
  },
  sheetHeader: { padding: '24px 24px 10px', flexShrink: 0 },
  sheetBody: { padding: '0 24px', overflowY: 'auto' },
  sheetFooter: { 
    padding: '20px 24px 30px', background: '#fff', 
    borderTop: '1px solid #F1F5F9', position: 'sticky', bottom: 0, 
    zIndex: 20
  },
  
  sheetHandle: { width: '48px', height: '5px', background: '#E2E8F0', borderRadius: '10px', margin: '0 auto 20px' },
  sheetTitle: { fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '20px' },

  // Bank Selection
  bankGrid: { display: 'grid', gap: '10px', marginBottom: '24px' },
  bankOption: {
    display: 'flex', alignItems: 'center', padding: '12px 16px',
    border: '1px solid #E2E8F0', borderRadius: '14px', cursor: 'pointer',
    transition: '0.2s', gap: '12px', background: '#fff'
  },
  bankOptionSelected: { borderColor: '#F97316', background: '#FFF7ED', boxShadow: '0 0 0 2px #F97316 inset' },

  // Amount Input
  inputBox: {
    background: '#F8FAFC', padding: '16px', borderRadius: '16px',
    border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center',
    marginBottom: '10px'
  },
  currency: { fontSize: '20px', fontWeight: '700', color: '#94A3B8', marginRight: '12px' },
  input: { background: 'transparent', border: 'none', fontSize: '28px', fontWeight: '700', color: '#0F172A', width: '100%', outline: 'none' },

  // Loader
  shimmer: {
    background: 'linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite linear',
    borderRadius: '8px'
  }
};

// --- Helper: CountUp Animation Component ---
const CountUp = ({ end, duration = 2000, prefix = '' }: { end: number, duration?: number, prefix?: string }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function for smooth stop
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
      
      countRef.current = Math.floor(easeOutQuart(percentage) * end);
      setCount(countRef.current);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}</span>;
};

// --- SWR Fetcher ---
const fetcher = (url: string) => apiClient(url);

export default function MyEarningsPage() {
  // SWR Caching & Fetching
  const { data: wallet, isLoading: wLoading } = useSWR('/wallet', fetcher);
  const { data: history, isLoading: hLoading } = useSWR('/wallet/history', fetcher);
  const { data: methods } = useSWR('/wallet/payment-methods', fetcher);

  // States
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Safe Data
  const balance = wallet?.balance ? parseFloat(wallet.balance) : 0;
  const lifetime = wallet?.lifetimeEarnings ? parseFloat(wallet.lifetimeEarnings) : 0;
  const pending = wallet?.pendingWithdrawals ? parseFloat(wallet.pendingWithdrawals) : 0;
  const transactions: Transaction[] = Array.isArray(history) ? history : [];
  const paymentMethods: PaymentMethod[] = Array.isArray(methods) ? methods : [];

  const getLogo = (name: string) => BANK_LIST.find(b => b.name?.toLowerCase() === name?.toLowerCase())?.logo || '/banks/default.png';

  const handleWithdraw = async () => {
    setError('');
    const amt = parseFloat(withdrawAmount);

    if (!selectedMethod) return setError("Please select a payment method");
    if (!amt || amt <= 0) return setError("Enter a valid amount");
    if (amt > balance) return setError("Insufficient balance");

    setSubmitting(true);
    try {
        await apiClient('/wallet/withdrawals', 'POST', {
            amount: amt,
            payment_method_id: selectedMethod.id
        });
        
        mutate('/wallet'); 
        mutate('/wallet/history');
        
        setIsWithdrawOpen(false);
        setWithdrawAmount('');
        alert("Request Sent Successfully!");

    } catch (e: any) {
        setError(e.message || "Withdrawal failed");
    } finally {
        setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pending') return <div style={{...s.statusBadge, ...s.statusPending}}><i className="fas fa-clock"></i> PENDING</div>;
    if (status === 'approved') return <div style={{...s.statusBadge, ...s.statusApproved}}><i className="fas fa-check"></i> APPROVED</div>;
    if (status === 'rejected') return <div style={{...s.statusBadge, ...s.statusRejected}}><i className="fas fa-times"></i> REJECTED</div>;
    return null;
  };

  const Shimmer = ({ w, h }: { w: string, h: string }) => <div style={{...s.shimmer, width: w, height: h}}></div>;

  return (
    <div style={s.page}>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .tap:active { transform: scale(0.97); opacity: 0.9; }
        .anim-item { animation: fadeIn 0.5s ease-out backwards; }
      `}</style>

      {/* --- HERO SECTION (BLUE THEME) --- */}
      <div style={s.hero}>
        <div style={s.bgCircle1}></div>
        
        <div style={s.headerNav}>
            <Link href="/profile" style={s.backBtn} className="tap"><i className="fas fa-arrow-left"></i></Link>
            <span style={s.pageTitle}>My Dashboard</span>
        </div>
        
        <div style={s.lifetimeBox}>
            <div style={s.lifetimeLabel}>Total Lifetime Earnings</div>
            {wLoading ? 
                <Shimmer w="180px" h="60px" /> : 
                <div style={s.lifetimeValue}>
                    <CountUp end={lifetime} prefix="Rs " />
                </div>
            }
        </div>

        <div style={s.statsGrid}>
            <div style={s.statCard}>
                {wLoading ? <Shimmer w="80px" h="15px" /> :
                <div style={s.statLabel}>Pending</div>}
                
                {wLoading ? <Shimmer w="100px" h="25px" /> :
                <div style={{...s.statVal, color: '#FCD34D'}}>
                    <CountUp end={pending} prefix="Rs " />
                </div>}
            </div>
            <div style={s.statCard}>
                {wLoading ? <Shimmer w="80px" h="15px" /> :
                <div style={s.statLabel}>Total Paid</div>}
                
                {wLoading ? <Shimmer w="100px" h="25px" /> :
                <div style={{...s.statVal, color: '#6EE7B7'}}>
                    <CountUp end={lifetime - balance - pending} prefix="Rs " />
                </div>}
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div style={s.container}>
        
        {/* Available Balance Card */}
        <div style={s.balanceCard}>
            <div style={s.availLabel}>Available for Withdrawal</div>
            {wLoading ? 
                <Shimmer w="140px" h="50px" /> : 
                <div style={s.availAmount}>
                    <CountUp end={balance} prefix="Rs " />
                </div>
            }
            
            <button 
                style={s.withdrawBtn} 
                className="tap"
                onClick={() => {
                    if (paymentMethods.length > 0) setSelectedMethod(paymentMethods[0]);
                    setIsWithdrawOpen(true);
                }}
            >
                <span>Withdraw Funds</span>
                <i className="fas fa-arrow-right-long"></i>
            </button>
        </div>

        {/* Transaction List */}
        <div style={s.sectionTitle}>Recent Transactions</div>

        <div style={s.txList}>
            {hLoading ? (
                // Shimmer List
                [1,2,3,4].map(i => (
                    <div key={i} style={s.txCard}>
                        <Shimmer w="48px" h="48px" />
                        <div style={{flex:1}}>
                            <Shimmer w="60%" h="16px" />
                            <div style={{height:'5px'}}></div>
                            <Shimmer w="40%" h="12px" />
                        </div>
                        <Shimmer w="80px" h="20px" />
                    </div>
                ))
            ) : transactions.length > 0 ? (
                transactions.map((tx, i) => {
                    const isCredit = tx.type === 'credit';
                    const isReturn = tx.reason === 'return_charge';
                    const isRefund = tx.reason === 'withdrawal_refund';
                    const isWithdrawal = tx.reason === 'withdrawal';
                    
                    let icon, iconColor, iconBg, logoUrl;
                    let titleText = "Transaction";
                    
                    if (isCredit && !isRefund) {
                        icon = 'fa-arrow-down';
                        iconColor = '#10B981'; // Green
                        iconBg = '#ECFDF5';
                        titleText = "Order Profit";
                    } else if (isRefund) {
                        icon = 'fa-undo-alt';
                        iconColor = '#10B981'; // Green
                        iconBg = '#ECFDF5';
                        titleText = "Refund";
                    } else if (isReturn) {
                        icon = 'fa-box-open';
                        iconColor = '#EF4444'; // Red
                        iconBg = '#FEF2F2';
                        titleText = "Return Deduction";
                    } else {
                        // Withdrawal (Debit)
                        iconColor = '#EF4444'; // Red
                        iconBg = '#FEF2F2';
                        titleText = "Withdrawal";
                        if (tx.bank_name) logoUrl = getLogo(tx.bank_name);
                        else icon = 'fa-building-columns';
                    }

                    return (
                        <div key={tx.id} style={{...s.txCard, animationDelay: `${i*0.05}s`}} className="anim-item">
                            <div style={{...s.iconBox, background: iconBg, color: iconColor, border: logoUrl ? '1px solid #F1F5F9' : 'none'}}>
                                {logoUrl ? (
                                    <img src={logoUrl} style={{width:'28px', height:'28px', objectFit:'contain'}} alt="" />
                                ) : (
                                    <i className={`fas ${icon}`}></i>
                                )}
                            </div>
                            
                            <div style={{flex:1}}>
                                <div style={{fontWeight:'600', fontSize:'14px', color:'#1E293B', marginBottom:'2px'}}>
                                    {titleText}
                                </div>
                                <div style={{fontSize:'11px', color:'#94A3B8'}}>
                                    {new Date(tx.created_at).toLocaleDateString('en-GB', {day:'numeric', month:'short'})} • {tx.description}
                                </div>
                                {isWithdrawal && tx.withdrawal_status && getStatusBadge(tx.withdrawal_status)}
                            </div>
                            
                            <div style={{textAlign:'right'}}>
                                <div style={{fontWeight:'700', fontSize:'15px', color: (isCredit || isRefund) ? '#10B981' : '#EF4444'}}>
                                    {(isCredit || isRefund) ? '+' : '-'} Rs {parseFloat(tx.amount).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div style={{textAlign:'center', padding:'60px 20px', color:'#94A3B8'}}>
                    <div style={{width:'60px', height:'60px', background:'#F1F5F9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 15px'}}>
                        <i className="fas fa-file-invoice" style={{fontSize:'24px', opacity:0.5}}></i>
                    </div>
                    <p>No transactions yet</p>
                </div>
            )}
        </div>
      </div>

      {/* --- WITHDRAW MODAL (STICKY BUTTON) --- */}
      {isWithdrawOpen && (
        <div style={s.overlay} onClick={(e) => { if(e.target === e.currentTarget) setIsWithdrawOpen(false); }}>
            <div style={s.sheet}>
                <div style={s.sheetHeader}>
                    <div style={s.sheetHandle}></div>
                    <div style={s.sheetTitle}>Withdraw Funds</div>
                </div>

                <div style={s.sheetBody}>
                    {/* Account Selector */}
                    {paymentMethods.length > 0 ? (
                        <div style={s.bankGrid}>
                            {paymentMethods.map((pm) => (
                                <div 
                                    key={pm.id} 
                                    style={{
                                        ...s.bankOption, 
                                        ...(selectedMethod?.id === pm.id ? s.bankOptionSelected : {})
                                    }}
                                    onClick={() => setSelectedMethod(pm)}
                                >
                                    <img src={getLogo(pm.provider_name)} style={{width:'40px', height:'40px', objectFit:'contain'}} alt="" />
                                    <div style={{flex:1}}>
                                        <div style={{fontWeight:'700', fontSize:'14px', color:'#1E293B'}}>{pm.provider_name}</div>
                                        <div style={{fontSize:'12px', color:'#64748B'}}>{pm.account_number}</div>
                                    </div>
                                    {selectedMethod?.id === pm.id && <div style={{width:'22px', height:'22px', background:'#F97316', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><i className="fas fa-check" style={{color:'#fff', fontSize:'12px'}}></i></div>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{textAlign:'center', padding:'30px', background:'#FFF7ED', borderRadius:'16px', marginBottom:'20px'}}>
                            <p style={{color:'#C2410C', fontWeight:'600', marginBottom:'10px'}}>No Accounts Found</p>
                            <Link href="/profile/profit-account/add" style={{fontSize:'14px', color:'#EA580C', textDecoration:'underline', fontWeight:'600'}}>+ Add Bank Account</Link>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div style={{...s.inputBox, borderColor: error ? '#EF4444' : '#E2E8F0'}}>
                        <span style={s.currency}>Rs</span>
                        <input 
                            type="number" 
                            placeholder="0" 
                            style={s.input}
                            value={withdrawAmount}
                            onChange={(e) => {
                                setWithdrawAmount(e.target.value);
                                if(parseFloat(e.target.value) > balance) setError("Exceeds Balance");
                                else setError("");
                            }}
                        />
                        <button 
                            onClick={() => { setWithdrawAmount(balance.toString()); setError(""); }}
                            style={{background:'#FFF7ED', color:'#F97316', border:'none', padding:'6px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:'700', cursor:'pointer'}}
                        >
                            MAX
                        </button>
                    </div>
                    {error && <div style={{color:'#EF4444', fontSize:'13px', marginBottom:'10px', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}><i className="fas fa-exclamation-circle"></i> {error}</div>}
                </div>

                {/* STICKY FOOTER FOR BUTTON (NEVER HIDDEN) */}
                <div style={s.sheetFooter}>
                    <button 
                        style={{
                            ...s.withdrawBtn,
                            background: '#0F172A', // Dark button inside modal for contrast
                            opacity: (submitting || !withdrawAmount || parseFloat(withdrawAmount) > balance || !selectedMethod) ? 0.5 : 1
                        }}
                        disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) > balance || !selectedMethod}
                        onClick={handleWithdraw}
                        className="tap"
                    >
                        {submitting ? <i className="fas fa-circle-notch fa-spin"></i> : `Confirm Withdrawal`}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}