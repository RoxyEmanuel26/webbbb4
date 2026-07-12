export const runtime = 'edge';
import React from 'react';
import SearchResultsShared, { getSearchMetadata } from '@/components/SearchResultsShared';

export async function generateMetadata({ params, searchParams }) {
  const { tagName } = await params;
  const sParams = await searchParams;
  const query = tagName.replace(/-/g, ' ');
  const page = parseInt(sParams.page) || 1;
  return getSearchMetadata({ query, isCat: false, isTag: true, page, tagName });
}

export default async function TagPage({ params, searchParams }) {
  const { tagName } = await params;
  const sParams = await searchParams;
  const query = tagName.replace(/-/g, ' ');
  const rawPage = parseInt(sParams.page);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const currentOrder = sParams.order || 'latest';

  const metadata = await getSearchMetadata({ query, isCat: false, isTag: true, page, tagName });
  const seoQuery = query.charAt(0).toUpperCase() + query.slice(1);

  return (
    <SearchResultsShared 
      query={query} 
      isCat={false} 
      isTag={true} 
      page={page} 
      currentOrder={currentOrder} 
      seoTitle={metadata.title}
      seoDesc={metadata.description}
      seoCanonical={metadata.alternates.canonical}
      seoQuery={seoQuery}
    />
  );
}
