import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { epornerApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import { Eye, Star, Calendar } from 'lucide-react';
import './Pages.css';

const VideoPlayer = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState([]);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const data = await epornerApi.getVideoDetails(id);
        
        // Eporner API returns empty array if video is removed
        if (!data || (Array.isArray(data) && data.length === 0) || !data.id) {
          setVideo(null);
          setLoading(false);
          return;
        }

        setVideo(data);

        // Fetch related videos based on first keyword or category
        if (data.keywords && data.keywords.length > 0) {
          const keyword = data.keywords.split(',')[0].trim();
          const relatedData = await epornerApi.searchVideos({
            query: keyword,
            per_page: 8
          });
          setRelatedVideos(relatedData.videos?.filter(v => v.id !== id) || []);
        }
      } catch (error) {
        console.error("Failed to fetch video details", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideoDetails();
    }
  }, [id]);

  if (loading) return <div className="page-container container loading-state">Loading Video...</div>;
  if (!video) return (
    <div className="page-container container empty-state" style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2 style={{ color: 'var(--color-primary)' }}>Video Removed</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>Mohon maaf, video ini telah dihapus oleh penyedia konten.</p>
      <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem', textDecoration: 'none' }}>Return Home</Link>
    </div>
  );

  return (
    <div className="page-container container video-page-layout">
      <div className="main-content">
        <div className="player-wrapper" dangerouslySetInnerHTML={{ __html: video.embed }}>
        </div>
        
        <div className="video-details">
          <h1 className="video-detail-title">{video.title}</h1>
          <div className="video-stats">
            <span><Eye size={16} /> {video.views}</span>
            <span><Star size={16} /> {video.rate}</span>
            <span><Calendar size={16} /> {video.added}</span>
            <span style={{ marginLeft: '10px', color: 'var(--color-text-secondary)' }}>{video.length_min}</span>
          </div>
          <div className="video-keywords">
            {video.keywords && video.keywords.split(',').map((kw, idx) => (
              <Link key={idx} to={`/search?query=${kw.trim()}`} className="keyword-tag">
                {kw.trim()}
              </Link>
            ))}
          </div>

          {video.thumbs && video.thumbs.length > 0 && (
            <div className="video-thumbnails-gallery" style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Preview Gallery</h3>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                {video.thumbs.map((thumb, idx) => (
                  <img 
                    key={idx} 
                    src={thumb.src} 
                    alt={`Preview ${idx + 1}`}
                    style={{ height: '90px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <aside className="sidebar-content">
        <h3 className="sidebar-title">Related Recommendations</h3>
        <div className="related-grid">
          {relatedVideos.map(v => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </aside>
    </div>
  );
};

export default VideoPlayer;
