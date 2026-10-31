"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Eye, Heart, Star } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import VideoPlayerFacade from "@/components/VideoPlayerFacade";
import { recordVisit, trackLocalEvent } from "@/lib/privacyMetrics";
import "../../../pages/Pages.css";

const FAVORITES_KEY = "nicevx_favorites_v1";
const SAVED_VIDEOS_KEY = "nicevx_saved_videos_v2";
const HISTORY_KEY = "nicevx_watch_history_v1";

function formatViews(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function formatDuration(seconds) {
  const minutes = Math.round(Number(seconds) / 60);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function VideoPlayerClient({ video, initialRelated = [], relatedCollections = [], discoveryContext = null }) {
  const [favorite, setFavorite] = useState(false);
  const videoTags = Array.isArray(video.tags) && video.tags.length > 0
    ? video.tags
    : (video.keywords ? String(video.keywords).split(',').map((t) => t.trim()).filter(Boolean) : []);

  useEffect(() => {
    recordVisit();
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_VIDEOS_KEY) || "[]");
      const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      setFavorite((Array.isArray(saved) && saved.some((item) => item.id === video.id)) || favorites.includes(video.id));
      const history = JSON.parse(
        localStorage.getItem(HISTORY_KEY) || "[]",
      ).filter((entry) => entry.id !== video.id);
      history.unshift({
        id: video.id,
        url: video.canonicalUrl,
        title: video.title,
        thumbnail: video.thumbnail,
        watchedAt: new Date().toISOString(),
      });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 24)));
    } catch (_) {}
  }, [video]);

  const toggleFavorite = () => {
    try {
      const favorites = new Set(
        JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"),
      );
      if (favorites.has(video.id)) favorites.delete(video.id);
      else favorites.add(video.id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
      const saved = JSON.parse(localStorage.getItem(SAVED_VIDEOS_KEY) || "[]");
      const savedVideos = Array.isArray(saved) ? saved.filter((item) => item?.id !== video.id) : [];
      if (favorites.has(video.id)) {
        savedVideos.unshift({
          id: video.id,
          canonicalUrl: video.canonicalUrl,
          title: video.title,
          thumbnail: video.thumbnail,
          views: video.views,
          rating: video.rating,
          length_min: video.length_min,
          category: video.category,
          tags: video.tags,
          uploadDate: video.uploadDate,
          discoveryScore: video.discoveryScore,
        });
      }
      localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(savedVideos.slice(0, 100)));
      setFavorite(favorites.has(video.id));
    } catch (_) {}
  };

  return (
    <div className="page-wrapper player-page">
      <nav className="breadcrumb-nav" aria-label="Breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <Link href={`/cat/${(video.category || 'all').toLowerCase().replace(/\s+/g, '-')}`} style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>
          {video.category ? video.category.replace(/\b\w/g, (l) => l.toUpperCase()) : 'Videos'}
        </Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: 'var(--color-text)' }}>{video.title}</span>
      </nav>
      <Link className="back-btn" href="/">
        <ArrowLeft size={16} /> Back to videos
      </Link>
      <div className="player-layout">
        <div className="player-main">
          <div className="player-box">
            <VideoPlayerFacade
              video={video}
              onPlayStart={() => trackLocalEvent("play_start")}
            />
          </div>
          <div className="video-info-block">
            <h1 className="video-info-title">
              {video.title}
            </h1>
            <div className="video-info-meta">
              <span>
                <Eye size={14} /> {formatViews(video.views)} views
              </span>
              <span>
                <Star size={14} /> {video.rating.toFixed(2)}/5 rating
              </span>
              <span>
                <Clock size={14} /> {video.length_min}
              </span>
              <span>
                <Calendar size={14} />{" "}
                {new Date(video.uploadDate).toLocaleDateString("en-US")}
              </span>
            </div>
            <div className="video-description-wrap">
              <h2 className="video-section-subtitle">Video Description</h2>
              <p className="video-info-desc">
                {video.description || `Watch ${video.title} in full HD on NICEVX. Stream high definition scene with verified playback and crisp audio.`}
              </p>
            </div>
            {videoTags.length > 0 && (
              <div className="video-tags-wrap">
                <span className="video-tags-label">Tags:</span>
                <div className="keyword-tags">
                  {videoTags.map((tag) => (
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
            {discoveryContext && (
              <section className="video-context" aria-labelledby="video-context-heading">
                <h2 id="video-context-heading">How this video compares</h2>
                <p>
                  {discoveryContext.collection ? (
                    <>
                      Within our <Link href={`/collections/${discoveryContext.collection.slug}`}>{discoveryContext.collection.name} collection</Link>
                    </>
                  ) : (
                    <>Among videos currently listed on NICEVX</>
                  )}
                  {discoveryContext.medianDurationSeconds && Number(video.durationSeconds) > 0
                    ? `, this video runs ${formatDuration(video.durationSeconds)} versus a median of ${formatDuration(discoveryContext.medianDurationSeconds)}.`
                    : "."}
                  {discoveryContext.sourceViewRank && discoveryContext.viewedCount > 1
                    ? ` It ranks ${discoveryContext.sourceViewRank} of ${discoveryContext.viewedCount} by views on the original platform.`
                    : ""}
                </p>
                {discoveryContext.sameLength.length > 0 && (
                  <div className="video-context-neighbors">
                    <h3>Similar length and tags</h3>
                    <ul>
                      {discoveryContext.sameLength.map((item) => (
                        <li key={item.id}>
                          <Link href={`/video/${item.canonicalSlug}`}>{item.title}</Link>
                          <span>{item.length_min}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
            {relatedCollections.length > 0 && (
              <nav className="video-collection-links" aria-label="Browse related collections">
                <h2>Browse this topic</h2>
                <div>
                  {relatedCollections.map((collection) => (
                    <Link key={collection.slug} href={`/collections/${collection.slug}`}>
                      {collection.name}
                    </Link>
                  ))}
                </div>
              </nav>
            )}
            <div className="video-actions">
              <button
                type="button"
                className="back-btn"
                onClick={toggleFavorite}
                aria-pressed={favorite}
              >
                <Heart size={16} fill={favorite ? "currentColor" : "none"} />{" "}
                {favorite ? "Saved" : "Save video"}
              </button>
            </div>
          </div>
        </div>

        <aside className="player-sidebar">
          <h2 className="sidebar-heading">Related videos</h2>
          <div className="related-video-list">
            {initialRelated.map((related) => (
              <div
                key={related.id}
                onClick={() => trackLocalEvent("related_click")}
              >
                <VideoCard video={related} compact />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
