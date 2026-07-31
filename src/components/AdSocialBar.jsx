"use client";

import { useEffect } from 'react';

/**
 * AdSocialBar – Memuat skrip Social Bar Adsterra (iklan notifikasi melayang).
 *
 * ARSITEKTUR (FIXED):
 * Tidak menggunakan useRef sebagai penjaga, karena script Adsterra terkadang
 * gagal inisialisasi ulang jika hanya memori React yang di-reset tanpa membersihkan DOM.
 * Kita cek langsung di DOM apakah script sudah terpasang.
 * Jika ya (dari navigasi sebelumnya), biarkan.
 * Jika tidak (reload awal), injeksi baru.
 */

const SOCIAL_BAR_SRC = 'https://glamournakedemployee.com/6b/5f/74/6b5f74f06f7a6a6df37d65cea9803a1d.js';
const SOCIAL_BAR_ATTR = 'data-adsterra-socialbar';

export default function AdSocialBar() {
  useEffect(() => {
    // Cek DOM langsung:
    if (document.querySelector(`script[${SOCIAL_BAR_ATTR}]`)) {
      return; // Sudah ada, tidak perlu injeksi ulang
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.setAttribute('data-cfasync', 'false');
    script.src = SOCIAL_BAR_SRC;
    script.async = true;
    script.setAttribute(SOCIAL_BAR_ATTR, '1');

    document.head.appendChild(script);
  }, []);

  return null;
}
