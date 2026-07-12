"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoCard from '@/components/VideoCard';
import AdBanner from '@/components/AdBanner';
import AdNative from '@/components/AdNative';
import { Eye, Star, Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';
import '../../../../pages/Pages.css';

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

const VideoPlayerClient = ({ id }) => {
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
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
      const v = { ...data, title: fixEncoding(data.title), keywords: fixEncoding(data.keywords) };
      setVideo(v);
      const kws = String(v.keywords || '').split(',').map(k => k.trim()).filter(k => k.length > 2 && !FORBIDDEN_REGEX.test(k));
      setKeywords(kws);

      // Fetch related
      const relUrl = new URL(`${API_BASE}/search/`);
      relUrl.searchParams.append('query', kws.slice(0, 3).join(' ') || 'all');
      relUrl.searchParams.append('per_page', 12);
      relUrl.searchParams.append('order', 'top-weekly');
      relUrl.searchParams.append('gay', 0);
      relUrl.searchParams.append('lq', 1);
      relUrl.searchParams.append('thumbsize', 'medium');
      relUrl.searchParams.append('format', 'json');
      const relRes = await fetch(relUrl.toString());
      const relData = await relRes.json();
      if (relData?.videos) {
        setRelated(
          relData.videos
            .map(rv => ({ ...rv, title: fixEncoding(rv.title), keywords: fixEncoding(rv.keywords) }))
            .filter(rv => rv.id !== id && !FORBIDDEN_REGEX.test(rv.keywords || '') && !FORBIDDEN_REGEX.test(rv.title || ''))
            .slice(0, 12)
        );
      }
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
      <div className="loading-block">
        <div className="loading-spinner" />
        <p>Loading video...</p>
      </div>
    );
  }

  if (pageError || !video) {
    return (
      <div className="empty-block">
        <p style={{ fontSize: '2rem' }}>⚠️</p>
        <p>Could not load this video. Please go back and try another.</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper player-page">
      {/* ── Banner 728x90 (Desktop) & 320x50 (Mobile) di atas tombol back ── */}
      <div className="ad-row" style={{ marginBottom: '1rem' }}>
        <div className="ad-desktop-only">
          <AdBanner adKey="6cb50045b61eddee00e504ba14847190" width={728} height={90} />
        </div>
        <div className="ad-mobile-only">
          <AdBanner adKey="05f054fa88f5e6d6b183797a8f9213f9" width={320} height={50} />
        </div>
      </div>

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

          <div className="video-info-block">
            <h1 className="video-info-title">{video.title}</h1>

            <div className="video-info-meta">
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
          {/* ── Banner 300x250 di atas Related Videos (sidebar) ── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <AdBanner adKey="a2d1d9869741533064aff0b41e9dbb6f" width={300} height={250} />
          </div>
          <h2 className="sidebar-heading">Related Videos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {related.map(v => (
              <VideoCard key={v.id} video={v} compact={true} />
            ))}
          </div>
          {related.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No related videos found.
            </p>
          )}
        </aside>
      </div>

      {/* ── Native Banner (4:1 layout) di bawah player layout (desktop & mobile) ── */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>
          Recommended Content
        </h3>
        <AdNative widgetId="fb2c6ae06d2ab4be82435961f6263160" />
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
  );
};

export default VideoPlayerClient;
