import { Suspense } from 'react';
import Script from 'next/script';
import LiveWatchClient from './LiveWatchClient';

export const metadata = {
  title: 'Watch Video — NICEVX',
  description: 'Watch a video on NICEVX.',
  robots: { index: false, follow: true },
};

export default function WatchPage() {
  return (
    <article className="video-page-article">
      <Script
        id="adsterra-live-video-popunder"
        src="https://glamournakedemployee.com/c5/d4/ca/c5d4ca9c6ad3af9bb2af16d5405c0a02.js"
        data-cfasync="false"
        strategy="afterInteractive"
      />
      <Suspense fallback={<div className="page-wrapper player-page"><div className="player-box" /></div>}>
        <LiveWatchClient />
      </Suspense>
    </article>
  );
}
