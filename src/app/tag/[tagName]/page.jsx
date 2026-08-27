import { Suspense } from 'react';
import SkeletonGrid from '@/components/SkeletonGrid';
import SearchResultsShared from '@/components/SearchResultsShared';
import { getSearchMetadata } from '@/utils/seo';
export const runtime = 'edge';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const tagName = resolvedParams?.tagName || '';
  const query = tagName.replace(/-/g, ' ');
  return getSearchMetadata({ query, isCat: false, isTag: true, page: 1, tagName });
}

export default async function TagPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const tagName = resolvedParams?.tagName || '';
  const query = tagName.replace(/-/g, ' ');
  const page = parseInt(resolvedSearchParams?.page) || 1;
  const currentOrder = resolvedSearchParams?.order || 'new';
  
  const seo = getSearchMetadata({ query, isCat: false, isTag: true, page, tagName });

  return (
    <Suspense fallback={<SkeletonGrid />}>
      <SearchResultsShared 
        isCat={false} 
        isTag={true} 
        query={query} 
        page={page}
        currentOrder={currentOrder}
        seoTitle={seo.title} 
        seoDesc={seo.description} 
        seoCanonical={seo.alternates.canonical} 
        seoQuery={query}
      />
    </Suspense>
  );
}
