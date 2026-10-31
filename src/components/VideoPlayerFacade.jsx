"use client";

import { useState } from "react";
import { Play, Clock } from "lucide-react";

export default function VideoPlayerFacade({ video, onPlayStart }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    if (onPlayStart) onPlayStart();
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
      <button
        type="button"
        className="video-facade-play-btn"
        aria-label={`Play ${video.title}`}
        onClick={(e) => {
          handlePlay();
        }}
      >
        <div className="play-icon-circle">
          <Play size={32} className="play-icon-svg" fill="currentColor" />
        </div>
      </button>
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
