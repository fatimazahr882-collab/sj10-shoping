// src/app/layout.tsx
// @ts-ignore: Allow importing global CSS without explicit type declarations.
import "./globals.css";
import { Poppins } from "next/font/google";
import { Suspense, type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

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
  weight: ["300", "400", "500", "600", "700", "800", "900"], 
  display: "swap",
  variable: "--font-poppins",
});

const SITE_URL = "https://www.sj10.pk";

// 🚀 ADVANCED SEO & METADATA
export const metadata = {
  metadataBase: new URL(SITE_URL), // 🔴 CRITICAL: Required for absolute canonical URLs
  title: {
    default: "SJ10 - Saman Junction | Pakistan's #1 Online Shopping",
    template: "%s | SJ10.pk" // Automatically formats child page titles
  },
  description: "Shop the best fashion, electronics, and home goods in Pakistan with fast delivery and Cash on Delivery (COD).",
  icons: {
    icon: '/favicon.ico', 
    apple: '/apple-touch-icon.png', // Good for mobile bookmarks
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Online Shopping & Reselling in Pakistan - Fashion, Groceries & Electronics",
    description: "Premium shopping & reselling experience in Pakistan with fast delivery and a wide selection of fashion, groceries, and electronics.",
    url: SITE_URL,
    siteName: 'SJ10',
    locale: 'en_PK', // 🔴 FIXED: Tell Google this is specifically for Pakistan
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SJ10 - Pakistan's #1 Online Shopping",
    description: "Premium shopping & reselling experience in Pakistan.",
  }
};

// 🚀 VIEWPORT & ACCESSIBILITY
// 🚀 UPDATED VIEWPORT & THEME
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f85606', // Daraz/SJ10 Orange color for mobile status bars
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en" className={`${poppins.variable} scroll-smooth`}>
      <head>
        {/* Performance: Connect to external domains early */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
         <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="format-detection" content="telephone=no" />
        {/* FontAwesome Icons */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      
      <body className="relative min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-orange-500 selection:text-white">
        
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <CartProvider>
              
              {/* 
                🚀 CLS FIX: Suspense fallbacks now EXACTLY match the height 
                of the actual components (40px for TopBar, 70px for Header).
                This stops the screen from "jumping" on load.
              */}
              <Suspense fallback={<div style={{ height: '40px', width: '100%', backgroundColor: '#1e40af' }} className="animate-pulse" />}>
                <ConditionalTopBar />
              </Suspense>

              <NotificationManager />

              <Suspense fallback={<div style={{ height: '70px', width: '100%', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }} />}>
                <Header />
              </Suspense>

              {/* Page Content */}
              <main className="page-container relative z-0 min-h-[70vh] flex flex-col">
                {children}
              </main>

              {/* Footer */}
              <Suspense fallback={<div className="h-64 bg-[#0A1E40] w-full" />}>
                <Footer />
              </Suspense>

            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}