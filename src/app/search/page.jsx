export const runtime = 'edge';
import React from 'react';
import SearchResultsShared, { getSearchMetadata } from '@/components/SearchResultsShared';

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || 'all';
  const page = parseInt(resolvedSearchParams?.page) || 1;
  return getSearchMetadata({ query, isCat: false, isTag: false, page });
}

export default function SearchPage() {
  return <SearchResultsShared isCat={false} isTag={false} />;
}
