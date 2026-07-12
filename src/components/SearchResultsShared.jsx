'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ALL_CATEGORIES } from '@/data/allCategories';
import VideoCard from '@/components/VideoCard';
import Pagination from '@/components/Pagination';
import SortBar from '@/components/SortBar';
import AdNative from '@/components/AdNative';
import AdBanner from '@/components/AdBanner';
import '../pages/Pages.css';

const API_BASE = 'https://www.eporner.com/api/v2/video';

const SORT_OPTIONS = [
  { value: 'latest',       label: '🕐 Latest' },
  { value: 'top-rated',    label: '⭐ Top Rated' },
  { value: 'most-popular', label: '🔥 Most Viewed' },
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

import { getSearchMetadata } from '@/utils/seo';

export default function SearchResultsShared({ query: propQuery, isCat, isTag, page: propPage, currentOrder: propOrder, seoTitle: propSeoTitle, seoDesc: propSeoDesc, seoCanonical: propSeoCanonical, seoQuery: propSeoQuery }) {
  const searchParams = useSearchParams();

  const rawQuery = propQuery ?? (searchParams.get('query') || 'all');
  const query = rawQuery;

  const rawPage = propPage ?? parseInt(searchParams.get('page') || '1');
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawOrder = propOrder ?? searchParams.get('order');
  const isValidOrder = SORT_OPTIONS.some(o => o.value === rawOrder);
  const currentOrder = isValidOrder ? rawOrder : 'top-weekly';

  const generatedSeo = getSearchMetadata({ query, isCat, isTag, page, catName: query, tagName: query });
  
  const seoTitle = propSeoTitle ?? generatedSeo.title;
  const seoDesc = propSeoDesc ?? generatedSeo.description;
  const seoCanonical = propSeoCanonical ?? generatedSeo.alternates.canonical;
  const seoQuery = propSeoQuery ?? query;

  const [videos, setVideos] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE}/search/`);
      url.searchParams.append('query', query === 'all' ? 'all' : query);
      url.searchParams.append('order', currentOrder);
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
    } catch (err) {
      console.error('SearchResultsShared fetch error:', err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [query, currentOrder, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://nicevx.com/" },
      ...(isCat ? [
        { "@type": "ListItem", "position": 2, "name": "Categories", "item": "https://nicevx.com/cats/" },
        { "@type": "ListItem", "position": 3, "name": seoQuery, "item": seoCanonical }
      ] : [
        { "@type": "ListItem", "position": 2, "name": seoQuery, "item": seoCanonical }
      ])
    ]
  };

  const getPageTitle = () => {
    if (isCat) return <span style={{textTransform: 'capitalize'}}>Category: {query}</span>;
    if (isTag) return <span style={{textTransform: 'capitalize'}}>Tag: {query}</span>;
    if (query === 'all') return 'All Videos';
    return `"${query}"`;
  };

  return (
    <div className="search-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([
          { "@context": "https://schema.org", "@type": "CollectionPage", "name": seoTitle, "description": seoDesc, "url": seoCanonical },
          breadcrumbsSchema
        ]).replace(/</g, '\\u003c') }}
      />
      <div className="page-wrapper search-content">
        <div className="section-header">
          <div className="section-title-group">
            <h1 className="section-title">{getPageTitle()}</h1>
            {totalCount > 0 && (
              <span className="section-count">{totalCount.toLocaleString()} results</span>
            )}
          </div>
          <SortBar value={currentOrder} options={SORT_OPTIONS} />
        </div>

        {loading ? (
          <div className="loading-block">
            <div className="loading-spinner" />
            <p>Loading videos...</p>
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
            <p style={{ fontSize: '2rem' }}>🔍</p>
            <p>No videos found for <strong style={{textTransform: 'capitalize'}}>"{query}"</strong></p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Try different keywords or browse by category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
