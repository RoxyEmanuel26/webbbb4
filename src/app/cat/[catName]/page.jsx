import React from 'react';
import SearchResultsShared, { getSearchMetadata } from '@/components/SearchResultsShared';

export async function generateMetadata({ params, searchParams }) {
  const { catName } = await params;
  const sParams = await searchParams;
  const query = catName.replace(/-/g, ' ');
  const page = parseInt(sParams.page) || 1;
  return getSearchMetadata({ query, isCat: true, isTag: false, page, catName });
}

export default async function CategoryPage({ params, searchParams }) {
  const { catName } = await params;
  const sParams = await searchParams;
  const query = catName.replace(/-/g, ' ');
  const rawPage = parseInt(sParams.page);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const currentOrder = sParams.order || 'latest';

  const metadata = await getSearchMetadata({ query, isCat: true, isTag: false, page, catName });
  const seoQuery = query.charAt(0).toUpperCase() + query.slice(1);

  return (
    <SearchResultsShared 
      query={query} 
      isCat={true} 
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
