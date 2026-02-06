// src/components/TopBar.tsx
"use client";

import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  // =======================================================================
  // === THE FIX: This function now correctly signs out and refreshes    ===
  // =======================================================================
  const handleLogout = async () => {
    await signOut();
    // Force a full page refresh to ensure all state is cleared and
    // the AuthProvider re-evaluates the user's session correctly.
    router.refresh();
  };

  if (isLoading) {
    return <div className="top-bar-placeholder"></div>;
  }

  return (
    <div className="top-bar">
      <div className="top-bar-content">
        {user ? (
          // --- Logged-In User View ---
          <>
            <button onClick={handleLogout} className="top-bar-btn">Logout</button>
            <a href="https://sj10suppliers.netlify.app/" target="_blank" rel="noopener noreferrer" className="top-bar-btn highlight">
              Sell on SJ10
            </a>
          </>
        ) : (
          // --- Guest User View ---
          <>
            <Link href="/auth?view=login" className="top-bar-btn">Login</Link>
            <Link href="/auth?view=signup" className="top-bar-btn">Signup</Link>
            <a href="https://sj10suppliers.netlify.app/" target="_blank" rel="noopener noreferrer" className="top-bar-btn highlight">
              Sell on SJ10
            </a>
          </>
        )}
      </div>
    </div>
  );
}