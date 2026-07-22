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
 * Komponen ini hanya bertugas memuat dan me-refresh script Adsterra
 * setiap kali user membuka halaman video.
 */
export default function AdPopunder() {
  useEffect(() => {
    const ATTR = 'data-adsterra-popunder';

    // Hapus script lama agar click listener lama juga ikut terhapus.
    // Ini penting agar setiap halaman video mendapat listener yang segar.
    const old = document.querySelector(`script[${ATTR}]`);
    if (old) {
      try { old.remove(); } catch (_) {}
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://glamournakedemployee.com/c5/d4/ca/c5d4ca9c6ad3af9bb2af16d5405c0a02.js';
    script.async = true;
    script.setAttribute(ATTR, '1');

    // Pasang di body sesuai standar Adsterra
    document.body.appendChild(script);

    // Tidak ada cleanup — biarkan script tetap hidup hingga halaman diganti
  }, []);

  return null;
}
