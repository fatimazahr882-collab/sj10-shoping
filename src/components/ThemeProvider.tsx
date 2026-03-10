// src/components/ThemeProvider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// We use React.ComponentProps to automatically figure out the correct types.
// This completely removes the need to import from "next-themes/dist/types"!
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}