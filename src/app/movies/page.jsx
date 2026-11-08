import JsonLd from '@/components/JsonLd';
import { breadcrumbListSchema, itemListSchema, faqPageSchema } from '@/lib/jsonld';
import { getCatalogVideos, toVideoCard } from '@/lib/catalog';
import MoviesClient from './MoviesClient';

export function generateMetadata() {
  const seoTitle = 'Full Movies & Extended Adult Feature Films | NICEVX';
  const seoDesc = 'Stream full-length adult movies and uncut feature scenes running 45+ minutes in crisp high definition. Verified durations, ratings, and smooth streaming.';
  const seoCanonical = 'https://www.nicevx.com/movies';

  return {
    title: seoTitle,
    description: seoDesc,
    robots: 'index, follow',
    alternates: { canonical: seoCanonical },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: seoCanonical,
      type: 'website',
      images: [{ url: '/favicon.png', width: 512, height: 512, alt: 'NICEVX Full Movies' }],
    },
    twitter: {
      title: seoTitle,
      description: seoDesc,
      images: ['/favicon.png'],
    },
  };
}

const FAQS = [
  {
    question: 'What defines a full-length movie on NICEVX?',
    answer: 'Full movies on NICEVX are complete scene recordings and feature releases with an uninterrupted runtime of 45 minutes or longer.',
  },
  {
    question: 'Can I preview scenes before watching full movies?',
    answer: 'Yes! Every movie card includes our interactive 15-frame storyboard scrubber. Simply move your cursor across the movie thumbnail to scrub through key moments.',
  },
  {
    question: 'Are all full movies free to stream in high definition?',
    answer: 'All full-length videos listed on NICEVX stream in full high definition (720p and 1080p) completely free of charge without registration.',
  },
];

export default function MoviesPage() {
  const allVideos = getCatalogVideos()
    .filter((v) => v.availability === 'available' && (Number(v.durationSeconds) || 0) >= 2700)
    .sort((a, b) => (Number(b.durationSeconds) || 0) - (Number(a.durationSeconds) || 0));

  const initialVideoCards = allVideos.map(toVideoCard);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Full Movies', url: '/movies' },
  ];

  const jsonLdData = [
    breadcrumbListSchema(breadcrumbs),
    itemListSchema({
      name: 'Full Length Adult Movies',
      url: '/movies',
      items: allVideos,
      maxItems: 36,
    }),
    faqPageSchema(FAQS),
  ];

  return (
    <>
      <JsonLd data={jsonLdData} />
      <MoviesClient initialVideos={initialVideoCards} />
    </>
  );
}
