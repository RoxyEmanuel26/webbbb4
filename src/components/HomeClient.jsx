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
  const sortLabel = SORT_OPTIONS.find(o => o.value === orderParam)?.label || '📈 Top This Week';
  const isDashboard = !orderParam && page === 1;

  const [videos, setVideos] = useState([]);
  const [latestVideos, setLatestVideos] = useState([]);

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

      // Fetch Latest videos (khusus Dashboard / Halaman 1 murni)
      if (isDashboard) {
        try {
          const latestUrl = new URL(`${API_BASE}/search/`);
          latestUrl.searchParams.append('query', 'all');
          latestUrl.searchParams.append('order', 'latest');
          latestUrl.searchParams.append('page', 1);
          latestUrl.searchParams.append('per_page', 24);
          latestUrl.searchParams.append('thumbsize', 'big');
          latestUrl.searchParams.append('gay', 0);
          latestUrl.searchParams.append('lq', 1);
          latestUrl.searchParams.append('format', 'json');
          
          const latestRes = await fetch(latestUrl.toString());
          const latestData = await latestRes.json();
          if (latestData?.videos) {
            const latestFiltered = latestData.videos
              .map(v => ({ ...v, title: fixEncoding(v.title), keywords: fixEncoding(v.keywords) }))
              .filter(v => !FORBIDDEN_REGEX.test(v.keywords || '') && !FORBIDDEN_REGEX.test(v.title || ''));
            setLatestVideos(latestFiltered);
          }
        } catch (_) {}
      }

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
              {orderParam 
                ? `Free HD Porn Videos & Sex Tube — ${sortLabel}` 
                : isDashboard ? '🔥 Top This Week' : 'Free HD Porn Videos & Sex Tube — Top Videos'}
            </h1>
            {totalCount > 0 && (
              <span className="section-count">{totalCount.toLocaleString()} videos</span>
            )}
          </div>
          <SortBar value={orderParam} options={SORT_OPTIONS} />
        </div>

        {loading ? (
          <div className="video-grid">
            {Array.from({ length: 36 }).map((_, idx) => (
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
                  {videos.slice(0, 12).map((v, idx) => (
                    <React.Fragment key={`${v.id}-${idx}`}>
                      <VideoCard video={v} priority={idx < 4} />
                    </React.Fragment>
                  ))}
                </div>

                {latestVideos.length > 0 && (
                  <>
                    <div className="section-header" style={{ marginTop: '40px' }}>
                      <div className="section-title-group">
                        <h2 className="section-title">🕐 Latest Videos</h2>
                      </div>
                      <a href="/?order=latest" className="view-all-link" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>View All →</a>
                    </div>
                    <div className="video-grid">
                      {latestVideos.map((v, idx) => (
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
