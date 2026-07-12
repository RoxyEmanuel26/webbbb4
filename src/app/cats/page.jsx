export const runtime = 'edge';
import React from 'react';
import CategoriesClient from './CategoriesClient';

export const metadata = {
  title: 'All Porn Categories — NICEVX',
  description: 'Browse all free HD porn video categories on NICEVX. Explore teen, MILF, Asian, amateur, lesbian, anal, hardcore and 100+ more categories. Updated daily.',
  alternates: {
    canonical: 'https://nicevx.com/cats/'
  },
  openGraph: {
    title: 'All Porn Categories — NICEVX',
    description: 'Browse all free HD porn video categories on NICEVX. Updated daily with the best adult content.',
    url: 'https://nicevx.com/cats/',
    type: 'website',
  },
};

export default function CategoriesPage() {
  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://nicevx.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Categories",
        "item": "https://nicevx.com/cats/"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "All Porn Categories — NICEVX",
            "description": "Browse all free HD porn video categories on NICEVX.",
            "url": "https://nicevx.com/cats/"
          },
          breadcrumbsSchema
        ]) }}
      />
      <CategoriesClient />
    </>
  );
}
