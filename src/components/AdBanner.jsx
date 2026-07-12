"use client";

import { useEffect, useRef } from 'react';
import { enqueueAd } from '../utils/adsterraQueue';

/**
 * AdBanner – Komponen Client untuk Adsterra Banner Ads
 * 
 * Update: Now uses a sequential queue loader instead of srcDoc iframes.
 * This ensures that multiple banners on the same page do not override
 * each other's `window.atOptions` while preserving native viewability 
 * and URL referrer tracking for maximum CPM and Revenue.
 */
export default function AdBanner({ adKey, width, height, className = '' }) {
  const containerRef = useRef(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !containerRef.current) return;
    injected.current = true;

    const container = containerRef.current;
    container.innerHTML = ''; // Clean up before injection

    let isMounted = true;

    // Enqueue this ad to be loaded sequentially
    enqueueAd(adKey, width, height, container).then(() => {
      if (!isMounted) return;
      // Ad loading completed (or failed)
    });

    return () => {
      isMounted = false;
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
