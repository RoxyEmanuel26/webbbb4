import React from 'react';
import PornstarsClient from './PornstarsClient';
import JsonLd from '@/components/JsonLd';
import { breadcrumbListSchema, buildCanonicalAlternates } from '@/lib/jsonld';
import { getCatalogVideos } from '@/lib/catalog';
import { PORNSTARS, getVideosForPerformer } from '@/data/pornstars';

export const metadata = {
  title: 'Top Adult Film Stars & Pornstars Directory A-Z | NICEVX',
  description:
    'Browse featured adult film stars, top US and European performers, and models on NICEVX. Stream free high-definition clips and filmographies indexed from A to Z.',
  alternates: buildCanonicalAlternates('https://www.nicevx.com/pornstars'),
  openGraph: {
    title: 'Top Adult Film Stars & Pornstars Directory A-Z | NICEVX',
    description:
      'Browse featured adult film stars, top US and European performers, and models on NICEVX. Stream free high-definition clips and filmographies indexed from A to Z.',
    url: 'https://www.nicevx.com/pornstars',
    type: 'website',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Adult Film Stars — NICEVX',
      },
    ],
  },
  twitter: {
    title: 'Top Adult Film Stars & Pornstars Directory A-Z | NICEVX',
    description:
      'Browse featured adult film stars, top US and European performers, and models on NICEVX. Stream free high-definition clips and filmographies indexed from A to Z.',
    images: ['/og-default.jpg'],
  },
};

export default function PornstarsPage() {
  const catalogVideos = getCatalogVideos();
  const starsWithCounts = PORNSTARS.map((star) => ({
    ...star,
    videoCount: getVideosForPerformer(star, catalogVideos).length,
  })).sort((a, b) => b.videoCount - a.videoCount || a.name.localeCompare(b.name));

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Pornstars', url: '/pornstars' },
  ];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Adult Film Stars & Pornstars Directory — NICEVX',
      description: 'Browse top US, European, and international adult performers and models on NICEVX.',
      url: 'https://www.nicevx.com/pornstars',
    },
    breadcrumbListSchema(breadcrumbs),
  ];

  return (
    <>
      <JsonLd data={schema} />
      <PornstarsClient initialStars={starsWithCounts} />
    </>
  );
}
