import { Suspense } from 'react';
import SkeletonGrid from '@/components/SkeletonGrid';
import SearchResultsShared from '@/components/SearchResultsShared';
export const metadata = {
  title: 'Search Videos — NICEVX',
  description: 'Search videos on NICEVX.',
  robots: 'noindex, nofollow',
  alternates: { canonical: 'https://www.nicevx.com/search' },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<SkeletonGrid />}>
      <SearchResultsShared isCat={false} isTag={false} />
    </Suspense>
  );
}
