"use client";

import { useEffect } from 'react';

/**
 * AdPopunder – Memuat skrip Popunder Adsterra setiap kali halaman video dibuka.
 * Dipasang HANYA di halaman video (/video/...).
 *
 * FIX KRITIS:
 * 1. Tidak ada cleanup function — script popunder HARUS tetap hidup di DOM
 *    selama user berada di halaman video. Cleanup function (return () => removeChild)
 *    justru membunuh script sebelum sempat mendeteksi klik user.
 * 2. Script dipasang di document.body (bukan head) — sesuai rekomendasi Adsterra
 *    agar event listener bisa menangkap klik pada elemen DOM dengan benar.
 * 3. Cek via data-attribute untuk mencegah duplikasi script jika terjadi
 *    double-render (React Strict Mode di development).
 */
export default function AdPopunder() {
  useEffect(() => {
    const ATTR = 'data-adsterra-popunder';

    // Hindari injeksi duplikat (React Strict Mode dev double-invoke)
    if (document.querySelector(`script[${ATTR}]`)) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://glamournakedemployee.com/c5/d4/ca/c5d4ca9c6ad3af9bb2af16d5405c0a02.js';
    script.async = true;
    script.setAttribute(ATTR, '1');

    // Pasang di body (bukan head) — sesuai standar Adsterra
    document.body.appendChild(script);

    // TIDAK ADA cleanup function di sini.
    // Menghapus script (removeChild) justru mematikan popunder sebelum sempat
    // mendeteksi klik user. Biarkan script hidup selama komponen ini terpasang.
  }, []);

  return null;
}
