// src/components/FontAwesomeLoader.tsx
"use client";

import { useEffect } from "react";

export default function FontAwesomeLoader() {
  useEffect(() => {
    // 🟢 Initial Paint ke foran baad icons load honge (Zero Render Blocking)
    const existing = document.getElementById("fa-cdn-link");
    if (!existing) {
      const link = document.createElement("link");
      link.id = "fa-cdn-link";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      link.crossOrigin = "anonymous";
      link.referrerPolicy = "no-referrer";
      document.head.appendChild(link);
    }
  }, []);

  return null;
}