import { Suspense } from 'react';
import SkeletonGrid from '@/components/SkeletonGrid';
import Link from 'next/link';
import SearchResultsShared from '@/components/SearchResultsShared';
import VideoCard from '@/components/VideoCard';
import { permanentRedirect } from 'next/navigation';
import { getCategorySlugForTag, getSearchMetadata } from '@/utils/seo';
import { getCatalogVideos, toVideoCard } from '@/lib/catalog';

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
  return [...tags.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 250)
    .map(([tagName]) => ({ tagName }));
}

function getTagCatalogVideos(tagName) {
  const normalized = toSlug(tagName);
  return getCatalogVideos()
    .filter((video) =>
      video.availability === 'available' &&
      (video.tags || []).some((tag) => toSlug(tag) === normalized)
    )
    .slice(0, 18)
    .map(toVideoCard);
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const tagName = resolvedParams?.tagName || '';
  const query = tagName.replace(/-/g, ' ');
  return getSearchMetadata({ query, isCat: false, isTag: true, page: 1, tagName });
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
  const seo = getSearchMetadata({ query, isCat: false, isTag: true, page: 1, tagName });
  const tagVideos = getTagCatalogVideos(tagName);

  return (
    <div className="tag-page">
      <section className="page-wrapper tag-intro" style={{ marginBottom: '1.5rem' }}>
        <nav className="breadcrumb-nav" aria-label="Breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          <Link href="/" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <Link href="/cats" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Tags</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span style={{ color: 'var(--color-text)' }}>#{query}</span>
        </nav>

        <h1 className="section-title">#{query} videos</h1>

        {tagVideos.length > 0 && (
          <>
            <p style={{ color: 'var(--color-muted)', marginBottom: '1rem' }}>
              Explore featured clips tagged #{query} from our verified video catalog.
            </p>
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
