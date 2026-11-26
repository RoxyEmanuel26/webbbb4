"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Eye, Star, Clock, Heart, Play, Film } from "lucide-react";
import "./VideoCard.css";

const FAVORITES_KEY = "nicevx_favorites_v1";
const SAVED_VIDEOS_KEY = "nicevx_saved_videos_v2";
const FORBIDDEN_REGEX =
  /\b(gay|shemale|tranny|ladyboy|ts|transsexual|transgender|boy|men|cock suck|cock sucking)\b/i;

const formatViews = (n) => {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return String(num);
};

const ratingToPercent = (rate) => {
  const r = parseFloat(rate) || 0;
  return Math.round((r / 5) * 100);
};

const createSlug = (title) => {
  if (!title) return "";
  return String(title)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const getThumbUrl = (item) => (typeof item === "string" ? item : item?.src || "");

const VideoCard = ({ video, compact = false, priority = false }) => {
  const [thumbIdx, setThumbIdx] = useState(0);
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPercent, setScrubPercent] = useState(0);
  const [saved, setSaved] = useState(false);
  const isPrefetched = useRef(false);
  const thumbWrapRef = useRef(null);

  const rawThumbs = Array.isArray(video.thumbs) ? video.thumbs : [];
  const thumbs = rawThumbs.filter((t) => {
    const url = getThumbUrl(t);
    return Boolean(url) && !failedUrls.has(url);
  });
  const activeThumb = getThumbUrl(thumbs[Math.min(thumbIdx, Math.max(0, thumbs.length - 1))]);
  const fallbackCandidates = [
    activeThumb,
    video.default_thumb?.src,
    video.thumbnail,
    ...thumbs.map(getThumbUrl),
  ].filter((url) => Boolean(url) && !failedUrls.has(url));
  const displayedSrc = fallbackCandidates[0] || "";

  const handleThumbError = () => {
    if (!displayedSrc) return;
    setFailedUrls((prev) => {
      if (prev.has(displayedSrc)) return prev;
      const next = new Set(prev);
      next.add(displayedSrc);
      return next;
    });
  };

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      if (Array.isArray(favs) && favs.includes(video.id)) {
        setSaved(true);
      }
    } catch (_) {}
  }, [video.id]);

  const prefetchThumbs = () => {
    if (!isPrefetched.current && thumbs.length > 1) {
      thumbs.forEach((t) => {
        const thumbUrl = getThumbUrl(t);
        if (thumbUrl) {
          const img = new Image();
          img.src = thumbUrl;
        }
      });
      isPrefetched.current = true;
    }
  };

  const updateScrubFromClientX = (clientX) => {
    const rect = thumbWrapRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ratio = x / rect.width;
    const index = Math.min(Math.floor(ratio * thumbs.length), thumbs.length - 1);
    setThumbIdx(index);
    setScrubPercent(ratio * 100);
    if (!isScrubbing) setIsScrubbing(true);
  };

  const handleMouseMove = (e) => {
    if (thumbs.length <= 1) return;
    prefetchThumbs();
    updateScrubFromClientX(e.clientX);
  };

  const handleMouseEnter = () => {
    if (thumbs.length > 1) {
      prefetchThumbs();
      setIsScrubbing(true);
    }
  };

  const handleMouseLeave = () => {
    setIsScrubbing(false);
    setThumbIdx(0);
    setScrubPercent(0);
  };

  const handleTouchMove = (e) => {
    if (thumbs.length <= 1 || !e.touches?.[0]) return;
    prefetchThumbs();
    updateScrubFromClientX(e.touches[0].clientX);
  };

  const handleQuickSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favorites = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"));
      const existingSaved = JSON.parse(localStorage.getItem(SAVED_VIDEOS_KEY) || "[]");
      const savedList = Array.isArray(existingSaved)
        ? existingSaved.filter((item) => item?.id !== video.id)
        : [];
      if (favorites.has(video.id)) {
        favorites.delete(video.id);
        setSaved(false);
      } else {
        favorites.add(video.id);
        savedList.unshift({
          id: video.id,
          canonicalSlug: video.canonicalSlug,
          canonicalUrl: video.canonicalUrl,
          title: video.title,
          thumbnail: video.thumbnail || video.default_thumb?.src || displayedSrc,
          views: video.views,
          rating: video.rating ?? video.rate,
          length_min: video.length_min,
          category: video.category,
          tags: video.tags,
          uploadDate: video.uploadDate,
          discoveryScore: video.discoveryScore,
        });
        setSaved(true);
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
      localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(savedList.slice(0, 100)));
    } catch (_) {}
  };

  const rating = parseFloat(video.rate ?? video.rating ?? 0);
  const duration = video.length_min || "—";
  const views = formatViews(video.views || 0);
  const ratingPct = ratingToPercent(rating);
  const slug = createSlug(video.title);
  const videoHref = (() => {
    if (!video.canonicalUrl) return `/watch?id=${encodeURIComponent(video.id)}`;
    try {
      const canonical = new URL(video.canonicalUrl, "https://www.nicevx.com");
      if (canonical.hostname === "www.nicevx.com" || canonical.hostname === "nicevx.com") {
        return `${canonical.pathname}${canonical.search}`;
      }
    } catch (_) {}
    return `/video/${slug}-${video.id}`;
  })();

  const getPrimaryKeyword = () => {
    if (video.actor) return video.actor;
    const keywordSource = video.keywords || (video.tags || []).join(",");
    if (!keywordSource) return "";
    const kws = String(keywordSource)
      .split(",")
      .map((k) => k.trim())
      .filter(
        (k) =>
          k.length > 2 &&
          k.length < 24 &&
          k.split(/\s+/).length <= 2 &&
          !FORBIDDEN_REGEX.test(k)
      );
    return kws[0] || "";
  };
  const primaryKeyword = getPrimaryKeyword();

  return (
    <article
      className={`vcard ${compact ? "vcard--compact" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      onTouchCancel={handleMouseLeave}
    >
      <Link
        ref={thumbWrapRef}
        href={videoHref}
        prefetch={false}
        className="vcard__thumb-wrap"
        aria-label={video.title}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onContextMenu={(e) => e.preventDefault()}
      >
        {displayedSrc ? (
          <img
            src={displayedSrc}
            alt={video.title}
            className="vcard__thumb"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            draggable="false"
            width="640"
            height="360"
            onError={handleThumbError}
          />
        ) : (
          <div className="vcard__thumb-fallback" aria-hidden="true">
            <Film size={28} strokeWidth={1.6} />
          </div>
        )}
        <div className="vcard__scrim" aria-hidden="true" />
        <div className="vcard__overlay" aria-hidden="true">
          <div className="vcard__play-icon">
            <Play size={18} fill="currentColor" strokeWidth={1.5} />
          </div>
        </div>
        <span className="vcard__hd-badge">HD</span>
        <span className="vcard__duration" aria-label={`Duration: ${duration}`}>
          <Clock size={10} aria-hidden="true" />
          {duration}
        </span>
        {thumbs.length > 1 && isScrubbing && (
          <>
            <div className="vcard__scrub-track" aria-hidden="true">
              <div
                className="vcard__scrub-bar"
                style={{ width: `${Math.max(scrubPercent, 6)}%` }}
              />
            </div>
            <span className="vcard__frame-badge" aria-hidden="true">
              {thumbIdx + 1}/{thumbs.length}
            </span>
          </>
        )}
      </Link>

      {!compact && (
        <button
          type="button"
          className={`vcard__save-btn ${saved ? "is-saved" : ""}`}
          onClick={handleQuickSave}
          aria-label={saved ? "Remove from saved" : "Save video"}
          aria-pressed={saved}
          title={saved ? "Saved" : "Save for later"}
        >
          <Heart size={13} fill={saved ? "currentColor" : "none"} strokeWidth={2} />
        </button>
      )}

      <div className="vcard__info">
        <h3 className="vcard__title">
          <Link href={videoHref} prefetch={false}>
            {video.title}
          </Link>
        </h3>
        <div className="vcard__meta">
          <span className="vcard__meta-item vcard__views">
            <Eye size={11} aria-hidden="true" />
            {views}
          </span>
          {rating > 0 && (
            <span
              className="vcard__meta-item vcard__rating"
              title={`${ratingPct}% approval`}
            >
              <Star size={11} fill="currentColor" aria-hidden="true" />
              {rating.toFixed(1)}
            </span>
          )}
          {primaryKeyword && (
            <span className="vcard__meta-item vcard__tag">
              {video.actor ? primaryKeyword : `#${primaryKeyword}`}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default VideoCard;
