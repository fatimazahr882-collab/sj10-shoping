"use client";

import React, { useState, useEffect, useRef, useTransition, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

// --- TYPES ---
type Subcategory = { id: string; name: string; image_url: string | null; slug: string; parent_id: string; };
type Category = { id: string; name: string; image_url: string | null; slug: string; subcategories: Subcategory[]; };

// --- HELPER: LOW RES URL ---
const getLowResUrl = (url: string | null, size: number) => {
  if (!url) return null;
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${size},q_auto:eco,f_webp/`);
  }
  return url;
};

// --- SIDEBAR ITEM ---
const SidebarItem = memo(({ cat, isActive, onClick, index }: { cat: Category, isActive: boolean, onClick: (e: any, id: string) => void, index: number }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div 
      className={`sidebar-item ${isActive ? 'active' : ''}`}
      onClick={(e) => onClick(e, cat.id)}
    >
      <div className="icon-box">
        {/* Shimmer Placeholder */}
        {!loaded && <div className="shimmer-loader" />}
        
        {cat.image_url ? (
          <Image 
            src={getLowResUrl(cat.image_url, 80) || cat.image_url} 
            alt={cat.name} 
            fill 
            sizes="60px"
            priority={index < 15} 
            loading={index < 15 ? undefined : "lazy"}
            className={`fade-img ${loaded ? 'loaded' : ''}`}
            onLoad={() => setLoaded(true)}
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <div className="placeholder" />
        )}
      </div>
      <span className="cat-name">{cat.name}</span>
    </div>
  );
});
SidebarItem.displayName = "SidebarItem";

// --- SUB ITEM ---
const SubItem = memo(({ sub, onClick, priority }: { sub: Subcategory, onClick: (slug: string) => void, priority: boolean }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div 
      className="sub-item" 
      onClick={() => onClick(sub.slug)}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.3 }}
    >
      <div className="sub-img-box">
        {!loaded && <div className="shimmer-loader" />}

        {sub.image_url ? (
          <Image 
            src={getLowResUrl(sub.image_url, 180) || sub.image_url} 
            alt={sub.name} 
            fill 
            sizes="(max-width: 768px) 33vw, 150px"
            priority={priority}
            className={`fade-img ${loaded ? 'loaded' : ''}`}
            onLoad={() => setLoaded(true)}
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <div className="placeholder-text">No Img</div>
        )}
      </div>
      <span className="sub-title">{sub.name}</span>
    </motion.div>
  );
});
SubItem.displayName = "SubItem";

// --- MAIN COMPONENT ---
export default function CategoryClientPage({ mainCats }: { mainCats: Category[] }) {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState<string>(mainCats[0]?.id || '');
  const [isPending, startTransition] = useTransition();
  
  const contentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // --- SCROLL SPY ---
  useEffect(() => {
    if (!contentRef.current) return;

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startTransition(() => {
            setActiveCat(entry.target.id.replace('group-', ''));
          });
        }
      });
    }, { 
      root: contentRef.current, 
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0 
    });

    const groups = contentRef.current.querySelectorAll('.category-group');
    groups.forEach((group) => observerRef.current?.observe(group));

    return () => observerRef.current?.disconnect();
  }, [mainCats]);

  const handleSidebarClick = (e: React.MouseEvent, catId: string) => {
    e.preventDefault();
    setActiveCat(catId);
    
    const target = document.getElementById(`group-${catId}`);
    if (target && contentRef.current) {
      const topPos = target.offsetTop - contentRef.current.offsetTop;
      contentRef.current.scrollTo({ top: topPos, behavior: 'auto' });
    }
  };

  const handleSubClick = (slug: string) => {
    router.push(`/category/${slug}`);
  };

  return (
    <div id="cat-page-container">
      <style jsx global>{`
        body { overscroll-behavior: none; overflow: hidden; background: #fff; }
        ::-webkit-scrollbar { display: none; }
        
        #cat-page-container {
          display: flex; flex-direction: column; height: 100vh; 
          background: #fff; overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* HEADER FIX: Increased height & padding to prevent text cutoff */
        .page-header {
          flex: 0 0 60px; /* Increased height */
          background: #fff; 
          display: flex; align-items: center; 
          padding: 0 24px; 
          border-bottom: 1px solid #f1f5f9; 
          z-index: 50;
          flex-shrink: 0; /* Prevents squashing */
        }
        .header-title { 
          font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; 
          line-height: 1.2;
        }

        /* LAYOUT */
        .category-layout { display: flex; flex: 1; overflow: hidden; }

        /* --- SIDEBAR --- */
        .category-sidebar {
          width: 90px; flex: 0 0 90px; background: #fff; overflow-y: auto;
          border-right: 1px solid #f1f5f9; display: flex; flex-direction: column;
          padding-bottom: 120px;
          contain: strict;
        }

        .sidebar-item {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 10px 4px; cursor: pointer; position: relative;
          border-bottom: 1px solid #f8fafc; min-height: 90px;
          transition: background 0.1s ease;
        }
        .sidebar-item.active { background: #f0f9ff; }
        
        .sidebar-item.active::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 4px; background: #0ea5e9; border-radius: 0 4px 4px 0;
        }

        /* ICON BOX - TRANSPARENT */
        .icon-box {
          width: 50px; height: 50px; position: relative; margin-bottom: 6px;
          background: transparent; 
          flex-shrink: 0;
        }
        .cat-name {
          font-size: 10px; text-align: center; color: #64748b; line-height: 1.2; font-weight: 600;
          max-width: 100%; overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .sidebar-item.active .cat-name { color: #0284c7; font-weight: 700; }

        /* --- CONTENT --- */
        .category-content {
          flex: 1; overflow-y: auto; padding: 16px; background: #fff;
          padding-bottom: 140px; 
          scroll-behavior: smooth;
          content-visibility: auto;
        }

        .category-group { margin-bottom: 40px; scroll-margin-top: 10px; }
        
        .group-header { 
          display: flex; align-items: center; gap: 10px; margin-bottom: 15px; 
          position: sticky; top: 0; background: rgba(255,255,255,0.98); 
          z-index: 10; padding: 10px 0; backdrop-filter: blur(5px);
        }
        
        /* Removed Blue Pill to fix 'slash' look */
        /* .blue-pill { width: 4px; height: 22px; background: #0ea5e9; border-radius: 4px; } */
        
        .group-title { font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0; }

        /* GRID */
        .subcategory-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
        }
        
        @media (min-width: 768px) {
          .subcategory-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 24px; }
          .category-sidebar { width: 120px; flex: 0 0 120px; }
          .icon-box { width: 60px; height: 60px; }
          .cat-name { font-size: 12px; }
        }

        /* SUB ITEM - TRANSPARENT */
        .sub-item {
          background: transparent; /* Fixed transparency */
          border-radius: 12px; padding: 8px;
          display: flex; flex-direction: column; align-items: center;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .sub-item:active { transform: scale(0.96); }
        
        .sub-img-box {
          width: 100%; aspect-ratio: 1; position: relative;
          margin-bottom: 8px; overflow: hidden; 
          background: transparent; /* Transparent background */
        }
        .sub-title { 
          font-size: 11px; text-align: center; color: #334155; font-weight: 600; 
          line-height: 1.3;
        }
        
        /* IMAGE LOADING EFFECTS */
        .fade-img {
          opacity: 0; transition: opacity 0.4s ease-in-out;
        }
        .fade-img.loaded {
          opacity: 1;
        }

        /* SHIMMER ANIMATION */
        .shimmer-loader {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: #f1f5f9;
          background-image: linear-gradient(to right, #f1f5f9 0%, #e2e8f0 20%, #f1f5f9 40%, #f1f5f9 100%);
          background-repeat: no-repeat;
          background-size: 800px 100%; 
          animation: shimmer 1.5s infinite linear forwards;
          border-radius: 8px;
        }
        @keyframes shimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }

        .placeholder { width: 100%; height: 100%; background: #f1f5f9; border-radius: 8px; }
        .placeholder-text { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 10px; }
      `}</style>

     
      <div className="category-layout">
        
        {/* SIDEBAR */}
        <nav className="category-sidebar">
          {mainCats.map((cat, index) => (
            <SidebarItem 
              key={cat.id} 
              cat={cat} 
              isActive={activeCat === cat.id} 
              onClick={handleSidebarClick}
              index={index} 
            />
          ))}
        </nav>

        {/* CONTENT */}
        <main className="category-content" ref={contentRef}>
          {mainCats.map((cat, catIndex) => (
            <div key={cat.id} id={`group-${cat.id}`} className="category-group">
              
              <div className="group-header">
                {/* Blue pill removed to fix UI complaint */}
                <h2 className="group-title">{cat.name}</h2>
              </div>

              <div className="subcategory-grid">
                {cat.subcategories.map((sub, index) => (
                  <SubItem 
                    key={sub.id} 
                    sub={sub} 
                    onClick={handleSubClick} 
                    priority={catIndex === 0 && index < 6}
                  />
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}