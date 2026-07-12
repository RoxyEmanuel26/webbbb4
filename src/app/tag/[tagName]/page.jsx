export const runtime = 'edge';
import { Suspense } from 'react';
import SearchResultsShared, { getSearchMetadata } from '@/components/SearchResultsShared';

export function generateMetadata({ params }) {
  const tagName = params?.tagName || '';
  const query = tagName.replace(/-/g, ' ');
  return getSearchMetadata({ query, isCat: false, isTag: true, page: 1, tagName });
}

export default async function TagPage({ params }) {
  const resolvedParams = await params;
  const tagName = resolvedParams?.tagName || '';
  const query = tagName.replace(/-/g, ' ');
  return (
    <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /></div>}>
      <SearchResultsShared isCat={false} isTag={true} query={query} seoQuery={query} seoTitle="" seoDesc="" seoCanonical={`https://nicevx.com/tag/${tagName}`} />
    </Suspense>
  );
}
