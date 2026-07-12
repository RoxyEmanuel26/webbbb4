"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Flame, TrendingUp, Star, Clock } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',       path: '/' },
  { label: 'Categories', path: '/cats/' },
];

const Navbar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const router     = useRouter();
  const pathname   = usePathname();
  const searchTimeout = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounced API Call
  useEffect(() => {
    if (!query.trim() || !isFocused) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      return;
    }

    setLoadingSuggestions(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    searchTimeout.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();
      try {
        const params = new URLSearchParams({
          action: 'search',
          query: query.trim(),
          per_page: 5,
          order: 'relevance'
        });
        const res = await fetch(`/api/eporner?${params}`, {
          headers: { 'x-internal-request': 'nicevx' },
          signal: abortControllerRef.current.signal
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setSuggestions(data.videos || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setLoadingSuggestions(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [query, isFocused]);

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleSuggestionClick = (video) => {
    setIsFocused(false);
    setQuery('');
    const slug = video.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    router.push(`/video/${video.id}/${slug}`);
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <header className="navbar-root" role="banner">
      <div className="page-wrapper navbar-inner">
        {/* Brand */}
        <Link href="/" className="navbar-brand" aria-label="Home">
          <div className="brand-logo-mark">
            <div className="brand-icon-glow"></div>
            <img src="/logo.webp" alt="Logo" width="22" height="22" style={{ position: 'relative', zIndex: 1, objectFit: 'contain' }} />
          </div>
          <div className="brand-text">
            <span className="brand-text-nice">NICE</span>
            <span className="brand-text-vx">VX</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="navbar-links" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              className={`navbar-link ${isActive(link.path) ? 'is-active' : ''}`}
              href={link.path}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="navbar-search-wrapper">
          <form
            className={`navbar-search ${isFocused ? 'is-focused' : ''}`}
            onSubmit={handleSearch}
            role="search"
          >
            <Search size={15} className="search-ico" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search videos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // slight delay to allow suggestion click to fire
                setTimeout(() => setIsFocused(false), 200);
              }}
              aria-label="Search videos"
            />
            <button type="submit" className="search-submit-btn" aria-label="Submit search">
              Search
            </button>
          </form>

          {/* Auto-Suggest Dropdown */}
          {isFocused && query.trim() && (
            <div className="navbar-autosuggest">
              {loadingSuggestions ? (
                <div className="autosuggest-loading">Searching...</div>
              ) : suggestions.length > 0 ? (
                <div className="autosuggest-list">
                  {suggestions.map((video) => (
                    <div 
                      key={video.id} 
                      className="autosuggest-item"
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent blur
                        handleSuggestionClick(video);
                      }}
                    >
                      <img src={video.default_thumb?.src || ''} alt="" className="autosuggest-thumb" loading="lazy" />
                      <div className="autosuggest-info">
                        <div className="autosuggest-title">{video.title}</div>
                        <div className="autosuggest-meta">
                          <Clock size={10} /> {video.length_min} • {video.views ? (video.views / 1000).toFixed(0) + 'K views' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div 
                    className="autosuggest-item autosuggest-see-all"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSearch(e);
                    }}
                  >
                    <Search size={14} /> See all results for "{query}"
                  </div>
                </div>
              ) : (
                <div className="autosuggest-empty">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
