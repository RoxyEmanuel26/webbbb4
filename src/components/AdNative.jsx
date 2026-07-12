"use client";

import { useState, useEffect } from 'react';

/**
 * AdNative – Client component for Adsterra Native Ads.
 * It uses an isolated same-origin iframe to ensure native ads re-execute and render 
 * correctly when users navigate between pages (SPA routing).
 * Height is adjusted dynamically via message listener communication.
 */
export default function AdNative({ widgetId, className = '' }) {
  const [height, setHeight] = useState(120); // Default initial height

  useEffect(() => {
    const handleMessage = (event) => {
      // Validate event type and widgetId matching
      if (
        event.data && 
        event.data.type === 'adsterra-native-resize' && 
        event.data.widgetId === widgetId
      ) {
        const newHeight = parseInt(event.data.height, 10);
        if (newHeight > 20) {
          setHeight(newHeight);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [widgetId]);

  return (
    <div 
      className={`ad-native-wrapper ${className}`} 
      style={{ 
        width: '100%', 
        margin: '1.5rem 0',
        minHeight: `${height}px`,
        transition: 'min-height 0.2s ease-out',
        overflow: 'hidden'
      }} 
    >
      <iframe
        title={`ad-native-${widgetId}`}
        src={`/adsterra-native.html?widgetId=${widgetId}`}
        width="100%"
        height={height}
        frameBorder="0"
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        style={{
          border: 'none',
          overflow: 'hidden',
          width: '100%',
          height: `${height}px`,
          transition: 'height 0.2s ease-out'
        }}
      />
    </div>
  );
}
