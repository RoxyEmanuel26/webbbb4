import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, Clock } from 'lucide-react';
import './VideoCard.css';

const VideoCard = ({ video }) => {
  // Format the date if it's too long
  const addedDate = video.added ? video.added.split(' ')[0] : '';
  
  // Format views to be compact e.g. 15.2K
  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
  };

  return (
    <Link to={`/video/${video.id}`} className="video-card">
      <div className="video-thumbnail-container">
        <img 
          src={video.default_thumb.src} 
          alt={video.title} 
          loading="lazy" 
          className="video-thumbnail"
        />
        <div className="video-badges">
          <span className="badge-hd">HD</span>
          <span className="badge-duration">{video.length_min || video.length_sec}</span>
        </div>
      </div>
      <div className="video-info">
        <h3 className="video-title" title={video.title}>{video.title}</h3>
        <div className="video-meta">
          <span className="meta-item"><Eye size={12} /> {formatViews(video.views)}</span>
          <span className="meta-item"><Heart size={12} /> {video.rate}</span>
          <span className="meta-item"><Clock size={12} /> {addedDate}</span>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
