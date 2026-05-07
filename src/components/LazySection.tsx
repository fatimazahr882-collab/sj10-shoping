"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function LazySection({ children, height = "300px", offset = "100px" }: { children: React.ReactNode, height?: string, offset?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Jab user scroll kar ke qareeb aayega toh real content show hoga
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Ek dafa load hone ke baad observer band
        }
      },
      { rootMargin: offset } // Offset (e.g., 200px pehle hi load karna shuru kar do)
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [offset]);

  return (
    <div ref={ref} style={{ minHeight: isVisible ? 'auto' : height }}>
      {isVisible ? children : (
        /* 🟢 BEAUTIFUL SKELETON LOADER INSTEAD OF BLANK SPACE */
        <div style={{ padding: '24px 12px', background: '#ffffff', borderTop: '8px solid #f3f4f6', width: '100%', overflow: 'hidden', height: height }}>
          
          {/* Skeleton Title (Header) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '24px', background: '#cbd5e1', borderRadius: '4px' }}></div>
            <div style={{ width: '180px', height: '24px', background: '#e2e8f0', borderRadius: '6px' }} className="animate-pulse"></div>
          </div>
          
          {/* Skeleton Product Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', width: '100%' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Image Placeholder */}
                <div style={{ width: '100%', aspectRatio: '1/1', background: '#f1f5f9' }} className="animate-pulse"></div>
                
                {/* Text Placeholder */}
                <div style={{ padding: '12px' }}>
                  <div style={{ width: '80%', height: '12px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }} className="animate-pulse"></div>
                  <div style={{ width: '50%', height: '16px', background: '#e2e8f0', borderRadius: '4px' }} className="animate-pulse"></div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}