import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Star, Clock } from 'lucide-react';
import './VideoCard.css';

/* ─ Helpers ─ */
const formatViews = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K';
  return String(n);
};

const ratingToPercent = (rate) => {
  const r = parseFloat(rate) || 0;
  return Math.round((r / 5) * 100);
};

const createSlug = (title) => {
  if (!title) return '';
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const VideoCard = ({ video, compact = false, priority = false }) => {
  const [thumbIdx, setThumbIdx] = useState(0);
  const hoverInterval = useRef(null);
  
  const thumbs = video.thumbs || [];
  const src    = thumbs[thumbIdx]?.src || video.default_thumb?.src || '';

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (hoverInterval.current) clearInterval(hoverInterval.current);
    };
  }, []);

  /* Hover: cycle through preview thumbs */
  const handleMouseEnter = () => {
    if (thumbs.length > 1) {
      let currentIdx = 0;
      hoverInterval.current = setInterval(() => {
        currentIdx = (currentIdx + 1) % thumbs.length;
        setThumbIdx(currentIdx);
      }, 500); // ganti gambar setiap 500ms
    }
  };
  
  const handleMouseLeave = () => {
    if (hoverInterval.current) {
      clearInterval(hoverInterval.current);
      hoverInterval.current = null;
    }
    setThumbIdx(0);
  };

  const rating   = parseFloat(video.rate || 0);
  const duration = video.length_min || '—';
  const views    = formatViews(video.views || 0);
  const ratingPct = ratingToPercent(rating);
  const slug     = createSlug(video.title);

  const primaryKeyword = video.keywords ? video.keywords.split(',')[0].trim() : '';

  return (
    <div
      className={`vcard ${compact ? 'vcard--compact' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail */}
      <Link to={`/video/${video.id}/${slug}`} className="vcard__thumb-wrap" aria-label={video.title}>
        <img
          src={src}
          alt={video.title}
          className="vcard__thumb"
          loading={priority ? "eager" : "lazy"}
          fetchpriority={priority ? "high" : "auto"}
          draggable="false"
          width="640"
          height="360"
        />
        {/* Duration Badge */}
        <span className="vcard__duration" aria-label={`Duration: ${duration}`}>
          <Clock size={10} aria-hidden="true" />
          {duration}
        </span>
        {/* HD Badge */}
        <span className="vcard__hd-badge">HD</span>
      </Link>

      {/* Info */}
      <div className="vcard__info">
        <h3 className="vcard__title">
          <Link to={`/video/${video.id}/${slug}`}>{video.title}</Link>
        </h3>
        <div className="vcard__meta">
          <span className="vcard__meta-item vcard__views">
            <Eye size={11} aria-hidden="true" />
            {views}
          </span>
          {rating > 0 && (
            <span className="vcard__meta-item vcard__rating">
              <Star size={11} aria-hidden="true" />
              {rating.toFixed(1)}
            </span>
          )}
          {primaryKeyword && (
            <Link 
              to={`/tag/${primaryKeyword.toLowerCase().replace(/\s+/g, '-')}`}
              className="vcard__meta-item" 
              style={{ color: 'var(--color-accent)', textDecoration: 'none', marginLeft: 'auto' }}
            >
              #{primaryKeyword}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
