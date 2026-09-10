'use client';

import { useEffect, useMemo, useState } from 'react';
import VideoCard from './VideoCard';

export default function PersonalShelf({ catalog = [] }) {
  const [historyIds, setHistoryIds] = useState([]);

  useEffect(() => {
    try {
      setHistoryIds(JSON.parse(localStorage.getItem('nicevx_watch_history_v1') || '[]').map((entry) => entry.id));
    } catch (_) {}
  }, []);

  const { recent, recommended } = useMemo(() => {
    const byId = new Map(catalog.map((video) => [video.id, video]));
    const recent = historyIds.map((id) => byId.get(id)).filter(Boolean).slice(0, 6);
    const viewed = new Set(historyIds);
    const signals = new Set(recent.flatMap((video) => [video.category, ...(video.tags || [])]));
    const recommended = catalog.filter((video) => !viewed.has(video.id) && [video.category, ...(video.tags || [])].some((signal) => signals.has(signal))).slice(0, 6);
    return { recent, recommended };
  }, [catalog, historyIds]);

  if (!recent.length) return null;
  const shelves = [{ title: 'Continue Watching', videos: recent }, { title: 'Recommendations', videos: recommended }];
  return <section className="personal-shelves" aria-label="Your videos">{shelves.filter((shelf) => shelf.videos.length).map((shelf) => <div key={shelf.title}><h2>{shelf.title}</h2><div className="video-grid">{shelf.videos.map((video) => <VideoCard key={video.id} video={video} />)}</div></div>)}</section>;
}
