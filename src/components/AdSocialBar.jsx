"use client";

import { useEffect } from 'react';

/**
 * AdSocialBar – Memuat skrip Social Bar Adsterra (iklan notifikasi melayang).
 *
 * ARSITEKTUR (FIXED):
 * - Tidak menggunakan useRef sebagai penjaga, karena ref bisa hilang saat
 *   Next.js melakukan hydration atau hot-reload di development.
 * - Sebagai gantinya, kita cek langsung ke DOM apakah script sudah ada.
 * - Jika sudah ada, tidak diinjeksi ulang (mencegah duplikasi).
 * - Jika belum ada (misal setelah reload penuh), script diinjeksi.
 */

const SOCIAL_BAR_SRC = 'https://glamournakedemployee.com/6b/5f/74/6b5f74f06f7a6a6df37d65cea9803a1d.js';
const SOCIAL_BAR_ATTR = 'data-adsterra-socialbar';

export default function AdSocialBar() {
  useEffect(() => {
    // Cek DOM langsung — lebih reliable dari useRef
    if (document.querySelector(`script[${SOCIAL_BAR_ATTR}]`)) {
      return; // Sudah ada, jangan duplikasi
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.setAttribute('data-cfasync', 'false');
    script.src = SOCIAL_BAR_SRC;
    script.async = true;
    script.setAttribute(SOCIAL_BAR_ATTR, '1');

    // Pasang di body sesuai standar Adsterra (sebelum </body>)
    document.body.appendChild(script);
  }, []);

  return null;
}
