'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, Eye, Heart, Star, Download } from 'lucide-react';
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

function buildVideoDescription(video) {
  if (video.description && String(video.description).trim().length > 20) {
    return fixEncoding(video.description);
  }
  const title = fixEncoding(video.title || 'Featured adult video');
  const keywords = fixEncoding(video.keywords || '');
  const tags = keywords
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0 && !FORBIDDEN_REGEX.test(k));
  const tagPhrase = tags.length > 0 ? tags.slice(0, 5).join(', ') : 'curated adult scenes';
  const durationPhrase = video.length_min ? `running ${video.length_min}` : 'in high definition';
  return `Watch ${title} on NICEVX. Stream high definition video featuring ${tagPhrase}, ${durationPhrase} with verified ratings and high speed streaming playback.`;
}

function normalizeVideo(video) {
  const title = fixEncoding(video.title) || 'Untitled video';
  const keywords = fixEncoding(video.keywords || '');
  const tags = keywords
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && !FORBIDDEN_REGEX.test(item));
  const description = buildVideoDescription({
    ...video,
    title,
    keywords,
    tags,
  });

  return {
    ...video,
    title,
    keywords,
    tags,
    description,
    rating: Number(video.rate || 0),
    thumbnail: video.default_thumb?.src || video.thumbs?.[0]?.src || '/logo.webp',
    embedUrl: video.embed,
    canonicalUrl: `/watch?id=${encodeURIComponent(video.id)}`,
  };
}

function formatViews(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export default function LiveWatchClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const validId = /^[A-Za-z0-9]{11}$/.test(id);
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [favorite, setFavorite] = useState(false);
  const [state, setState] = useState(validId ? 'loading' : 'invalid');

  useEffect(() => {
    if (!validId) return;
    const controller = new AbortController();

    async function loadVideo() {
      setState('loading');
      try {
        const detailUrl = `${API_BASE}/id/?id=${encodeURIComponent(id)}&thumbsize=big&format=json`;
        const response = await fetch(detailUrl, { signal: controller.signal });
        if (!response.ok) throw new Error(`Video API returned ${response.status}`);
        const raw = await response.json();
        if (!raw?.id || !raw?.embed) throw new Error('Video unavailable');
        const current = normalizeVideo(raw);
        if (FORBIDDEN_REGEX.test(`${current.title} ${current.keywords}`)) throw new Error('Video unavailable');
        setVideo(current);
        setState('ready');
        recordVisit();

        try {
          const saved = JSON.parse(localStorage.getItem(SAVED_VIDEOS_KEY) || '[]');
          const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
          setFavorite((Array.isArray(saved) && saved.some((item) => item.id === id)) || favorites.includes(id));
          const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]').filter((item) => item.id !== id);
          history.unshift({ id, url: current.canonicalUrl, title: current.title, thumbnail: current.thumbnail, watchedAt: new Date().toISOString() });
          localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 24)));
        } catch (_) {}

        const relatedQuery = current.keywords.split(',').map((item) => item.trim()).find(Boolean) || current.title.split(/\s+/).slice(0, 3).join(' ');
        const relatedUrl = new URL(`${API_BASE}/search/`);
        relatedUrl.searchParams.set('query', relatedQuery || 'all');
        relatedUrl.searchParams.set('order', 'latest');
        relatedUrl.searchParams.set('page', '1');
        relatedUrl.searchParams.set('per_page', '12');
        relatedUrl.searchParams.set('thumbsize', 'big');
        relatedUrl.searchParams.set('gay', '0');
        relatedUrl.searchParams.set('lq', '1');
        relatedUrl.searchParams.set('format', 'json');
        const relatedResponse = await fetch(relatedUrl, { signal: controller.signal });
        if (relatedResponse.ok) {
          const data = await relatedResponse.json();
          setRelated((data.videos || []).filter((item) => item.id !== id && !FORBIDDEN_REGEX.test(`${item.title || ''} ${item.keywords || ''}`)).slice(0, 10).map(normalizeVideo));
        }
      } catch (error) {
        if (error.name !== 'AbortError') setState('unavailable');
      }
    }

    loadVideo();
    return () => controller.abort();
  }, [id, validId]);

  const toggleFavorite = () => {
    if (!video) return;
    try {
      const favorites = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
      if (favorites.has(video.id)) favorites.delete(video.id);
      else favorites.add(video.id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
      const stored = JSON.parse(localStorage.getItem(SAVED_VIDEOS_KEY) || '[]');
      const saved = Array.isArray(stored) ? stored.filter((item) => item?.id !== video.id) : [];
      if (favorites.has(video.id)) saved.unshift(video);
      localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(saved.slice(0, 100)));
      setFavorite(favorites.has(video.id));
    } catch (_) {}
  };

  if (state === 'loading') {
    return <div className="page-wrapper player-page"><div className="player-box" aria-label="Loading video" /></div>;
  }

  if (state !== 'ready' || !video) {
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
