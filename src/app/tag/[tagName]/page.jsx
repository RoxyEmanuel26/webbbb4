import { Suspense } from 'react';
import SkeletonGrid from '@/components/SkeletonGrid';
import Link from 'next/link';
import SearchResultsShared from '@/components/SearchResultsShared';
import VideoCard from '@/components/VideoCard';
import JsonLd from '@/components/JsonLd';
import { permanentRedirect } from 'next/navigation';
import { getCategorySlugForTag, getSearchMetadata } from '@/utils/seo';
import { getCatalogVideos, toVideoCard } from '@/lib/catalog';
import {
  getTagHubHref,
  getTagHubs,
  getTagIntro,
  getTagStats,
  getTagVideos,
  isTagIndexable,
} from '@/lib/hubs';
import { breadcrumbListSchema, faqPageSchema, itemListSchema } from '@/lib/jsonld';

export const dynamicParams = false;

const toSlug = (value = '') =>
  String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function generateStaticParams() {
  const tags = new Map();
  getCatalogVideos().forEach((video) => {
    (video.tags || []).forEach((tag) => {
      const slug = toSlug(tag);
      if (slug) tags.set(slug, (tags.get(slug) || 0) + 1);
    });
  });
  const slugSet = new Set(getTagHubs().map((hub) => hub.slug));
  [...tags.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 250)
    .forEach(([tagName]) => slugSet.add(tagName));
  return [...slugSet].map((tagName) => ({ tagName }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const tagName = resolvedParams?.tagName || '';
  const query = tagName.replace(/-/g, ' ');
  return getSearchMetadata({
    query,
    isCat: false,
    isTag: true,
    isIndexableTag: isTagIndexable(tagName),
    page: 1,
    tagName,
  });
}

export default async function TagPage({ params }) {
  const resolvedParams = await params;
  const tagName = resolvedParams?.tagName || '';
  const categorySlug = getCategorySlugForTag(tagName);

  // /tag/<category> redirects to /cat/<category>
  if (categorySlug) {
    permanentRedirect(`/cat/${categorySlug}`);
  }

  const query = tagName.replace(/-/g, ' ');
  const indexableTag = isTagIndexable(tagName);
  const seo = getSearchMetadata({
    query,
    isCat: false,
    isTag: true,
    isIndexableTag: indexableTag,
    page: 1,
    tagName,
  });
  const allMatchingVideos = getTagVideos(tagName);
  const ssrLimit = indexableTag ? 24 : 18;
  const tagVideos = allMatchingVideos.slice(0, ssrLimit).map(toVideoCard);
  const stats = getTagStats(tagName);
  const relatedHubLinks = (stats.relatedTags || [])
    .map((relTag) => ({ label: relTag, href: getTagHubHref(relTag) }))
    .filter((item) => item.href)
    .slice(0, 6);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/cats' },
    { name: `#${query}`, url: `/tag/${tagName}` },
  ];

  const medianMins = stats.medianDurationSeconds
    ? `${Math.max(1, Math.round(stats.medianDurationSeconds / 60))} min`
    : '12 min';

  const faqs = indexableTag
    ? [
        {
          question: `How many #${query} videos are in the NICEVX catalog?`,
          answer: `NICEVX currently lists ${stats.videoCount} high-definition videos tagged #${query}, with an average scene length of roughly ${medianMins}.`,
        },
        {
          question: `Can I preview #${query} videos before opening them?`,
          answer: `Yes, every #${query} card includes interactive storyboard thumbnail scrubbing and instant streaming without sign-up.`,
        },
      ]
    : [];

  return (
    <div className="tag-page">
      {indexableTag && (
        <JsonLd
          data={[
            breadcrumbListSchema(breadcrumbs),
            itemListSchema({
              name: `#${query} HD Adult Videos`,
              url: `/tag/${tagName}`,
              items: allMatchingVideos,
              maxItems: 36,
            }),
            faqPageSchema(faqs),
          ]}
        />
      )}
      <section className="page-wrapper tag-intro" style={{ marginBottom: '1.5rem' }}>
        <nav className="breadcrumb-nav" aria-label="Breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          <Link href="/" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <Link href="/cats" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Categories</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span style={{ color: 'var(--color-text)' }}>#{query}</span>
        </nav>

        <h1 className="section-title">#{query} videos</h1>

        {indexableTag && (
          <div style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>
            <p style={{ color: 'var(--color-muted)', lineHeight: 1.6, maxWidth: '72ch' }}>
              {getTagIntro(tagName)}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              <span><strong style={{ color: 'var(--color-text)' }}>{stats.videoCount}</strong> catalog videos</span>
              <span>•</span>
              <span>Median runtime: <strong style={{ color: 'var(--color-text)' }}>{medianMins}</strong></span>
              {stats.hdShare !== null && (
                <>
                  <span>•</span>
                  <span><strong style={{ color: 'var(--color-text)' }}>{stats.hdShare}%</strong> HD clips</span>
                </>
              )}
            </div>
            {relatedHubLinks.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.9rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Related hubs:</span>
                {relatedHubLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="keyword-tag"
                    style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}
                  >
                    #{item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tagVideos.length > 0 && (
          <>
            {!indexableTag && (
              <p style={{ color: 'var(--color-muted)', marginBottom: '1rem' }}>
                Browse featured clips tagged #{query} in our catalog.
              </p>
            )}
            <div className="video-grid tag-picks-grid" style={{ marginBottom: '2rem' }}>
              {tagVideos.map((video, index) => (
                <VideoCard key={video.id} video={video} priority={index < 4} />
              ))}
            </div>
          </>
        )}
      </section>

      <Suspense fallback={<SkeletonGrid />}>
        <SearchResultsShared
          isCat={false}
          isTag={true}
          query={query}
          seoTitle={seo.title}
          seoDesc={seo.description}
          seoCanonical={seo.alternates.canonical}
          seoQuery={query}
          pageTitle={`More #${query} videos`}
          headingLevel="h2"
        />
      </Suspense>
    </div>
  );
}
