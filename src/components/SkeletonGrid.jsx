import React from 'react';
import SkeletonCard from './SkeletonCard';

export default function SkeletonGrid({ count = 36 }) {
  return (
    <div className="video-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={`skel-grid-${idx}`} />
      ))}
    </div>
  );
}
