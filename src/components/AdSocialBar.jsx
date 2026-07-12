"use client";

import { useEffect, useRef } from 'react';

/**
 * AdSocialBar – Memuat skrip Social Bar Adsterra (iklan notifikasi melayang).
 * Diletakkan di layout.jsx agar tampil di semua halaman.
 */
export default function AdSocialBar() {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://glamournakedemployee.com/6b/5f/74/6b5f74f06f7a6a6df37d65cea9803a1d.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null; // Tidak merender apapun secara visual
}
