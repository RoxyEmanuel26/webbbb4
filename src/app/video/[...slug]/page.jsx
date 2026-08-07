export const runtime = 'edge';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import VideoPlayerClient from './VideoPlayerClient';

/**
 * Helper: Slugify text ke lowercase-hyphen
 */
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Helper: Ekstrak Eporner video ID dari slug array.
 * Format URL: /video/judul-video-VIDEOID
 * ID Eporner selalu 11 karakter alphanumeric (contoh: DJ999oYH9ei)
 */
function extractIdFromSlug(slugArr) {
  if (!slugArr || slugArr.length === 0) return null;
  const fullSlug = slugArr.join('/');
  // Coba ambil segmen terakhir setelah '-' yang cocok dengan pola ID Eporner
  // ID Eporner: 8-12 karakter alphanumeric
  const match = fullSlug.match(/-([A-Za-z0-9]{8,12})$/);
  if (match) return match[1];
  // Fallback: ambil segment terakhir dari slug jika tidak ada '-'
  const parts = fullSlug.split('-');
  const last = parts[parts.length - 1];
  if (/^[A-Za-z0-9]{8,12}$/.test(last)) return last;
  return null;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slugArr = resolvedParams?.slug || [];
  const id = extractIdFromSlug(slugArr);

  let title = 'Watch Free HD Porn Video — NICEVX';
  let description = 'Watch free HD porn videos on NICEVX. Stream top-quality adult content in stunning 1080p HD quality.';
  let canonical = `https://nicevx.com/video/${slugArr.join('/')}`;
  let thumbnailUrl = 'https://nicevx.com/favicon.png';

  if (id) {
    try {
      const res = await fetch(`https://www.eporner.com/api/v2/video/id/?id=${id}&thumbs=all`, {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const video = await res.json();
        if (video && video.title) {
          title = `${video.title} — Watch Free HD Porn Video — NICEVX`;
          description = `Watch "${video.title}" in full HD quality on NICEVX. Rating: ${video.rate || '100%'} with ${(video.views || 0).toLocaleString()} views. Stream top-quality adult content free.`;
          const slug = slugify(video.title);
          canonical = `https://nicevx.com/video/${slug}-${id}`;
          const thumbs = video.thumbs || [];
          if (thumbs.length > 0) {
            thumbnailUrl = thumbs[Math.floor(thumbs.length / 2)]?.src || thumbnailUrl;
          }
        }
      }
    } catch (e) {
      console.error('Error generating dynamic metadata:', e);
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
  const slugArr = resolvedParams?.slug || [];
  const id = extractIdFromSlug(slugArr);

  if (!id) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /></div>}>
      <VideoPlayerClient id={id} />
    </Suspense>
  );
}
