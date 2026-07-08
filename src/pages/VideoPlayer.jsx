import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { epornerApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import { Eye, Star, Calendar, Clock, ArrowLeft } from 'lucide-react';
import './Pages.css';

const formatViews = (n) => {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M views';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K views';
  return n + ' views';
};

const VideoPlayer = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [video,      setVideo]        = useState(null);
  const [loading,    setLoading]      = useState(true);
  const [error,      setError]        = useState(false);
  const [related,    setRelated]      = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(false);

    (async () => {
      try {
        const data = await epornerApi.getVideoDetails(id, 'big');

        // API returns [] for removed videos
        if (!data || Array.isArray(data) || !data.id) {
          setError(true);
          setLoading(false);
          return;
        }

        setVideo(data);

        // Fetch related by first keyword
        if (data.keywords) {
          const kw = data.keywords.split(',')[0].trim();
          const rel = await epornerApi.searchVideos({
            query: kw,
            per_page: 10,
            gay: 0,
            lq: 1,
            thumbsize: 'medium',
          });
          setRelated((rel?.videos || []).filter(v => v.id !== id).slice(0, 8));
        }
      } catch (_) {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-block" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span>Loading video…</span>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="empty-block" style={{ minHeight: '60vh' }}>
        <p style={{ fontSize: '3rem' }}>😔</p>
        <h2>Video Not Available</h2>
        <p>This video may have been removed or is temporarily unavailable.</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '1rem',
            background: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 'var(--font-size-base)',
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const keywords = video.keywords
    ? video.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  return (
    <div className="page-wrapper player-page">
      {/* Back link */}
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="player-layout">
        {/* ─ Main Column ─ */}
        <div className="player-main">
          {/* Embed Player */}
          <div
            className="player-box"
            dangerouslySetInnerHTML={{ __html: video.embed }}
          />

          {/* Video Info Card */}
          <div className="video-info-block">
            <h1 className="video-info-title">{video.title}</h1>

            <div className="video-info-meta">
              <span className="meta-chip">
                <Eye size={14} />
                {formatViews(video.views)}
              </span>
              <span className="meta-chip rating">
                <Star size={14} />
                {parseFloat(video.rate || 0).toFixed(1)} / 5.0
              </span>
              <span className="meta-chip">
                <Clock size={14} />
                {video.length_min || `${video.length_sec}s`}
              </span>
              {video.added && (
                <span className="meta-chip">
                  <Calendar size={14} />
                  {video.added.split(' ')[0]}
                </span>
              )}
            </div>

            {/* Keywords */}
            {keywords.length > 0 && (
              <div className="keyword-tags">
                {keywords.slice(0, 20).map((kw, i) => (
                  <Link
                    key={i}
                    to={`/search?query=${encodeURIComponent(kw)}`}
                    className="keyword-tag"
                  >
                    #{kw}
                  </Link>
                ))}
              </div>
            )}

            {/* Preview Thumbnails */}
            {video.thumbs && video.thumbs.length > 1 && (
              <div className="thumb-gallery" aria-label="Video preview thumbnails">
                {video.thumbs.map((t, i) => (
                  <img key={i} src={t.src} alt={`Preview ${i + 1}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─ Sidebar ─ */}
        <aside className="player-sidebar">
          <h2 className="sidebar-heading">Related Videos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {related.map(v => (
              <VideoCard key={v.id} video={v} compact={true} />
            ))}
          </div>
          {related.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No related videos found.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default VideoPlayer;
