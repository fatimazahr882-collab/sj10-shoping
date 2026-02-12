// src/components/LoadTrigger.tsx
"use client";

import { useEffect, useRef } from 'react';

interface Props {
  onVisible: () => void;
}

export default function LoadTrigger({ onVisible }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Ensure we only create one observer
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // When the trigger is visible, call the function and then stop observing
        if (entry.isIntersecting) {
          onVisible();
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '250px' } // Load content 250px before it's fully in view
    );

    if (ref.current) {
      observerRef.current.observe(ref.current);
    }

    // Cleanup on unmount
    return () => observerRef.current?.disconnect();
  }, [onVisible]);

  // An invisible div to act as the trigger
  return <div ref={ref} className="h-10 w-full" aria-hidden="true" />;
}