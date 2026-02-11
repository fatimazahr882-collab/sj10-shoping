// src/app/profile/layout.tsx
import React from 'react';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  // We remove the static header from here to let the pages control their own title if needed.
  return (
    <div id="profile-page">
      {children}
    </div>
  );
}