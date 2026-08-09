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
 * ID Eporner: 8-12 karakter alphanumeric
 */
function extractIdFromSlug(slugArr) {
  if (!slugArr || slugArr.length === 0) return null;
  const fullSlug = slugArr.join('/');
  const match = fullSlug.match(/-([A-Za-z0-9]{8,12})$/);
  if (match) return match[1];
  const parts = fullSlug.split('-');
  const last = parts[parts.length - 1];
  if (/^[A-Za-z0-9]{8,12}$/.test(last)) return last;
  return null;
}

/**
 * Helper: Ekstrak judul video dari slug URL.
 * Eporner memblokir request dari Cloudflare Edge IPs, jadi kita
 * langsung ambil title dari slug yang sudah berisi judul video.
 * Contoh: "german-girl-creamy-bgdAoGFOKTx" -> "German Girl Creamy"
 */
function titleFromSlug(slugArr) {
  const fullSlug = slugArr.join('/');
  // Hapus ID (8-12 char alphanumeric di akhir setelah tanda '-')
  const withoutId = fullSlug.replace(/-[A-Za-z0-9]{8,12}$/, '');
  if (!withoutId) return null;
  // Capitalize setiap kata
  return withoutId
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slugArr = resolvedParams?.slug || [];
  const id = extractIdFromSlug(slugArr);

  // Ambil judul langsung dari slug -- tidak butuh API call ke Eporner
  // (Eporner memblokir request dari Cloudflare Edge server IPs)
  const videoTitle = titleFromSlug(slugArr);
  const canonical = `https://nicevx.com/video/${slugArr.join('/')}`;

  const title = videoTitle
    ? `${videoTitle} — Watch Free HD Porn Video — NICEVX`
    : 'Watch Free HD Porn Video — NICEVX';

  const description = videoTitle
    ? `Watch "${videoTitle}" free in full HD quality on NICEVX. Stream top-quality adult content with thousands of HD porn videos updated daily.`
    : 'Watch free HD porn videos on NICEVX. Stream top-quality adult content in stunning 1080p HD quality.';

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
          url: 'https://nicevx.com/favicon.png',
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://nicevx.com/favicon.png'],
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
