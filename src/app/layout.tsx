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

// 1. Font Optimization: Variable font reduces network requests
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
  preload: true,
});

// 2. Detailed SEO Optimization
export const metadata = {
  metadataBase: new URL('https://sj10.pk'), // Replace with your actual domain
  title: {
    default: "SJ10 - Pakistan's #1 Online Shopping & Reselling Platform",
    template: "%s | SJ10 Shopping"
  },
  description: "Shop fashion, electronics, home decor, and groceries at SJ10. Fast COD delivery across Pakistan. Join as a reseller and earn money online.",
  keywords: [
    "online shopping pakistan", "sj10", "saman junction", "buy online", 
    "fashion pakistan", "electronics price pakistan", "reselling app pakistan",
    "cod shopping", "ladies bags", "watches", "shoes"
  ],
  authors: [{ name: "Saman Junction Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sj10.pk",
    siteName: "SJ10",
    title: "SJ10 - Shop & Earn in Pakistan",
    description: "Premium shopping experience with fast delivery. Resell products and earn profit from home.",
    images: [
      {
        url: "/og-image.jpg", // Ensure you have an image at public/og-image.jpg
        width: 1200,
        height: 630,
        alt: "SJ10 Online Shopping",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SJ10 - Online Shopping Pakistan",
    description: "Shop best deals or start your reselling business today.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en" className={`${poppins.variable} scroll-smooth`}>
      <head>
        {/* 3. Preconnect to critical domains for speed */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        
        {/* FontAwesome - Loading this is blocking, but necessary for your icons. 
            Ideally, replace with React Icons to remove this link for max speed. */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      
      <body className="relative min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-indigo-500 selection:text-white font-sans">
        
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <CartProvider>
              
              {/* Suspense Boundaries allow parts of the UI to load without blocking the whole page */}
              <Suspense>
                <ConditionalTopBar />
              </Suspense>

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