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
      const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null; 
      
      if (!token) {
        console.log("Guest User: Notification sync skipped.");
        return;
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push notifications not supported in this browser.");
        return;
      }

      try {
        // 1. Register Service Worker
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        
        // 🟢 2. CRITICAL FIX: Wait until the Service Worker is 100% ACTIVE!
        const registration = await navigator.serviceWorker.ready;
        console.log("✅ Service Worker Active & Ready");

        // 3. Check Current Permission
        let permission = Notification.permission;
        
        if (permission === 'denied') {
          console.warn("🚫 Notifications blocked by user.");
          return;
        }

        // 4. Request Permission if needed
        if (permission === 'default') {
          console.log("🔔 Requesting Permission...");
          permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') return;

        // 5. Check if already subscribed in Browser
        let subscription = await registration.pushManager.getSubscription();

        // 6. If no subscription exists, create a new one
        if (!subscription) {
          console.log("Fetching VAPID Key...");
          const response = await apiClient("/notifications/vapid-key", "GET");
          const vapidKey = response.key || response.vapidPublicKey || response.publicKey;

          if (!vapidKey) throw new Error("VAPID key not found in response");

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          });
        }

        // 7. Save subscription in Backend Database
        console.log("💾 Saving subscription to database...");
        await apiClient("/notifications/subscribe", "POST", { subscription });
        
        setIsSubscribed(true);
        console.log("✅ Web Push Device Subscribed Successfully!");

      } catch (error) {
        console.error("❌ Subscription Error:", error);
      }
    }

    subscribeUserToPush();
  }, [pathname]); 

  return null;
}