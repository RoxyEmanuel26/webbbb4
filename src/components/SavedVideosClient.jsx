"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import VideoCard from "@/components/VideoCard";

const FAVORITES_KEY = "nicevx_favorites_v1";

export default function SavedVideosClient({ catalog = [] }) {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      setFavoriteIds(Array.isArray(stored) ? stored : []);
    } catch (_) {
      setFavoriteIds([]);
    } finally {
      setReady(true);
    }
  }, []);

  const savedVideos = useMemo(() => {
    const byId = new Map(catalog.map((video) => [video.id, video]));
    return favoriteIds.map((id) => byId.get(id)).filter(Boolean);
  }, [catalog, favoriteIds]);

  return (
    <section className="saved-page" aria-labelledby="saved-title">
      <div className="saved-heading">
        <span className="saved-heading-icon" aria-hidden="true">
          <Heart size={30} fill="currentColor" />
        </span>
        <div>
          <h1 id="saved-title">Saved Videos</h1>
          <p>Your saved videos, ready whenever you want to watch them.</p>
        </div>
      </div>

      {ready && savedVideos.length > 0 ? (
        <div className="video-grid">
          {savedVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} priority={index < 4} />
          ))}
        </div>
      ) : ready ? (
        <div className="saved-empty">
          <Heart size={42} aria-hidden="true" />
          <h2>No saved videos yet</h2>
          <p>Tap “Save video” on anything you want to find again.</p>
          <Link className="saved-browse-link" href="/">
            Browse videos
          </Link>
        </div>
      ) : (
        <div className="saved-loading" aria-live="polite">Loading saved videos…</div>
      )}
    </section>
  );
}
