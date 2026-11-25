"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Heart,
  Flame,
  Tag,
  ArrowRight,
  Star,
  Globe,
  Sun,
  Moon,
  Award,
} from "lucide-react";
import { PORNSTARS } from "@/data/pornstars";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Best", path: "/best", icon: Award },
  { label: "Movies", path: "/movies" },
  { label: "Stars", path: "/pornstars" },
  { label: "Categories", path: "/cats" },
  { label: "Saved", path: '/saved', icon: Heart },
];

const EU_LOCALES = [
  { code: "EN", href: "/", label: "English (US/UK)" },
  { code: "DE", href: "/de", label: "Deutsch" },
  { code: "FR", href: "/fr", label: "Français" },
  { code: "ES", href: "/es", label: "Español" },
  { code: "IT", href: "/it", label: "Italiano" },
];

const TRENDING_SUGGESTIONS = [
  { name: "European", slug: "european" },
  { name: "British", slug: "british" },
  { name: "Japanese", slug: "japanese" },
  { name: "MILF", slug: "milf" },
  { name: "Anal", slug: "anal" },
  { name: "Amateur", slug: "amateur" },
  { name: "Big Natural Tits", slug: "big-natural-tits" },
  { name: "Stepsister", slug: "stepsister" },
  { name: "Creampie", slug: "creampie" },
  { name: "POV", slug: "pov" },
  { name: "Latina", slug: "latina" },
  { name: "Lesbian", slug: "lesbian" },
];

const QUICK_CATEGORY_LIST = [
  "Amateur", "Anal", "Asian", "BBW", "BDSM", "Big Ass", "Big Boobs",
  "Big Natural Tits", "Big Tits", "Blonde", "Blowjob", "Bondage",
  "British", "Casting", "Cosplay", "Couple", "Creampie", "Cuckold",
  "Czech", "Deepthroat", "Double Penetration", "Ebony", "European",
  "French", "Gangbang", "German", "Hairy", "Handjob", "Hardcore",
  "Homemade", "Hotwife", "Indian", "Interracial", "Japanese", "Latina",
  "Lesbian", "Lingerie", "Massage", "Masturbation", "Mature", "MILF",
  "Outdoor", "PAWG", "Petite", "POV", "Public", "Redhead", "Rough",
  "Solo", "Squirt", "Stepmom", "Stepsister", "Threesome", "Toys",
  "Vintage", "Webcam",
];

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [activeIndex, setActiveIndex] = useState(-1);

  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchWrapperRef = useRef(null);
  const langWrapperRef = useRef(null);
  const inputRef = useRef(null);

  const trimmedQuery = query.trim();

  const currentLang = useMemo(() => {
    const match = pathname.match(/^\/(de|fr|es|it)(?:\/|$)/);
    return match ? match[1].toUpperCase() : "EN";
  }, [pathname]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nicevx_theme");
      if (saved === "light") setTheme("light");
    } catch (_) {}
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("nicevx_theme", next);
    } catch (_) {}
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const matchingStars = useMemo(() => {
    if (!trimmedQuery) return [];
    const q = trimmedQuery.toLowerCase();
    return PORNSTARS.filter((star) => star.name.toLowerCase().includes(q)).slice(0, 3);
  }, [trimmedQuery]);

  const matchingCategories = useMemo(() => {
    if (!trimmedQuery) return [];
    const q = trimmedQuery.toLowerCase();
    return QUICK_CATEGORY_LIST.filter((name) => name.toLowerCase().includes(q)).slice(0, 5);
  }, [trimmedQuery]);

  const totalItems = matchingStars.length + matchingCategories.length + (trimmedQuery ? 1 : 0);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
      if (langWrapperRef.current && !langWrapperRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setLangOpen(false);
    setActiveIndex(-1);
  }, [pathname]);

  const navigateTo = (href) => {
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery("");
    if (inputRef.current) inputRef.current.blur();
    router.push(href);
  };

  const navigateToSearch = (searchTerm) => {
    const term = searchTerm.trim();
    if (!term) return;
    navigateTo(`/search?query=${encodeURIComponent(term)}`);
  };

  const navigateToCategory = (catName) => {
    const slug = catName.toLowerCase().replace(/\s+/g, "-");
    navigateTo(`/cat/${slug}`);
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (activeIndex >= 0 && activeIndex < matchingStars.length) {
      navigateTo(`/pornstar/${matchingStars[activeIndex].slug}`);
      return;
    }
    const catIdx = activeIndex - matchingStars.length;
    if (catIdx >= 0 && catIdx < matchingCategories.length) {
      navigateToCategory(matchingCategories[catIdx]);
      return;
    }
    if (trimmedQuery) {
      navigateToSearch(trimmedQuery);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <header className="navbar-root" role="banner">
      <div className="page-wrapper navbar-inner">
        {/* Brand */}
        <Link href="/" className="navbar-brand" aria-label="NICEVX Home" prefetch={false}>
          <div className="brand-logo-mark">
            <img
              src="/logo.webp"
              alt="NICEVX"
              width="32"
              height="32"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
          <div className="brand-text">
            <span className="brand-text-nice">NICE</span>
            <span className="brand-text-vx">VX</span>
          </div>
        </Link>

        {/* Primary Desktop Nav */}
        <nav className="navbar-links" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                className={`navbar-link ${isActive(link.path) ? "is-active" : ""}`}
                href={link.path}
                prefetch={false}
                rel={link.path === "/saved" ? "nofollow" : undefined}
              >
                {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Search + Locale + Theme Controls */}
        <div className="navbar-controls">
          <div className="navbar-search-wrapper" ref={searchWrapperRef}>
            <form
              className={`navbar-search ${isOpen ? "is-focused" : ""}`}
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <Search size={15} className="search-ico" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                placeholder="Search stars, niches..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                  setActiveIndex(-1);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                aria-label="Search videos and performers"
              />
              <button type="submit" className="search-submit-btn" aria-label="Submit search">
                Go
              </button>
            </form>

            {isOpen && (
              <div className="navbar-autosuggest" role="listbox">
                {trimmedQuery.length === 0 ? (
                  <div className="autosuggest-trending">
                    <div className="autosuggest-header">
                      <Flame size={13} className="autosuggest-header-icon" />
                      <span>Popular US &amp; EU Niches</span>
                    </div>
                    <div className="autosuggest-tags-grid">
                      {TRENDING_SUGGESTIONS.map((item) => (
                        <button
                          key={item.slug}
                          type="button"
                          className="autosuggest-tag-chip"
                          onClick={() => navigateTo(`/cat/${item.slug}`)}
                        >
                          <Tag size={11} aria-hidden="true" />
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="autosuggest-matches">
                    {matchingStars.length > 0 && (
                      <>
                        <div className="autosuggest-header">
                          <Star size={13} className="autosuggest-header-icon" />
                          <span>Performers</span>
                        </div>
                        {matchingStars.map((star, idx) => (
                          <button
                            key={star.slug}
                            type="button"
                            className={`autosuggest-item ${activeIndex === idx ? "is-active" : ""}`}
                            onClick={() => navigateTo(`/pornstar/${star.slug}`)}
                          >
                            <span className="autosuggest-cat-name">{star.name}</span>
                            <span className="autosuggest-cat-count">{star.nationality}</span>
                          </button>
                        ))}
                      </>
                    )}
                    {matchingCategories.length > 0 && (
                      <>
                        <div className="autosuggest-header">
                          <Tag size={13} className="autosuggest-header-icon" />
                          <span>Categories</span>
                        </div>
                        {matchingCategories.map((catName, idx) => {
                          const flatIdx = matchingStars.length + idx;
                          return (
                            <button
                              key={catName}
                              type="button"
                              className={`autosuggest-item ${activeIndex === flatIdx ? "is-active" : ""}`}
                              onClick={() => navigateToCategory(catName)}
                            >
                              <span className="autosuggest-cat-name">{catName}</span>
                              <span className="autosuggest-cat-count">HD Hub</span>
                            </button>
                          );
                        })}
                      </>
                    )}
                    <button
                      type="button"
                      className={`autosuggest-item autosuggest-see-all ${
                        activeIndex === matchingStars.length + matchingCategories.length ? "is-active" : ""
                      }`}
                      onClick={() => navigateToSearch(trimmedQuery)}
                    >
                      <span>
                        Search all videos for &quot;<strong>{trimmedQuery}</strong>&quot;
                      </span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Locale Switcher (US/UK + EU Languages) */}
          <div className="navbar-lang-wrap" ref={langWrapperRef}>
            <button
              type="button"
              className="navbar-icon-pill"
              onClick={() => setLangOpen((o) => !o)}
              aria-expanded={langOpen}
              aria-label="Switch language edition"
              title="International Editions"
            >
              <Globe size={14} aria-hidden="true" />
              <span>{currentLang}</span>
            </button>
            {langOpen && (
              <div className="navbar-lang-menu" role="menu">
                {EU_LOCALES.map((loc) => (
                  <Link
                    key={loc.code}
                    href={loc.href}
                    prefetch={false}
                    className={`navbar-lang-option ${currentLang === loc.code ? "is-active" : ""}`}
                    onClick={() => setLangOpen(false)}
                  >
                    <span className="lang-code">{loc.code}</span>
                    <span>{loc.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            className="navbar-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
