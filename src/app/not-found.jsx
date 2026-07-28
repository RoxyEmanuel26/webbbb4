import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'System Maintenance — NICEVX',
  description: 'Our system is currently undergoing scheduled maintenance.',
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#18181b', // zinc-900
        border: '1px solid #27272a', // zinc-800
        borderRadius: '16px',
        padding: '40px 24px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
      }}>
        
        {/* Logo Section */}
        <div style={{ marginBottom: '24px' }}>
          <Image 
            src="/logo.webp" 
            alt="NICEVX Logo" 
            width={60} 
            height={60} 
            style={{ objectFit: 'contain', margin: '0 auto', filter: 'drop-shadow(0 0 10px rgba(225, 29, 72, 0.4))' }}
          />
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700',
            color: '#ffffff',
            marginTop: '16px',
            marginBottom: '8px'
          }}>
            System Maintenance
          </h1>
        </div>

        {/* Text Description */}
        <p style={{ 
          fontSize: '1rem', 
          color: '#a1a1aa', // zinc-400
          lineHeight: '1.6', 
          marginBottom: '24px',
          padding: '0 10px'
        }}>
          We are currently performing scheduled maintenance and server upgrades. 
          Some pages might be temporarily unavailable. We'll be back online shortly!
        </p>

        {/* Maintenance Image */}
        <div style={{ 
          marginBottom: '32px', 
          display: 'flex', 
          justifyContent: 'center',
          background: '#09090b', // darker background for image container
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #27272a'
        }}>
          <Image 
            src="/system-maintenance.webp" 
            alt="Maintenance Illustration" 
            width={280} 
            height={200} 
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              objectFit: 'contain'
            }}
            priority
          />
        </div>

        {/* Action Button */}
        <Link 
          href="/" 
          style={{ 
            display: 'inline-block', 
            padding: '12px 28px', 
            backgroundColor: '#e11d48', // rose-600
            color: '#ffffff', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'opacity 0.2s',
            width: '100%',
            maxWidth: '300px'
          }}
        >
          Return to Homepage
        </Link>

        {/* Error Code */}
        <p style={{ 
          fontSize: '0.8rem', 
          color: '#52525b', // zinc-600
          marginTop: '20px',
          marginBottom: '0'
        }}>
          Error Code: 404 / Limit Exceeded
        </p>
      </div>
    </div>
  );
}
