import React from 'react';
import SearchResultsShared, { getSearchMetadata } from '@/components/SearchResultsShared';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params.query || 'all';
  const page = parseInt(params.page) || 1;
  return getSearchMetadata({ query, isCat: false, isTag: false, page });
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params.query || 'all';
  const rawPage = parseInt(params.page);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const currentOrder = params.order || 'latest';

  const metadata = await getSearchMetadata({ query, isCat: false, isTag: false, page });
  const seoQuery = query.charAt(0).toUpperCase() + query.slice(1).replace(/-/g, ' ');

  return (
    <SearchResultsShared 
      query={query} 
      isCat={false} 
      isTag={false} 
      page={page} 
      currentOrder={currentOrder} 
      seoTitle={metadata.title}
      seoDesc={metadata.description}
      seoCanonical={metadata.alternates.canonical}
      seoQuery={seoQuery}
    />
  );
}
