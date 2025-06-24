"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ToastKeyboardHandler() {
  const [toastCount, setToastCount] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toast.dismiss();
      }
    };

    // Monitor toast count for showing dismiss all button
    const checkToastCount = () => {
      const toasts = document.querySelectorAll('[data-sonner-toast]');
      setToastCount(toasts.length);
    };

    // Check initially and set up observer
    checkToastCount();
    const observer = new MutationObserver(checkToastCount);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, []);

  // Show dismiss all button when there are multiple toasts
  useEffect(() => {
    if (toastCount > 1) {
      const existingButton = document.querySelector('.dismiss-all-toasts');
      if (!existingButton) {
        const button = document.createElement('button');
        button.className = 'dismiss-all-toasts fixed top-4 right-4 z-[9999] bg-notion-accent text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-notion-accent-hover transition-colors shadow-lg';
        button.textContent = `Dismiss All (${toastCount})`;
        button.onclick = () => {
          toast.dismiss();
          button.remove();
        };
        document.body.appendChild(button);
      } else {
        existingButton.textContent = `Dismiss All (${toastCount})`;
      }
    } else {
      const existingButton = document.querySelector('.dismiss-all-toasts');
      if (existingButton) {
        existingButton.remove();
      }
    }
  }, [toastCount]);

  return null;
} 