import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { epornerApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import Pagination from '../components/Pagination';
import TagsBar from '../components/TagsBar';
import SortBar from '../components/SortBar';
import './Pages.css';

const SORT_OPTIONS = [
  { value: 'latest',       label: '🕐 Latest' },
  { value: 'top-rated',    label: '⭐ Top Rated' },
  { value: 'most-popular', label: '🔥 Most Viewed' },
  { value: 'top-weekly',   label: '📈 Top This Week' },
  { value: 'top-monthly',  label: '📅 Top This Month' },
  { value: 'longest',      label: '⏱ Longest' },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read state from URL so browser navigation works
  const currentOrder = searchParams.get('order') || 'latest';
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
          const forbiddenWords = ['gay', 'shemale', 'tranny', 'ladyboy', 'ts', 'transsexual', 'transgender', 'boy', 'men', 'cock suck'];
          res.videos.forEach(v =>
            v.keywords.split(',').forEach(k => {
              const kw = k.trim().toLowerCase();
              if (kw.length > 2 && !forbiddenWords.some(word => kw.includes(word))) {
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
        const res = await epornerApi.searchVideos({
          order: currentOrder,
          page:  currentPage,
          per_page: 32,
          gay: 0,
          lq: 1,
          thumbsize: 'big',
        });
        setVideos(res?.videos || []);
        setTotalPages(res?.total_pages || 1);
        setTotalCount(res?.total_count || 0);
      } catch (_) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentOrder, currentPage]);

  const handleSortChange = (val) => {
    setSearchParams({ order: val, page: '1' });
  };

  const handlePageChange = (p) => {
    setSearchParams({ order: currentOrder, page: String(p) });
  };

  const handleTagClick = (tag) => {
    navigate(`/search?query=${encodeURIComponent(tag)}`);
  };

  const sortLabel = SORT_OPTIONS.find(o => o.value === currentOrder)?.label || 'Videos';

  return (
    <div className="home-page">

      {/* ─ Tags Horizontal Bar ─ */}
      {tagsReady && trendTags.length > 0 && (
        <TagsBar tags={trendTags} onTagClick={handleTagClick} />
      )}

      {/* ─ Main Content ─ */}
      <div className="page-wrapper content-area">

        {/* Section Header */}
        <div className="section-header">
          <div className="section-title-group">
            <h1 className="section-title">{sortLabel}</h1>
            {totalCount > 0 && (
              <span className="section-count">{totalCount.toLocaleString()} videos</span>
            )}
          </div>
          <SortBar value={currentOrder} options={SORT_OPTIONS} onChange={handleSortChange} />
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
