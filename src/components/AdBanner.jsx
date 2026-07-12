"use client";

import { useEffect, useRef } from 'react';

/**
 * AdBanner – Komponen Client untuk Adsterra Banner Ads
 * Karena Next.js App Router berjalan di server, script iklan harus
 * dimuat secara manual di sisi klien menggunakan useEffect.
 *
 * Props:
 *  - adKey    : Key unik iklan dari Adsterra
 *  - width    : Lebar banner (px)
 *  - height   : Tinggi banner (px)
 *  - className: CSS class tambahan untuk wrapper div
 */
export default function AdBanner({ adKey, width, height, className = '' }) {
  const containerRef = useRef(null);
  const injected = useRef(false);

  useEffect(() => {
    // Cegah injeksi ganda saat React Strict Mode memanggil effect dua kali
    if (injected.current || !containerRef.current) return;
    injected.current = true;

    const container = containerRef.current;

    // Bersihkan container sebelum inject (penting untuk navigasi SPA)
    container.innerHTML = '';

    // 1. Set global atOptions sebelum load invoke.js
    const optScript = document.createElement('script');
    optScript.type = 'text/javascript';
    optScript.text = `
      window.atOptions = {
        'key': '${adKey}',
        'format': 'iframe',
        'height': ${height},
        'width': ${width},
        'params': {}
      };
    `;
    container.appendChild(optScript);

    // 2. Load script invoke.js dari Adsterra
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `https://glamournakedemployee.com/${adKey}/invoke.js`;
    invokeScript.async = true;
    container.appendChild(invokeScript);

    return () => {
      // Cleanup saat komponen unmount (navigasi halaman)
      if (container) container.innerHTML = '';
      injected.current = false;
    };
  }, [adKey, width, height]);

  return (
    <div
      ref={containerRef}
      className={`adsterra-banner ${className}`}
      style={{
        width: `${width}px`,
        maxWidth: '100%',
        minHeight: `${height}px`,
        margin: '0 auto',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Advertisement"
    />
  );
}
