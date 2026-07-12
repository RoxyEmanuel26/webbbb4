"use client";

import { useEffect, useRef } from 'react';
// import { enqueueAd } from '../utils/adsterraQueue'; // Removed as we use iframe now

/**
 * AdBanner – Komponen Client untuk Adsterra Banner Ads
 * 
 * Update: Now uses a sequential queue loader instead of srcDoc iframes.
 * This ensures that multiple banners on the same page do not override
 * each other's `window.atOptions` while preserving native viewability 
 * and URL referrer tracking for maximum CPM and Revenue.
 */
export default function AdBanner({ adKey, width, height, className = '' }) {
  // Use a same-origin static HTML file to isolate Adsterra's scripts.
  // This prevents Adsterra from injecting invisible full-page overlays
  // that block clicks on the main React app (e.g. video player).
  // Because it uses a real URL (/adsterra.html), Adsterra sees a valid origin,
  // protecting your CPM and Revenue compared to using 'about:srcdoc'.
  
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
        src={`/adsterra.html?key=${adKey}&w=${width}&h=${height}`}
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
