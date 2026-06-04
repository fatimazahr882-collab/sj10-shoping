// src/app/products/[slug]/not-found.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import ProductCard, { type Product } from '@/components/ProductCard';
import LatestProductsExplore from '@/components/LatestProductsExplore';

const API_BASE = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "https://products.sj10.pk/api";
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProductNotFound() {
  const pathname = usePathname();
  const [searchKeyword, setSearchKeyword] = useState("");

  // 1. URL se purani product ka naam nikalna (e.g., /products/blue-cotton-shirt-123 -> "blue cotton shirt")
  useEffect(() => {
    const slug = pathname.split('/').pop() || '';
    // Hyphens aur numbers hata kar clean keyword banayein
    const cleanSlug = slug.replace(/[0-9-]/g, ' ').replace(/\s+/g, ' ').trim();
    // Shuru ke 2-3 words lein taake search result achay aayein
    const keyword = cleanSlug.split(' ').slice(0, 3).join(' ');
    setSearchKeyword(keyword);
  }, [pathname]);

  // 2. Milti-julti products API se fetch karna
  const { data: relatedData, isLoading: isRelatedLoading } = useSWR(
    searchKeyword ? `${API_BASE}/products/search-results?q=${encodeURIComponent(searchKeyword)}&limit=10` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const relatedProducts: Product[] = relatedData?.products || (Array.isArray(relatedData) ? relatedData : []);

  return (
    <div className="not-found-wrapper">
      {/* 🔴 CSS STYLING */}
      <style jsx>{`
        .not-found-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 80px;
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
        }

        /* 🟢 Animated Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);
          padding: 60px 20px;
          text-align: center;
          border-bottom: 1px solid #ffedd5;
          position: relative;
        }

        .emoji-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          background: #ffedd5;
          border-radius: 50%;
          font-size: 50px;
          box-shadow: 0 10px 25px rgba(249, 115, 22, 0.2);
          margin-bottom: 20px;
          position: relative;
        }

        .broken-heart {
          position: absolute;
          bottom: -5px;
          right: -5px;
          font-size: 30px;
          animation: float 3s ease-in-out infinite;
        }

        .title {
          font-size: 28px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 15px;
          color: #64748b;
          max-width: 500px;
          margin: 0 auto 25px auto;
          line-height: 1.7;
        }

        .home-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(90deg, #f85606, #ff8a00);
          color: white;
          padding: 14px 35px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 15px;
          text-decoration: none;
          box-shadow: 0 10px 20px rgba(248, 86, 6, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .home-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 25px rgba(248, 86, 6, 0.4);
        }

        /* 🟢 Related Products Horizontal Slider */
        .related-section {
          max-width: 1400px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .section-header {
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-left: 5px solid #f85606;
          padding-left: 12px;
        }

        .product-slider {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 20px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .product-slider::-webkit-scrollbar {
          display: none;
        }

        .slider-item {
          flex: 0 0 160px;
          scroll-snap-align: start;
        }

        @media (min-width: 768px) {
          .slider-item { flex: 0 0 220px; }
          .title { font-size: 36px; }
        }

        /* 🟢 Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(10deg); }
        }
      `}</style>

      {/* 🔴 BEAUTIFUL APOLOGY HERO SECTION */}
      <div className="hero-section">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="emoji-container"
        >
          😔
          <div className="broken-heart">💔</div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="title"
        >
          Maazrat Chahte Hain! 🥺
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="subtitle"
        >
          Aap jo product dekhna chah rahe hain wo shayad <strong>Sold Out</strong> ho chuki hai ya uska link update ho gaya hai. Lekin fikar na karein, hum aapko khali hath wapis nahi janay denge! 🎁
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/explore" className="home-btn">
            <i className="fas fa-shopping-bag"></i> Continue Shopping
          </Link>
        </motion.div>
      </div>

      {/* 🔴 RELATED PRODUCTS SLIDER (Based on Dead Slug Keywords) */}
      {relatedProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="related-section"
        >
          <h2 className="section-header">
            🛍️ Milti Julti Products (Khas Aap Ke Liye)
          </h2>
          <div className="product-slider">
            {relatedProducts.map((p, index) => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="slider-item"
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 🔴 LATEST PRODUCTS FALLBACK (Standard Grid) */}
      <div className="related-section">
        <h2 className="section-header">
          🔥 Hamari Nayi Collection Check Karein
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {/* Reuse the LatestProductsExplore component for a live feed */}
          <LatestProductsExplore 
            searchQuery="" 
            filterVideo={false} 
            filterVerified={false} 
          />
        </div>
      </div>

    </div>
  );
}