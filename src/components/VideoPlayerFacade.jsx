"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Play, Clock, Film, ArrowRight } from "lucide-react";

const AGE_VERIFIED_EVENT = "nicevx:age-verified";
const EPORNER_ID_API = "https://www.eporner.com/api/v2/video/id/";

function getVideoHref(v) {
  if (!v) return "/";
  if (v.canonicalSlug) return `/video/${v.canonicalSlug}`;
  if (v.canonicalUrl) {
    try {
      const u = new URL(v.canonicalUrl, "https://www.nicevx.com");
      return `${u.pathname}${u.search}`;
    } catch (_) {}
  }
  return `/watch?id=${encodeURIComponent(v.id)}`;
}

export default function VideoPlayerFacade({
  video,
  onPlayStart,
  relatedVideos = [],
  categoryHref = "/",
  categoryName = "",
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsAgeConfirm, setNeedsAgeConfirm] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [liveEmbedUrl, setLiveEmbedUrl] = useState(video.embedUrl || "");
  const [livePosterUrl, setLivePosterUrl] = useState(video.thumbnail || "");
  const [posterFallbackIdx, setPosterFallbackIdx] = useState(0);
  const [posterBroken, setPosterBroken] = useState(false);

  const posterCandidates = useMemo(() => {
    const rawList = [
      livePosterUrl,
      video.thumbnail,
      video.default_thumb?.src,
      ...(Array.isArray(video.thumbs)
        ? video.thumbs.map((t) => (typeof t === "string" ? t : t?.src))
        : []),
    ].filter(Boolean);
    return [...new Set(rawList)];
  }, [livePosterUrl, video.thumbnail, video.default_thumb, video.thumbs]);

  const activePoster = posterCandidates[posterFallbackIdx] || "";

  useEffect(() => {
    setIsPlaying(false);
    setNeedsAgeConfirm(false);
    setIsUnavailable(false);
    setLiveEmbedUrl(video.embedUrl || "");
    setLivePosterUrl(video.thumbnail || "");
    setPosterFallbackIdx(0);
    setPosterBroken(false);
  }, [video.id, video.embedUrl, video.thumbnail]);

  useEffect(() => {
    try {
      setAgeVerified(localStorage.getItem("ageVerified") === "true");
    } catch (_) {}
    const onVerified = () => {
      setAgeVerified(true);
      setNeedsAgeConfirm(false);
    };
    window.addEventListener(AGE_VERIFIED_EVENT, onVerified);
    return () => window.removeEventListener(AGE_VERIFIED_EVENT, onVerified);
  }, []);

  // Silent live availability check so visitors never see Eporner's removed-video screen.
  useEffect(() => {
    if (!video?.id) return;
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    fetch(`${EPORNER_ID_API}?id=${encodeURIComponent(video.id)}&thumbsize=big&format=json`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || data === null) return;
        if (!data || Array.isArray(data) || !data.id || !data.embed) {
          setIsUnavailable(true);
          setIsPlaying(false);
          return;
        }
        if (data.embed && data.embed !== video.embedUrl) {
          setLiveEmbedUrl(data.embed);
        }
        if (data.default_thumb?.src && data.default_thumb.src !== video.thumbnail) {
          setLivePosterUrl(data.default_thumb.src);
          setPosterFallbackIdx(0);
          setPosterBroken(false);
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer));

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [video?.id, video?.embedUrl, video?.thumbnail]);

  const handlePosterError = () => {
    if (posterFallbackIdx + 1 < posterCandidates.length) {
      setPosterFallbackIdx((prev) => prev + 1);
    } else {
      setPosterBroken(true);
    }
  };

  const startPlayback = () => {
    if (isUnavailable) return;
    setNeedsAgeConfirm(false);
    setIsPlaying(true);
    if (onPlayStart) onPlayStart();
  };

  const handlePlay = () => {
    if (isUnavailable) return;
    if (ageVerified) {
      startPlayback();
      return;
    }
    setNeedsAgeConfirm(true);
  };

  const handleConfirmAgeAndPlay = (e) => {
    e.stopPropagation();
    try {
      localStorage.setItem("ageVerified", "true");
    } catch (_) {}
    setAgeVerified(true);
    window.dispatchEvent(new Event(AGE_VERIFIED_EVENT));
    startPlayback();
  };

  if (isUnavailable) {
    const recoveryPicks = (Array.isArray(relatedVideos) ? relatedVideos : [])
      .filter((item) => item && item.id !== video.id && (item.thumbnail || item.default_thumb?.src))
      .slice(0, 3);
    const browseLabel = categoryName
      ? `Browse ${categoryName.replace(/\b\w/g, (l) => l.toUpperCase())} Videos`
      : "Browse Latest HD Videos";

    return (
      <div className="video-unavailable-panel" role="status" aria-live="polite">
        <div className="video-unavailable-head">
          <span className="video-unavailable-badge">
            <Film size={14} aria-hidden="true" /> Video Removed by Host
          </span>
          <p className="video-unavailable-msg">
            This video is no longer available from the upstream provider. Pick a similar HD video below:
          </p>
        </div>

        {recoveryPicks.length > 0 && (
          <div className="video-unavailable-picks">
            {recoveryPicks.map((item) => (
              <Link
                key={item.id}
                href={getVideoHref(item)}
                prefetch={false}
                className="video-unavailable-pick"
              >
                <div className="video-unavailable-pick-thumb">
                  <img
                    src={item.thumbnail || item.default_thumb?.src}
                    alt={item.title}
                    loading="lazy"
                  />
                  {item.length_min && (
                    <span className="video-unavailable-pick-dur">{item.length_min}</span>
                  )}
                </div>
                <span className="video-unavailable-pick-title">{item.title}</span>
              </Link>
            ))}
          </div>
        )}

        <Link href={categoryHref || "/"} className="video-unavailable-cta">
          <span>{browseLabel}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const embedWithAutoplay = liveEmbedUrl
    ? `${liveEmbedUrl}${liveEmbedUrl.includes("?") ? "&" : "?"}autoplay=1`
    : "";

  if (isPlaying) {
    return (
      <iframe
        src={embedWithAutoplay}
        title={video.title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="eager"
      />
    );
  }

  const durationText =
    video.length_min ||
    (video.durationSeconds
      ? `${Math.round(video.durationSeconds / 60)} min`
      : null);

  return (
    <div
      className="video-player-facade"
      onClick={handlePlay}
      role="region"
      aria-label={`Video player for ${video.title}`}
    >
      {!posterBroken && activePoster ? (
        <img
          src={activePoster}
          alt={video.title}
          className="video-facade-poster"
          width="1280"
          height="720"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={handlePosterError}
        />
      ) : (
        <div className="video-facade-poster-fallback" aria-hidden="true" />
      )}
      <div className="video-facade-overlay" />
      {needsAgeConfirm ? (
        <div
          style={{
            position: "relative",
            zIndex: 3,
            maxWidth: "360px",
            margin: "0 1rem",
            padding: "1.1rem 1.25rem",
            borderRadius: "12px",
            background: "rgba(15, 15, 22, 0.94)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.92rem", color: "#fff", fontWeight: 600 }}>
            18+ Adult Content — Confirm you are at least 18 years old to stream this video.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            <button
              type="button"
              onClick={handleConfirmAgeAndPlay}
              style={{
                background: "var(--color-accent, #e11d48)",
                color: "#fff",
                border: "none",
                padding: "8px 18px",
                borderRadius: "6px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              I am 18+ — Watch
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setNeedsAgeConfirm(false);
              }}
              style={{
                background: "transparent",
                color: "#ccc",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "8px 14px",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="video-facade-play-btn"
          aria-label={`Play ${video.title}`}
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
        >
          <div className="play-icon-circle">
            <Play size={32} className="play-icon-svg" fill="currentColor" />
          </div>
        </button>
      )}
      {durationText && (
        <span className="video-facade-duration">
          <Clock size={12} aria-hidden="true" style={{ marginRight: "4px", verticalAlign: "-1px" }} />
          {durationText}
        </span>
      )}
      <span className="video-facade-hd-badge">1080p HD</span>
    </div>
  );
}
