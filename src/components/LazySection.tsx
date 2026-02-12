"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function LazySection({ children, height = "300px", offset = "100px" }: { children: React.ReactNode, height?: string, offset?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Once the placeholder enters the viewport (with optional offset), render the real content
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once loaded
        }
      },
      { rootMargin: offset } // Pre-load just before it comes into view
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [offset]);

  return (
    <div ref={ref} style={{ minHeight: isVisible ? 'auto' : height }}>
      {isVisible ? children : <div className="w-full bg-gray-50 rounded-lg animate-pulse" style={{ height }} />}
    </div>
  );
}