"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Eye, Heart, Star, Download, ChevronDown, Film, X, Play } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import VideoPlayerFacade from "@/components/VideoPlayerFacade";
import { recordVisit, trackLocalEvent } from "@/lib/privacyMetrics";
import { findModelInText } from "@/data/pornstars";
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

function getNextVideoHref(v) {
  if (!v) return '/';
  if (v.canonicalSlug) return `/video/${v.canonicalSlug}`;
  if (v.canonicalUrl) {
    try {
      const u = new URL(v.canonicalUrl, 'https://www.nicevx.com');
      return `${u.pathname}${u.search}`;
    } catch (_) {}
  }
  return `/watch?id=${encodeURIComponent(v.id)}`;
}

export default function VideoPlayerClient({
  video,
  initialRelated = [],
  relatedCollections = [],
  discoveryContext = null,
  tagHubLinks = {},
  categoryHref = null,
  displayCategory = null,
}) {
  const router = useRouter();
  const effectiveCategory = displayCategory?.name || video?.category || '';
  const [favorite, setFavorite] = useState(false);
  const [previewThumb, setPreviewThumb] = useState(null);
  const [autoplay, setAutoplay] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [showStickyNext, setShowStickyNext] = useState(false);
  const [dismissSticky, setDismissSticky] = useState(false);
  const countdownTimer = useRef(null);

  const nextVideo = initialRelated && initialRelated.length > 0 ? initialRelated[0] : null;

  const videoTags = Array.isArray(video.tags) && video.tags.length > 0
    ? video.tags
    : (video.keywords ? String(video.keywords).split(',').map((t) => t.trim()).filter(Boolean) : []);

  const thumbs = Array.isArray(video.thumbs) ? video.thumbs : [];

  const starringModel = findModelInText(
    `${video.title || ""} ${video.keywords || ""} ${(video.tags || []).join(" ")}`,
  );

  const handleToggleAutoplay = (enabled) => {
    setAutoplay(enabled);
    if (!enabled && countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
      setCountdown(null);
    }
    try {
      localStorage.setItem('nicevx_autoplay_next', String(enabled));
    } catch (_) {}
  };

  const cancelCountdown = () => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    setCountdown(null);
  };

  useEffect(() => {
    recordVisit();
    try {
      const savedAutoplay = localStorage.getItem('nicevx_autoplay_next');
      if (savedAutoplay !== null) {
        setAutoplay(savedAutoplay === 'true');
      }
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

    const handleScroll = () => {
      if (window.scrollY > 480 && !dismissSticky) {
        setShowStickyNext(true);
      } else {
        setShowStickyNext(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [video, dismissSticky]);

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
        <Link href={categoryHref || `/cat/${(effectiveCategory || 'all').toLowerCase().replace(/\s+/g, '-')}`} style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>
          {effectiveCategory ? effectiveCategory.replace(/\b\w/g, (l) => l.toUpperCase()) : 'Videos'}
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

            {/* Starring Performer Badge if detected */}
            {starringModel && (
              <div className="starring-model-banner">
                <Star size={13} fill="var(--color-accent)" style={{ color: 'var(--color-accent)' }} />
                <span>Starring: </span>
                <Link href={`/pornstar/${starringModel.slug}`} className="starring-model-link">
                  {starringModel.name}
                </Link>
              </div>
            )}

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

            {/* Quick Actions directly beneath metadata */}
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

            {/* Scene Highlights Storyboard Rail */}
            {thumbs.length > 1 && (
              <section className="video-storyboard-section" aria-label="Scene Highlights Storyboard">
                <div className="video-storyboard-header">
                  <h2 className="video-storyboard-title">
                    <Film size={15} style={{ color: "var(--color-accent)" }} /> Scene Highlights ({thumbs.length} Key Moments)
                  </h2>
                  <span className="video-storyboard-tip">Click frame to preview</span>
                </div>
                <div className="video-storyboard-rail" tabIndex={0} role="region" aria-label="Scene thumbnails carousel">
                  {thumbs.map((thumb, idx) => {
                    const thumbSrc = typeof thumb === "string" ? thumb : thumb?.src;
                    if (!thumbSrc) return null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`video-storyboard-item ${previewThumb?.index === idx ? "active" : ""}`}
                        onClick={() => setPreviewThumb({ src: thumbSrc, index: idx })}
                        aria-label={`View scene frame ${idx + 1} of ${thumbs.length}`}
                      >
                        <img
                          src={thumbSrc}
                          alt={`${video.title} scene frame ${idx + 1}`}
                          loading="lazy"
                          width="160"
                          height="90"
                          className="video-storyboard-img"
                        />
                        <span className="video-storyboard-badge">#{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Inline Frame Modal Preview if clicked */}
                {previewThumb && (
                  <div className="video-storyboard-modal" onClick={() => setPreviewThumb(null)}>
                    <div className="video-storyboard-modal-content" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="video-storyboard-modal-close"
                        onClick={() => setPreviewThumb(null)}
                        aria-label="Close scene preview"
                      >
                        <X size={18} />
                      </button>
                      <img
                        src={previewThumb.src}
                        alt={`Scene preview moment ${previewThumb.index + 1}`}
                        className="video-storyboard-modal-img"
                      />
                      <div className="video-storyboard-modal-caption">
                        <span>Scene Highlight #{previewThumb.index + 1} of {thumbs.length}</span>
                        <div className="video-storyboard-modal-nav">
                          <button
                            type="button"
                            className="storyboard-nav-btn"
                            disabled={previewThumb.index <= 0}
                            onClick={() => {
                              const prev = previewThumb.index - 1;
                              const prevSrc = typeof thumbs[prev] === "string" ? thumbs[prev] : thumbs[prev]?.src;
                              if (prevSrc) setPreviewThumb({ src: prevSrc, index: prev });
                            }}
                          >
                            ◀ Prev
                          </button>
                          <button
                            type="button"
                            className="storyboard-nav-btn"
                            disabled={previewThumb.index >= thumbs.length - 1}
                            onClick={() => {
                              const next = previewThumb.index + 1;
                              const nextSrc = typeof thumbs[next] === "string" ? thumbs[next] : thumbs[next]?.src;
                              if (nextSrc) setPreviewThumb({ src: nextSrc, index: next });
                            }}
                          >
                            Next ▶
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Collapsible Details: Crawled 100% by Googlebot, clean on mobile */}
            <details className="video-details-accordion" open>
              <summary className="video-details-summary">
                <span>Video Details &amp; Comparison</span>
                <ChevronDown size={16} className="summary-chevron" aria-hidden="true" />
              </summary>
              <div className="video-details-body">
                <div className="video-description-wrap">
                  <h2 className="video-section-subtitle">Video Description</h2>
                  <p className="video-info-desc">
                    {video.description || `Watch ${video.title} in full HD on NICEVX. Stream high definition scenes with smooth playback and crisp audio.`}
                  </p>
                </div>
                <dl
                  className="video-scene-facts"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.6rem 1rem',
                    margin: '0.85rem 0',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    fontSize: '0.82rem',
                  }}
                >
                  {video.length_min && (
                    <div>
                      <dt style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Runtime</dt>
                      <dd style={{ margin: 0, fontWeight: 600 }}>{video.length_min}</dd>
                    </div>
                  )}
                  {effectiveCategory && (
                    <div>
                      <dt style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Category</dt>
                      <dd style={{ margin: 0, fontWeight: 600 }}>{effectiveCategory}</dd>
                    </div>
                  )}
                  <div>
                    <dt style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Quality</dt>
                    <dd style={{ margin: 0, fontWeight: 600 }}>{video.isHd === false ? 'SD' : 'HD Streaming'}</dd>
                  </div>
                  {Number(video.views) > 0 && (
                    <div>
                      <dt style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Views</dt>
                      <dd style={{ margin: 0, fontWeight: 600 }}>{formatViews(video.views)}</dd>
                    </div>
                  )}
                  {Number(video.rating) > 0 && (
                    <div>
                      <dt style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Approval Rating</dt>
                      <dd style={{ margin: 0, fontWeight: 600 }}>{video.rating}%</dd>
                    </div>
                  )}
                  {video.uploadDate && (
                    <div>
                      <dt style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Published</dt>
                      <dd style={{ margin: 0, fontWeight: 600 }}>{new Date(video.uploadDate).toLocaleDateString('en-US')}</dd>
                    </div>
                  )}
                </dl>
                {videoTags.length > 0 && (
                  <div className="video-tags-wrap">
                    <span className="video-tags-label">Tags:</span>
                    <div className="keyword-tags">
                      {videoTags.map((tag) => {
                        const hubHref = tagHubLinks?.[tag];
                        return hubHref ? (
                          <Link
                            key={tag}
                            href={hubHref}
                            className="keyword-tag"
                          >
                            #{tag}
                          </Link>
                        ) : (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => router.push(`/search?query=${encodeURIComponent(tag)}`)}
                            className="keyword-tag"
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {categoryHref && effectiveCategory && (
                  <p className="video-category-bridge" style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                    Category:{' '}
                    <Link href={categoryHref} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                      More {effectiveCategory} videos &rarr;
                    </Link>
                  </p>
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
              </div>
            </details>
          </div>
        </div>

        <aside className="player-sidebar">
          {/* Up Next Autoplay Card */}
          {nextVideo && (
            <div className="up-next-card">
              <div className="up-next-header">
                <span className="up-next-label">
                  <Play size={12} fill="var(--color-accent)" style={{ color: 'var(--color-accent)' }} /> Up Next
                </span>
                <label className="autoplay-toggle" title="Toggle autoplay next video">
                  <span className="autoplay-text">Autoplay</span>
                  <input
                    type="checkbox"
                    checked={autoplay}
                    onChange={(e) => handleToggleAutoplay(e.target.checked)}
                    aria-label="Autoplay next video"
                  />
                  <span className="autoplay-slider" />
                </label>
              </div>
              <div className="up-next-body">
                <Link href={getNextVideoHref(nextVideo)} className="up-next-thumb-link">
                  <img
                    src={nextVideo.thumbnail}
                    alt={nextVideo.title}
                    className="up-next-thumb"
                    width="120"
                    height="68"
                    loading="lazy"
                  />
                  {nextVideo.length_min && (
                    <span className="up-next-duration">{nextVideo.length_min}</span>
                  )}
                </Link>
                <div className="up-next-details">
                  <Link href={getNextVideoHref(nextVideo)} className="up-next-title">
                    {nextVideo.title}
                  </Link>
                  <span className="up-next-views">{formatViews(nextVideo.views)} views</span>
                  <Link href={getNextVideoHref(nextVideo)} className="play-next-btn">
                    Play Next ▶
                  </Link>
                </div>
              </div>
            </div>
          )}

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

      {/* Floating Sticky Next Bar when scrolled down */}
      {showStickyNext && nextVideo && (
        <aside className="sticky-next-bar" aria-label="Up next quick bar">
          <div className="sticky-next-inner">
            <div className="sticky-next-info">
              <span className="sticky-next-label">Up Next:</span>
              <span className="sticky-next-title">{nextVideo.title}</span>
            </div>
            <div className="sticky-next-actions">
              <Link href={getNextVideoHref(nextVideo)} className="sticky-play-btn">
                Play Next ▶
              </Link>
              <button
                type="button"
                className="sticky-close-btn"
                onClick={() => setDismissSticky(true)}
                aria-label="Dismiss up next bar"
              >
                ✕
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
