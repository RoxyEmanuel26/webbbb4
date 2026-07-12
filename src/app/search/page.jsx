export const runtime = 'edge';
import React from 'react';
import SearchResultsShared, { getSearchMetadata } from '@/components/SearchResultsShared';

export function generateMetadata({ searchParams }) {
  const query = searchParams?.query || 'all';
  const page = parseInt(searchParams?.page) || 1;
  return getSearchMetadata({ query, isCat: false, isTag: false, page });
}

export default function SearchPage() {
  return <SearchResultsShared isCat={false} isTag={false} />;
}
