"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoCard from '@/components/VideoCard';

import { Eye, Star, Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight, X, AlertTriangle, Download } from 'lucide-react';
import '../../../pages/Pages.css';

const API_BASE = 'https://www.eporner.com/api/v2/video';
const FORBIDDEN_REGEX = /\b(gay|shemale|tranny|ladyboy|ts|transsexual|transgender|boy|men|cock suck|cock sucking)\b/i;

function fixEncoding(str) {
  if (!str) return str;
  let fixed = String(str);
  try { if (/[\x80-\xFF]/.test(fixed)) fixed = decodeURIComponent(escape(fixed)); } catch (_) {}
  return fixed.replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#039;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}

const formatViews = (n) => {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M views';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K views';
  return n + ' views';
};

// ─── Smart Related Videos Engine ─────────────────────────────────────────────

// Signal 1 helper: parse & normalize keywords into a Set for O(1) lookup
function computeKeywordSet(video) {
  const raw = String(video.keywords || video.title || '');
  return new Set(
    raw.split(/[,\s]+/)
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 2 && k.length < 30 && !FORBIDDEN_REGEX.test(k))
  );
}

// Multi-signal scorer: returns integer relevance score for one candidate video
function scoreCandidate(candidate, sourceKws, sourceDuration, sourceRate) {
  let score = 0;

  // Signal 1 — Keyword Overlap (max 50 pts, +10 per shared keyword)
  const candKws = computeKeywordSet(candidate);
  let overlap = 0;
  for (const kw of candKws) { if (sourceKws.has(kw)) overlap++; }
  score += Math.min(overlap * 10, 50);

  // Signal 2 — Duration Proximity: closer = more relevant (max 15 pts)
  const durDiff = Math.abs((parseInt(candidate.length_sec) || 0) - sourceDuration);
  if      (durDiff < 60)  score += 15;
  else if (durDiff < 180) score += 10;
  else if (durDiff < 300) score += 5;

  // Signal 3 — Quality: high-rated videos are preferred (max 10 pts)
  const candRate = parseFloat(candidate.rate) || 0;
  if      (candRate >= 4.5) score += 10;
  else if (candRate >= 4.0) score += 7;
  else if (candRate >= 3.5) score += 4;
  else if (candRate >= 3.0) score += 2;

  // Signal 4 — Popularity tier (max 5 pts)
  const candViews = parseInt(candidate.views) || 0;
  if      (candViews >= 1_000_000) score += 5;
  else if (candViews >= 100_000)   score += 3;
  else if (candViews >= 10_000)    score += 1;

  // Signal 5 — Better-than-source quality bonus (max 5 pts)
  if (candRate > (parseFloat(sourceRate) || 0)) score += 5;

  return score;
}

// Multi-pass fetch: 3 parallel/sequential queries → pool → score → rank → return top 16
async function fetchRelatedVideos(video, sourceKws) {
  const kwArr = Array.from(sourceKws);
  if (kwArr.length === 0) kwArr.push('all');

  const sourceDuration = parseInt(video.length_sec) || 0;
  const sourceRate     = parseFloat(video.rate) || 0;

  const buildUrl = (query, order, n = 20) => {
    const u = new URL(`${API_BASE}/search/`);
    u.searchParams.set('query', query);
    u.searchParams.set('per_page', n);
    u.searchParams.set('order', order);
    u.searchParams.set('gay', 0);
    u.searchParams.set('lq', 1);
    u.searchParams.set('thumbsize', 'medium');
    u.searchParams.set('format', 'json');
    return u.toString();
  };

  // Pass 1 & 2 run in parallel
  const p1q = kwArr.slice(0, 2).join(' ');
  const p2q = kwArr.slice(2, 5).join(' ') || kwArr[0];
  const [r1, r2] = await Promise.all([
    fetch(buildUrl(p1q, 'top-rated', 20)).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(buildUrl(p2q, 'most-popular', 20)).then(r => r.ok ? r.json() : null).catch(() => null),
  ]);

  const seen = new Set([video.id]);
  const pool = [];

  const absorb = (videos, src) => {
    for (const v of (videos || [])) {
      if (seen.has(v.id)) continue;
      if (FORBIDDEN_REGEX.test(v.title || '') || FORBIDDEN_REGEX.test(v.keywords || '')) continue;
      seen.add(v.id);
      pool.push({ ...v, title: fixEncoding(v.title), keywords: fixEncoding(v.keywords), _source: src });
    }
  };

  absorb(r1?.videos, 'primary');
  absorb(r2?.videos, 'secondary');

  // Pass 3 — category/keyword fallback if pool is thin
  if (pool.length < 15) {
    const r3 = await fetch(buildUrl(kwArr[0], 'latest', 20)).then(r => r.ok ? r.json() : null).catch(() => null);
    absorb(r3?.videos, 'fallback');
  }

  // Score every candidate
  const scored = pool.map(v => ({
    ...v,
    _score: scoreCandidate(v, sourceKws, sourceDuration, sourceRate),
  }));

  // Sort by score DESC, enforce diversity: max 8 videos per source
  scored.sort((a, b) => b._score - a._score);
  const srcCount = {};
  const result = [];
  for (const v of scored) {
    srcCount[v._source] = (srcCount[v._source] || 0) + 1;
    if (srcCount[v._source] > 8) continue;
    result.push(v);
    if (result.length >= 16) break;
  }
  return result;
}

const VideoPlayerClient = ({ id, initialTitle, seoDescription }) => {
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const fetchVideo = useCallback(async () => {
    if (!id) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const res = await fetch(`${API_BASE}/id/?id=${id}&thumbsize=big&format=json`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (!data || !data.id) throw new Error('Video not found');

      if (data.title) data.title = fixEncoding(data.title);
      if (data.keywords) data.keywords = fixEncoding(data.keywords);

      setVideo(data);
      const kws = String(data.keywords || '')
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 2 && k.length < 25 && k.split(/\s+/).length <= 2 && !FORBIDDEN_REGEX.test(k));
      setKeywords(kws);

      // ── Smart Related Videos: fire-and-forget so main video loads instantly ──
      setRelatedLoading(true);
      const sourceKws = computeKeywordSet(data);
      fetchRelatedVideos(data, sourceKws)
        .then(results => { setRelated(results); })
        .catch(() => {})
        .finally(() => setRelatedLoading(false));
    } catch (err) {
      setPageError(err.message);
    } finally {
      setPageLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchVideo(); }, [fetchVideo]);
  const router = useRouter();
  const [iframeStatus, setIframeStatus] = useState('loading');
  const [selectedThumbIndex, setSelectedThumbIndex] = useState(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  // Overlay untuk memicu Adsterra Popunder pada klik pertama
  const [overlayActive, setOverlayActive] = useState(true);

  const handleOverlayClick = () => {
    setOverlayActive(false);
    // Dispatch click event manual ke document agar script Adsterra mendeteksinya
    document.dispatchEvent(new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    }));
  };

  const thumbScrollRef = useRef(null);
  const [showLeftThumb, setShowLeftThumb] = useState(false);
  const [showRightThumb, setShowRightThumb] = useState(true);

  const checkThumbScroll = () => {
    if (thumbScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = thumbScrollRef.current;
      setShowLeftThumb(scrollLeft > 0);
      setShowRightThumb(Math.ceil(scrollLeft) < scrollWidth - clientWidth);
    }
  };

  const lightboxStripRef = useRef(null);
  const [showLeftStrip, setShowLeftStrip] = useState(false);
  const [showRightStrip, setShowRightStrip] = useState(true);

  const checkStripScroll = () => {
    if (lightboxStripRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = lightboxStripRef.current;
      setShowLeftStrip(scrollLeft > 0);
      setShowRightStrip(Math.ceil(scrollLeft) < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    checkThumbScroll();
    window.addEventListener('resize', checkThumbScroll);
    window.addEventListener('resize', checkStripScroll);
    return () => {
      window.removeEventListener('resize', checkThumbScroll);
      window.removeEventListener('resize', checkStripScroll);
    };
  }, [video]);

  // Iframe Timeout Fallback
  useEffect(() => {
    setIframeStatus('loading');
    const timer = setTimeout(() => {
      setIframeStatus(prev => prev === 'loading' ? 'error' : prev);
    }, 12000); 
    return () => clearTimeout(timer);
  }, [video?.id]);

  useEffect(() => {
    if (selectedThumbIndex !== null) {
      const t = setTimeout(checkStripScroll, 50);
      return () => clearTimeout(t);
    }
  }, [selectedThumbIndex]);

  const handleThumbScroll = (direction) => {
    if (thumbScrollRef.current) {
      const scrollAmount = 300;
      thumbScrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const handleStripScroll = (direction) => {
    if (lightboxStripRef.current) {
      const scrollAmount = 200;
      lightboxStripRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };


  if (pageLoading) {
    return (
      <div className="page-wrapper player-page">
        <button className="back-btn" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="player-layout">
          <div className="player-main">
            <div className="player-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="loading-spinner" />
            </div>
            
            <div className="video-info-block" itemProp="description">
              <h1 className="video-info-title" itemProp="name">{initialTitle || 'Loading Video...'}</h1>
              
              <div className="video-info-meta" style={{ display: 'flex', gap: '10px', opacity: 0.5, borderBottom: 'none' }}>
                 <div style={{ width: '80px', height: '20px', background: 'var(--color-border)', borderRadius: '4px' }}></div>
                 <div style={{ width: '80px', height: '20px', background: 'var(--color-border)', borderRadius: '4px' }}></div>
              </div>

              {seoDescription && (
                <p className="video-info-desc" style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--color-text-secondary)', 
                  lineHeight: '1.6', 
                  marginBottom: 'var(--space-4)', 
                  marginTop: 'var(--space-4)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {seoDescription}
                </p>
              )}
            </div>
          </div>

          <aside className="player-sidebar">
            <h2 className="sidebar-heading">Related Videos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ height: '100px', background: 'var(--color-border)', borderRadius: '8px', opacity: 0.5 }}></div>
              <div style={{ height: '100px', background: 'var(--color-border)', borderRadius: '8px', opacity: 0.5 }}></div>
              <div style={{ height: '100px', background: 'var(--color-border)', borderRadius: '8px', opacity: 0.5 }}></div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (pageError || (video === null && !pageLoading)) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
      
      // Remove any existing canonical to completely decouple it from indexing
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.remove();
    }
  }, [pageError, video, pageLoading]);

  if (pageError || !video) {
    return (
      <div className="empty-block">
        <p style={{ fontSize: '2rem' }}>😥</p>
        <p>Could not load this video. Please go back and try another.</p>
      </div>
    );
  }

  let clientVideoSchema = null;
  if (typeof window !== 'undefined' && video) {
    let isoDuration = undefined;
    if (video.length_sec) {
      isoDuration = `PT${Math.floor(video.length_sec / 60)}M${video.length_sec % 60}S`;
    }
    let isoDate = '2024-01-01T00:00:00Z';
    if (video.added) {
      isoDate = video.added.replace(' ', 'T') + 'Z';
    }
    clientVideoSchema = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: fixEncoding(video.title) || initialTitle,
      description: seoDescription || fixEncoding(video.title),
      thumbnailUrl: video.default_thumb?.src || `https://static-eu-cdn.eporner.com/thumbs/static4/big/${id}/5_big.jpg`,
      embedUrl: `https://www.eporner.com/embed/${id}/`,
      contentUrl: window.location.href,
      url: window.location.href,
      uploadDate: isoDate,
      ...(isoDuration && { duration: isoDuration }),
      isFamilyFriendly: false,
      ...(keywords && keywords.length > 0 && { keywords: keywords.join(', ') }),
      publisher: {
        '@type': 'Organization',
        name: 'NICEVX',
        url: 'https://www.nicevx.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.nicevx.com/favicon.png',
          width: 512,
          height: 512,
        },
      },
    };
  }

  return (
    <>
      {clientVideoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clientVideoSchema) }}
        />
      )}
    <div className="page-wrapper player-page">

      <button
        className="back-btn"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="player-layout">
        <div className="player-main">
          <div className="player-box">
            {(() => {
              let safeEmbedUrl = video.embed;
              if (video.embed && video.embed.includes('<iframe')) {
                const srcMatch = video.embed.match(/src=["']([^"']+)["']/);
                safeEmbedUrl = srcMatch ? srcMatch[1] : '';
              }
              
              if (!safeEmbedUrl) return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-dim)' }}>
                  Video URL tidak valid.
                </div>
              );

              return (
                <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                  {iframeStatus === 'loading' && (
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-text-dim)' }}>
                       <div className="loading-spinner"></div>
                       <p style={{ fontSize: '0.9rem' }}>Memuat pemutar video...</p>
                    </div>
                  )}
                  {iframeStatus === 'error' && (
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-text-dim)', textAlign: 'center', padding: '1rem' }}>
                       <AlertTriangle size={32} style={{ color: 'var(--color-accent)' }} />
                       <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>Pemutar video memakan waktu terlalu lama untuk dimuat.<br/>Video mungkin telah dihapus atau diblokir di wilayah Anda.</p>
                       <button 
                         onClick={() => window.open(safeEmbedUrl, '_blank')} 
                         style={{ marginTop: '0.5rem', background: 'var(--color-accent)', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                       >
                         Buka di Tab Baru
                       </button>
                    </div>
                  )}
                  {overlayActive && (
                    <div 
                      onClick={handleOverlayClick}
                      style={{
                        position: 'absolute',
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%',
                        zIndex: 10, 
                        cursor: 'pointer'
                      }} 
                    />
                  )}
                  <iframe 
                    src={safeEmbedUrl} 
                    loading="lazy"
                    frameBorder="0" 
                    scrolling="no" 
                    allowFullScreen
                    title={video.title || "Video Player"}
                    style={{ width: '100%', height: '100%', opacity: iframeStatus === 'loaded' ? 1 : 0.01, transition: 'opacity 0.3s' }}
                    onLoad={() => setIframeStatus('loaded')}
                    onError={() => setIframeStatus('error')}
                  />

                </div>
              );
            })()}
          </div>

          <div className="video-info-block" itemProp="description">
            {/* Title ditampilkan dari API data - SSR title dipassing sebagai H1 fallback di skeleton */}
          <h1 className="video-info-title" itemProp="name" aria-label={video.title}>{video.title}</h1>

            <div className="video-info-meta" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="meta-chip">
                  <Eye size={14} />
                  {formatViews(video.views)}
                </span>
                <span className="meta-chip rating">
                  <Star size={14} />
                  {parseFloat(video.rate || 0).toFixed(1)} / 5.0
                </span>
                <span className="meta-chip">
                  <Clock size={14} />
                  {video.length_min || `${video.length_sec}s`}
                </span>
                {video.added && (
                  <span className="meta-chip">
                    <Calendar size={14} />
                    {String(video.added).split(' ')[0]}
                  </span>
                )}
              </div>
              <a 
                href="https://glamournakedemployee.com/i55dh5pc?key=dc0dba53bc73a8f967e369df108afe96" 
                target="_blank" 
                rel="noopener"
                referrerPolicy="no-referrer-when-downgrade"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#22c55e',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'opacity 0.2s',
                  boxShadow: '0 2px 4px rgba(34,197,94,0.3)',
                  marginLeft: 'auto'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                <Download size={16} />
                Download
              </a>
            </div>

            {seoDescription && (
              <div style={{ marginBottom: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <p className="video-info-desc" style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--color-text-secondary)', 
                  lineHeight: '1.6', 
                  marginBottom: '8px',
                  display: '-webkit-box',
                  WebkitLineClamp: isDescExpanded ? 'unset' : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {seoDescription}
                </p>
                <button 
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--color-text-primary)', 
                    fontWeight: '700', 
                    cursor: 'pointer', 
                    padding: '0', 
                    fontSize: '0.85rem'
                  }}
                  aria-expanded={isDescExpanded}
                >
                  {isDescExpanded ? 'Show less' : 'Show more...'}
                </button>
              </div>
            )}

            {keywords.length > 0 && (
              <div className="keyword-tags">
                {keywords.slice(0, 20).map((kw, i) => (
                  <Link
                    key={i}
                    href={`/tag/${kw.toLowerCase().replace(/\s+/g, '-')}`}
                    className="keyword-tag"
                  >
                    #{kw}
                  </Link>
                ))}
              </div>
            )}



            {video.thumbs && video.thumbs.length > 1 && (
              <div className="thumb-gallery-wrapper">
                {showLeftThumb && (
                  <button className="thumb-scroll-btn left" onClick={() => handleThumbScroll('left')} aria-label="Scroll left">
                    <ChevronLeft size={18} />
                  </button>
                )}
                <div className="thumb-gallery" aria-label="Video preview thumbnails" ref={thumbScrollRef} onScroll={checkThumbScroll}>
                  {video.thumbs.map((t, i) => (
                    <img 
                      key={i} 
                      src={t.src} 
                      alt={`Preview ${i + 1}`} 
                      onClick={() => setSelectedThumbIndex(i)}
                      role="button"
                      tabIndex={0}
                    />
                  ))}
                </div>
                {showRightThumb && (
                  <button className="thumb-scroll-btn right" onClick={() => handleThumbScroll('right')} aria-label="Scroll right">
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="player-sidebar">

          <h2 className="sidebar-heading">
            Related Videos
            {relatedLoading && (
              <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--color-text-dim)', marginLeft: '8px' }}>
                Finding best matches…
              </span>
            )}
          </h2>

          {/* Loading skeleton */}
          {relatedLoading && related.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ height: '90px', background: 'var(--color-border)', borderRadius: '8px', opacity: 0.4, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          )}

          {/* Related videos list with relevance badge */}
          {!relatedLoading || related.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {related.map(v => {
                const badge = v._score >= 40
                  ? { label: '🔥 Top Match', color: '#ef4444' }
                  : v._score >= 20
                  ? { label: '✨ Related', color: 'var(--color-accent)' }
                  : null;
                return (
                  <div key={v.id} style={{ position: 'relative' }}>
                    {badge && (
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        zIndex: 2,
                        background: badge.color,
                        color: '#fff',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        letterSpacing: '0.02em',
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      }}>
                        {badge.label}
                      </span>
                    )}
                    <VideoCard video={v} compact={true} />
                  </div>
                );
              })}
            </div>
          ) : null}

          {!relatedLoading && related.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No related videos found.
            </p>
          )}
        </aside>
      </div>



      {selectedThumbIndex !== null && (
        <div 
          className="thumb-lightbox-overlay" 
          onClick={() => setSelectedThumbIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="thumb-lightbox-main">

            {selectedThumbIndex > 0 && (
              <button 
                className="thumb-lightbox-nav left"
                onClick={(e) => { e.stopPropagation(); setSelectedThumbIndex(selectedThumbIndex - 1); }}
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <div className="thumb-lightbox-img-wrapper" onClick={e => e.stopPropagation()}>
              <button 
                className="thumb-lightbox-close"
                onClick={() => setSelectedThumbIndex(null)}
                aria-label="Close image"
              >
                <X size={20} />
              </button>
              <img src={video.thumbs?.[selectedThumbIndex]?.src || ''} alt="Enlarged preview" />
            </div>

            {selectedThumbIndex < (video.thumbs?.length || 0) - 1 && (
              <button 
                className="thumb-lightbox-nav right"
                onClick={(e) => { e.stopPropagation(); setSelectedThumbIndex(selectedThumbIndex + 1); }}
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            )}
          </div>

          <div className="thumb-lightbox-strip-wrapper" onClick={e => e.stopPropagation()}>
            {showLeftStrip && (
              <button 
                className="thumb-scroll-btn left" 
                onClick={() => handleStripScroll('left')} 
                aria-label="Scroll left"
                style={{ zIndex: 100 }}
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <div className="thumb-lightbox-strip" ref={lightboxStripRef} onScroll={checkStripScroll}>
              {(video.thumbs || []).map((t, i) => (
                <img 
                  key={i} 
                  src={t.src} 
                  alt={`Miniature ${i + 1}`}
                  className={i === selectedThumbIndex ? 'active' : ''}
                  onClick={() => setSelectedThumbIndex(i)}
                />
              ))}
            </div>

            {showRightStrip && (
              <button 
                className="thumb-scroll-btn right" 
                onClick={() => handleStripScroll('right')} 
                aria-label="Scroll right"
                style={{ zIndex: 100 }}
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
    </>
  );
};

export default VideoPlayerClient;
