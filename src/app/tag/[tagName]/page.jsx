import { Suspense } from 'react';
import SkeletonGrid from '@/components/SkeletonGrid';
import SearchResultsShared from '@/components/SearchResultsShared';
import { permanentRedirect } from 'next/navigation';
import { getCategorySlugForTag, getSearchMetadata } from '@/utils/seo';
import { getCatalogVideos } from '@/lib/catalog';

export const dynamicParams = false;

const toSlug = (value = '') => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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

  // /tag/<category> previously declared /cat/<category> as its canonical while
  // still returning 200. A permanent redirect gives crawlers one unambiguous URL.
  if (categorySlug) {
    permanentRedirect(`/cat/${categorySlug}`);
  }

  const query = tagName.replace(/-/g, ' ');
  const seo = getSearchMetadata({ query, isCat: false, isTag: true, page: 1, tagName });

  return (
    <Suspense fallback={<SkeletonGrid />}>
      <SearchResultsShared 
        isCat={false} 
        isTag={true} 
        query={query} 
        seoTitle={seo.title} 
        seoDesc={seo.description} 
        seoCanonical={seo.alternates.canonical} 
        seoQuery={query}
      />
    </Suspense>
  );
}
