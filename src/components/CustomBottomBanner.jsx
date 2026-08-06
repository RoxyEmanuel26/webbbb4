import React from 'react';

export default function CustomBottomBanner() {
  return (
    <div className="custom-bottom-banner" style={{ textAlign: 'center', padding: '20px 10px 15px', background: 'var(--color-bg)', width: '100%' }}>
      <a 
        href="https://www.teraboxpage.com/myknow/kumpulenak1" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ display: 'inline-block', width: '100%', maxWidth: '970px' }}
      >
        <img 
          src="https://i.ibb.co/jvCjnCMF/Your-paragraph-text.webp" 
          alt="Premium Content Delivery" 
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
