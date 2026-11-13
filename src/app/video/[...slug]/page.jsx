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
import { getTagHubHref, isCategoryIndexable } from '@/lib/hubs';

export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalogVideos().map((video) => ({ slug: [video.canonicalSlug] }));
}

function extractId(slug) {
  return slug?.join('/').match(/-([A-Za-z0-9]{11})$/)?.[1] || null;
}

function formatSeoTitle(rawTitle, category) {
  const cleanTitle = String(rawTitle || '').trim();
  const siteSuffix = ' | NICEVX';
  if (cleanTitle.length + siteSuffix.length <= 60) {
    if (category) {
      const withCat = `${cleanTitle} – ${category}${siteSuffix}`;
      if (withCat.length <= 60) return withCat;
    }
    return `${cleanTitle}${siteSuffix}`;
  }
  const maxTitleLen = 60 - siteSuffix.length - 3;
  const truncated = cleanTitle.slice(0, maxTitleLen).replace(/\s+\S*$/, '...');
  return `${truncated}${siteSuffix}`;
}

function formatSeoDesc(rawDesc, video) {
  let desc = String(rawDesc || '').trim();
  if (desc.length < 120) {
    desc += ` Stream in high definition on NICEVX with verified ${video.length_min || 'full'} duration.`;
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
  const title = formatSeoTitle(video.title, video.category);
  const description = formatSeoDesc(video.description, video);
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

  const categorySlug = (video.category || 'amateur').toLowerCase().replace(/\s+/g, '-');
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
    { name: video.category || 'Videos', url: categoryHref },
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
          videoObjectSchema(video),
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
      />
    </article>
  );
}
