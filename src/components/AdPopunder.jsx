"use client";

import { useEffect } from 'react';

/**
 * AdPopunder – Memuat skrip Popunder Adsterra satu kali per sesi browser.
 * Dipasang HANYA di halaman video (/video/...) agar tidak mengganggu
 * pengunjung yang sedang browsing halaman utama atau kategori.
 *
 * Menggunakan sessionStorage sebagai kunci satu-sesi:
 * - Muncul 1x saat pengunjung pertama kali membuka halaman video.
 * - Tidak muncul lagi meski pengunjung berpindah ke video lain.
 * - Muncul kembali saat pengunjung membuka tab/sesi browser baru.
 */
export default function AdPopunder() {
  useEffect(() => {
    const SESSION_KEY = 'adsterra_popunder_v1';

    // Jika sudah pernah ditembakkan di sesi ini, jangan ulangi lagi.
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Tandai sesi ini sudah menerima popunder.
    sessionStorage.setItem(SESSION_KEY, '1');

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://glamournakedemployee.com/c5/d4/ca/c5d4ca9c6ad3af9bb2af16d5405c0a02.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null; // Tidak merender apapun secara visual
}
