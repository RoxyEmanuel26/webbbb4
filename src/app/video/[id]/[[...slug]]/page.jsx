export const runtime = 'edge';
import { Suspense } from 'react';
import VideoPlayerClient from './VideoPlayerClient';

export function generateMetadata({ params }) {
  // Metadata is minimal here since video data is loaded client-side
  return {
    title: 'Watch Free HD Porn Video — NICEVX',
    description: 'Watch free HD porn videos on NICEVX. Stream top-quality adult content.',
  };
}

export default function VideoPage({ params }) {
  const id = params?.id || '';
  return (
    <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /></div>}>
      <VideoPlayerClient id={id} />
    </Suspense>
  );
}
