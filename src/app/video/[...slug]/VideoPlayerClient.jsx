'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Eye, Heart, Star } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import { recordVisit, trackLocalEvent } from '@/lib/privacyMetrics';
import '../../../pages/Pages.css';

const FAVORITES_KEY = 'nicevx_favorites_v1';
const HISTORY_KEY = 'nicevx_watch_history_v1';

function formatViews(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export default function VideoPlayerClient({ video, initialRelated = [] }) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    recordVisit();
    try {
      const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      setFavorite(favorites.includes(video.id));
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]').filter((entry) => entry.id !== video.id);
      history.unshift({ id: video.id, url: video.canonicalUrl, title: video.title, thumbnail: video.thumbnail, watchedAt: new Date().toISOString() });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 24)));
    } catch (_) {}
  }, [video]);

  const toggleFavorite = () => {
    try {
      const favorites = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
      if (favorites.has(video.id)) favorites.delete(video.id); else favorites.add(video.id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
      setFavorite(favorites.has(video.id));
    } catch (_) {}
  };

  return (
    <div className="page-wrapper player-page">
      <Link className="back-btn" href="/"><ArrowLeft size={16} /> Back to discovery</Link>
      <div className="player-layout">
        <div className="player-main">
          <div className="player-box">
            <iframe
              src={video.embedUrl}
              title={video.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="eager"
              onLoad={() => trackLocalEvent('play_start')}
            />
          </div>
          <div className="video-info-block">
            <h1 className="video-info-title" itemProp="name">{video.title}</h1>
            <div className="video-info-meta">
              <span><Eye size={14} /> {formatViews(video.views)} source views</span>
              <span><Star size={14} /> {video.rating.toFixed(2)}/5 source rating</span>
              <span><Clock size={14} /> {video.length_min}</span>
              <span><Calendar size={14} /> {new Date(video.uploadDate).toLocaleDateString('en-US')}</span>
            </div>
            <p className="video-info-desc" itemProp="description">{video.description}</p>
            <div className="video-actions">
              <button type="button" className="back-btn" onClick={toggleFavorite} aria-pressed={favorite}>
                <Heart size={16} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Saved locally' : 'Save to favorites'}
              </button>
              <a className="back-btn" href={video.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">View original source on Eporner</a>
            </div>
          </div>

          <section className="discovery-panel" aria-labelledby="discovery-title">
            <h2 id="discovery-title">Why this video was selected</h2>
            <p>{video.discoveryReason}</p>
            <dl>
              <div><dt>NICEVX Discovery Score</dt><dd>{video.discoveryScore.toFixed(1)}/100</dd></div>
              <div><dt>Collection</dt><dd>{video.category}</dd></div>
              <div><dt>Trend evidence</dt><dd>{video.trendStatus === 'insufficient-data' ? 'Waiting for a second snapshot' : `${formatViews(video.viewGrowth)} measured view growth`}</dd></div>
              <div><dt>First catalog sync</dt><dd>{new Date(video.syncedAt).toLocaleDateString('en-US')}</dd></div>
            </dl>
            <Link href="/methodology">Read the ranking methodology</Link>
          </section>
        </div>

        <aside className="player-sidebar">
          <h2 className="sidebar-heading">Related curated videos</h2>
          <div className="related-video-list">
            {initialRelated.map((related) => (
              <div key={related.id} onClick={() => trackLocalEvent('related_click')}>
                <VideoCard video={related} compact />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
