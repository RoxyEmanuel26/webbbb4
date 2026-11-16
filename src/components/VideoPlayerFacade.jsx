"use client";

import { useEffect, useState } from "react";
import { Play, Clock } from "lucide-react";

const AGE_VERIFIED_EVENT = "nicevx:age-verified";

export default function VideoPlayerFacade({ video, onPlayStart }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsAgeConfirm, setNeedsAgeConfirm] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

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

  const startPlayback = () => {
    setNeedsAgeConfirm(false);
    setIsPlaying(true);
    if (onPlayStart) onPlayStart();
  };

  const handlePlay = () => {
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

  const embedWithAutoplay = video.embedUrl
    ? `${video.embedUrl}${video.embedUrl.includes('?') ? '&' : '?'}autoplay=1`
    : '';

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
      <img
        src={video.thumbnail}
        alt={video.title}
        className="video-facade-poster"
        width="1280"
        height="720"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
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
                background: "var(--color-accent, #ff3355)",
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
          <Clock size={12} aria-hidden="true" style={{ marginRight: '4px', verticalAlign: '-1px' }} />
          {durationText}
        </span>
      )}
      <span className="video-facade-hd-badge">1080p HD</span>
    </div>
  );
}
