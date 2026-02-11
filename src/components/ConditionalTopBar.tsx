// src/components/ConditionalTopBar.tsx (FINAL, CORRECTED VERSION THAT PRESERVES YOUR DESIGN)
"use client";

import { useState, useEffect } from 'react';
import TopBar from './TopBar'; // We will always render the TopBar after the initial load.

/**
 * This component's ONLY job is to solve the hydration mismatch error.
 * It works by rendering a placeholder on the server and on the very first
 * client render. Immediately after, it re-renders and shows the real <TopBar />.
 *
 * The <TopBar /> component itself is responsible for showing the correct buttons
 * (Login/Signup vs. Logout).
 */
export default function ConditionalTopBar() {
  // This state is the key. It's `false` on the server, and becomes `true`
  // only in the browser after the first render.
  const [hasMounted, setHasMounted] = useState(false);

  // This hook runs only in the browser, after the initial render is complete.
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // --- Rendering Logic ---

  // On the server AND on the first client render, `hasMounted` is `false`.
  // This line is GUARANTEED to run, ensuring the server and client HTML match.
  if (!hasMounted) {
    return <div className="top-bar-placeholder" style={{ height: '35px' }} />;
  }

  // After the component has safely mounted in the browser, we ALWAYS render
  // your real <TopBar /> component. The TopBar will then use its own logic
  // to display the correct buttons for the user's status.
  return <TopBar />;
}