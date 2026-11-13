'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Film, Clock, Flame, Star, Search, Filter } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import '../../pages/Pages.css';

const DURATION_TIERS = [
  { id: '45', label: '45+ Min (All Movies)', minSeconds: 2700 },
  { id: '60', label: '60+ Min (Feature Length)', minSeconds: 3600 },
  { id: '90', label: '90+ Min (Extended Films)', minSeconds: 5400 },
];

const SORT_OPTIONS = [
  { id: 'longest', label: '🎬 Longest First' },
  { id: 'views', label: '🔥 Most Viewed' },
  { id: 'rating', label: '⭐ Top Rated' },
];

const INITIAL_VISIBLE_COUNT = 48;

export default function MoviesClient({ initialVideos = [] }) {
  const [selectedTier, setSelectedTier] = useState('45');
  const [selectedSort, setSelectedSort] = useState('longest');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const filteredVideos = useMemo(() => {
    const tier = DURATION_TIERS.find((t) => t.id === selectedTier) || DURATION_TIERS[0];
    let result = initialVideos.filter((v) => (Number(v.durationSeconds) || 0) >= tier.minSeconds);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          (v.title && v.title.toLowerCase().includes(q)) ||
          (v.category && v.category.toLowerCase().includes(q)) ||
          (Array.isArray(v.tags) && v.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (selectedSort === 'longest') {
      result.sort((a, b) => (Number(b.durationSeconds) || 0) - (Number(a.durationSeconds) || 0));
    } else if (selectedSort === 'views') {
      result.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    } else if (selectedSort === 'rating') {
      result.sort((a, b) => (Number(b.rating || b.rate) || 0) - (Number(a.rating || a.rate) || 0));
    }

    return result;
  }, [initialVideos, selectedTier, selectedSort, searchQuery]);

  const visibleVideos = filteredVideos.slice(0, visibleCount);

  return (
    <div className="page-wrapper movies-page">
      {/* Hero Header */}
      <header className="movies-hero">
        <div className="movies-hero-badge">
          <Film size={14} style={{ color: 'var(--color-accent)' }} />
          <span>Long-Format Catalog</span>
        </div>
        <h1 className="movies-hero-title">Full Movies &amp; Feature-Length Adult Videos</h1>
        <p className="movies-hero-subtitle">
          Stream uncut, extended adult movies and full scenes running 45 minutes or longer in high definition.
          Explore feature films from top performers and studios with complete runtimes and seamless streaming.
        </p>

        {/* Filter & Search Bar */}
        <div className="movies-controls-bar">
          <div className="movies-tier-pills" role="tablist" aria-label="Duration filter">
            {DURATION_TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                role="tab"
                aria-selected={selectedTier === tier.id}
                className={`movies-pill-btn ${selectedTier === tier.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTier(tier.id);
                  setVisibleCount(INITIAL_VISIBLE_COUNT);
                }}
              >
                <Clock size={12} /> {tier.label}
              </button>
            ))}
          </div>

          <div className="movies-search-wrap">
            <Search size={14} className="movies-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Filter movies by title or tag..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(INITIAL_VISIBLE_COUNT);
              }}
              className="movies-search-input"
              aria-label="Filter movies by title or tag"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="movies-sort-row">
          <span className="movies-count-label">
            Showing <strong>{visibleVideos.length}</strong> of <strong>{filteredVideos.length}</strong> full-length movies
          </span>
          <div className="movies-sort-pills">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`movies-sort-btn ${selectedSort === opt.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSort(opt.id);
                  setVisibleCount(INITIAL_VISIBLE_COUNT);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <div className="video-grid">
        {visibleVideos.map((video, index) => (
          <VideoCard key={video.id} video={video} priority={index < 4} />
        ))}
      </div>

      {filteredVideos.length > visibleVideos.length && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
          <button
            type="button"
            className="back-btn"
            onClick={() => setVisibleCount((prev) => prev + INITIAL_VISIBLE_COUNT)}
          >
            Show More Movies ({filteredVideos.length - visibleVideos.length} remaining)
          </button>
        </div>
      )}

      {filteredVideos.length === 0 && (
        <div className="empty-block" style={{ margin: '3rem auto' }}>
          <h2>No full movies match your query</h2>
          <p>Try lowering the duration filter or clearing your search term.</p>
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              setSelectedTier('45');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* SEO FAQ Section */}
      <section className="movies-faq-section" aria-labelledby="movies-faq-heading">
        <h2 id="movies-faq-heading" className="movies-faq-title">Frequently Asked Questions About Full Movies</h2>
        <div className="movies-faq-grid">
          <div className="movies-faq-card">
            <h3>What defines a full-length movie on NICEVX?</h3>
            <p>
              Full movies on NICEVX are complete scene recordings and feature releases with an uninterrupted runtime of 45 minutes or longer.
              Unlike short clips or teaser previews, full movies provide comprehensive storylines, extended foreplay, and multiple climactic sequences.
            </p>
          </div>
          <div className="movies-faq-card">
            <h3>Can I preview scenes before watching full movies?</h3>
            <p>
              Yes! Every movie card includes our interactive 15-frame storyboard scrubber. Simply move your cursor across the movie thumbnail
              to scrub through key moments from the beginning to the end of the film.
            </p>
          </div>
          <div className="movies-faq-card">
            <h3>Are all full movies free to stream in high definition?</h3>
            <p>
              All full-length videos listed on NICEVX stream in full high definition (720p and 1080p) completely free of charge.
              No sign-up or paid subscription is required to stream any video in our catalog.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
