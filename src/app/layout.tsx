// src/app/layout.tsx

// --- LINE 1-5: STANDARD IMPORTS ---
import "./globals.css";
import { Poppins } from "next/font/google";
import { Suspense, type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

// --- LINE 7-8: NEW IMPORTS FOR THEME & LANGUAGE ---
import {NextIntlClientProvider, useMessages} from 'next-intl';
import { ThemeProvider } from "@/components/ThemeProvider";

// --- LINE 11-16: YOUR COMPONENTS (NO ConditionalTopBar) ---
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar"; 
import NotificationManager from "@/components/NotificationManager";

// --- LINE 19-20: YOUR CONTEXTS (No change) ---
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/context/CartContext";

// --- LINE 23-40: YOUR FONT, METADATA, VIEWPORT (No change) ---
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});
export const metadata = {
  title: "SJ10 - Saman Junction | Pakistan's #1 Online Shopping",
  description: "Shop the best fashion, electronics, and home goods in Pakistan with fast delivery.",
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// --- LINE 44-50: FUNCTION SIGNATURE UPDATED ---
export default function RootLayout({ 
  children, 
  params: { locale } 
}: { 
  children: ReactNode;
  params: { locale: string };
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  // --- LINE 51: This gets the dictionary (en.json or ur.json) ---
  const messages = useMessages();

  return (
    // --- LINE 55: HTML TAG UPDATED ---
    <html lang={locale} className={`${poppins.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body>
        {/* --- LINE 67-89: ALL PROVIDERS WRAPPED CORRECTLY --- */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <GoogleOAuthProvider clientId={googleClientId}>
              <AuthProvider>
                <CartProvider>
                  {/* We now use TopBar directly, no need for ConditionalTopBar */}
                  <TopBar />
                  <NotificationManager />
                  <Header />

                  <main className="page-container relative z-0 min-h-[70vh] flex flex-col">
                    {children}
                  </main>

                  <Footer />
                </CartProvider>
              </AuthProvider>
            </GoogleOAuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}