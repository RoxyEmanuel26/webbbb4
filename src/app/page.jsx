import { Suspense } from 'react';
import { permanentRedirect } from 'next/navigation';
import HomeClient from '@/components/HomeClient';
import SkeletonGrid from '@/components/SkeletonGrid';
import '../pages/Pages.css';

export const runtime = 'edge';

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
  const sortLabel = SORT_OPTIONS.find(o => o.value === orderParam)?.label || 'Latest';
  
  const rawPage = parseInt(params?.page);
  const page = !isNaN(rawPage) && rawPage > 1 ? rawPage : 1;
  const currentYear = new Date().getFullYear();

  const seoTitle = orderParam
    ? `Free HD ${sortLabel} Porn Videos ${currentYear} — NICEVX`
    : page > 1 
    ? `Free HD Porn Videos — Page ${page} — NICEVX`
    : `NICEVX — Free HD Porn Videos ${currentYear} | 4M+ Videos`;

  const seoDesc = orderParam
    ? `Watch the ${sortLabel.toLowerCase()} free HD porn videos on NICEVX. Stream thousands of top-quality adult videos updated daily in ${currentYear}.`
    : `Watch free HD porn videos on NICEVX. Over 4 million videos updated daily in ${currentYear} — amateur, teen, MILF, Asian, hardcore and more in stunning 1080p quality.`;

  let seoCanonical = orderParam
    ? `https://www.nicevx.com/?order=${orderParam}`
    : 'https://www.nicevx.com/';
  
  if (page > 1) {
    seoCanonical += (seoCanonical.includes('?') ? '&' : '?') + `page=${page}`;
  }

  // /?order=* diblokir robots.txt DAN noindex untuk konsistensi penuh
  // /?page=* (>1) juga di-noindex agar Google fokus mengindeks halaman video/kategori, bukan halaman list yang tak berujung
  const robots = (orderParam || page > 1) ? 'noindex, follow' : 'index, follow';

  return {
    title: seoTitle,
    description: seoDesc,
    robots,
    alternates: { canonical: seoCanonical },
    openGraph: { title: seoTitle, description: seoDesc, url: seoCanonical, type: 'website', images: [{ url: '/favicon.png', width: 512, height: 512, alt: 'NICEVX' }] },
    twitter: { title: seoTitle, description: seoDesc, images: ['/favicon.png'] },
  };
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  
  // Parameter tracking (utm_, fbclid, dll) sekarang dihandle secara client-side di layout.jsx
  // untuk mencegah masalah cache dan error 500 di Cloudflare Pages.

  return (
    <Suspense fallback={<SkeletonGrid />}>
      <HomeClient />
    </Suspense>
  );
}
