"use client";

import { useEffect } from 'react';

/**
 * AdPopunder – Memuat skrip Popunder Adsterra setiap kali halaman video dibuka.
 * Dipasang HANYA di halaman video (/video/...) agar tidak mengganggu
 * pengunjung yang sedang browsing halaman utama atau kategori.
 *
 * Tanpa batasan sesi — popunder akan muncul setiap kali pengunjung
 * membuka atau berpindah ke halaman video manapun.
 */
export default function AdPopunder() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://glamournakedemployee.com/c5/d4/ca/c5d4ca9c6ad3af9bb2af16d5405c0a02.js';
    script.async = true;
    document.head.appendChild(script);

    // Cleanup: hapus script saat komponen unmount (user keluar dari halaman video)
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null; // Tidak merender apapun secara visual
}
