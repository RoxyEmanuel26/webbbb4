'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, Eye, Heart, Star, Download, ChevronDown } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import VideoPlayerFacade from '@/components/VideoPlayerFacade';
import { recordVisit, trackLocalEvent } from '@/lib/privacyMetrics';
import '../../pages/Pages.css';

const API_BASE = 'https://www.eporner.com/api/v2/video';
const FAVORITES_KEY = 'nicevx_favorites_v1';
const SAVED_VIDEOS_KEY = 'nicevx_saved_videos_v2';
const HISTORY_KEY = 'nicevx_watch_history_v1';
const FORBIDDEN_REGEX = /\b(gay|shemale|tranny|ladyboy|ts|transsexual|transgender|boy|men|cock suck|cock sucking)\b/i;

function fixEncoding(value) {
  if (!value) return value;
  let fixed = String(value);
  try {
    if (/[\x80-\xFF]/.test(fixed)) fixed = decodeURIComponent(escape(fixed));
  } catch (_) {}
  return fixed
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function buildVideoDescription(video, tags) {
  const parts = [];
  const tagList = tags.slice(0, 4).join(', ');
  if (video.title) parts.push(video.title);
  if (tagList) parts.push(`featuring ${tagList}`);
  const base = parts.join(' ');
  const duration = video.length_min ? ` (${video.length_min})` : '';
  const views = video.views ? ` with ${Number(video.views).toLocaleString('en-US')} views` : '';
  return `Watch ${base}${duration}${views} in high definition on NICEVX. Stream verified adult videos with smooth playback.`;
}

function normalizeVideo(raw) {
  if (!raw || !raw.id) return null;
  const tags = (raw.keywords ? String(raw.keywords).split(',') : [])
    .map((tag) => fixEncoding(tag.trim()))
    .filter((tag) => tag.length > 0 && !FORBIDDEN_REGEX.test(tag));

  const title = fixEncoding(raw.title || '');
  if (FORBIDDEN_REGEX.test(title)) return null;

  return {
    id: raw.id,
    title,
    description: buildVideoDescription({ ...raw, title }, tags),
    tags,
    category: tags[0] || 'adult porn',
    thumbnail: raw.default_thumb?.src || raw.thumbs?.[0]?.src || '',
    thumbs: raw.thumbs || [],
    embedUrl: raw.embed || `https://www.eporner.com/embed/${raw.id}/`,
    durationSeconds: Number(raw.length_sec || 0),
    length_min: raw.length_min || '',
    views: Number(raw.views || 0),
    rating: Number(raw.rate || 0),
    rate: Number(raw.rate || 0),
    uploadDate: raw.added ? new Date(raw.added).toISOString() : new Date().toISOString(),
    availability: 'available',
  };
}

function formatViews(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export default function LiveWatchClient() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('id');
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setError('Video ID not provided');
      setLoading(false);
      return;
    }

    recordVisit();
    let isCancelled = false;

    async function fetchVideo() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/id/?id=${encodeURIComponent(videoId)}&thumbsize=big&format=json`);
        if (!res.ok) throw new Error(`Video not found (status ${res.status})`);
        const data = await res.json();
        if (data && data.id) {
          const norm = normalizeVideo(data);
          if (!norm) throw new Error('Video is not available');
          if (!isCancelled) {
            setVideo(norm);
            try {
              const saved = JSON.parse(localStorage.getItem(SAVED_VIDEOS_KEY) || '[]');
              const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
              setFavorite((Array.isArray(saved) && saved.some((item) => item.id === norm.id)) || favorites.includes(norm.id));
              const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]').filter((entry) => entry.id !== norm.id);
              history.unshift({
                id: norm.id,
                url: `/watch?id=${encodeURIComponent(norm.id)}`,
                title: norm.title,
                thumbnail: norm.thumbnail,
                watchedAt: new Date().toISOString(),
              });
              localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 24)));
            } catch (_) {}
            const searchTag = norm.tags[0] || 'popular';
            const relRes = await fetch(`${API_BASE}/search/?query=${encodeURIComponent(searchTag)}&per_page=12&thumbsize=big&gay=0&lq=1&format=json`);
            if (relRes.ok) {
              const relData = await relRes.json();
              if (relData && Array.isArray(relData.videos) && !isCancelled) {
                const normRelated = relData.videos
                  .filter((item) => item.id !== norm.id)
                  .map(normalizeVideo)
                  .filter(Boolean)
                  .slice(0, 8);
                setRelated(normRelated);
              }
            }
          }
        } else {
          throw new Error('Video details could not be loaded');
        }
      } catch (err) {
        if (!isCancelled) setError(err.message || 'Error loading video');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchVideo();
    return () => {
      isCancelled = true;
    };
  }, [videoId]);

  const toggleFavorite = () => {
    if (!video) return;
    try {
      const favorites = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
      if (favorites.has(video.id)) favorites.delete(video.id);
      else favorites.add(video.id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
      const saved = JSON.parse(localStorage.getItem(SAVED_VIDEOS_KEY) || '[]');
      const savedVideos = Array.isArray(saved) ? saved.filter((item) => item?.id !== video.id) : [];
      if (favorites.has(video.id)) {
        savedVideos.unshift({
          id: video.id,
          canonicalUrl: `/watch?id=${encodeURIComponent(video.id)}`,
          title: video.title,
          thumbnail: video.thumbnail,
          views: video.views,
          rating: video.rating,
          length_min: video.length_min,
          category: video.category,
          tags: video.tags,
          uploadDate: video.uploadDate,
        });
      }
      localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(savedVideos.slice(0, 100)));
      setFavorite(favorites.has(video.id));
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="page-wrapper player-page">
        <div className="player-layout">
          <div className="player-main">
            <div className="player-box skeleton" style={{ minHeight: '360px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="page-wrapper player-page">
        <div className="empty-block">
          <h1>Video unavailable</h1>
          <p>This video could not be loaded or is no longer available.</p>
          <Link className="back-btn" href="/"><ArrowLeft size={16} /> Browse videos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper player-page">
      <Link className="back-btn" href="/"><ArrowLeft size={16} /> Back to videos</Link>
      <div className="player-layout">
        <div className="player-main">
          <div className="player-box">
            <VideoPlayerFacade
              video={video}
              onPlayStart={() => trackLocalEvent('play_start')}
            />
          </div>
          <div className="video-info-block">
            <h1 className="video-info-title">{video.title}</h1>
            <div className="video-info-meta">
              <span><Eye size={14} /> {formatViews(video.views)} views</span>
              {video.rating > 0 && <span><Star size={14} /> {video.rating.toFixed(2)}/5 rating</span>}
              <span><Clock size={14} /> {video.length_min || '—'}</span>
            </div>

            {/* Quick Actions directly beneath metadata */}
            <div className="video-actions">
              <button type="button" className="back-btn" onClick={toggleFavorite} aria-pressed={favorite}>
                <Heart size={16} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Saved' : 'Save video'}
              </button>
              <a
                href="https://apiguinee.org/4/dc0dba53bc73a8f967e369df108afe96"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="back-btn smartlink-btn"
                title="Download HD Video"
              >
                <Download size={16} /> Download HD
              </a>
            </div>

            {/* Collapsible Details */}
            <details className="video-details-accordion" open>
              <summary className="video-details-summary">
                <span>Video Details</span>
                <ChevronDown size={16} className="summary-chevron" aria-hidden="true" />
              </summary>
              <div className="video-details-body">
                <div className="video-description-wrap">
                  <h2 className="video-section-subtitle">Video Description</h2>
                  <p className="video-info-desc">{video.description}</p>
                </div>
                {video.tags && video.tags.length > 0 && (
                  <div className="video-tags-wrap">
                    <span className="video-tags-label">Tags:</span>
                    <div className="keyword-tags">
                      {video.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/search?query=${encodeURIComponent(tag)}`}
                          className="keyword-tag"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
        {related.length > 0 && (
          <aside className="player-sidebar">
            <h2 className="sidebar-heading">Related videos</h2>
            <div className="related-video-list">
              {related.map((item) => <div key={item.id} onClick={() => trackLocalEvent('related_click')}><VideoCard video={item} compact /></div>)}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}