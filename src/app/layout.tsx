// src/app/layout.tsx
// @ts-expect-error - CSS imports are handled by Next.js at build time.
import "./globals.css";
import { Poppins } from "next/font/google";
import { Suspense, type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConditionalTopBar from "@/components/ConditionalTopBar";
import NotificationManager from "@/components/NotificationManager";
import GlobalProgressBar from "@/components/GlobalProgressBar";

// Contexts
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/context/CartContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"], 
  display: "swap",
  variable: "--font-poppins",
});

const SITE_URL = "https://www.sj10.pk";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SJ10 - Saman Junction | Pakistan's #1 Online Shopping",
    template: "%s | SJ10.pk"
  },
  description: "Shop the best fashion, electronics, and home goods in Pakistan with fast delivery and Cash on Delivery (COD).",
  icons: {
    icon: '/favicon.ico', 
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Online Shopping & Reselling in Pakistan",
    description: "Premium shopping & reselling experience in Pakistan with fast delivery.",
    url: SITE_URL,
    siteName: 'SJ10',
    locale: 'en_PK',
    type: 'website',
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f85606',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en" className={`${poppins.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://media.sj10.pk" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        
        {/* FontAwesome Non-Blocking Async Load */}
        <link 
          rel="preload" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          as="style" 
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body className="relative min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-orange-500 selection:text-white" suppressHydrationWarning>
        <Suspense fallback={null}>
          <GlobalProgressBar />
        </Suspense>

        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <CartProvider>
              <ConditionalTopBar />
              <NotificationManager />
              <Header />

              <main className="page-container relative z-0 min-h-[70vh] flex flex-col">
                {children}
              </main>

              <Footer />
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}