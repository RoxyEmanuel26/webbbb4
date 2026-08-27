export const runtime = 'edge';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import VideoPlayerClient from './VideoPlayerClient';
import aiData from '@/data/ai-seo.json';

function extractIdFromSlug(slugArr) {
  if (!slugArr || slugArr.length === 0) return null;
  const fullSlug = slugArr.join('/');
  const match = fullSlug.match(/-([A-Za-z0-9]{11})$/);
  if (match) return match[1];
  const parts = fullSlug.split('-');
  const last = parts[parts.length - 1];
  if (/^[A-Za-z0-9]{11}$/.test(last)) return last;
  return null;
}

function titleFromSlug(slugArr) {
  const fullSlug = slugArr.join('/');
  const withoutId = fullSlug.replace(/-[A-Za-z0-9]{8,12}$/, '');
  if (!withoutId) return null;
  return withoutId.split('-').filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slugArr = resolvedParams?.slug || [];
  const id = extractIdFromSlug(slugArr);
  const videoTitle = titleFromSlug(slugArr);
  const truncatedTitle = videoTitle && videoTitle.length > 40
    ? videoTitle.substring(0, 37).trim() + '...'
    : videoTitle;
  const canonical = `https://nicevx.com/video/${slugArr.join('/')}`;
  const title = truncatedTitle
    ? `${truncatedTitle} \u2014 Watch HD Porn \u2014 NICEVX`
    : 'Watch Free HD Porn Videos \u2014 NICEVX';

  let description = videoTitle
    ? `Watch ${videoTitle} free in full HD quality on NICEVX. Stream top-quality adult content with thousands of HD porn videos updated daily.`
    : 'Watch free HD porn videos on NICEVX. Stream top-quality adult content in stunning 1080p HD quality.';
  if (id && aiData[id]?.seoDescription) {
    const d = aiData[id].seoDescription;
    description = d.length > 155 ? d.substring(0, 152) + '...' : d;
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
      images: [{
        url: `https://static-eu-cdn.eporner.com/thumbs/static4/big/${id}/5_big.jpg`,
        width: 640,
        height: 360,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://static-eu-cdn.eporner.com/thumbs/static4/big/${id}/5_big.jpg`],
    },
  };
}

export default async function VideoPage({ params }) {
  const resolvedParams = await params;
  const slugArr = resolvedParams?.slug || [];
  const id = extractIdFromSlug(slugArr);
  if (!id) notFound();

  const videoTitle = titleFromSlug(slugArr);
  const canonical = `https://nicevx.com/video/${slugArr.join('/')}`;
  const truncatedTitle = videoTitle && videoTitle.length > 40
    ? videoTitle.substring(0, 37).trim() + '...'
    : videoTitle;
  const title = truncatedTitle
    ? `${truncatedTitle} \u2014 Watch HD Porn \u2014 NICEVX`
    : 'Watch Free HD Porn Videos \u2014 NICEVX';

  let description = videoTitle
    ? `Watch ${videoTitle} free in full HD quality on NICEVX. Stream top-quality adult content with thousands of HD porn videos updated daily.`
    : 'Watch free HD porn videos on NICEVX. Stream top-quality adult content in stunning 1080p HD quality.';
  if (id && aiData[id]?.seoDescription) {
    const d = aiData[id].seoDescription;
    description = d.length > 155 ? d.substring(0, 152) + '...' : d;
  }

  const seoDescription = videoTitle
    ? `Watch ${videoTitle} for free in full HD quality on NICEVX \u2014 one of the largest free adult video platforms on the web. This video is part of our collection of over 4 million free HD porn videos available in stunning 1080p quality, updated daily with the freshest content from top categories. NICEVX features a vast library of free adult content spanning popular categories including teen, MILF, amateur, Asian, hardcore, lesbian, and much more \u2014 all completely free and accessible without registration. Stream ${videoTitle} directly in your browser with no downloads required. Our advanced video player delivers smooth, buffer-free HD playback for the best viewing experience on any device. Explore thousands of related videos, browse by category, or discover top-rated content updated every day on NICEVX.`
    : 'NICEVX is one of the largest free HD porn video platforms on the web, featuring over 4 million videos in stunning 1080p quality. Browse our vast collection of free adult content spanning top categories including teen, MILF, amateur, Asian, hardcore, lesbian, and much more. All videos are completely free to watch with no registration required. Stream directly in your browser with our advanced player for smooth, buffer-free HD playback on any device. New content is added daily so there is always something fresh to discover. Explore thousands of videos, browse by category, or find top-rated content on NICEVX.';

  const aiEntry = id && aiData[id] ? aiData[id] : null;
  const aiDescription = aiEntry?.seoDescription || null;
  const aiCleanedTags = aiEntry?.cleanedTags || [];
  const aiCategory = aiEntry?.category || null;

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    thumbnailUrl: `https://static-eu-cdn.eporner.com/thumbs/static4/big/${id}/5_big.jpg`,
    embedUrl: `https://www.eporner.com/embed/${id}/`,
    contentUrl: canonical,
    url: canonical,
    uploadDate: '2024-01-01T00:00:00Z',
    isFamilyFriendly: false,
    ...(aiCategory && { genre: aiCategory }),
    ...(aiCleanedTags.length > 0 && { keywords: aiCleanedTags.join(', ') }),
    publisher: {
      '@type': 'Organization',
      name: 'NICEVX',
      url: 'https://nicevx.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nicevx.com/favicon.png',
        width: 512,
        height: 512,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      <article className="video-page-article" itemScope itemType="https://schema.org/VideoObject">
        <section className="video-page-player-section">
          <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /></div>}>
            <VideoPlayerClient
              id={id}
              initialTitle={videoTitle || 'Free HD Porn Video'}
              seoDescription={seoDescription}
              aiDescription={aiDescription}
              aiCleanedTags={aiCleanedTags}
            />
          </Suspense>
        </section>
      </article>
    </>
  );
}
