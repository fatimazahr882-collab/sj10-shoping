// src/components/ClientOnly.tsx
"use client";

import React, { useEffect, useState } from 'react';

// This component's only job is to delay rendering its children
// until it has safely mounted on the client-side.
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // This effect runs only once, after the initial render on the client.
    setHasMounted(true);
  }, []);

  // On the server render and during the initial client render, we render null.
  // This ensures the HTML from the server and the initial client render are identical,
  // which is what solves the hydration mismatch error.
  if (!hasMounted) {
    return null;
  }

  // Only after the component has safely mounted on the client, we render the actual children.
  return <>{children}</>;
}