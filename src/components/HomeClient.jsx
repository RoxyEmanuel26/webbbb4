'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoCard from '@/components/VideoCard';
import Pagination from '@/components/Pagination';
import SkeletonCard from '@/components/SkeletonCard';
import TagsBar from '@/components/TagsBar';
import SortBar from '@/components/SortBar';


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
  const sortLabel = SORT_OPTIONS.find(o => o.value === orderParam)?.label || '🕐 Latest';
  const isDashboard = !orderParam && page === 1;
  const activeOrder = orderParam || 'latest';
  const perPageCount = activeOrder === 'latest' ? 24 : 36;

  const [videos, setVideos] = useState([]);
  const [topWeeklyVideos, setTopWeeklyVideos] = useState([]);

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
      url.searchParams.append('order', activeOrder);
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', perPageCount);
      url.searchParams.append('thumbsize', 'big');
      url.searchParams.append('gay', 0);
      url.searchParams.append('lq', 1);
      url.searchParams.append('format', 'json');

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      if (data?.videos) {
        const filtered = data.videos
          .map(v => ({ ...v, title: fixEncoding(v.title), keywords: fixEncoding(v.keywords) }))
          .filter(v => !FORBIDDEN_REGEX.test(v.keywords || '') && !FORBIDDEN_REGEX.test(v.title || ''));
        setVideos(filtered);
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.total_count || 0);
      } else {
        setVideos([]);
      }

      // Fetch trend tags & Top Weekly videos (combined request)
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

            // Re-use for Top Weekly videos section if it's the dashboard
            if (isDashboard) {
              const topFiltered = tagData.videos
                .map(v => ({ ...v, title: fixEncoding(v.title), keywords: fixEncoding(v.keywords) }))
                .filter(v => !FORBIDDEN_REGEX.test(v.keywords || '') && !FORBIDDEN_REGEX.test(v.title || ''));
              setTopWeeklyVideos(topFiltered.slice(0, 12));
            }
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error('HomeClient fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeOrder, perPageCount, isDashboard, page]);

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
              {orderParam 
                ? `Free HD Porn Videos & Sex Tube — ${sortLabel}` 
                : isDashboard ? '🕐 Latest Videos' : 'Free HD Porn Videos & Sex Tube — Latest Videos'}
            </h1>
            {totalCount > 0 && (
              <span className="section-count">{totalCount.toLocaleString()} videos</span>
            )}
          </div>
          <SortBar value={orderParam} options={SORT_OPTIONS} />
        </div>

        {loading ? (
          <div className="video-grid">
            {Array.from({ length: isDashboard ? 36 : perPageCount }).map((_, idx) => (
              <SkeletonCard key={`skel-${idx}`} />
            ))}
          </div>
        ) : error ? (
          <div className="empty-block">
            <p>Could not load videos. Please try again.</p>
          </div>
        ) : videos.length > 0 ? (
          <>
            {isDashboard ? (
              <>
                <div className="video-grid">
                  {/* Tampilkan 24 video Terbaru di atas */}
                  {videos.slice(0, 24).map((v, idx) => (
                    <React.Fragment key={`${v.id}-${idx}`}>
                      <VideoCard video={v} priority={idx < 4} />
                    </React.Fragment>
                  ))}
                </div>

                {topWeeklyVideos.length > 0 && (
                  <>
                    <div className="section-header" style={{ marginTop: '40px' }}>
                      <div className="section-title-group">
                        <h2 className="section-title">🔥 Top This Week</h2>
                      </div>
                      <a href="/?order=top-weekly" className="view-all-link" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>View All →</a>
                    </div>
                    <div className="video-grid">
                      {/* Tampilkan 12 video Populer di bawah */}
                      {topWeeklyVideos.map((v, idx) => (
                        <React.Fragment key={`${v.id}-${idx}`}>
                          <VideoCard video={v} priority={false} />
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="video-grid">
                {videos.map((v, idx) => (
                  <React.Fragment key={`${v.id}-${idx}`}>
                    <VideoCard video={v} priority={idx < 4} />
                  </React.Fragment>
                ))}
              </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} />
          </>
        ) : (
          <div className="empty-block">
            <p>No videos found.</p>
          </div>
        )}
      </div>


    </div>
  );
}
