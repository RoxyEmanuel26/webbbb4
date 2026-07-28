import React from 'react';
import Link from 'next/link';
import { Wrench, AlertTriangle } from 'lucide-react';
import '../pages/Pages.css';

export const metadata = {
  title: 'System Maintenance — NICEVX',
  description: 'Our system is currently undergoing scheduled maintenance.',
};

export default function NotFound() {
  return (
    <div className="page-wrapper legal-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="legal-card" style={{ textAlign: 'center', maxWidth: '600px', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <Wrench size={48} color="#facc15" />
          <AlertTriangle size={48} color="#facc15" />
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: '#fff' }}>System Maintenance</h1>
        
        <p style={{ fontSize: '1.1rem', color: '#a1a1aa', lineHeight: '1.6', marginBottom: '30px' }}>
          We are currently performing scheduled maintenance and server upgrades to improve your experience. 
          Some pages might be temporarily unavailable. Please bear with us, we'll be back online shortly!
        </p>

        <p style={{ fontSize: '0.9rem', color: '#71717a', marginBottom: '30px' }}>
          Error Code: 404 / System Update in Progress
        </p>

        <Link 
          href="/" 
          style={{ 
            display: 'inline-block', 
            padding: '12px 24px', 
            backgroundColor: '#e11d48', 
            color: 'white', 
            borderRadius: '6px', 
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#be123c'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#e11d48'}
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
