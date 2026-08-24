'use client';

import { useEffect } from 'react';

/**
 * Mendaftarkan service worker PWA (hanya di production & browser yang mendukung).
 * Lihat public/sw.js.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] Gagal mendaftarkan service worker:', err);
    });
  }, []);

  return null;
}
