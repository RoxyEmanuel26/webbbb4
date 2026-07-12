export const runtime = 'edge';
import { Suspense } from 'react';
import SearchResultsShared, { getSearchMetadata } from '@/components/SearchResultsShared';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const catName = resolvedParams?.catName || '';
  const query = catName.replace(/-/g, ' ');
  return getSearchMetadata({ query, isCat: true, isTag: false, page: 1, catName });
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const catName = resolvedParams?.catName || '';
  const query = catName.replace(/-/g, ' ');
  return (
    <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /></div>}>
      <SearchResultsShared isCat={true} isTag={false} query={query} seoQuery={query} seoTitle="" seoDesc="" seoCanonical={`https://nicevx.com/cat/${catName}`} />
    </Suspense>
  );
}
