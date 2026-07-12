"use client";

import { useEffect, useRef } from 'react';

/**
 * AdNative – Client component for Adsterra Native Ads.
 * It dynamically appends the Adsterra script into the container 
 * and targets a DOM element with `id="container-${widgetId}"`.
 */
export default function AdNative({ widgetId, className = '' }) {
  const containerRef = useRef(null);
  const injected = useRef(false);

  useEffect(() => {
    // Avoid double injection during React Dev StrictMode
    if (injected.current || !containerRef.current) return;
    injected.current = true;

    const container = containerRef.current;
    
    // Clear out any stale content before injecting
    container.innerHTML = '';

    // Create the script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://glamournakedemployee.com/${widgetId}/invoke.js`;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    // Create the targeting container element inside containerRef
    const adTarget = document.createElement('div');
    adTarget.id = `container-${widgetId}`;
    
    container.appendChild(adTarget);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
      injected.current = false;
    };
  }, [widgetId]);

  return (
    <div 
      ref={containerRef} 
      className={`ad-native-wrapper ${className}`} 
      style={{ 
        width: '100%', 
        margin: '1.5rem 0',
        minHeight: '120px'
      }} 
    />
  );
}
