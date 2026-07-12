import { ALL_CATEGORIES } from '@/data/allCategories';

export const getSearchMetadata = ({ query, isCat, isTag, page, catName, tagName }) => {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const seoQuery = capitalize((query || '').replace(/-/g, ' '));
  const currentYear = new Date().getFullYear();

  const seoTitle = isCat
    ? `Free HD ${seoQuery} Porn Videos ${currentYear} — NICEVX`
    : isTag
    ? `Free #${seoQuery} Porn Videos ${currentYear} — NICEVX`
    : query === 'all'
    ? `All Free HD Porn Videos ${currentYear} — NICEVX`
    : `"${seoQuery}" Free Porn Search Results ${currentYear} — NICEVX`;

  const seoDesc = isCat
    ? `Watch free ${seoQuery} HD porn videos on NICEVX. Thousands of top-quality ${seoQuery} adult videos updated daily in ${currentYear}.`
    : isTag
    ? `Explore free HD videos tagged #${seoQuery} on NICEVX. Updated daily with the best ${seoQuery} content in ${currentYear}.`
    : `Search results for "${seoQuery}" on NICEVX. Find thousands of free HD porn videos matching your search in ${currentYear}.`;

  let seoCanonical = isCat
    ? `https://nicevx.com/cat/${catName}`
    : isTag
    ? `https://nicevx.com/tag/${tagName}`
    : `https://nicevx.com/search?query=${encodeURIComponent(query)}`;

  if (isTag && tagName) {
    const isAlsoCat = ALL_CATEGORIES.some(c => c.name?.toLowerCase().replace(/\s+/g, '-') === tagName);
    if (isAlsoCat) {
      seoCanonical = `https://nicevx.com/cat/${tagName}`;
    }
  }

  if (page > 1) {
    seoCanonical += (seoCanonical.includes('?') ? '&' : '?') + `page=${page}`;
  }

  const robots = (!isCat && !isTag) ? 'noindex, nofollow' : (page > 1 ? 'noindex, follow' : 'index, follow');

  return {
    title: seoTitle,
    description: seoDesc,
    robots,
    alternates: { canonical: seoCanonical },
    openGraph: { title: seoTitle, description: seoDesc, url: seoCanonical, type: 'website' },
    twitter: { title: seoTitle, description: seoDesc },
  };
};
