"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Heart, Flame, Tag, ArrowRight } from 'lucide-react';
import { ALL_CATEGORIES } from '@/data/allCategories';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',        path: '/' },
  { label: 'Stars',       path: '/pornstars' },
  { label: 'Collections', path: '/collections' },
  { label: 'Categories',  path: '/cats' },
  { label: 'Saved',       path: '/saved', icon: Heart },
];

const TRENDING_SUGGESTIONS = [
  { name: 'Japanese',   slug: 'japanese' },
  { name: 'Milf',       slug: 'milf' },
  { name: 'Anal',       slug: 'anal' },
  { name: 'Asian',      slug: 'asian' },
  { name: 'Amateur',    slug: 'amateur' },
  { name: 'Big Tits',   slug: 'big-tits' },
  { name: 'Creampie',   slug: 'creampie' },
  { name: 'POV',        slug: 'pov' },
  { name: 'Cosplay',    slug: 'cosplay' },
  { name: 'Blowjob',    slug: 'blowjob' },
  { name: 'Ebony',      slug: 'ebony' },
  { name: 'Hardcore',   slug: 'hardcore' },
];

const FORBIDDEN_REGEX = /\b(gay|shemale|tranny|ladyboy|ts|transsexual|transgender|boy|men|cock suck|cock sucking)\b/i;

const Navbar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const router = useRouter();
  const pathname = usePathname();
  const searchWrapperRef = useRef(null);
  const inputRef = useRef(null);

  const trimmedQuery = query.trim();

  // Filter categories matching query
  const matchingCategories = useMemo(() => {
    if (!trimmedQuery) return [];
    const q = trimmedQuery.toLowerCase();
    return ALL_CATEGORIES
      .filter((cat) => !FORBIDDEN_REGEX.test(cat.name) && cat.name.toLowerCase().includes(q))
      .slice(0, 7);
  }, [trimmedQuery]);

  // Total selectable items (matching categories + 'search for query' item)
  const totalItems = matchingCategories.length + (trimmedQuery ? 1 : 0);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Close suggestions on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, [pathname]);

  const navigateToSearch = (searchTerm) => {
    const term = searchTerm.trim();
    if (!term) return;
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery('');
    if (inputRef.current) inputRef.current.blur();
    router.push(`/search?query=${encodeURIComponent(term)}`);
  };

  const navigateToCategory = (catName) => {
    const slug = catName.toLowerCase().replace(/\s+/g, '-');
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery('');
    if (inputRef.current) inputRef.current.blur();
    router.push(`/cat/${slug}`);
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (activeIndex >= 0 && activeIndex < matchingCategories.length) {
      navigateToCategory(matchingCategories[activeIndex].name);
      return;
    }
    if (trimmedQuery) {
      navigateToSearch(trimmedQuery);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <header className="navbar-root" role="banner">
      <div className="page-wrapper navbar-inner">
        {/* Brand */}
        <Link href="/" className="navbar-brand" aria-label="Home" prefetch={false}>
          <div className="brand-logo-mark">
            <div className="brand-icon-glow"></div>
            <img
              src="/logo.webp"
              alt="Logo"
              width="34"
              height="34"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              style={{ position: 'relative', zIndex: 1, objectFit: 'contain' }}
            />
          </div>
          <div className="brand-text">
            <span className="brand-text-nice">NICE</span>
            <span className="brand-text-vx">VX</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="navbar-links" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return link.external ? (
              <a
                key={link.path}
                className="navbar-link external-link"
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.path}
                className={`navbar-link ${isActive(link.path) ? 'is-active' : ''}`}
                href={link.path}
                prefetch={false}
              >
                {Icon && <Icon size={15} aria-hidden="true" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <div className="navbar-search-wrapper" ref={searchWrapperRef}>
          <form
            className={`navbar-search ${isOpen ? 'is-focused' : ''}`}
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <Search size={15} className="search-ico" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search videos..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              aria-label="Search videos"
            />
            <button type="submit" className="search-submit-btn" aria-label="Submit search">
              Search
            </button>
          </form>

          {/* Autocomplete / Suggestions Dropdown */}
          {isOpen && (
            <div className="navbar-autosuggest" role="listbox">
              {trimmedQuery.length === 0 ? (
                <div className="autosuggest-trending">
                  <div className="autosuggest-header">
                    <Flame size={13} className="autosuggest-header-icon" />
                    <span>Trending Searches</span>
                  </div>
                  <div className="autosuggest-tags-grid">
                    {TRENDING_SUGGESTIONS.map((item) => (
                      <button
                        key={item.slug}
                        type="button"
                        className="autosuggest-tag-chip"
                        onClick={() => navigateToCategory(item.name)}
                      >
                        <Tag size={11} aria-hidden="true" />
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="autosuggest-matches">
                  {matchingCategories.length > 0 && (
                    <div className="autosuggest-header">
                      <Tag size={13} className="autosuggest-header-icon" />
                      <span>Matching Categories</span>
                    </div>
                  )}
                  {matchingCategories.map((cat, idx) => (
                    <button
                      key={cat.name}
                      type="button"
                      className={`autosuggest-item ${activeIndex === idx ? 'is-active' : ''}`}
                      onClick={() => navigateToCategory(cat.name)}
                    >
                      <span className="autosuggest-cat-name">{cat.name}</span>
                      {cat.count && <span className="autosuggest-cat-count">{cat.count} videos</span>}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`autosuggest-item autosuggest-see-all ${activeIndex === matchingCategories.length ? 'is-active' : ''}`}
                    onClick={() => navigateToSearch(trimmedQuery)}
                  >
                    <span>Search all videos for &quot;<strong>{trimmedQuery}</strong>&quot;</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;