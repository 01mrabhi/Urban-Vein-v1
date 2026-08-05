import { useState, useEffect } from 'react';

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).Razorpay) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK script');
      setIsLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      // Optional cleanup if script wasn't fully loaded
    };
  }, []);

  return { isLoaded };
}
