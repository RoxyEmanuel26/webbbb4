'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import VideoCard from '@/components/VideoCard';
import Pagination from '@/components/Pagination';
import TagsBar from '@/components/TagsBar';
import SortBar from '@/components/SortBar';
import PersonalShelf from '@/components/PersonalShelf';

const SORT_OPTIONS = [
  { value: 'latest', label: '🕐 Latest' },
  { value: 'most-popular', label: '🔥 Most Viewed' },
  { value: 'top-weekly', label: '📈 Discovery Score' },
  { value: 'top-monthly', label: '⭐ Top Rated' },
];

function sortVideos(videos, order) {
  const sorted = [...videos];
  if (order === 'most-popular') return sorted.sort((a, b) => b.views - a.views);
  if (order === 'top-monthly') return sorted.sort((a, b) => b.rating - a.rating || b.views - a.views);
  if (order === 'top-weekly') return sorted.sort((a, b) => b.discoveryScore - a.discoveryScore);
  return sorted.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
}

export default function HomeClient({ initialVideos = [], initialTrendTags = [] }) {
  const searchParams = useSearchParams();
  const rawOrder = searchParams.get('order');
  const order = SORT_OPTIONS.some((option) => option.value === rawOrder) ? rawOrder : 'latest';
  const rawPage = Number.parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const perPage = 36;
  const sorted = sortVideos(initialVideos, order);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const videos = sorted.slice((page - 1) * perPage, page * perPage);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === order)?.label;

  return (
    <div className="home-page">
      {initialTrendTags.length > 0 && <TagsBar tags={initialTrendTags} />}
      <div className="page-wrapper content-area">
        <PersonalShelf catalog={initialVideos} />
        <div className="section-header">
          <div className="section-title-group">
            <h1 className="section-title">Curated Adult Video Discovery — {sortLabel}</h1>
            <span className="section-count">{initialVideos.length.toLocaleString()} verified videos</span>
          </div>
          <SortBar value={rawOrder} options={SORT_OPTIONS} />
        </div>
        <p className="collection-lead">Every published item has a verified source, stable thumbnail, factual metadata, and a transparent discovery score. Trend claims appear only after measured snapshots exist.</p>
        {videos.length > 0 ? (
          <>
            <div className="video-grid">
              {videos.map((video, index) => <VideoCard key={video.id} video={video} priority={index < 4} />)}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} />
          </>
        ) : <div className="empty-block"><p>The curated catalog is being refreshed.</p></div>}
      </div>
    </div>
  );
}
