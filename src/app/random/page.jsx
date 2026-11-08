'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shuffle } from 'lucide-react';
import catalog from '@/data/curated-video-catalog.json';
import '../../pages/Pages.css';

export default function RandomVideoPage() {
  const router = useRouter();

  useEffect(() => {
    const available = (catalog.videos || []).filter(
      (v) => v.availability === 'available' && v.canonicalSlug
    );
    if (available.length > 0) {
      const randomIdx = Math.floor(Math.random() * available.length);
      const pick = available[randomIdx];
      router.replace(`/video/${pick.canonicalSlug}`);
    } else {
      router.replace('/');
    }
  }, [router]);

  return (
    <div
      className="page-wrapper"
      style={{
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(255, 51, 85, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-accent)',
          marginBottom: '1.25rem',
          animation: 'pulse 1.5s infinite',
        }}
      >
        <Shuffle size={28} />
      </div>
      <h1
        style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        Finding a Random Top HD Video...
      </h1>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.875rem',
          maxWidth: '420px',
          lineHeight: 1.5,
        }}
      >
        Shuffling through verified high definition videos in our catalog to give you a fresh surprise scene.
      </p>
    </div>
  );
}
