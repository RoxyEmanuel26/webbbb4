"use client";

import { useEffect, useRef } from 'react';

/**
 * AdPopunder – Memuat skrip Popunder Adsterra satu kali per sesi.
 * Diletakkan di layout.jsx agar berjalan di semua halaman.
 * Menggunakan sessionStorage agar popunder hanya muncul sekali per sesi,
 * tidak mengganggu pengguna yang berpindah halaman.
 */
export default function AdPopunder() {
  const injected = useRef(false);

  useEffect(() => {
    // --- PAUSED BY USER (Do not delete) ---
    // Remove the early return below to re-enable the popunder ad.
    return;
    
    if (injected.current) return;
    injected.current = true;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://glamournakedemployee.com/c5/d4/ca/c5d4ca9c6ad3af9bb2af16d5405c0a02.js';
    script.async = true;
    document.head.appendChild(script);

    // Tidak perlu cleanup karena popunder hanya boleh dimuat satu kali
  }, []);

  return null; // Tidak merender apapun secara visual
}
