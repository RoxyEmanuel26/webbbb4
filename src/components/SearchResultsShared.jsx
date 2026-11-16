'use client';

import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import VideoCard from '@/components/VideoCard';
import SkeletonCard from '@/components/SkeletonCard';
import Pagination from '@/components/Pagination';
import SortBar from '@/components/SortBar';
import TagsBar from '@/components/TagsBar';

import '../pages/Pages.css';

const API_BASE = 'https://www.eporner.com/api/v2/video';

const SORT_OPTIONS = [
  { value: 'latest',       label: '🕐 Latest' },
  { value: 'top-rated',    label: '⭐ Top Rated' },
  { value: 'most-popular', label: '🔥 Most Viewed' },
  { value: 'longest',      label: '🎬 Longest' },
  { value: 'top-weekly',   label: '📈 This Week' },
  { value: 'top-monthly',  label: '📅 This Month' },
];

const FORBIDDEN_REGEX = /\b(gay|shemale|tranny|ladyboy|ts|transsexual|transgender|boy|men|cock suck|cock sucking)\b/i;

function fixEncoding(str) {
  if (!str) return str;
  let fixed = String(str);
  try {
    if (/[\x80-\xFF]/.test(fixed)) fixed = decodeURIComponent(escape(fixed));
  } catch (_) {}
  return fixed
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function getDurationSeconds(v) {
  if (typeof v.length_sec === 'number' && v.length_sec > 0) return v.length_sec;
  if (typeof v.durationSeconds === 'number' && v.durationSeconds > 0) return v.durationSeconds;
  if (typeof v.length_min === 'string') {
    const parts = v.length_min.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }
  return 0;
}

function SearchParamsBridge({ onParamsChange }) {
  const searchParams = useSearchParams();
  const serialized = searchParams.toString();

  useEffect(() => {
    onParamsChange(serialized);
  }, [serialized, onParamsChange]);

  return null;
}

export default function SearchResultsShared({
  query: propQuery,
  isCat,
  isTag,
  page: propPage,
  currentOrder: propOrder,
  initialVideos = null,
  pageTitle,
  headingLevel = 'h1',
  trendTags = [],
  introContent = null,
  perPage = 36,
}) {
  const [searchString, setSearchString] = useState('');
  const [liveFeedActive, setLiveFeedActive] = useState(!Array.isArray(initialVideos));

  const urlParams = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const rawQuery = propQuery ?? (urlParams.get('query') || 'all');
  const query = rawQuery;

  const rawPage = propPage ?? parseInt(urlParams.get('page') || '1', 10);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawOrder = propOrder ?? urlParams.get('order');
  const isValidOrder = SORT_OPTIONS.some((o) => o.value === rawOrder);
  const currentOrder = isValidOrder ? rawOrder : 'latest';

  const durationFilter = urlParams.get('duration') || 'all';

  const hasServerCatalog = Array.isArray(initialVideos);
  const [liveVideos, setLiveVideos] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(initialVideos?.length || 0);
  const [loading, setLoading] = useState(!hasServerCatalog);

  // Only invoke the browser-direct upstream Eporner search API for `/search`,
  // explicit page >= 2 navigation, or user-activated live feed exploration.
  const shouldUseLiveApi = !hasServerCatalog || liveFeedActive || page > 1;

  const fetchData = useCallback(async () => {
    if (!shouldUseLiveApi) return;
    setLoading(true);
    try {
      const url = new URL(`${API_BASE}/search/`);
      url.searchParams.append('query', query === 'all' ? 'all' : query);
      url.searchParams.append('order', currentOrder);
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', perPage);
      url.searchParams.append('thumbsize', 'big');
      url.searchParams.append('gay', 0);
      url.searchParams.append('lq', 1);
      url.searchParams.append('format', 'json');

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      if (data?.videos) {
        const filtered = data.videos
          .map((v) => ({ ...v, title: fixEncoding(v.title), keywords: fixEncoding(v.keywords) }))
          .filter((v) => !FORBIDDEN_REGEX.test(v.keywords || '') && !FORBIDDEN_REGEX.test(v.title || ''));
        setLiveVideos(filtered);
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.total_count || 0);
      } else {
        setLiveVideos([]);
      }
    } catch (err) {
      console.error('SearchResultsShared fetch error:', err);
      setLiveVideos([]);
    } finally {
      setLoading(false);
    }
  }, [query, currentOrder, page, perPage, shouldUseLiveApi]);

  useEffect(() => {
    if (shouldUseLiveApi) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchData, shouldUseLiveApi]);

  const activeSourceVideos = shouldUseLiveApi ? liveVideos : initialVideos;

  // Apply duration filter
  const durationFilteredVideos = useMemo(() => {
    if (!durationFilter || durationFilter === 'all') return activeSourceVideos;
    return activeSourceVideos.filter((v) => {
      const sec = getDurationSeconds(v);
      if (sec <= 0) return true;
      if (durationFilter === 'short') return sec < 600;
      if (durationFilter === 'medium') return sec >= 600 && sec <= 1500;
      if (durationFilter === 'long') return sec > 1500;
      return true;
    });
  }, [activeSourceVideos, durationFilter]);

  const catalogPage = useMemo(() => {
    if (shouldUseLiveApi) return null;
    const sorted = [...durationFilteredVideos];
    if (currentOrder === 'top-rated') {
      sorted.sort((a, b) => Number(b.rating || b.rate || 0) - Number(a.rating || a.rate || 0));
    } else if (currentOrder === 'most-popular') {
      sorted.sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
    } else if (currentOrder === 'longest') {
      sorted.sort((a, b) => getDurationSeconds(b) - getDurationSeconds(a));
    } else if (currentOrder === 'top-weekly') {
      sorted.sort((a, b) => Number(b.viewGrowth7d || 0) - Number(a.viewGrowth7d || 0));
    } else if (currentOrder === 'top-monthly') {
      sorted.sort((a, b) => Number(b.discoveryScore || 0) - Number(a.discoveryScore || 0));
    } else {
      sorted.sort((a, b) =>
        (Number(b.discoveryScore) || 0) - (Number(a.discoveryScore) || 0) ||
        Date.parse(b.uploadDate || 0) - Date.parse(a.uploadDate || 0)
      );
    }
    return {
      videos: sorted.slice(0, perPage),
      totalPages: Math.max(1, Math.ceil(sorted.length / perPage)),
      totalCount: sorted.length,
    };
  }, [currentOrder, durationFilteredVideos, perPage, shouldUseLiveApi]);

  const visibleVideos = catalogPage?.videos || durationFilteredVideos;
  const visibleTotalPages = catalogPage?.totalPages || totalPages;
  const visibleTotalCount = catalogPage?.totalCount ?? (durationFilter !== 'all' ? durationFilteredVideos.length : totalCount);

  const getPageTitle = () => {
    if (pageTitle) return pageTitle;
    if (isCat) return <span style={{ textTransform: 'capitalize' }}>Category: {query}</span>;
    if (isTag) return <span style={{ textTransform: 'capitalize' }}>Tag: {query}</span>;
    if (query === 'all') return 'All Videos';
    return `"${query}"`;
  };
  const Heading = headingLevel === 'h2' ? 'h2' : 'h1';

  return (
    <div className="search-page">
      <Suspense fallback={null}>
        <SearchParamsBridge onParamsChange={setSearchString} />
      </Suspense>
      {trendTags.length > 0 && <TagsBar tags={trendTags} />}
      <div className="page-wrapper search-content">
        <div className="section-header">
          <div className="section-title-group">
            <Heading className="section-title">{getPageTitle()}</Heading>
            {visibleTotalCount > 0 && (
              <span className="section-count">{visibleTotalCount.toLocaleString()} results</span>
            )}
          </div>
          <SortBar
            value={currentOrder}
            options={SORT_OPTIONS}
            currentDuration={durationFilter}
            currentSearch={searchString}
          />
        </div>

        {introContent}

        {loading ? (
          <div className="video-grid">
            {Array.from({ length: perPage }).map((_, idx) => (
              <SkeletonCard key={`skel-${idx}`} />
            ))}
          </div>
        ) : visibleVideos.length > 0 ? (
          <>
            <div className="video-grid">
              {visibleVideos.map((v, idx) => (
                <React.Fragment key={`${v.id}-${idx}`}>
                  <VideoCard video={v} priority={idx < 4} />
                </React.Fragment>
              ))}
            </div>

            {hasServerCatalog && !shouldUseLiveApi && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0 0.5rem' }}>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setLiveFeedActive(true)}
                >
                  Browse more live videos from feed &rarr;
                </button>
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={visibleTotalPages}
              currentSearch={searchString}
            />
          </>
        ) : (
          <div className="empty-block">
            <p style={{ fontSize: '2rem' }}>🔍</p>
            <p>No videos found for <strong style={{ textTransform: 'capitalize' }}>&quot;{query}&quot;</strong>{durationFilter !== 'all' ? ` in selected duration (${durationFilter})` : ''}</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {hasServerCatalog && !shouldUseLiveApi
                ? 'Explore more results from our extended live stream feed or browse another category.'
                : 'Try adjusting your duration filter or browse by category.'}
            </p>
            {hasServerCatalog && !shouldUseLiveApi && (
              <button
                type="button"
                className="back-btn"
                style={{ marginTop: '0.75rem' }}
                onClick={() => setLiveFeedActive(true)}
              >
                Load live videos for {query} &rarr;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
