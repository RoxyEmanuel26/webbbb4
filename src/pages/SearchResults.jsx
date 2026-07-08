import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { epornerApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import Pagination from '../components/Pagination';
import SortBar from '../components/SortBar';
import './Pages.css';

const SORT_OPTIONS = [
  { value: 'latest',       label: '🕐 Latest' },
  { value: 'top-rated',    label: '⭐ Top Rated' },
  { value: 'most-popular', label: '🔥 Most Viewed' },
  { value: 'top-weekly',   label: '📈 This Week' },
  { value: 'top-monthly',  label: '📅 This Month' },
  { value: 'longest',      label: '⏱ Longest' },
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query      = searchParams.get('query') || 'all';
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
  }, [query, currentPage, currentOrder]);

  const handleSortChange = (val) => {
    setSearchParams({ query, page: '1', order: val });
  };

  const handlePageChange = (p) => {
    setSearchParams({ query, page: String(p), order: currentOrder });
  };

  return (
    <div className="search-page">
      <div className="page-wrapper search-content">

        {/* Header */}
        <div className="section-header">
          <div className="section-title-group">
            <h1 className="section-title">
              {query === 'all' ? 'All Videos' : `"${query}"`}
            </h1>
            {totalCount > 0 && (
              <span className="section-count">{totalCount.toLocaleString()} results</span>
            )}
          </div>
          <SortBar value={currentOrder} options={SORT_OPTIONS} onChange={handleSortChange} />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-block">
            <div className="spinner" />
            <span>Searching…</span>
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
            <p style={{ fontSize: '2rem' }}>🔍</p>
            <p>No videos found for <strong>"{query}"</strong></p>
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
