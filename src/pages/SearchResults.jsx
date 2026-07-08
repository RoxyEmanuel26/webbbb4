import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { epornerApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import './Pages.css';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [order, setOrder] = useState(searchParams.get('order') || 'latest');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await epornerApi.searchVideos({
          query,
          page,
          order,
          gay: 0,
          lq: 1,
          per_page: 20
        });
        setVideos(data.videos || []);
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.total_count || 0);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page, order]);

  const handleOrderChange = (e) => {
    setOrder(e.target.value);
    setSearchParams({ query, page: 1, order: e.target.value });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ query, page: newPage, order });
    window.scrollTo(0, 0);
  };

  return (
    <div className="page-container container" style={{ paddingTop: '2rem' }}>
      <div className="search-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          Search results for: <span style={{ color: 'var(--primary)' }}>"{query}"</span>
        </h2>
        <FilterPanel 
          order={order} 
          onOrderChange={(newOrder) => handleOrderChange({ target: { value: newOrder } })} 
          totalCount={totalCount}
        />
      </div>

      {loading ? (
        <div className="loading-state">Searching...</div>
      ) : videos.length > 0 ? (
        <>
          <div className="video-grid">
            {videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </>
      ) : (
        <div className="empty-state">No videos found.</div>
      )}
    </div>
  );
};

export default SearchResults;
