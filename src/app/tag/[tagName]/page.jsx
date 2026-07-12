export const runtime = 'edge';
import { Suspense } from 'react';
import SearchResultsShared from '@/components/SearchResultsShared';
import { getSearchMetadata } from '@/utils/seo';

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
  const currentOrder = resolvedSearchParams?.order || 'top-weekly';
  
  const seo = getSearchMetadata({ query, isCat: false, isTag: true, page, tagName });

  return (
    <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /></div>}>
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
