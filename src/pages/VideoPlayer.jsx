import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { epornerApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import { Eye, Star, Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ALL_CATEGORIES } from '../data/allCategories';
import './Pages.css';

const formatViews = (n) => {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M views';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K views';
  return n + ' views';
};

const createSlug = (title) => {
  if (!title) return '';
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};


const VideoPlayer = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [video,      setVideo]        = useState(null);
  const [loading,    setLoading]      = useState(true);
  const [error,      setError]        = useState(false);
  const [related,    setRelated]      = useState([]);
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

  useEffect(() => {
    if (selectedThumbIndex !== null) {
      setTimeout(checkStripScroll, 50);
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

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(false);

    (async () => {
      try {
        const data = await epornerApi.getVideoDetails(id, 'big');

        // API returns [] for removed videos
        if (!data || Array.isArray(data) || !data.id) {
          setError(true);
          setLoading(false);
          return;
        }

        setVideo(data);

        // SEO: Enforce canonical URL redirect
        const expectedSlug = createSlug(data.title);
        const canonicalUrl = `/video/${id}/${expectedSlug}`;
        if (location.pathname !== canonicalUrl) {
          navigate(canonicalUrl, { replace: true });
        }

        // Fetch related by first keyword
        if (data.keywords) {
          const kw = data.keywords.split(',')[0].trim();
          const rel = await epornerApi.searchVideos({
            query: kw,
            per_page: 10,
            gay: 0,
            lq: 1,
            thumbsize: 'medium',
          });
          setRelated((rel?.videos || []).filter(v => v.id !== id).slice(0, 8));
        }
      } catch (_) {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-block" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span>Loading video…</span>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="empty-block" style={{ minHeight: '60vh' }}>
        <p style={{ fontSize: '3rem' }}>😔</p>
        <h2>Video Not Available</h2>
        <p>This video may have been removed or is temporarily unavailable.</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '1rem',
            background: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 'var(--font-size-base)',
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const keywords = video.keywords
    ? video.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  // SEO metadata for this video
  const videoSlug = createSlug(video.title);
  const canonicalUrl = `https://nicevx.com/video/${video.id}/${videoSlug}`;
  const currentYear = new Date().getFullYear();
  const seoTitle = `${video.title} - Free HD Porn Video ${currentYear} — NICEVX`;
  const seoDesc = `Watch "${video.title}" free HD porn video on NICEVX. ${video.length_min || ''} ${video.views ? `${Number(video.views).toLocaleString()} views.` : ''} Stream top-quality adult content in ${currentYear}.`;
  const thumbSrc = video.default_thumb?.src || (video.thumbs?.[0]?.src) || '';

  // VideoObject structured data
  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: seoDesc,
    thumbnailUrl: thumbSrc,
    uploadDate: video.added || undefined,
    duration: video.length_min ? `PT${video.length_min.replace(':', 'M')}S` : undefined,
    contentUrl: canonicalUrl,
    embedUrl: typeof video.embed === 'string' && !video.embed.includes('<iframe') ? video.embed : undefined,
    interactionStatistic: video.views ? {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: video.views,
    } : undefined,
    keywords: keywords.join(', '),
  };

  // Find related categories based on keywords for internal linking
  const relatedCategories = ALL_CATEGORIES.filter(cat => 
    keywords.some(kw => cat.name.toLowerCase() === kw.toLowerCase() || kw.toLowerCase().includes(cat.name.toLowerCase()))
  ).slice(0, 5); // Limit to 5 categories

  return (
    <div className="page-wrapper player-page">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="video.other" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content={canonicalUrl} />
        {thumbSrc && <meta property="og:image" content={thumbSrc} />}
        {thumbSrc && <meta name="twitter:image" content={thumbSrc} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <script type="application/ld+json">
          {JSON.stringify([
            videoSchema,
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://nicevx.com/"
                },
                ...(keywords.length > 0 ? [
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1),
                    "item": `https://nicevx.com/tag/${keywords[0].toLowerCase().replace(/\s+/g, '-')}`
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": video.title,
                    "item": canonicalUrl
                  }
                ] : [
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": video.title,
                    "item": canonicalUrl
                  }
                ])
              ]
            }
          ])}
        </script>
      </Helmet>
      {/* Back link */}
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="player-layout">
        {/* ─ Main Column ─ */}
        <div className="player-main">
          {/* Embed Player */}
          <div className="player-box">
            {video.embed && video.embed.includes('<iframe') ? (
              <div dangerouslySetInnerHTML={{ __html: video.embed.replace('<iframe', '<iframe loading="lazy"') }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <iframe 
                src={video.embed} 
                loading="lazy"
                frameBorder="0" 
                scrolling="no" 
                allowFullScreen
                title={video.title || "Video Player"}
              />
            )}
          </div>

          {/* Video Info Card */}
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
                  {video.added.split(' ')[0]}
                </span>
              )}
            </div>

            {/* Keywords */}
            {keywords.length > 0 && (
              <div className="keyword-tags">
                {keywords.slice(0, 20).map((kw, i) => (
                  <Link
                    key={i}
                    to={`/tag/${kw.toLowerCase().replace(/\s+/g, '-')}`}
                    className="keyword-tag"
                  >
                    #{kw}
                  </Link>
                ))}
              </div>
            )}

            {/* SEO Description Boilerplate */}
            <div className="seo-description" style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              <p>
                Watch the <strong>{video.title}</strong> video for free on NICEVX. 
                {video.length_min && ` This HD porn video is ${video.length_min} long and `} 
                {video.views && `has been viewed ${Number(video.views).toLocaleString()} times.`}
                {keywords.length > 0 && ` Explore more related content in ${keywords.slice(0, 3).join(', ')} categories.`} 
                We update our tube daily with the best high-quality adult videos.
              </p>
            </div>

            {/* Preview Thumbnails */}
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

        {/* ─ Sidebar ─ */}
        <aside className="player-sidebar">
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

          {/* Related Categories / Internal Linking */}
          {relatedCategories.length > 0 && (
            <>
              <h2 className="sidebar-heading" style={{ marginTop: '2rem' }}>Related Categories</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {relatedCategories.map(cat => (
                  <Link
                    key={cat.name}
                    to={`/cat/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="keyword-tag"
                    style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Lightbox Overlay */}
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
              <img src={video.thumbs[selectedThumbIndex].src} alt="Enlarged preview" />
            </div>

            {selectedThumbIndex < video.thumbs.length - 1 && (
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
              {video.thumbs.map((t, i) => (
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

export default VideoPlayer;
