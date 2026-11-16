"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Layers, Search, FolderHeart } from "lucide-react";
import { ALL_CATEGORIES } from "@/data/allCategories";

import "../../pages/Pages.css";
import "../../pages/Categories.css";

const CATEGORIES = [
  {
    name: "Japanese",
    image: "https://static-sg-cdn.eporner.com/catimg/52.jpg",
  },
  { name: "Anal", image: "https://static-ca-cdn.eporner.com/catimg/3.jpg" },
  {
    name: "HD Porn 1080p",
    image: "https://static-ca-cdn.eporner.com/catimg/43.jpg",
  },
  { name: "VR Porn", image: "https://static-ca-cdn.eporner.com/catimg/72.jpg" },
  { name: "Teen", image: "https://static-ca-cdn.eporner.com/catimg/0.jpg" },
  { name: "Asian", image: "https://static-ca-cdn.eporner.com/catimg/11.jpg" },
  {
    name: "Big Tits",
    image: "https://static-ca-cdn.eporner.com/catimg/25.jpg",
  },
  { name: "Shemale", image: "https://static-ca-cdn.eporner.com/catimg/24.jpg" },
  { name: "MILF", image: "https://static-ca-cdn.eporner.com/catimg/53.jpg" },
  { name: "Ebony", image: "https://static-ca-cdn.eporner.com/catimg/10.jpg" },
  {
    name: "Homemade",
    image: "https://static-ca-cdn.eporner.com/catimg/12.jpg",
  },
  { name: "Indian", image: "https://static-ca-cdn.eporner.com/catimg/59.jpg" },
  {
    name: "Interracial",
    image: "https://static-ca-cdn.eporner.com/catimg/48.jpg",
  },
  { name: "Amateur", image: "https://static-ca-cdn.eporner.com/catimg/1.jpg" },
  { name: "Lesbian", image: "https://static-ca-cdn.eporner.com/catimg/6.jpg" },
  { name: "60 FPS", image: "https://static-ca-cdn.eporner.com/catimg/67.jpg" },
  { name: "Big Ass", image: "https://static-ca-cdn.eporner.com/catimg/44.jpg" },
  { name: "POV", image: "https://static-ca-cdn.eporner.com/catimg/33.jpg" },
  { name: "Mature", image: "https://static-ca-cdn.eporner.com/catimg/17.jpg" },
  {
    name: "Creampie",
    image: "https://static-ca-cdn.eporner.com/catimg/47.jpg",
  },
  { name: "Hentai", image: "https://static-ca-cdn.eporner.com/catimg/42.jpg" },
  { name: "Hardcore", image: "https://static-ca-cdn.eporner.com/catimg/5.jpg" },
  { name: "BBW", image: "https://static-ca-cdn.eporner.com/catimg/63.jpg" },
  {
    name: "Threesome",
    image: "https://static-ca-cdn.eporner.com/catimg/9.jpg",
  },
  { name: "Latina", image: "https://static-ca-cdn.eporner.com/catimg/54.jpg" },
  { name: "Big Dick", image: "https://static-ca-cdn.eporner.com/catimg/7.jpg" },
  {
    name: "Double Penetration",
    image: "https://static-ca-cdn.eporner.com/catimg/2.jpg",
  },
  {
    name: "Pornstar",
    image: "https://static-ca-cdn.eporner.com/catimg/66.jpg",
  },
  {
    name: "Group Sex",
    image: "https://static-ca-cdn.eporner.com/catimg/26.jpg",
  },
  { name: "Vintage", image: "https://static-ca-cdn.eporner.com/catimg/57.jpg" },
  { name: "Cumshot", image: "https://static-ca-cdn.eporner.com/catimg/4.jpg" },
  { name: "Blowjob", image: "https://static-ca-cdn.eporner.com/catimg/8.jpg" },
  {
    name: "Masturbation",
    image: "https://static-ca-cdn.eporner.com/catimg/28.jpg",
  },
  {
    name: "Students",
    image: "https://static-ca-cdn.eporner.com/catimg/19.jpg",
  },
  { name: "Blonde", image: "https://static-ca-cdn.eporner.com/catimg/37.jpg" },
  { name: "Petite", image: "https://static-ca-cdn.eporner.com/catimg/65.jpg" },
  { name: "Webcam", image: "https://static-ca-cdn.eporner.com/catimg/62.jpg" },
  { name: "Orgy", image: "https://static-ca-cdn.eporner.com/catimg/58.jpg" },
  {
    name: "Brunette",
    image: "https://static-ca-cdn.eporner.com/catimg/38.jpg",
  },
  { name: "Office", image: "https://static-ca-cdn.eporner.com/catimg/23.jpg" },
  { name: "BDSM", image: "https://static-ca-cdn.eporner.com/catimg/29.jpg" },
  { name: "Public", image: "https://static-ca-cdn.eporner.com/catimg/15.jpg" },
  {
    name: "Older Men",
    image: "https://static-ca-cdn.eporner.com/catimg/13.jpg",
  },
  { name: "Massage", image: "https://static-ca-cdn.eporner.com/catimg/49.jpg" },
  {
    name: "Lingerie",
    image: "https://static-ca-cdn.eporner.com/catimg/36.jpg",
  },
  { name: "Toys", image: "https://static-ca-cdn.eporner.com/catimg/30.jpg" },
  { name: "Hotel", image: "https://static-ca-cdn.eporner.com/catimg/35.jpg" },
  { name: "Squirt", image: "https://static-ca-cdn.eporner.com/catimg/51.jpg" },
  { name: "Outdoor", image: "https://static-ca-cdn.eporner.com/catimg/16.jpg" },
  { name: "Fat", image: "https://static-ca-cdn.eporner.com/catimg/18.jpg" },
  { name: "Fetish", image: "https://static-ca-cdn.eporner.com/catimg/60.jpg" },
  { name: "Redhead", image: "https://static-ca-cdn.eporner.com/catimg/39.jpg" },
  {
    name: "Housewives",
    image: "https://static-ca-cdn.eporner.com/catimg/20.jpg",
  },
  {
    name: "Small Tits",
    image: "https://static-ca-cdn.eporner.com/catimg/50.jpg",
  },
  { name: "Sleep", image: "https://static-ca-cdn.eporner.com/catimg/22.jpg" },
  { name: "Swinger", image: "https://static-ca-cdn.eporner.com/catimg/32.jpg" },
  { name: "Bukkake", image: "https://static-ca-cdn.eporner.com/catimg/55.jpg" },
  { name: "Uniform", image: "https://static-ca-cdn.eporner.com/catimg/27.jpg" },
  {
    name: "Striptease",
    image: "https://static-ca-cdn.eporner.com/catimg/61.jpg",
  },
  { name: "Handjob", image: "https://static-ca-cdn.eporner.com/catimg/21.jpg" },
  { name: "Bondage", image: "https://static-ca-cdn.eporner.com/catimg/45.jpg" },
  {
    name: "For Women",
    image: "https://static-ca-cdn.eporner.com/catimg/64.jpg",
  },
  { name: "Nurses", image: "https://static-ca-cdn.eporner.com/catimg/41.jpg" },
  { name: "Fisting", image: "https://static-ca-cdn.eporner.com/catimg/56.jpg" },
  { name: "HQ Porn", image: "https://static-ca-cdn.eporner.com/catimg/69.jpg" },
  { name: "Footjob", image: "https://static-ca-cdn.eporner.com/catimg/40.jpg" },
  { name: "HD Sex", image: "https://static-ca-cdn.eporner.com/catimg/70.jpg" },
  { name: "ASMR", image: "https://static-ca-cdn.eporner.com/catimg/31.jpg" },
  { name: "Doctor", image: "https://static-ca-cdn.eporner.com/catimg/34.jpg" },
  {
    name: "Indonesia",
    image: "https://static-ca-cdn.eporner.com/catimg/80.jpg",
  },
  { name: "Stepmom", image: "https://static-ca-cdn.eporner.com/catimg/84.jpg" },
  {
    name: "Compilation",
    image: "https://static-ca-cdn.eporner.com/catimg/75.jpg",
  },
  { name: "AI", image: "https://static-ca-cdn.eporner.com/catimg/73.jpg" },
  { name: "Cuckold", image: "https://static-ca-cdn.eporner.com/catimg/77.jpg" },
  {
    name: "Stepsister",
    image: "https://static-ca-cdn.eporner.com/catimg/85.jpg",
  },
  { name: "Pinay", image: "https://static-ca-cdn.eporner.com/catimg/82.jpg" },
  { name: "Cosplay", image: "https://static-ca-cdn.eporner.com/catimg/76.jpg" },
  { name: "PAWG", image: "https://static-ca-cdn.eporner.com/catimg/81.jpg" },
  { name: "Casting", image: "https://static-ca-cdn.eporner.com/catimg/74.jpg" },
  {
    name: "Pregnant",
    image: "https://static-ca-cdn.eporner.com/catimg/83.jpg",
  },
  { name: "Hotwife", image: "https://static-ca-cdn.eporner.com/catimg/79.jpg" },
  {
    name: "Gloryhole",
    image: "https://static-ca-cdn.eporner.com/catimg/78.jpg",
  },
];

const CategoriesClient = ({ activeCategories = [], featuredCollections = [] }) => {
  const [topicFilter, setTopicFilter] = useState("");

  const featuredCards = useMemo(() => {
    const activeBySlug = new Map(activeCategories.map((c) => [c.slug, c]));
    return CATEGORIES.filter((cat) =>
      activeBySlug.has(cat.name.toLowerCase().replace(/\s+/g, "-")),
    ).map((cat) => {
      const slug = cat.name.toLowerCase().replace(/\s+/g, "-");
      const meta = activeBySlug.get(slug);
      return {
        slug,
        name: cat.name,
        image: cat.image,
        count: meta?.count || 0,
      };
    });
  }, [activeCategories]);

  const matchingTopics = useMemo(() => {
    const q = topicFilter.trim().toLowerCase();
    if (!q) return [];
    return ALL_CATEGORIES.filter((cat) => cat.name.toLowerCase().includes(q)).slice(0, 48);
  }, [topicFilter]);

  return (
    <div className="categories-page">
      <div className="page-wrapper content-area">
        {/* Section Header */}
        <div className="section-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
          <div className="section-title-group">
            <Layers className="section-icon" size={28} />
            <h1 className="section-title">Browse Video Categories</h1>
          </div>
          <p style={{ color: "var(--color-muted)", maxWidth: "74ch", margin: 0, lineHeight: 1.6 }}>
            Explore {activeCategories.length} active genre hubs and {featuredCollections.length} specialized thematic collections with curated HD scenes, clear runtime metrics, and direct streaming access.
          </p>
        </div>

        {/* Visual Featured Categories Grid (only populated indexable hubs) */}
        <div className="cats-grid">
          {featuredCards.map((cat) => (
            <Link
              href={`/cat/${cat.slug}`}
              key={cat.slug}
              prefetch={false}
              className="cat-card has-bg-img"
            >
              <img
                className="cat-card-bg"
                src={cat.image}
                alt={`${cat.name} videos`}
                loading="lazy"
                width="300"
                height="170"
              />
              <div className="cat-card-overlay"></div>
              <div className="cat-card-content">
                <h2 className="cat-name">{cat.name}</h2>
                {cat.count > 0 && (
                  <span style={{ fontSize: "0.78rem", opacity: 0.88 }}>{cat.count} videos</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* All Active Populated Categories Directory */}
        {activeCategories.length > 0 && (
          <section className="all-categories-section" style={{ marginTop: "var(--space-8)" }}>
            <div className="section-header all-cats-header">
              <div className="section-title-group">
                <Layers className="section-icon" size={22} />
                <h2 className="section-title">Active Categories Directory ({activeCategories.length})</h2>
              </div>
            </div>
            <div className="all-cats-list">
              {activeCategories.map((cat) => (
                <Link
                  href={`/cat/${cat.slug}`}
                  key={cat.slug}
                  prefetch={false}
                  className="all-cat-item"
                >
                  <span className="all-cat-name">{cat.name}</span>
                  <span className="all-cat-count">{cat.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Thematic Collections Bridge */}
        {featuredCollections.length > 0 && (
          <section style={{ marginTop: "var(--space-8)" }}>
            <div className="section-header all-cats-header">
              <div className="section-title-group">
                <FolderHeart className="section-icon" size={22} />
                <h2 className="section-title">Specialized Theme Collections</h2>
              </div>
              <Link href="/collections" className="home-niche-see-all">
                All collections &rarr;
              </Link>
            </div>
            <div className="all-cats-list">
              {featuredCollections.map((col) => (
                <Link
                  href={`/collections/${col.slug}`}
                  key={col.slug}
                  prefetch={false}
                  className="all-cat-item"
                >
                  <span className="all-cat-name">{col.name}</span>
                  <span className="all-cat-count">{col.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Client-side Niche Finder (no hidden noindex links dumped in SSR HTML) */}
        <section style={{ marginTop: "var(--space-8)" }}>
          <div className="section-header all-cats-header">
            <div className="section-title-group">
              <Search className="section-icon" size={22} />
              <h2 className="section-title">Find Niche Topics</h2>
            </div>
          </div>
          <p style={{ color: "var(--color-muted)", marginBottom: "0.75rem", fontSize: "0.92rem" }}>
            Type a niche keyword below to search {ALL_CATEGORIES.length}+ streaming tags across the live feed.
          </p>
          <input
            type="search"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            placeholder="Filter niche topics (e.g., redhead, cosplay, compilation)..."
            aria-label="Filter niche topics"
            style={{
              width: "100%",
              maxWidth: "460px",
              padding: "0.65rem 0.9rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-primary)",
              fontSize: "0.95rem",
              marginBottom: "1rem",
            }}
          />
          {matchingTopics.length > 0 && (
            <div className="all-cats-list">
              {matchingTopics.map((cat) => (
                <Link
                  href={`/search?query=${encodeURIComponent(cat.name.toLowerCase())}`}
                  key={cat.name}
                  prefetch={false}
                  rel="nofollow"
                  className="all-cat-item"
                >
                  <span className="all-cat-name">{cat.name}</span>
                  <span className="all-cat-count">{cat.count}</span>
                </Link>
              ))}
            </div>
          )}
          {topicFilter.trim() && matchingTopics.length === 0 && (
            <div className="no-cats-msg">
              No topic matched &quot;{topicFilter.trim()}&quot;.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoriesClient;
