import { useState, useEffect } from 'react';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        reg.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribeToPush = async (userToken: string) => {
    if (!registration) return;

    try {
      // 1. Get VAPID public key from backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications/vapid-public-key`);
      const { publicKey } = await response.json();

      // 2. Subscribe user
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      };

      const newSubscription = await registration.pushManager.subscribe(subscribeOptions);
      
      // 3. Send subscription to backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          subscription: newSubscription,
          deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
        })
      });

      setSubscription(newSubscription);
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to subscribe user:', error);
      return false;
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe user:', error);
      return false;
    }
  };

  return { isSubscribed, subscribeToPush, unsubscribeFromPush };
};
