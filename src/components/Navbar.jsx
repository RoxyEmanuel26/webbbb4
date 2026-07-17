"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Flame, TrendingUp, Star, Clock } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',       path: '/' },
  { label: 'Categories', path: '/cats/' },
  { label: 'Free JAV',   path: 'https://www.missav-j.web.id', external: true },
];

const Navbar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
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
            <img src="/logo.webp" alt="Logo" width="34" height="34" style={{ position: 'relative', zIndex: 1, objectFit: 'contain' }} />
          </div>
          <div className="brand-text">
            <span className="brand-text-nice">NICE</span>
            <span className="brand-text-vx">VX</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="navbar-links" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            link.external ? (
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
              >
                {link.label}
              </Link>
            )
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

        </div>
      </div>
    </header>
  );
};

export default Navbar;
