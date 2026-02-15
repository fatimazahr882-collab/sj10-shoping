// src/app/page.tsx
import { getStaticHomeData } from '@/lib/home-data';
import HomeClientPage from '@/components/HomeClientPage';

// --- ISR CONFIGURATION ---
// 345600 seconds = 4 Days.
// This tells the server: "Only rebuild this page once every 4 days."
// New: 1 hour
export const revalidate = 3600; // 1 hour in seconds




export default async function HomePage() {
  // 1. Fetch data on the server (Instant for user because it comes from cache)
  const initialData = await getStaticHomeData();

  // 2. Pass data to client component to render the layout
  return <HomeClientPage initialData={initialData} />;
}