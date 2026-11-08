"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star, Globe, Tag } from 'lucide-react';
import { PORNSTARS } from '@/data/pornstars';
import '../../pages/Pages.css';

const ALPHABET = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export default function PornstarsClient() {
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStars = useMemo(() => {
    let result = PORNSTARS;

    if (selectedLetter !== 'ALL') {
      result = result.filter((star) =>
        star.name.toUpperCase().startsWith(selectedLetter)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (star) =>
          star.name.toLowerCase().includes(q) ||
          star.nationality.toLowerCase().includes(q) ||
          (star.topGenres || []).some((g) => g.toLowerCase().includes(q))
      );
    }

    return result;
  }, [selectedLetter, searchQuery]);

  return (
    <div className="page-wrapper pornstars-directory-page">
      <div className="directory-header">
        <h1 className="directory-title">Adult Film Stars &amp; Performers</h1>
        <p className="directory-desc">
          Browse verified adult models and performers on NICEVX. Stream full HD scenes and explore filmographies indexed from A to Z.
        </p>

        {/* Search Bar */}
        <div className="directory-search-bar">
          <Search size={16} className="directory-search-ico" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by performer name, nationality, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="directory-search-input"
            aria-label="Search performers"
          />
        </div>

        {/* Alphabet Bar */}
        <div className="alphabet-bar" role="group" aria-label="Filter by initial letter">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              type="button"
              className={`alphabet-btn ${selectedLetter === letter ? 'is-active' : ''}`}
              onClick={() => setSelectedLetter(letter)}
              aria-pressed={selectedLetter === letter}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Stars Grid */}
      <div className="pornstars-grid">
        {filteredStars.length > 0 ? (
          filteredStars.map((star) => (
            <Link
              key={star.slug}
              href={`/pornstar/${star.slug}`}
              className="pornstar-card"
            >
              <div className="pornstar-card-avatar-wrap">
                <img
                  src={star.photo}
                  alt={star.name}
                  className="pornstar-card-avatar"
                  loading="lazy"
                  width="96"
                  height="96"
                />
                <span className="pornstar-card-badge">
                  <Star size={10} fill="currentColor" /> Verified
                </span>
              </div>
              <div className="pornstar-card-content">
                <h2 className="pornstar-card-name">{star.name}</h2>
                <span className="pornstar-card-nationality">
                  <Globe size={11} aria-hidden="true" /> {star.nationality}
                </span>
                <p className="pornstar-card-bio">{star.bio}</p>
                {star.topGenres && (
                  <div className="pornstar-card-genres">
                    {star.topGenres.slice(0, 3).map((genre) => (
                      <span key={genre} className="pornstar-card-genre-pill">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-block" style={{ gridColumn: '1 / -1', padding: '3rem 1rem' }}>
            <p style={{ fontSize: '2rem' }}>🔍</p>
            <p>No performers found matching &quot;<strong>{searchQuery || selectedLetter}</strong>&quot;</p>
            <button
              type="button"
              className="back-btn"
              onClick={() => {
                setSelectedLetter('ALL');
                setSearchQuery('');
              }}
              style={{ margin: '1rem auto' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
