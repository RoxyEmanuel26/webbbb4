import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Flame, TrendingUp, Star, Clock, Heart } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Latest',       path: '/?order=latest',       order: 'latest' },
  { label: 'Top Rated',    path: '/?order=top-rated',    order: 'top-rated' },
  { label: 'Most Viewed',  path: '/?order=most-popular', order: 'most-popular' },
  { label: 'Top Weekly',   path: '/?order=top-weekly',   order: 'top-weekly' },
  { label: 'Top Monthly',  path: '/?order=top-monthly',  order: 'top-monthly' },
];

const Navbar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate   = useNavigate();
  const location   = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const isActive = (order) => {
    const params = new URLSearchParams(location.search);
    return params.get('order') === order;
  };

  return (
    <header className="navbar-root" role="banner">
      <div className="page-wrapper navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" aria-label="Home">
          <Heart size={18} fill="var(--color-accent)" color="var(--color-accent)" />
          <span>PORNAPI</span>
        </Link>

        {/* Nav Links */}
        <nav className="navbar-links" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.order}
              to={link.path}
              className={`navbar-link ${isActive(link.order) ? 'is-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
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
            onBlur={() => setIsFocused(false)}
            aria-label="Search videos"
          />
          <button type="submit" className="search-submit-btn" aria-label="Submit search">
            Search
          </button>
        </form>
      </div>
    </header>
  );
};

export default Navbar;
