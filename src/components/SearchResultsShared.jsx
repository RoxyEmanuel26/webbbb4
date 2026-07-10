import React from 'react';
import { epornerServerApi } from '@/lib/eporner';
import { ALL_CATEGORIES } from '@/data/allCategories';
import VideoCard from '@/components/VideoCard';
import Pagination from '@/components/Pagination';
import SortBar from '@/components/SortBar';
import '../pages/Pages.css';

const SORT_OPTIONS = [
  { value: 'latest',       label: '🕐 Latest' },
  { value: 'top-rated',    label: '⭐ Top Rated' },
  { value: 'most-popular', label: '🔥 Most Viewed' },
  { value: 'top-weekly',   label: '📈 This Week' },
  { value: 'top-monthly',  label: '📅 This Month' },
];

export const getSearchMetadata = async ({ query, isCat, isTag, page, catName, tagName }) => {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const seoQuery = capitalize(query.replace(/-/g, ' '));
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
    const isAlsoCat = ALL_CATEGORIES.some(c => c.name.toLowerCase().replace(/\s+/g, '-') === tagName);
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
    alternates: {
      canonical: seoCanonical
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: seoCanonical,
      type: 'website',
    },
    twitter: {
      title: seoTitle,
      description: seoDesc,
    }
  };
};

export default async function SearchResultsShared({ query, isCat, isTag, page, currentOrder, seoTitle, seoDesc, seoCanonical, seoQuery }) {
  let videos = [];
  let totalPages = 1;
  let totalCount = 0;

  try {
    const res = await epornerServerApi.searchVideos({
      query,
      page,
      order: currentOrder,
      per_page: 36,
      gay: 0,
      lq: 1,
      thumbsize: 'big',
    });
    videos = res?.videos || [];
    totalPages = res?.total_pages || 1;
    totalCount = res?.total_count || 0;
  } catch (_) {}

  const getPageTitle = () => {
    if (isCat) return <span style={{textTransform: 'capitalize'}}>Category: {query}</span>;
    if (isTag) return <span style={{textTransform: 'capitalize'}}>Tag: {query}</span>;
    if (query === 'all') return 'All Videos';
    return `"${query}"`;
  };

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
      ...(isCat ? [{
        "@type": "ListItem",
        "position": 2,
        "name": "Categories",
        "item": "https://nicevx.com/cats/"
      }, {
        "@type": "ListItem",
        "position": 3,
        "name": seoQuery,
        "item": seoCanonical
      }] : [{
        "@type": "ListItem",
        "position": 2,
        "name": seoQuery,
        "item": seoCanonical
      }])
    ]
  };

  return (
    <div className="search-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": seoTitle,
            "description": seoDesc,
            "url": seoCanonical
          },
          breadcrumbsSchema
        ]).replace(/</g, '\\u003c') }}
      />
      <div className="page-wrapper search-content">
        <div className="section-header">
          <div className="section-title-group">
            <h1 className="section-title">
              {getPageTitle()}
            </h1>
            {totalCount > 0 && (
              <span className="section-count">{totalCount.toLocaleString()} results</span>
            )}
          </div>
          <SortBar value={currentOrder} options={SORT_OPTIONS} />
        </div>

        {videos.length > 0 ? (
          <>
            <div className="video-grid">
              {videos.map((v, idx) => (
                <VideoCard key={`${v.id}-${idx}`} video={v} priority={idx < 4} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} />
          </>
        ) : (
          <div className="empty-block">
            <p style={{ fontSize: '2rem' }}>🔍</p>
            <p>No videos found for <strong style={{textTransform: 'capitalize'}}>"{query}"</strong></p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Try different keywords or browse by category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
