// src/components/AnimatedHeaderSlogan.tsx
"use client";

import { useState, useEffect } from 'react';

const slogans = [
  "Pakistan's #1 Shopping Site",
  "COD All Over Pakistan",
  "Sell Products & Earn Money",
];

export default function AnimatedHeaderSlogan() {
  const [currentSlogan, setCurrentSlogan] = useState(slogans[0]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false); // Start fade-out
      setTimeout(() => {
        setCurrentSlogan(prevSlogan => {
          const currentIndex = slogans.indexOf(prevSlogan);
          const nextIndex = (currentIndex + 1) % slogans.length;
          return slogans[nextIndex];
        });
        setIsVisible(true); // Start fade-in with new slogan
      }, 500); // Wait for fade-out to complete
    }, 4000); // Time each slogan is visible + fade time

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animated-slogan-container">
      <span className={`animated-slogan-text ${isVisible ? 'visible' : ''}`}>
        {currentSlogan}
      </span>
    </div>
  );
}