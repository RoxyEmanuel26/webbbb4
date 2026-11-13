import React from 'react';
import PornstarsClient from './PornstarsClient';
import JsonLd from '@/components/JsonLd';
import { breadcrumbListSchema } from '@/lib/jsonld';

export const metadata = {
  title: 'Top Adult Film Stars & Pornstars Directory A-Z | NICEVX',
  description:
    'Browse verified adult film stars, top performers, and models on NICEVX. Stream free high-definition clips and filmographies indexed from A to Z.',
  alternates: {
    canonical: 'https://www.nicevx.com/pornstars',
  },
  openGraph: {
    title: 'Top Adult Film Stars & Pornstars Directory A-Z | NICEVX',
    description:
      'Browse verified adult film stars, top performers, and models on NICEVX. Stream free high-definition clips and filmographies indexed from A to Z.',
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
      'Browse verified adult film stars, top performers, and models on NICEVX. Stream free high-definition clips and filmographies indexed from A to Z.',
    images: ['/og-default.jpg'],
  },
};

export default function PornstarsPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Pornstars', url: '/pornstars' },
  ];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Adult Film Stars & Pornstars Directory — NICEVX',
      description: 'Browse top adult performers and models on NICEVX.',
      url: 'https://www.nicevx.com/pornstars',
    },
    breadcrumbListSchema(breadcrumbs),
  ];

  return (
    <>
      <JsonLd data={schema} />
      <PornstarsClient />
    </>
  );
}
