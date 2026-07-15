export const runtime = 'edge';
import { Suspense } from 'react';
import VideoPlayerClient from './VideoPlayerClient';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || '';
  let title = 'Watch Free HD Porn Video — NICEVX';
  let description = 'Watch free HD porn videos on NICEVX. Stream top-quality adult content in stunning 1080p HD quality.';
  let canonical = `https://nicevx.com/video/${id}`;
  let thumbnailUrl = 'https://nicevx.com/favicon.webp';

  if (id) {
    try {
      const res = await fetch(`https://www.eporner.com/api/v2/video/id/?id=${id}&thumbs=all`);
      if (res.ok) {
        const video = await res.json();
        if (video && video.title) {
          title = `${video.title} — Watch Free HD Porn Video — NICEVX`;
          description = `Watch "${video.title}" in full HD quality on NICEVX. Rating: ${video.rate || '100%'} with ${(video.views || 0).toLocaleString()} views. Stream top-quality adult content free.`;
          // Slugify the title
          const slug = video.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
          canonical = `https://nicevx.com/video/${id}/${slug}`;
          // Best thumbnail
          const thumbs = video.thumbs || [];
          if (thumbs.length > 0) {
            thumbnailUrl = thumbs[Math.floor(thumbs.length / 2)]?.src || thumbnailUrl;
          }
        }
      }
    } catch (e) {
      console.error("Error generating dynamic metadata:", e);
    }
  }

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'NICEVX',
      type: 'video.other',
      locale: 'en_US',
      images: [
        {
          url: thumbnailUrl,
          width: 853,
          height: 480,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [thumbnailUrl],
    },
  };
}

export default async function VideoPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || '';
  return (
    <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /></div>}>
      <VideoPlayerClient id={id} />
    </Suspense>
  );
}
