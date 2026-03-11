"use client";

import TopBar from './TopBar';

export default function ConditionalTopBar() {
  // We remove the hydration delay here so the Search Bar loads INSTANTLY on mobile & desktop.
  // The hydration logic is now handled safely inside TopBar.tsx itself.
  return <TopBar />;
}