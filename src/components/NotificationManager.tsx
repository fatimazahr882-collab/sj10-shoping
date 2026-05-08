"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { usePathname } from "next/navigation";

// Helper: Convert VAPID Key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationManager() {
  const pathname = usePathname(); 
  const [isSubscribed, setIsSubscribed] = useState(false);

 useEffect(() => {
    async function subscribeUserToPush() {
      // 🛑 THE FIX: Pehle check karein token hai ya nahi
      const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null; 
      
      if (!token) {
        // Agar token nahi hai toh khamoshi se return kar jao
        console.log("Guest User: Notification sync skipped.");
        return;
      }

      // Baqi sara code iske neeche aayega...
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return;
      }

      try {
        // 3. Register Service Worker
        // Ensure sw.js is in your public/ folder
        const register = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("✅ Service Worker Ready");

        // 4. Check Current Permission
        let permission = Notification.permission;
        
        if (permission === 'denied') {
            console.warn("🚫 Notifications blocked by user.");
            return;
        }

        // 5. If not granted, ASK NOW
        // This will trigger immediately after you login because the path changes
        if (permission === 'default') {
            console.log("🔔 Requesting Permission...");
            permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') return;

        // 6. Check if already subscribed in Browser
        let subscription = await register.pushManager.getSubscription();

        // 7. If no subscription exists, create a new one
       // ... inside subscribeUserToPush ...

        // 7. If no subscription exists, create a new one
        if (!subscription) {
            console.log("Fetching VAPID Key...");
            
            // ✅ FIX: Expect JSON response
            const response = await apiClient("/notifications/vapid-key", "GET");
            
            // ✅ FIX: Access the 'key' property
            const vapidKey = response.key; 

            if (!vapidKey) throw new Error("VAPID key not found in response");

            subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });
        }

// ... rest of the code ...

        // 8. SEND TO BACKEND
        console.log("💾 Saving subscription to database...");
        await apiClient("/notifications/subscribe", "POST", { subscription });
        
        setIsSubscribed(true);
        console.log("✅ Device Subscribed Successfully!");

      } catch (error) {
        console.error("❌ Subscription Error:", error);
      }
    }

    subscribeUserToPush();

  // Re-run whenever the URL changes (e.g., redirecting after login)
  }, [pathname]); 

  return null;
}