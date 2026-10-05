"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Eye, Heart, Star } from "lucide-react";
import VideoCard from "@/components/VideoCard";
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
      <Link className="back-btn" href="/">
        <ArrowLeft size={16} /> Back to videos
      </Link>
      <div className="player-layout">
        <div className="player-main">
          <div className="player-box">
            <iframe
              src={video.embedUrl}
              title={video.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="eager"
              onLoad={() => trackLocalEvent("play_start")}
            />
          </div>
          <div className="video-info-block">
            <h1 className="video-info-title" itemProp="name">
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
            <p className="video-info-desc" itemProp="description">
              {video.description}
            </p>
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
