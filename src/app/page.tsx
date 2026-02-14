// src/app/page.tsx
import { getStaticHomeData } from '@/lib/home-data';
import HomeClientPage from '@/components/HomeClientPage';

// --- ISR CONFIGURATION ---
// 21600 seconds = 6 Hours.
// The server will rebuild this page in the background once every 6 hours.
export const revalidate = 21600; 

export default async function HomePage() {
  // This runs on the server at build time (and regeneration time).
  // The data is baked into the HTML, making it load INSTANTLY.
  const initialData = await getStaticHomeData();

  return <HomeClientPage initialData={initialData} />;
}