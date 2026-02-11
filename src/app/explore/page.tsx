"use client";

import React from 'react';
import ExploreClientPage from '@/components/ExploreClientPage';

export default function ExplorePage() {
  // We do NOT fetch data here anymore.
  // We render the client page immediately.
  // The client page will show the Loading Skeleton instantly and fetch data in the background.
  return <ExploreClientPage />;
}