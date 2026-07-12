export const runtime = 'edge';

import { Suspense } from 'react';
import HomeClient from '@/components/HomeClient';
import '../pages/Pages.css';

const SORT_OPTIONS = [
  { value: 'latest',       label: 'Latest' },
  { value: 'most-popular', label: 'Most Viewed' },
  { value: 'top-weekly',   label: 'Top This Week' },
  { value: 'top-monthly',  label: 'Top This Month' },
];

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const rawOrderParam = params?.order;
  const isValidOrder = SORT_OPTIONS.some(o => o.value === rawOrderParam);
  const orderParam = isValidOrder ? rawOrderParam : null;
  const sortLabel = SORT_OPTIONS.find(o => o.value === orderParam)?.label || 'Top This Week';
  const currentYear = new Date().getFullYear();

  const seoTitle = orderParam
    ? `Free HD ${sortLabel} Porn Videos ${currentYear} — NICEVX`
    : `NICEVX — Free HD Porn Videos ${currentYear} | 4M+ Videos`;

  const seoDesc = orderParam
    ? `Watch the ${sortLabel.toLowerCase()} free HD porn videos on NICEVX. Stream thousands of top-quality adult videos updated daily in ${currentYear}.`
    : `Watch free HD porn videos on NICEVX. Over 4 million videos updated daily in ${currentYear} — amateur, teen, MILF, Asian, hardcore and more in stunning 1080p quality.`;

  const seoCanonical = orderParam
    ? `https://nicevx.com/?order=${orderParam}`
    : 'https://nicevx.com/';

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: { canonical: seoCanonical },
    openGraph: { title: seoTitle, description: seoDesc, url: seoCanonical, type: 'website' },
    twitter: { title: seoTitle, description: seoDesc },
  };
}

export default function Home() {
  return (
    <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /><p>Loading...</p></div>}>
      <HomeClient />
    </Suspense>
  );
}
