// src/components/GlobalProgressBar.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GlobalProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Stop progress line when route navigation completes
  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  // Intercept every link click globally for 0ms instant feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        const currentUrl = window.location.href;
        const targetUrl = target.href;
        
        // Trigger line animation instantly on click if navigating to new page
        if (currentUrl !== targetUrl && !target.target && !target.hasAttribute("download")) {
          setLoading(true);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!loading) return null;

  return (
    <div className="global-top-progress-bar">
      <div className="progress-bar-fill"></div>
      <style jsx>{`
        .global-top-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          z-index: 10000000;
          background: rgba(248, 86, 6, 0.2);
          overflow: hidden;
          pointer-events: none;
        }
        .progress-bar-fill {
          height: 100%;
          width: 50%;
          background: linear-gradient(90deg, #f85606, #ff8a00, #3b82f6);
          animation: globalLineSlide 0.8s infinite linear;
        }
        @keyframes globalLineSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}