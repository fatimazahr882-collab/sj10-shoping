// src/app/auth/page.tsx
import { redirect } from 'next/navigation';

export default function AuthIndex() {
  // Automatically redirect /auth -> /auth/login
  redirect('/auth/login');
}