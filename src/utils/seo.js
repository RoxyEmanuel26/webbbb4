import { ALL_CATEGORIES } from '@/data/allCategories';

const toCategorySlug = (name = '') => name.toLowerCase().replace(/\s+/g, '-');

// A tag that is also one of our curated categories is not a distinct page.
// Callers should redirect it to this canonical category URL instead of asking
// Google to reconcile two equivalent URL patterns.
export const getCategorySlugForTag = (tagName = '') => {
  const normalizedTag = String(tagName).trim().toLowerCase();
  return ALL_CATEGORIES.some((category) => toCategorySlug(category.name) === normalizedTag)
    ? normalizedTag
    : null;
};

export const getSearchMetadata = ({ query, isCat, isTag, page, catName, tagName }) => {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const seoQuery = capitalize((query || '').replace(/-/g, ' '));

  const seoTitle = isCat
    ? `${seoQuery} Porn Videos – Free HD Clips | NICEVX`
    : isTag
    ? `Free #${seoQuery} Adult Videos & Clips | NICEVX`
    : query === 'all'
    ? 'All Free HD Porn Videos & Collections | NICEVX'
    : `Search: ${seoQuery} – Free Adult Videos | NICEVX`;

  const seoDesc = isCat
    ? `Watch free ${seoQuery} HD porn videos on NICEVX. Stream top-rated clips with verified durations, ratings, and smooth high-definition playback.`
    : isTag
    ? `Browse trending #${seoQuery} adult videos on NICEVX. Stream verified free HD clips with fast streaming and daily updates.`
    : `Search results for "${seoQuery}" on NICEVX. Find matching free HD adult videos and curated clips with fast streaming.`;

  let seoCanonical = isCat
    ? `https://www.nicevx.com/cat/${catName.toLowerCase()}`
    : isTag
    ? `https://www.nicevx.com/tag/${tagName.toLowerCase()}`
    : `https://www.nicevx.com/search?query=${encodeURIComponent(query.toLowerCase())}`;

  if (page > 1) {
    seoCanonical += (seoCanonical.includes('?') ? '&' : '?') + `page=${page}`;
  }

  const robots = (!isCat && !isTag)
    ? 'noindex, nofollow'   // search pages
    : isTag
    ? 'noindex, follow'     // tag pages: canonical points to /cat/ so noindex to save crawl budget
    : page > 1
    ? 'noindex, follow'     // paginated cat pages
    : 'index, follow';      // cat page 1

  const ogImage = [
    {
      url: '/favicon.png',
      width: 512,
      height: 512,
      alt: `${seoQuery} — NICEVX Free HD Videos`,
    },
  ];

  return {
    title: seoTitle,
    description: seoDesc,
    robots,
    alternates: { canonical: seoCanonical },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: seoCanonical,
      siteName: 'NICEVX',
      type: 'website',
      locale: 'en_US',
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: ['/favicon.png'],
    },
  };
};
