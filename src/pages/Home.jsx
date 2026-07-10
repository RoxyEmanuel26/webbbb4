import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { epornerApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import Pagination from '../components/Pagination';
import TagsBar from '../components/TagsBar';
import SortBar from '../components/SortBar';
import './Pages.css';

const SORT_OPTIONS = [
  { value: 'latest',       label: '🕐 Latest' },
  { value: 'most-popular', label: '🔥 Most Viewed' },
  { value: 'top-weekly',   label: '📈 Top This Week' },
  { value: 'top-monthly',  label: '📅 Top This Month' },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read state from URL so browser navigation works
  const rawOrderParam = searchParams.get('order');
  const isValidOrder = SORT_OPTIONS.some(o => o.value === rawOrderParam);
  const orderParam = isValidOrder ? rawOrderParam : null;
  const currentPage  = parseInt(searchParams.get('page') || '1', 10);

  const [videos,      setVideos]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [trendTags,   setTrendTags]   = useState([]);
  const [tagsReady,   setTagsReady]   = useState(false);

  /* ─ Fetch trending tags once ─ */
  useEffect(() => {
    (async () => {
      try {
        const res = await epornerApi.searchVideos({ order: 'top-weekly', per_page: 50, gay: 0, lq: 1 });
        if (res?.videos) {
          const freq = {};
          const forbiddenRegex = /\b(gay|shemale|tranny|ladyboy|ts|transsexual|transgender|boy|men|cock suck|cock sucking)\b/i;
          res.videos.forEach(v =>
            v.keywords.split(',').forEach(k => {
              const kw = k.trim().toLowerCase();
              if (kw.length > 2 && !forbiddenRegex.test(kw)) {
                freq[kw] = (freq[kw] || 0) + 1;
              }
            })
          );
          setTrendTags(
            Object.entries(freq)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 20)
              .map(([k]) => k)
          );
        }
      } catch (_) {}
      setTagsReady(true);
    })();
  }, []);

  /* ─ Fetch videos ─ */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    (async () => {
      try {
        let res;
        
        if (!orderParam) {
          // If no order is specified (default Homepage), just fetch top-weekly for better performance
          try {
            res = await epornerApi.searchVideos({
              order: 'top-weekly',
              page:  currentPage,
              per_page: 44, // Fetch buffer to account for client-side filtering
              gay: 0,
              lq: 1,
              thumbsize: 'big',
            });
          } catch (err) {
            console.warn("Fetch failed", err);
          }
        } else {
          // Explicit sort parameter is set, fetch normally
          res = await epornerApi.searchVideos({
            order: orderParam,
            page:  currentPage,
            per_page: 44, // Fetch buffer to account for client-side filtering
            gay: 0,
            lq: 1,
            thumbsize: 'big',
          });
        }

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
  }, [orderParam, currentPage, searchParams]);

  const handleSortChange = (val) => {
    setSearchParams({ order: val, page: '1' });
  };

  const handlePageChange = (p) => {
    if (orderParam) {
      setSearchParams({ order: orderParam, page: String(p) });
    } else {
      setSearchParams({ page: String(p) }); // Preserve null order on home page
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/search?query=${encodeURIComponent(tag)}`);
  };

  const sortLabel = SORT_OPTIONS.find(o => o.value === orderParam)?.label || '📈 Top This Week';

  // SEO: build dynamic title and description per sort
  const seoTitle = orderParam
    ? `${sortLabel.replace(/^[^\w]+/, '').trim()} Videos — NICEVX`
    : 'NICEVX — Free HD Porn Videos | 4M+ Videos Updated Daily';

  const seoDesc = orderParam
    ? `Watch the ${sortLabel.replace(/^[^\w]+/, '').trim().toLowerCase()} free HD porn videos on NICEVX. Stream thousands of top-quality adult videos.`
    : 'Watch free HD porn videos on NICEVX. Over 4 million videos updated daily — amateur, teen, MILF, Asian, hardcore and more in stunning 1080p quality.';

  const seoCanonical = orderParam
    ? `https://nicevx.com/?order=${orderParam}`
    : 'https://nicevx.com/';

  return (
    <div className="home-page">
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
      </Helmet>

      {/* ─ Tags Horizontal Bar ─ */}
      {tagsReady && trendTags.length > 0 && (
        <TagsBar tags={trendTags} onTagClick={handleTagClick} />
      )}

      {/* ─ Main Content ─ */}
      <div className="page-wrapper content-area">

        {/* Section Header */}
        <div className="section-header">
          <div className="section-title-group">
            <h1 className="section-title">
              {orderParam ? sortLabel : '📈 Top Videos'}
            </h1>
            {totalCount > 0 && (
              <span className="section-count">{totalCount.toLocaleString()} videos</span>
            )}
          </div>
          <SortBar value={orderParam} options={SORT_OPTIONS} onChange={handleSortChange} />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-block">
            <div className="spinner" />
            <span>Loading videos…</span>
          </div>
        ) : videos.length > 0 ? (
          <>
            <div className="video-grid">
              {videos.map(v => <VideoCard key={v.id} video={v} />)}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.min(totalPages, 100)}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="empty-block">
            <p>No videos found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
