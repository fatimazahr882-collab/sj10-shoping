// src/components/ThemeSwitcher.tsx
"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // This ensures the button only renders on the client, avoiding errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Don't show anything on the server
  }

  return (
    <button
      className="theme-toggle-btn"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}