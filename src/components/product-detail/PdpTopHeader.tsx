"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ClientOnly from '../ClientOnly';

export default function PdpTopHeader({ 
  product, 
  isFavorite, 
  handleToggleFavorite, 
  handleShareButton 
}: { 
  product: any; 
  isFavorite: boolean; 
  handleToggleFavorite: () => void; 
  handleShareButton: () => void; 
}) {
  const router = useRouter();
  const { itemCount } = useCart();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 769);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const rawTitle = product?.title || product?.name || 'Product Details';
  const displayTitle = rawTitle.length > 45 ? `${rawTitle.substring(0, 45)}...` : rawTitle;

  return (
    <div className="pdp-top-header-wrapper">
      {/* 🟢 ROW 1: GO BACK ARROW + PRODUCT TITLE + (DESKTOP CART) + HEART + SHARE */}
      <div className="pdp-title-bar">
        
        {/* LEFT: BACK BUTTON */}
        <button 
          onClick={() => router.back()} 
          className="pdp-back-btn" 
          type="button" 
          aria-label="Go Back"
          title="Go Back"
        >
          <i className="fas fa-arrow-left"></i>
        </button>

        {/* CENTER: PRODUCT TITLE */}
        <div className="pdp-title-box">
          <span className="pdp-title-text" title={rawTitle}>
            {displayTitle}
          </span>
        </div>

        {/* RIGHT: ACTION BUTTONS */}
        <div className="pdp-action-buttons">
          
          {/* DESKTOP ONLY CART BUTTON */}
          {isDesktop && (
            <Link href="/cart" className="pdp-cart-btn-desktop" title="View Shopping Cart">
              <i className="fas fa-shopping-bag"></i>
              <ClientOnly>
                {itemCount > 0 && <span className="pdp-cart-badge">{itemCount}</span>}
              </ClientOnly>
            </Link>
          )}

          {/* FAVORITE BUTTON */}
          <button 
            className={`pdp-icon-btn ${isFavorite ? 'heart-active' : ''}`} 
            onClick={handleToggleFavorite} 
            type="button"
            title="Favorite"
          >
            <i className={isFavorite ? "fas fa-heart" : "far fa-heart"}></i>
          </button>

          {/* SHARE BUTTON */}
          <button 
            className="pdp-icon-btn" 
            onClick={handleShareButton} 
            type="button"
            title="Share"
          >
            <i className="fas fa-share-alt"></i>
          </button>

        </div>
      </div>

      {/* 🟢 ROW 2: BEAUTIFUL SPACIOUS TREE BREADCRUMBS */}
      <nav className="pdp-breadcrumbs-bar" aria-label="Breadcrumb">
        <div className="crumb-item">
          <Link href="/" className="crumb-link">
            <i className="fas fa-house crumb-icon"></i>
            <span>Home</span>
          </Link>
        </div>

        {product?.category_info?.parent_name ? (
          <React.Fragment key="parent-cat">
            <i className="fas fa-chevron-right crumb-arrow"></i>
            <div className="crumb-item">
              <Link href={`/category/${product.category_info.parent_slug}`} className="crumb-link">
                <i className="fas fa-folder-open crumb-icon-sub"></i>
                <span>{product.category_info.parent_name}</span>
              </Link>
            </div>
          </React.Fragment>
        ) : null}

        {product?.category_info?.name ? (
          <React.Fragment key="sub-cat">
            <i className="fas fa-chevron-right crumb-arrow"></i>
            <div className="crumb-item">
              <Link href={`/category/${product.category_info.slug}`} className="crumb-link active">
                <i className="fas fa-tag crumb-icon-active"></i>
                <span>{product.category_info.name}</span>
              </Link>
            </div>
          </React.Fragment>
        ) : null}
      </nav>

      {/* 🟢 GLOBAL CSS SCOPING (BYPASSES NEXT.JS LINK SCOPING BUGS) */}
      <style jsx global>{`
        .pdp-top-header-wrapper {
          width: 100% !important;
          background: #ffffff !important;
          border-bottom: 1px solid #e2e8f0 !important;
          box-sizing: border-box !important;
          position: relative !important;
          z-index: 10 !important;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02) !important;
        }

        @media (min-width: 769px) {
          .pdp-top-header-wrapper {
            max-width: 1350px !important;
            margin: 15px auto 0 auto !important;
            border-radius: 16px !important;
            border: 1px solid #e2e8f0 !important;
          }
        }

        .pdp-title-bar {
          display: grid !important;
          grid-template-columns: 36px 1fr auto !important;
          align-items: center !important;
          gap: 12px !important;
          width: 100% !important;
          padding: 12px 18px !important;
          box-sizing: border-box !important;
          background: #ffffff !important;
        }

        @media (min-width: 769px) {
          .pdp-title-bar {
            grid-template-columns: 42px 1fr auto !important;
            padding: 16px 28px !important;
            gap: 18px !important;
          }
        }

        .pdp-back-btn {
          width: 36px !important;
          height: 36px !important;
          border-radius: 50% !important;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          box-sizing: border-box !important;
        }

        @media (min-width: 769px) {
          .pdp-back-btn {
            width: 42px !important;
            height: 42px !important;
            font-size: 16px !important;
          }
        }

        .pdp-back-btn:hover {
          background: #f85606 !important;
          color: #ffffff !important;
          border-color: #f85606 !important;
          transform: scale(1.05) !important;
        }

        .pdp-title-box {
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
        }

        .pdp-title-text {
          display: block !important;
          width: 100% !important;
          font-size: 15px !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          -webkit-text-fill-color: #0f172a !important;
          margin: 0 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          line-height: 1.3 !important;
        }

        @media (min-width: 769px) {
          .pdp-title-text {
            font-size: 19px !important;
            letter-spacing: -0.3px !important;
          }
        }

        .pdp-action-buttons {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }

        @media (min-width: 769px) {
          .pdp-action-buttons {
            gap: 14px !important;
          }
        }

        /* 🟢 DESKTOP CART BUTTON FIXED GLOBAL STYLES */
        .pdp-cart-btn-desktop {
          display: none !important;
        }

        @media (min-width: 769px) {
          .pdp-cart-btn-desktop {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: relative !important; /* CRITICAL ANCHOR FOR BADGE */
            width: 42px !important;
            height: 42px !important;
            border-radius: 50% !important;
            background: linear-gradient(135deg, #f85606 0%, #ff8a00 100%) !important;
            color: #ffffff !important;
            text-decoration: none !important;
            font-size: 16px !important;
            box-shadow: 0 4px 14px rgba(248, 86, 6, 0.35) !important;
            transition: all 0.25s ease !important;
            flex-shrink: 0 !important;
          }

          .pdp-cart-btn-desktop:hover {
            transform: translateY(-2px) scale(1.08) !important;
            box-shadow: 0 6px 20px rgba(248, 86, 6, 0.45) !important;
          }

          /* 🟢 BADGE STRICTLY LOCKED AT TOP-RIGHT CORNER OF CART CIRCLE */
          .pdp-cart-badge {
            position: absolute !important;
            top: -5px !important;
            right: -5px !important;
            background: #0f172a !important;
            color: #ffffff !important;
            font-size: 11px !important;
            font-weight: 900 !important;
            width: 20px !important;
            height: 20px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border: 2px solid #ffffff !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25) !important;
            line-height: 1 !important;
            z-index: 20 !important;
          }
        }

        .pdp-icon-btn {
          width: 34px !important;
          height: 34px !important;
          border-radius: 50% !important;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          color: #475569 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 13px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          box-sizing: border-box !important;
        }

        @media (min-width: 769px) {
          .pdp-icon-btn {
            width: 42px !important;
            height: 42px !important;
            font-size: 16px !important;
          }
        }

        .pdp-icon-btn:hover {
          background: #ffffff !important;
          border-color: #cbd5e1 !important;
          color: #0f172a !important;
          transform: scale(1.05) !important;
        }
        .pdp-icon-btn.heart-active {
          background: #fef2f2 !important;
          border-color: #fecdd3 !important;
          color: #e11d48 !important;
        }

        /* 🟢 BREADCRUMBS GLOBAL STYLES */
        .pdp-breadcrumbs-bar {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 10px 18px !important;
          font-size: 12px !important;
          background: #ffffff !important;
          border-top: 1px solid #f8fafc !important;
          white-space: nowrap !important;
          overflow-x: auto !important;
          scrollbar-width: none !important;
        }
        .pdp-breadcrumbs-bar::-webkit-scrollbar { display: none; }

        @media (min-width: 769px) {
          .pdp-breadcrumbs-bar {
            padding: 12px 28px !important;
            font-size: 13px !important;
            gap: 12px !important;
            border-top: 1px solid #f1f5f9 !important;
          }
        }

        .crumb-item {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
        }

        .crumb-link {
          color: #475569 !important;
          text-decoration: none !important;
          font-weight: 600 !important;
          padding: 4px 12px !important;
          border-radius: 20px !important;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          transition: all 0.25s ease !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02) !important;
        }

        @media (min-width: 769px) {
          .crumb-link {
            padding: 6px 16px !important;
            font-size: 13px !important;
          }
        }

        .crumb-link:hover {
          color: #f85606 !important;
          background: #fff7ed !important;
          border-color: #ffedd5 !important;
          transform: translateY(-1.5px) !important;
          box-shadow: 0 3px 8px rgba(248, 86, 6, 0.12) !important;
        }

        .crumb-link.active {
          color: #ea580c !important;
          background: #fff7ed !important;
          border-color: #ffedd5 !important;
          font-weight: 800 !important;
        }

        .crumb-icon { font-size: 11px !important; color: #f85606 !important; }
        .crumb-icon-sub { font-size: 11px !important; color: #3b82f6 !important; }
        .crumb-icon-active { font-size: 11px !important; color: #ea580c !important; }

        .crumb-arrow {
          color: #cbd5e1 !important;
          font-size: 9px !important;
          animation: arrowPulse 2s infinite ease-in-out !important;
        }

        @keyframes arrowPulse {
          0%, 100% { opacity: 0.5; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}