import { notFound, permanentRedirect } from 'next/navigation';
import Script from 'next/script';
import VideoPlayerClient from './VideoPlayerClient';
import JsonLd from '@/components/JsonLd';
import { videoObjectSchema, breadcrumbListSchema } from '@/lib/jsonld';
import {
  getCatalogVideos,
  getCollections,
  getRelatedVideos,
  getVideoContext,
  getVideoById,
  isCollectionIndexable,
  toVideoCard,
} from '@/lib/catalog';
import { getDisplayCategory, getTagHubHref, isCategoryIndexable } from '@/lib/hubs';

export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalogVideos().map((video) => ({ slug: [video.canonicalSlug] }));
}

function extractId(slug) {
  return slug?.join('/').match(/-([A-Za-z0-9]{11})$/)?.[1] || null;
}

const PRESERVE_ACRONYMS = new Set([
  'HD', '4K', 'UHD', 'POV', 'MILF', 'JAV', 'BBC', 'BBW', 'BDSM',
  'PMV', 'DP', 'JOI', 'PAWG', 'ASS', 'CUM', 'XXX', 'VR', 'ASMR', 'FHD',
]);

function normalizeVideoTitle(rawTitle) {
  const cleaned = String(rawTitle || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'HD Video';
  const letters = cleaned.match(/[A-Za-z]/g) || [];
  const upperLetters = cleaned.match(/[A-Z]/g) || [];
  const upperRatio = letters.length > 0 ? upperLetters.length / letters.length : 0;

  // Normalize shouting ALLCAPS titles to readable Title Case while preserving industry acronyms.
  if (letters.length >= 6 && upperRatio > 0.65) {
    return cleaned
      .split(' ')
      .map((word) => {
        const bare = word.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (PRESERVE_ACRONYMS.has(bare)) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }
  return cleaned;
}

function formatSeoTitle(rawTitle, categoryName, lengthMin) {
  const cleanTitle = normalizeVideoTitle(rawTitle);
  const siteSuffix = ' | NICEVX';
  const cleanCat = String(categoryName || '').trim();
  const cleanDur = String(lengthMin || '').trim();

  if (cleanTitle.length < 25 && cleanCat) {
    const expanded = cleanDur && `${cleanTitle} – ${cleanCat} (${cleanDur})${siteSuffix}`.length <= 60
      ? `${cleanTitle} – ${cleanCat} (${cleanDur})${siteSuffix}`
      : `${cleanTitle} – ${cleanCat}${siteSuffix}`;
    if (expanded.length <= 60) return expanded;
  }

  if (cleanTitle.length + siteSuffix.length <= 60) {
    if (cleanCat) {
      const withCat = `${cleanTitle} – ${cleanCat}${siteSuffix}`;
      if (withCat.length <= 60) return withCat;
    }
    return `${cleanTitle}${siteSuffix}`;
  }
  const maxTitleLen = 60 - siteSuffix.length - 3;
  const truncated = cleanTitle.slice(0, maxTitleLen).replace(/\s+\S*$/, '...');
  return `${truncated}${siteSuffix}`;
}

function formatSeoDesc(rawDesc, video, displayCatName) {
  let desc = String(rawDesc || '').trim();
  if (desc.length < 120) {
    const durPart = video.length_min ? ` (${video.length_min})` : '';
    const catPart = displayCatName ? ` in ${displayCatName}` : '';
    desc += ` Stream in high definition${catPart}${durPart} on NICEVX with fast playback.`;
  }
  if (desc.length > 155) {
    desc = desc.slice(0, 151).replace(/\s+\S*$/, '...');
  }
  return desc;
}

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const video = getVideoById(extractId(slug));
  if (!video) return { title: 'Video not found | NICEVX', robots: { index: false, follow: false } };
  const displayCategory = getDisplayCategory(video);
  const title = formatSeoTitle(video.title, displayCategory.name, video.length_min);
  const description = formatSeoDesc(video.description, video, displayCategory.name);
  return {
    title,
    description,
    alternates: { canonical: video.canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: video.canonicalUrl,
      type: 'video.other',
      images: [{ url: video.thumbnail, width: 640, height: 360, alt: video.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [video.thumbnail],
    },
  };
}

export default async function VideoPage({ params }) {
  const { slug = [] } = await params;
  const video = getVideoById(extractId(slug));
  if (!video) notFound();
  if (slug.join('/') !== video.canonicalSlug) permanentRedirect(`/video/${video.canonicalSlug}`);
  const relatedCollections = getCollections()
    .filter((collection) =>
      isCollectionIndexable(collection, collection.videos) &&
      collection.videos.some((item) => item.id === video.id),
    )
    .slice(0, 3)
    .map(({ slug: collectionSlug, name }) => ({ slug: collectionSlug, name }));

  const displayCategory = getDisplayCategory(video);
  const categorySlug = displayCategory.slug || 'amateur';
  const categoryHref = isCategoryIndexable(categorySlug) ? `/cat/${categorySlug}` : '/cats';
  const rawTags = Array.isArray(video.tags) && video.tags.length > 0
    ? video.tags
    : (video.keywords ? String(video.keywords).split(',').map((t) => t.trim()).filter(Boolean) : []);
  const tagHubLinks = {};
  for (const tag of rawTags) {
    const href = getTagHubHref(tag);
    if (href) tagHubLinks[tag] = href;
  }

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: displayCategory.name || 'Videos', url: categoryHref },
    { name: video.title, url: video.canonicalUrl },
  ];

  return (
    <article className="video-page-article">
      <Script
        id="adsterra-video-popunder"
        src="https://benchform.org/1/c5d4ca9c6ad3af9bb2af16d5405c0a02"
        data-cfasync="false"
        strategy="afterInteractive"
      />
      <JsonLd
        data={[
          videoObjectSchema({ ...video, category: displayCategory.name }),
          breadcrumbListSchema(breadcrumbItems),
        ]}
      />
      <VideoPlayerClient
        video={video}
        initialRelated={getRelatedVideos(video).map(toVideoCard)}
        relatedCollections={relatedCollections}
        discoveryContext={getVideoContext(video)}
        tagHubLinks={tagHubLinks}
        categoryHref={categoryHref}
        displayCategory={displayCategory}
      />
    </article>
  );
}
