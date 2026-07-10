import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { epornerApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import Pagination from '../components/Pagination';
import SortBar from '../components/SortBar';
import { ALL_CATEGORIES } from '../data/allCategories';
import './Pages.css';

const SORT_OPTIONS = [
  { value: 'latest',       label: '🕐 Latest' },
  { value: 'top-rated',    label: '⭐ Top Rated' },
  { value: 'most-popular', label: '🔥 Most Viewed' },
  { value: 'top-weekly',   label: '📈 This Week' },
  { value: 'top-monthly',  label: '📅 This Month' },
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { catName, tagName } = useParams();
  const location = useLocation();
  
  const isCat = location.pathname.startsWith('/cat/');
  const isTag = location.pathname.startsWith('/tag/');

  let derivedQuery = searchParams.get('query') || 'all';
  if (isCat && catName) derivedQuery = catName.replace(/-/g, ' ');
  if (isTag && tagName) derivedQuery = tagName.replace(/-/g, ' ');
  const query = derivedQuery;

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentOrder = searchParams.get('order') || 'latest';

  const [videos,     setVideos]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    (async () => {
      try {
        const res = await epornerApi.searchVideos({
          query,
          page: currentPage,
          order: currentOrder,
          per_page: 44, // Fetch buffer to account for client-side filtering
          gay: 0,
          lq: 1,
          thumbsize: 'big',
        });
        // Slice exactly 36 items so the grid (4, 3, or 2 cols) never has an empty slot
        setVideos((res?.videos || []).slice(0, 36));
        setTotalPages(res?.total_pages || 1);
        setTotalCount(res?.total_count || 0);
      } catch (_) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [query, currentPage, currentOrder]);

  const handleSortChange = (val) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    params.set('order', val);
    setSearchParams(params);
  };

  const handlePageChange = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const getPageTitle = () => {
    if (isCat) return <span style={{textTransform: 'capitalize'}}>Category: {query}</span>;
    if (isTag) return <span style={{textTransform: 'capitalize'}}>Tag: {query}</span>;
    if (query === 'all') return 'All Videos';
    return `"${query}"`;
  };

  // SEO
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

  // De-duplicate tags that match categories
  if (isTag && tagName) {
    const isAlsoCat = ALL_CATEGORIES.some(c => c.name.toLowerCase().replace(/\s+/g, '-') === tagName);
    if (isAlsoCat) {
      seoCanonical = `https://nicevx.com/cat/${tagName}`;
    }
  }

  // Self-referencing canonical for pagination
  if (currentPage > 1) {
    seoCanonical += (seoCanonical.includes('?') ? '&' : '?') + `page=${currentPage}`;
  }

  return (
    <div className="search-page">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={seoCanonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content={seoCanonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        {/* Prevent pagination pages beyond page 1 from competing with main category */}
        {currentPage > 1 && <meta name="robots" content="noindex, follow" />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                "name": seoTitle,
                "description": seoDesc,
                "url": seoCanonical
              },
              {
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
              }
            ]
          })}
        </script>
      </Helmet>
      <div className="page-wrapper search-content">

        {/* Header */}
        <div className="section-header">
          <div className="section-title-group">
            <h1 className="section-title">
              {getPageTitle()}
            </h1>
            {totalCount > 0 && (
              <span className="section-count">{totalCount.toLocaleString()} results</span>
            )}
          </div>
          <SortBar value={currentOrder} options={SORT_OPTIONS} onChange={handleSortChange} />
        </div>

        {/* SEO Category/Tag Description */}
        {(isCat || isTag) && currentPage === 1 && (
          <div className="seo-category-desc" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            <p>
              Welcome to the best collection of <strong>{seoQuery}</strong> porn videos. 
              NICEVX offers thousands of top-quality, free HD adult videos {isTag ? `tagged with #${seoQuery}` : `in the ${seoQuery} category`}. 
              Our tube is updated daily with fresh content, ensuring you always have access to the newest and most popular {seoQuery} XXX movies. 
              Use the filters above to sort by latest, top-rated, or most viewed.
            </p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="loading-block">
            <div className="spinner" />
            <span>Searching…</span>
          </div>
        ) : videos.length > 0 ? (
          <>
            <div className="video-grid">
              {videos.map((v, idx) => (
                <VideoCard key={v.id} video={v} priority={idx < 4} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.min(totalPages, 100)}

            />
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
};

export default SearchResults;
