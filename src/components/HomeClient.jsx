'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoCard from '@/components/VideoCard';
import Pagination from '@/components/Pagination';
import TagsBar from '@/components/TagsBar';
import SortBar from '@/components/SortBar';
import AdBanner from '@/components/AdBanner';
import AdNative from '@/components/AdNative';

const API_BASE = 'https://www.eporner.com/api/v2/video';

const SORT_OPTIONS = [
  { value: 'latest',       label: '🕐 Latest' },
  { value: 'most-popular', label: '🔥 Most Viewed' },
  { value: 'top-weekly',   label: '📈 Top This Week' },
  { value: 'top-monthly',  label: '📅 Top This Month' },
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

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawOrder = searchParams.get('order');
  const isValidOrder = SORT_OPTIONS.some(o => o.value === rawOrder);
  const orderParam = isValidOrder ? rawOrder : null;
  const rawPage = parseInt(searchParams.get('page') || '1');
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const sortLabel = SORT_OPTIONS.find(o => o.value === orderParam)?.label || '📈 Top This Week';

  const [videos, setVideos] = useState([]);
  const [trendTags, setTrendTags] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch main videos
      const url = new URL(`${API_BASE}/search/`);
      url.searchParams.append('query', 'all');
      url.searchParams.append('order', orderParam || 'top-weekly');
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', 36);
      url.searchParams.append('thumbsize', 'big');
      url.searchParams.append('gay', 0);
      url.searchParams.append('lq', 1);
      url.searchParams.append('format', 'json');

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      if (data && data.videos) {
        setVideos(
          data.videos
            .map(sanitizeVideo)
            .filter(v => !FORBIDDEN_REGEX.test(v.keywords || '') && !FORBIDDEN_REGEX.test(v.title || ''))
        );
      }
      setTotalPages(data?.total_pages || 1);
      setTotalCount(data?.total_count || 0);

      // Fetch trend tags (separate request)
      if (page === 1) {
        try {
          const tagUrl = new URL(`${API_BASE}/search/`);
          tagUrl.searchParams.append('query', 'all');
          tagUrl.searchParams.append('order', 'top-weekly');
          tagUrl.searchParams.append('per_page', 50);
          tagUrl.searchParams.append('gay', 0);
          tagUrl.searchParams.append('lq', 1);
          tagUrl.searchParams.append('format', 'json');
          const tagRes = await fetch(tagUrl.toString());
          const tagData = await tagRes.json();
          if (tagData?.videos) {
            const freq = {};
            tagData.videos.forEach(v =>
              String(v.keywords || '').split(',').forEach(k => {
                const kw = k.trim().toLowerCase();
                if (kw.length > 2 && kw.length < 25 && kw.split(/\s+/).length <= 2 && !FORBIDDEN_REGEX.test(kw)) {
                  freq[kw] = (freq[kw] || 0) + 1;
                }
              })
            );
            setTrendTags(
              Object.entries(freq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20)
                .map(([k]) => k)
            );
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error('HomeClient fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderParam, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="home-page">
      {trendTags.length > 0 && <TagsBar tags={trendTags} />}

      <div className="page-wrapper content-area">

        <div className="section-header">
          <div className="section-title-group">
            <h1 className="section-title">
              {orderParam ? sortLabel : '📈 Top Videos'}
            </h1>
            {totalCount > 0 && (
              <span className="section-count">{totalCount.toLocaleString()} videos</span>
            )}
          </div>
          <SortBar value={orderParam} options={SORT_OPTIONS} />
        </div>

        {loading ? (
          <div className="loading-block">
            <div className="loading-spinner" />
            <p>Loading videos...</p>
          </div>
        ) : error ? (
          <div className="empty-block">
            <p>Could not load videos. Please try again.</p>
          </div>
        ) : videos.length > 0 ? (
          <>
            <div className="video-grid">
              {videos.map((v, idx) => (
                <React.Fragment key={`${v.id}-${idx}`}>
                  <VideoCard video={v} priority={idx < 4} />
                  {/* ── Native Banner di tengah video (setelah video ke-12) ── */}
                  {idx === 11 && (
                    <div className="native-ad-wrapper" style={{ gridColumn: '1 / -1', margin: '20px 0' }}>
                      <AdNative widgetId="fb2c6ae06d2ab4be82435961f6263160" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* ── Banner 300x250 di atas pagination ── */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
              <AdBanner adKey="a2d1d9869741533064aff0b41e9dbb6f" width={300} height={250} />
            </div>
            <Pagination currentPage={page} totalPages={totalPages} />
          </>
        ) : (
          <div className="empty-block">
            <p>No videos found.</p>
          </div>
        )}
      </div>

      {/* ── Sticky Bottom Banner Mobile 320x50 ── */}
      <div className="ad-sticky-bottom ad-mobile-only">
        <AdBanner adKey="05f054fa88f5e6d6b183797a8f9213f9" width={320} height={50} />
      </div>
    </div>
  );
}
