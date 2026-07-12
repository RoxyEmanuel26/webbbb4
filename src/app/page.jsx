export const runtime = 'edge';
import React from 'react';
import { epornerServerApi } from '@/lib/eporner';
import VideoCard from '@/components/VideoCard';
import Pagination from '@/components/Pagination';
import TagsBar from '@/components/TagsBar';
import SortBar from '@/components/SortBar';
import AdBanner from '@/components/AdBanner';
import AdNative from '@/components/AdNative';
import '../pages/Pages.css';

const SORT_OPTIONS = [
  { value: 'latest',       label: '🕐 Latest' },
  { value: 'most-popular', label: '🔥 Most Viewed' },
  { value: 'top-weekly',   label: '📈 Top This Week' },
  { value: 'top-monthly',  label: '📅 Top This Month' },
];

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const rawOrderParam = params?.order;
  const isValidOrder = SORT_OPTIONS.some(o => o.value === rawOrderParam);
  const orderParam = isValidOrder ? rawOrderParam : null;
  const sortLabel = SORT_OPTIONS.find(o => o.value === orderParam)?.label || '📈 Top This Week';
  const currentYear = new Date().getFullYear();

  const seoTitle = orderParam
    ? `Free HD ${sortLabel.replace(/^[^\w]+/, '').trim()} Porn Videos ${currentYear} — NICEVX`
    : `NICEVX — Free HD Porn Videos ${currentYear} | 4M+ Videos`;

  const seoDesc = orderParam
    ? `Watch the ${sortLabel.replace(/^[^\w]+/, '').trim().toLowerCase()} free HD porn videos on NICEVX. Stream thousands of top-quality adult videos updated daily in ${currentYear}.`
    : `Watch free HD porn videos on NICEVX. Over 4 million videos updated daily in ${currentYear} — amateur, teen, MILF, Asian, hardcore and more in stunning 1080p quality.`;

  const seoCanonical = orderParam
    ? `https://nicevx.com/?order=${orderParam}`
    : 'https://nicevx.com/';

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: seoCanonical
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: seoCanonical,
      type: 'website',
    },
    twitter: {
      title: seoTitle,
      description: seoDesc,
    }
  };
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const rawOrderParam = params?.order;
  const isValidOrder = SORT_OPTIONS.some(o => o.value === rawOrderParam);
  const orderParam = isValidOrder ? rawOrderParam : null;
  const rawPage = parseInt(params?.page);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const sortLabel = SORT_OPTIONS.find(o => o.value === orderParam)?.label || '📈 Top This Week';

  // Fetch trending tags
  let trendTags = [];
  try {
    const resTags = await epornerServerApi.searchVideos({ order: 'top-weekly', per_page: 50, gay: 0, lq: 1 });
    if (resTags?.videos) {
      const freq = {};
      const forbiddenRegex = /\b(gay|shemale|tranny|ladyboy|ts|transsexual|transgender|boy|men|cock suck|cock sucking)\b/i;
      resTags.videos.forEach(v =>
        v.keywords.split(',').forEach(k => {
          const kw = k.trim().toLowerCase();
          if (kw.length > 2 && !forbiddenRegex.test(kw)) {
            freq[kw] = (freq[kw] || 0) + 1;
          }
        })
      );
      trendTags = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([k]) => k);
    }
  } catch (_) {}

  // Fetch videos
  let videos = [];
  let totalPages = 1;
  let totalCount = 0;
  
  try {
    const fetchParams = {
      order: orderParam || 'top-weekly',
      page:  page,
      per_page: 36,
      gay: 0,
      lq: 1,
      thumbsize: 'big',
    };
    
    const res = await epornerServerApi.searchVideos(fetchParams);
    videos = res?.videos || [];
    totalPages = res?.total_pages || 1;
    totalCount = res?.total_count || 0;
  } catch (_) {}

  return (
    <div className="home-page">
      {trendTags.length > 0 && (
        <TagsBar tags={trendTags} />
      )}

      <div className="page-wrapper content-area">
        {/* ── Banner 728x90 Desktop / 320x50 Mobile ── */}
        <div className="ad-row ad-row--top">
          {/* Desktop: 728x90 */}
          <div className="ad-desktop-only">
            <AdBanner adKey="6cb50045b61eddee00e504ba14847190" width={728} height={90} />
          </div>
          {/* Mobile: 320x50 */}
          <div className="ad-mobile-only">
            <AdBanner adKey="05f054fa88f5e6d6b183797a8f9213f9" width={320} height={50} />
          </div>
        </div>

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

        {videos.length > 0 ? (
          <>
            <div className="video-grid">
              {videos.map((v, idx) => (
                <React.Fragment key={`${v.id}-${idx}`}>
                  <VideoCard video={v} priority={idx < 4} />
                  {/* ── Banner 300x250 setelah video ke-12 (baris ke-3) ── */}
                  {idx === 11 && (
                    <div className="ad-ingrid-wrap">
                      <AdBanner adKey="a2d1d9869741533064aff0b41e9dbb6f" width={300} height={250} className="ad-ingrid" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* ── Native Banner (4:1 layout) di atas pagination ── */}
            <AdNative widgetId="fb2c6ae06d2ab4be82435961f6263160" />
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
