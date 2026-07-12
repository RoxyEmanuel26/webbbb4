export const runtime = 'edge';
import { Suspense } from 'react';
import SearchResultsShared from '@/components/SearchResultsShared';
import { getSearchMetadata } from '@/utils/seo';

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || 'all';
  const page = parseInt(resolvedSearchParams?.page) || 1;
  return getSearchMetadata({ query, isCat: false, isTag: false, page });
}

export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || 'all';
  const page = parseInt(resolvedSearchParams?.page) || 1;
  const currentOrder = resolvedSearchParams?.order || 'top-weekly';
  
  const seo = getSearchMetadata({ query, isCat: false, isTag: false, page });

  return (
    <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /></div>}>
      <SearchResultsShared 
        isCat={false} 
        isTag={false} 
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
