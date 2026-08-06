import React from 'react';

export default function CustomTopBanner() {
  return (
    <div className="custom-top-banner" style={{ textAlign: 'center', padding: '15px 10px 5px', background: 'var(--color-bg)', width: '100%' }}>
      <a 
        href="https://www.teraboxpage.com/myknow/kumpulenak1" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ display: 'inline-block', width: '100%', maxWidth: '970px' }}
      >
        <img 
          src="https://i.ibb.co/7xcJZ3kp/2.webp" 
          alt="Download 100,000+ Premium Photos & Videos FREE" 
          style={{ 
            width: '100%', 
            height: 'auto', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }} 
        />
      </a>
    </div>
  );
}
