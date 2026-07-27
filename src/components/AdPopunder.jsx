"use client";

import { useEffect } from 'react';

/**
 * AdPopunder – Memuat skrip Popunder Adsterra.
 *
 * ARSITEKTUR:
 * Script ini mendaftarkan click listener pada document.
 * NAMUN karena video player adalah cross-origin iframe (eporner.com),
 * klik user di dalam player TIDAK mencapai document listener ini.
 *
 * Solusi: VideoPlayerClient memasang transparent overlay di atas iframe.
 * Overlay menangkap klik pertama user (trusted event), lalu secara
 * sinkron mendispatch click ke document agar Adsterra bisa memicunya.
 *
 * FIXED:
 * - Sebelumnya script dihapus+diinjeksi ulang setiap render.
 * - Sekarang kita cek DOM secara langsung — jika script sudah ada
 *   (misal dari SPA navigation sebelumnya), tidak perlu re-inject.
 * - Jika belum ada (misal setelah reload penuh), script diinjeksi fresh.
 * - Listener lama otomatis hilang bersama script lama saat reload penuh,
 *   jadi tidak ada risiko listener ganda.
 */

const POPUNDER_SRC = 'https://glamournakedemployee.com/c5/d4/ca/c5d4ca9c6ad3af9bb2af16d5405c0a02.js';
const POPUNDER_ATTR = 'data-adsterra-popunder';

export default function AdPopunder() {
  useEffect(() => {
    // Cek DOM langsung apakah script sudah ada
    if (document.querySelector(`script[${POPUNDER_ATTR}]`)) {
      return; // Sudah ada, skip — listener Adsterra masih aktif
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.setAttribute('data-cfasync', 'false');
    script.src = POPUNDER_SRC;
    script.async = true;
    script.setAttribute(POPUNDER_ATTR, '1');

    // Pasang di head sesuai standar Adsterra (sebelum </head>)
    document.head.appendChild(script);
  }, []);

  return null;
}
