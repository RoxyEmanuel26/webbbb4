import React, { useEffect, useState } from 'react';
import { epornerApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import TrendingTagsSlider from '../components/TrendingTagsSlider';
import './Pages.css';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState('latest');
  const [totalPages, setTotalPages] = useState(1);
  const [trendingTags, setTrendingTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Fetch trending tags once on mount
  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        const data = await epornerApi.searchVideos({
          order: 'top-weekly',
          per_page: 50,
          gay: 0,
          lq: 1
        });
        
        if (data.videos) {
          // Extract and count keywords
          const allKeywords = data.videos
            .flatMap(v => v.keywords.split(',').map(k => k.trim().toLowerCase()))
            .filter(k => k.length > 2); // filter out very short junk tags
            
          const counts = {};
          allKeywords.forEach(k => counts[k] = (counts[k] || 0) + 1);
          
          // Sort by frequency and take top 15
          const topTags = Object.keys(counts)
            .sort((a, b) => counts[b] - counts[a])
            .slice(0, 15);
            
          setTrendingTags(topTags);
        }
      } catch (error) {
        console.error("Failed to load trending tags", error);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTrendingTags();
  }, []);

  // Fetch videos on page/order change
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const data = await epornerApi.searchVideos({
          order: order,
          page: page,
          per_page: 20,
          gay: 0,
          lq: 1
        });
        setVideos(data.videos || []);
        setTotalPages(data.total_pages || 1);
      } catch (error) {
        console.error("Failed to load top videos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    window.scrollTo(0, 0);
  }, [page, order]);

  const handleOrderChange = (newOrder) => {
    setOrder(newOrder);
    setPage(1);
  };

  return (
    <div className="page-container container" style={{ paddingTop: '2rem' }}>
      
      {!tagsLoading && trendingTags.length > 0 && (
        <TrendingTagsSlider tags={trendingTags} />
      )}

      <section className="home-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title">New Videos</h2>
          <FilterPanel order={order} onOrderChange={handleOrderChange} />
        </div>

        {loading ? (
          <div className="loading-state">Loading videos...</div>
        ) : (
          <>
            <div className="video-grid">
              {videos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
            
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
