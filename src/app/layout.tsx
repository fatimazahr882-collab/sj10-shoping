import "./globals.css";
import { Poppins } from "next/font/google";
import { Suspense, type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google'; // New Import

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConditionalTopBar from "@/components/ConditionalTopBar";
import NotificationManager from "@/components/NotificationManager";

// Contexts
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/context/CartContext";

// Font Optimization (Subsets reduce file size = Faster Load)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Added 300 for light text
  display: "swap",
  variable: "--font-poppins",
});

// SEO & Metadata (Advanced)
export const metadata = {
  title: "SJ10 - Saman Junction | Pakistan's #1 Online Shopping",
  description: "Shop the best fashion, electronics, and home goods in Pakistan with fast delivery.",
  icons: {
    icon: '/favicon.ico', // Make sure you have a favicon
  },
  openGraph: {
    title: "Online Shopping & Reselling  in Pakistan - Fashion  Grocries & Electronics With SJ10.pk",
    description: "Premium shopping & REselling experience in Pakistan with fast delivery and wide selection of fashion, groceries, and electronics.",
    url: 'https://sj10.pk', // Replace with real URL later
    siteName: 'SJ10',
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents input zooming on mobile for "App-like" feel
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en" className={`${poppins.variable} scroll-smooth`}>
      <head>
        {/* Performance: Connect to CDN early */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        
        {/* Icons */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      
      {/* 
         antialiased: Makes text sharper
         selection: Custom highlight color
      */}
      <body className="relative min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-indigo-500 selection:text-white">
        
        {/* 1. Google Provider (Wraps everything) */}
        <GoogleOAuthProvider clientId={googleClientId}>
          
          {/* 2. Auth Provider */}
          <AuthProvider>
            
            {/* 3. Cart Provider */}
            <CartProvider>
              
              {/* Top Bar (Suspense prevents blocking) */}
              <Suspense fallback={<div className="h-10 bg-gray-100 w-full animate-pulse" />}>
                <ConditionalTopBar />
              </Suspense>

              {/* Global Notifications */}
              <NotificationManager />

              {/* Main Header */}
              <Suspense fallback={<div className="h-20 bg-white w-full border-b border-gray-200" />}>
                <Header />
              </Suspense>

              {/* Page Content */}
              <main className="page-container relative z-0 min-h-[70vh] flex flex-col">
                {children}
              </main>

              {/* Footer */}
              <Suspense fallback={<div className="h-64 bg-gray-900 w-full" />}>
                <Footer />
              </Suspense>

            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}