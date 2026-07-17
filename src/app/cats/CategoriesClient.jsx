"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, List } from 'lucide-react';
import { ALL_CATEGORIES } from '@/data/allCategories';
import '../../pages/Pages.css';
import '../../pages/Categories.css';

const CATEGORIES = [
  { name: 'Japanese', image: 'https://static-sg-cdn.eporner.com/catimg/52.jpg' },
  { name: 'Anal', image: 'https://static-ca-cdn.eporner.com/catimg/3.jpg' },
  { name: 'HD Porn 1080p', image: 'https://static-ca-cdn.eporner.com/catimg/43.jpg' },
  { name: 'VR Porn', image: 'https://static-ca-cdn.eporner.com/catimg/72.jpg' },
  { name: 'Teen', image: 'https://static-ca-cdn.eporner.com/catimg/0.jpg' },
  { name: 'Asian', image: 'https://static-ca-cdn.eporner.com/catimg/11.jpg' },
  { name: 'Big Tits', image: 'https://static-ca-cdn.eporner.com/catimg/25.jpg' },
  { name: 'Shemale', image: 'https://static-ca-cdn.eporner.com/catimg/24.jpg' },
  { name: 'MILF', image: 'https://static-ca-cdn.eporner.com/catimg/53.jpg' },
  { name: 'Ebony', image: 'https://static-ca-cdn.eporner.com/catimg/10.jpg' },
  { name: 'Homemade', image: 'https://static-ca-cdn.eporner.com/catimg/12.jpg' },
  { name: 'Indian', image: 'https://static-ca-cdn.eporner.com/catimg/59.jpg' },
  { name: 'Interracial', image: 'https://static-ca-cdn.eporner.com/catimg/48.jpg' },
  { name: 'Amateur', image: 'https://static-ca-cdn.eporner.com/catimg/1.jpg' },
  { name: 'Lesbian', image: 'https://static-ca-cdn.eporner.com/catimg/6.jpg' },
  { name: '60 FPS', image: 'https://static-ca-cdn.eporner.com/catimg/67.jpg' },
  { name: 'Big Ass', image: 'https://static-ca-cdn.eporner.com/catimg/44.jpg' },
  { name: 'POV', image: 'https://static-ca-cdn.eporner.com/catimg/33.jpg' },
  { name: 'Mature', image: 'https://static-ca-cdn.eporner.com/catimg/17.jpg' },
  { name: 'Creampie', image: 'https://static-ca-cdn.eporner.com/catimg/47.jpg' },
  { name: 'Hentai', image: 'https://static-ca-cdn.eporner.com/catimg/42.jpg' },
  { name: 'Hardcore', image: 'https://static-ca-cdn.eporner.com/catimg/5.jpg' },
  { name: 'BBW', image: 'https://static-ca-cdn.eporner.com/catimg/63.jpg' },
  { name: 'Threesome', image: 'https://static-ca-cdn.eporner.com/catimg/9.jpg' },
  { name: 'Latina', image: 'https://static-ca-cdn.eporner.com/catimg/54.jpg' },
  { name: 'Big Dick', image: 'https://static-ca-cdn.eporner.com/catimg/7.jpg' },
  { name: 'Double Penetration', image: 'https://static-ca-cdn.eporner.com/catimg/2.jpg' },
  { name: 'Pornstar', image: 'https://static-ca-cdn.eporner.com/catimg/66.jpg' },
  { name: 'Group Sex', image: 'https://static-ca-cdn.eporner.com/catimg/26.jpg' },
  { name: 'Vintage', image: 'https://static-ca-cdn.eporner.com/catimg/57.jpg' },
  { name: 'Cumshot', image: 'https://static-ca-cdn.eporner.com/catimg/4.jpg' },
  { name: 'Blowjob', image: 'https://static-ca-cdn.eporner.com/catimg/8.jpg' },
  { name: 'Masturbation', image: 'https://static-ca-cdn.eporner.com/catimg/28.jpg' },
  { name: 'Students', image: 'https://static-ca-cdn.eporner.com/catimg/19.jpg' },
  { name: 'Blonde', image: 'https://static-ca-cdn.eporner.com/catimg/37.jpg' },
  { name: 'Petite', image: 'https://static-ca-cdn.eporner.com/catimg/65.jpg' },
  { name: 'Webcam', image: 'https://static-ca-cdn.eporner.com/catimg/62.jpg' },
  { name: 'Orgy', image: 'https://static-ca-cdn.eporner.com/catimg/58.jpg' },
  { name: 'Brunette', image: 'https://static-ca-cdn.eporner.com/catimg/38.jpg' },
  { name: 'Office', image: 'https://static-ca-cdn.eporner.com/catimg/23.jpg' },
  { name: 'BDSM', image: 'https://static-ca-cdn.eporner.com/catimg/29.jpg' },
  { name: 'Public', image: 'https://static-ca-cdn.eporner.com/catimg/15.jpg' },
  { name: 'Older Men', image: 'https://static-ca-cdn.eporner.com/catimg/13.jpg' },
  { name: 'Massage', image: 'https://static-ca-cdn.eporner.com/catimg/49.jpg' },
  { name: 'Lingerie', image: 'https://static-ca-cdn.eporner.com/catimg/36.jpg' },
  { name: 'Toys', image: 'https://static-ca-cdn.eporner.com/catimg/30.jpg' },
  { name: 'Hotel', image: 'https://static-ca-cdn.eporner.com/catimg/35.jpg' },
  { name: 'Squirt', image: 'https://static-ca-cdn.eporner.com/catimg/51.jpg' },
  { name: 'Outdoor', image: 'https://static-ca-cdn.eporner.com/catimg/16.jpg' },
  { name: 'Fat', image: 'https://static-ca-cdn.eporner.com/catimg/18.jpg' },
  { name: 'Fetish', image: 'https://static-ca-cdn.eporner.com/catimg/60.jpg' },
  { name: 'Redhead', image: 'https://static-ca-cdn.eporner.com/catimg/39.jpg' },
  { name: 'Housewives', image: 'https://static-ca-cdn.eporner.com/catimg/20.jpg' },
  { name: 'Small Tits', image: 'https://static-ca-cdn.eporner.com/catimg/50.jpg' },
  { name: 'Sleep', image: 'https://static-ca-cdn.eporner.com/catimg/22.jpg' },
  { name: 'Swinger', image: 'https://static-ca-cdn.eporner.com/catimg/32.jpg' },
  { name: 'Bukkake', image: 'https://static-ca-cdn.eporner.com/catimg/55.jpg' },
  { name: 'Uniform', image: 'https://static-ca-cdn.eporner.com/catimg/27.jpg' },
  { name: 'Striptease', image: 'https://static-ca-cdn.eporner.com/catimg/61.jpg' },
  { name: 'Handjob', image: 'https://static-ca-cdn.eporner.com/catimg/21.jpg' },
  { name: 'Bondage', image: 'https://static-ca-cdn.eporner.com/catimg/45.jpg' },
  { name: 'For Women', image: 'https://static-ca-cdn.eporner.com/catimg/64.jpg' },
  { name: 'Nurses', image: 'https://static-ca-cdn.eporner.com/catimg/41.jpg' },
  { name: 'Fisting', image: 'https://static-ca-cdn.eporner.com/catimg/56.jpg' },
  { name: 'HQ Porn', image: 'https://static-ca-cdn.eporner.com/catimg/69.jpg' },
  { name: 'Footjob', image: 'https://static-ca-cdn.eporner.com/catimg/40.jpg' },
  { name: 'HD Sex', image: 'https://static-ca-cdn.eporner.com/catimg/70.jpg' },
  { name: 'ASMR', image: 'https://static-ca-cdn.eporner.com/catimg/31.jpg' },
  { name: 'Doctor', image: 'https://static-ca-cdn.eporner.com/catimg/34.jpg' },
  { name: 'Indonesia', image: 'https://static-ca-cdn.eporner.com/catimg/80.jpg' },
  { name: 'Stepmom', image: 'https://static-ca-cdn.eporner.com/catimg/84.jpg' },
  { name: 'Compilation', image: 'https://static-ca-cdn.eporner.com/catimg/75.jpg' },
  { name: 'AI', image: 'https://static-ca-cdn.eporner.com/catimg/73.jpg' },
  { name: 'Cuckold', image: 'https://static-ca-cdn.eporner.com/catimg/77.jpg' },
  { name: 'Stepsister', image: 'https://static-ca-cdn.eporner.com/catimg/85.jpg' },
  { name: 'Pinay', image: 'https://static-ca-cdn.eporner.com/catimg/82.jpg' },
  { name: 'Cosplay', image: 'https://static-ca-cdn.eporner.com/catimg/76.jpg' },
  { name: 'PAWG', image: 'https://static-ca-cdn.eporner.com/catimg/81.jpg' },
  { name: 'Casting', image: 'https://static-ca-cdn.eporner.com/catimg/74.jpg' },
  { name: 'Pregnant', image: 'https://static-ca-cdn.eporner.com/catimg/83.jpg' },
  { name: 'Hotwife', image: 'https://static-ca-cdn.eporner.com/catimg/79.jpg' },
  { name: 'Gloryhole', image: 'https://static-ca-cdn.eporner.com/catimg/78.jpg' },
];

const ALPHABET = ['#', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

const CategoriesClient = () => {
  const [activeLetter, setActiveLetter] = useState('A');

  // Bucket every category by its leading letter (digits -> '#') so we can render
  // ALL of them into the server HTML. The alphabet bar only toggles visibility
  // (via the `hidden` attribute) — it never conditionally renders links. This
  // keeps every /cat/<slug> link crawlable regardless of the active letter,
  // which is what prevents these pages from being orphaned.
  const letterOf = (cat) => {
    const first = (cat.name || '').charAt(0).toLowerCase();
    return /[0-9]/.test(first) ? '#' : first;
  };

  return (
    <div className="categories-page">
      <div className="page-wrapper content-area">
        
        {/* Section Header */}
        <div className="section-header">
          <div className="section-title-group">
            <Layers className="section-icon" size={28} />
            <h1 className="section-title">Free HD Porn Categories & Sex Tube</h1>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="cats-grid">
          {CATEGORIES.map((cat) => (
            <Link 
              href={`/cat/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              key={cat.name}
              prefetch={false}
              className="cat-card has-bg-img"
            >
              <img className="cat-card-bg" src={cat.image} alt={cat.name} loading="lazy" width="300" height="170" />
              <div className="cat-card-overlay"></div>
              <div className="cat-card-content">
                <h3 className="cat-name">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* All Categories Section */}
        <div className="all-categories-section" style={{ marginTop: 'var(--space-8)' }}>
          <div className="section-header all-cats-header">
            <div className="section-title-group">
              <List className="section-icon" size={24} />
              <h2 className="section-title">All Categories</h2>
            </div>
          </div>
          
          <div className="alphabet-bar">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                className={`alphabet-btn ${activeLetter === letter ? 'active' : ''}`}
                onClick={() => setActiveLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="all-cats-list">
            {ALL_CATEGORIES.map((cat) => (
              <Link
                href={`/cat/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                key={cat.name}
                prefetch={false}
                className="all-cat-item"
                data-letter={letterOf(cat)}
                hidden={letterOf(cat) !== activeLetter.toLowerCase()}
              >
                <span className="all-cat-name">{cat.name}</span>
                <span className="all-cat-count">{cat.count}</span>
              </Link>
            ))}
            {!ALL_CATEGORIES.some((cat) => letterOf(cat) === activeLetter.toLowerCase()) && (
              <div className="no-cats-msg">No categories found for {activeLetter}.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesClient;
