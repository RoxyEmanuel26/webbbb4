export const runtime = 'edge';

import { notFound, permanentRedirect } from 'next/navigation';
import VideoPlayerClient from './VideoPlayerClient';
import { getRelatedVideos, getVideoById } from '@/lib/catalog';

function extractId(slug) {
  return slug?.join('/').match(/-([A-Za-z0-9]{11})$/)?.[1] || null;
}

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const video = getVideoById(extractId(slug));
  if (!video) return { title: 'Video not found — NICEVX', robots: { index: false, follow: false } };
  const title = `${video.title} — Watch on NICEVX`;
  return {
    title,
    description: video.description,
    alternates: { canonical: video.canonicalUrl },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' } },
    openGraph: { title, description: video.description, url: video.canonicalUrl, type: 'video.other', images: [{ url: video.thumbnail, width: 640, height: 360, alt: video.title }] },
    twitter: { card: 'summary_large_image', title, description: video.description, images: [video.thumbnail] },
  };
}

export default async function VideoPage({ params }) {
  const { slug = [] } = await params;
  const video = getVideoById(extractId(slug));
  if (!video) notFound();
  if (slug.join('/') !== video.canonicalSlug) permanentRedirect(`/video/${video.canonicalSlug}`);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbs.length ? video.thumbs.map((thumb) => thumb.src) : [video.thumbnail],
    embedUrl: video.embedUrl,
    url: video.canonicalUrl,
    uploadDate: video.uploadDate,
    ...(video.duration && { duration: video.duration }),
    isFamilyFriendly: false,
    genre: video.category,
    keywords: video.tags.join(', '),
    ...(video.views > 0 && { interactionStatistic: { '@type': 'InteractionCounter', interactionType: { '@type': 'WatchAction' }, userInteractionCount: video.views } }),
  };

  return (
    <article className="video-page-article" itemScope itemType="https://schema.org/VideoObject">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <VideoPlayerClient video={video} initialRelated={getRelatedVideos(video)} />
    </article>
  );
}
