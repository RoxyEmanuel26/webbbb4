export const runtime = 'edge';
import { Suspense } from 'react';
import SearchResultsShared from '@/components/SearchResultsShared';
import { getSearchMetadata } from '@/utils/seo';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const catName = resolvedParams?.catName || '';
  const query = catName.replace(/-/g, ' ');
  return getSearchMetadata({ query, isCat: true, isTag: false, page: 1, catName });
}

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const catName = resolvedParams?.catName || '';
  const query = catName.replace(/-/g, ' ');
  const page = parseInt(resolvedSearchParams?.page) || 1;
  const currentOrder = resolvedSearchParams?.order || 'top-weekly';
  
  const seo = getSearchMetadata({ query, isCat: true, isTag: false, page, catName });

  return (
    <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /></div>}>
      <SearchResultsShared 
        isCat={true} 
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
