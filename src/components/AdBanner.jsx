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
  // Use srcDoc to isolate Adsterra's global window.atOptions and document.write
  // This allows multiple banners of different or same sizes to coexist on one page
  // without overriding each other's configurations.
  const adHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background: transparent; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            width: 100vw;
            height: 100vh;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          window.atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://glamournakedemployee.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div
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
    >
      <iframe
        title={`ad-${adKey}`}
        srcDoc={adHtml}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        style={{
          border: 'none',
          overflow: 'hidden',
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '100%'
        }}
      />
    </div>
  );
}
