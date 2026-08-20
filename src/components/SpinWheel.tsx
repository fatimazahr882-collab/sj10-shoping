// src/components/SpinWheel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function SpinWheel() {
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [resultPopup, setResultPopup] = useState<any>(null);

  // Fetch Status when opened
  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      // 🟢 apiClient khud token aur base URL handle kar lega
      const data = await apiClient('spin/status', 'GET');
      
      setOptions(data.options || []);
      setCanSpin(data.canSpin);

      if (!data.canSpin && data.timeLeftMs) {
        startCountdown(data.timeLeftMs);
      }
    } catch (e) {
      console.error("Failed to load spin status");
    }
  };

  const startCountdown = (ms: number) => {
    let remaining = ms;
    const interval = setInterval(() => {
      remaining -= 1000;
      if (remaining <= 0) {
        clearInterval(interval);
        setCanSpin(true);
        setTimeLeft(null);
      } else {
        const h = Math.floor(remaining / (1000 * 60 * 60));
        const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
  };

  const handleSpinClick = async () => {
    if (!canSpin || isSpinning || options.length === 0) return;

    setIsSpinning(true);

    try {
      const data = await apiClient('spin/play', 'POST');

      if (data.success) {
        const winIndex = options.findIndex(opt => opt.id === data.reward_id);
        const sliceDegree = 360 / options.length;
        const targetDegree = (winIndex * sliceDegree) + (sliceDegree / 2);
        
        // 5 Full spins + target alignment
        const extraSpins = 360 * 5; 
        const finalRotation = extraSpins + (360 - targetDegree);

        setRotation(prev => prev + finalRotation);

        // Wait for CSS animation to finish (4 seconds)
        setTimeout(() => {
          setIsSpinning(false);
          setCanSpin(false); 
          setResultPopup(data); 
        }, 4000);

      } else {
        alert(data.message);
        setIsSpinning(false);
      }
    } catch (e: any) {
      alert(e.message || "Something went wrong!");
      setIsSpinning(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .spin-wheel-banner {
          background: linear-gradient(135deg, #f85606 0%, #ea580c 100%);
          margin: 0 15px 20px 15px;
          padding: 16px 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
          cursor: pointer;
          box-shadow: 0 8px 20px -5px rgba(248, 86, 6, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .spin-wheel-banner:active { transform: scale(0.97); }
        .spin-wheel-banner:hover { box-shadow: 0 10px 25px rgba(248, 86, 6, 0.5); }
        
        .wheel-icon-anim {
          font-size: 32px;
          animation: spin-slow 4s linear infinite;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
      `}} />

      {/* 🎁 PROFILE BANNER TRIGGER */}
      <div className="spin-wheel-banner" onClick={() => setIsOpen(true)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className="fas fa-dharmachakra wheel-icon-anim"></i>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>Daily Spin & Win! 🎁</h3>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, fontWeight: 500 }}>Tap to try your luck today</p>
          </div>
        </div>
        <i className="fas fa-chevron-right" style={{ fontSize: '18px', opacity: 0.8 }}></i>
      </div>

      {/* 🎡 WHEEL MODAL */}
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', padding: '15px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>
              <i className="fas fa-times-circle"></i>
            </button>

            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', margin: '0 0 5px 0' }}>Spin to Win! 💸</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '25px', textAlign: 'center' }}>Win exclusive discounts and offers everyday.</p>

            {/* THE WHEEL UI */}
            <div style={{ position: 'relative', width: '260px', height: '260px', marginBottom: '30px' }}>
              
              {/* Pointer Arrow */}
              <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, color: '#dc2626', fontSize: '40px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
                <i className="fas fa-caret-down"></i>
              </div>

              {/* Spinning Circle */}
              <div 
                style={{ 
                  width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #f85606', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
                  transform: `rotate(${rotation}deg)`, 
                  transition: 'transform 4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  background: `conic-gradient(
                    #fef08a 0deg 72deg, 
                    #fbcfe8 72deg 144deg, 
                    #bfdbfe 144deg 216deg, 
                    #bbf7d0 216deg 288deg, 
                    #fed7aa 288deg 360deg
                  )` 
                }}
              >
                {options.map((opt, i) => {
                  const sliceAngle = 360 / options.length;
                  const rotateAngle = (i * sliceAngle) + (sliceAngle / 2);
                  return (
                    <div 
                      key={opt.id}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '30px', fontWeight: 800, color: '#1e293b', fontSize: '14px', transform: `rotate(${rotateAngle}deg)` }}
                    >
                      <span style={{ transformOrigin: 'bottom', transform: 'rotate(-90deg)', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                        {opt.title}
                      </span>
                    </div>
                  );
                })}
                
                {/* Center Dot */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50px', height: '50px', background: 'white', borderRadius: '50%', border: '4px solid #f85606', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 10 }}></div>
              </div>
            </div>

            {/* SPIN BUTTON / TIMER */}
            {canSpin ? (
              <button 
                onClick={handleSpinClick} 
                disabled={isSpinning}
                style={{ width: '100%', padding: '16px', background: isSpinning ? '#94a3b8' : 'linear-gradient(90deg, #f85606, #ea580c)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 900, cursor: isSpinning ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(248, 86, 6, 0.3)', transition: '0.2s' }}
              >
                {isSpinning ? 'Spinning...' : 'SPIN NOW!'}
              </button>
            ) : (
              <div style={{ width: '100%', textAlign: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Next Spin Available in:</p>
                <p style={{ margin: 0, color: '#f85606', fontSize: '20px', fontWeight: 900, fontFamily: 'monospace' }}>
                  {timeLeft || "Calculating..."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎉 RESULT POPUP */}
      {resultPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100005, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '350px', width: '100%', textAlign: 'center', border: '4px solid #fbbf24', boxShadow: '0 0 40px rgba(251, 191, 36, 0.4)', animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            
            <i className={`text-6xl mb-4 ${resultPopup.is_win ? 'fas fa-gift text-green-500 animate-bounce' : 'far fa-sad-tear text-gray-400'}`} style={{ fontSize: '60px', marginBottom: '15px', color: resultPopup.is_win ? '#10b981' : '#94a3b8' }}></i>
            
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', margin: '0 0 10px 0' }}>
              {resultPopup.is_win ? 'Congratulations!' : 'Oops!'}
            </h2>
            
            <p style={{ color: '#475569', marginBottom: '25px', fontWeight: 500, fontSize: '15px' }}>
              {resultPopup.is_win 
                ? `You won a ${resultPopup.reward_title} coupon!` 
                : 'Better luck next time. Come back tomorrow!'}
            </p>

            {resultPopup.is_win && resultPopup.coupon && (
              <div style={{ background: '#fff7ed', border: '2px solid #fed7aa', borderRadius: '16px', padding: '15px', marginBottom: '25px' }}>
                <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Your Coupon Code</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', letterSpacing: '2px', fontFamily: 'monospace' }}>{resultPopup.coupon.code}</div>
                
                <div style={{ marginTop: '15px', fontSize: '13px', color: '#475569', textAlign: 'left', background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #ffedd5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Min Order:</span> <strong>Rs. {resultPopup.coupon.min_order}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Max Discount:</span> <strong>Rs. {resultPopup.coupon.max_cap}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontSize: '12px', marginTop: '10px', fontWeight: 700 }}><span><i className="fas fa-clock"></i> Expires in 24 hours!</span></div>
                </div>
              </div>
            )}

            <button 
              onClick={() => {
                setResultPopup(null);
                if (resultPopup.is_win) {
                  navigator.clipboard.writeText(resultPopup.coupon?.code || '');
                  alert("Coupon Code Copied!");
                  router.push('/');
                  setIsOpen(false);
                }
              }} 
              style={{ width: '100%', padding: '14px', background: '#0f172a', color: 'white', fontWeight: 800, borderRadius: '12px', border: 'none', fontSize: '15px', cursor: 'pointer' }}
            >
              {resultPopup.is_win ? 'Copy Code & Shop Now' : 'Close'}
            </button>
            <style dangerouslySetInnerHTML={{__html: `@keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}} />
          </div>
        </div>
      )}
    </>
  );
}