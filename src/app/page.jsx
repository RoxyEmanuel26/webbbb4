import Link from "next/link";
import { Award, Film, Globe, Sparkles, Star } from "lucide-react";
import SearchResultsShared from "@/components/SearchResultsShared";
import VideoCard from "@/components/VideoCard";
import JsonLd from "@/components/JsonLd";
import { websiteSchema, organizationSchema, buildCanonicalAlternates } from "@/lib/jsonld";
import "../pages/Pages.css";
import {
  getCatalogVideos,
  getCollections,
  getTrendTags,
  isCollectionIndexable,
  toVideoCard,
} from "@/lib/catalog";
import { getTagHubHref } from "@/lib/hubs";
import { PORNSTARS } from "@/data/pornstars";

const POPULAR_NICHES = [
  { name: "Amateur", slug: "amateur", badge: "US & EU" },
  { name: "European", slug: "european", badge: "EU Hub" },
  { name: "British", slug: "british", badge: "UK Hub" },
  { name: "German", slug: "german", badge: "DE Hub" },
  { name: "French", slug: "french", badge: "FR Hub" },
  { name: "Czech", slug: "czech", badge: "CZ Hub" },
  { name: "MILF", slug: "milf", badge: "Top Rated" },
  { name: "Big Natural Tits", slug: "big-natural-tits", badge: "Trending" },
  { name: "Stepsister", slug: "stepsister", badge: "Popular" },
  { name: "Anal", slug: "anal", badge: "HD" },
  { name: "POV", slug: "pov", badge: "1st Person" },
  { name: "Creampie", slug: "creampie", badge: "Popular" },
  { name: "Japanese", slug: "japanese", badge: "JAV" },
  { name: "Latina", slug: "latina", badge: "HD" },
  { name: "Lesbian", slug: "lesbian", badge: "HD" },
  { name: "Hardcore", slug: "hardcore", badge: "HD" },
];

const FEATURED_GUIDES = [
  { slug: "full-length-hd-movies", label: "Best Full-Length Movies (45m+)" },
  { slug: "top-rated-european-scenes", label: "Best European & British Scenes" },
  { slug: "top-rated-american-pornstars", label: "Top American Pornstars" },
  { slug: "highest-rated-pov-videos", label: "Highest Rated POV Scenes" },
  { slug: "best-milf-stepmom-scenes", label: "Top MILF & Stepmom Scenes" },
  { slug: "best-big-natural-tits", label: "Best Big Natural Tits HD" },
];

const EU_EDITIONS = [
  { code: "DE", label: "Deutsch", href: "/de" },
  { code: "FR", label: "Français", href: "/fr" },
  { code: "ES", label: "Español", href: "/es" },
  { code: "IT", label: "Italiano", href: "/it" },
];

function getLatestHomepageVideos(limit = 36) {
  return getCatalogVideos()
    .filter(
      (video) =>
        video.availability === "available" &&
        video.canonicalUrl &&
        video.thumbnail &&
        video.title?.length >= 10 &&
        !/^(?:sku\b|untitled$|hidden$|video$)/i.test(video.title) &&
        !/[\uFFFD\u0080-\u009F]/.test(video.title)
    )
    .sort(
      (left, right) =>
        Date.parse(right.uploadDate || 0) - Date.parse(left.uploadDate || 0) ||
        (Number(right.discoveryScore) || 0) - (Number(left.discoveryScore) || 0) ||
        left.id.localeCompare(right.id)
    )
    .slice(0, limit)
    .map((video) => toVideoCard(video, { maxTags: 2 }));
}

function getHomepageTrendingLinks(limit = 12) {
  const resolved = [];
  const seenHrefs = new Set();
  for (const tag of getTrendTags(36)) {
    const href = getTagHubHref(tag);
    if (!href || seenHrefs.has(href)) continue;
    seenHrefs.add(href);
    resolved.push({ label: tag, href });
    if (resolved.length >= limit) break;
  }
  return resolved;
}

function getHomepagePicks(excludeIds = new Set()) {
  return getCatalogVideos()
    .filter(
      (video) =>
        video.availability === "available" &&
        video.canonicalUrl &&
        video.thumbnail &&
        !excludeIds.has(video.id) &&
        video.title?.length >= 14 &&
        !/^(?:sku\b|untitled$|hidden$|video$)/i.test(video.title) &&
        !/[\uFFFD\u0080-\u009F]/.test(video.title)
    )
    .sort(
      (left, right) =>
        (Number(right.discoveryScore) || 0) - (Number(left.discoveryScore) || 0) ||
        (Number(right.views) || 0) - (Number(left.views) || 0) ||
        left.id.localeCompare(right.id)
    )
    .slice(0, 16)
    .map((video) => toVideoCard(video, { maxTags: 2 }));
}

export function generateMetadata() {
  const seoTitle = "Free HD Adult Videos, European & US Performers | NICEVX";
  const seoDesc =
    "Watch free HD adult videos, full-length movies, European & American categories, and top performer scenes with instant storyboard previews on NICEVX.";
  const seoCanonical = "https://www.nicevx.com/";

  return {
    title: seoTitle,
    description: seoDesc,
    robots: "index, follow",
    alternates: {
      ...buildCanonicalAlternates(seoCanonical),
      languages: {
        "en-US": "https://www.nicevx.com/",
        "en-GB": "https://www.nicevx.com/",
        en: "https://www.nicevx.com/",
        de: "https://www.nicevx.com/de",
        fr: "https://www.nicevx.com/fr",
        es: "https://www.nicevx.com/es",
        it: "https://www.nicevx.com/it",
        "x-default": "https://www.nicevx.com/",
      },
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: seoCanonical,
      type: "website",
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "NICEVX" }],
    },
    twitter: {
      title: seoTitle,
      description: seoDesc,
      images: ["/og-default.jpg"],
    },
  };
}

export default function Home() {
  const totalVideos = getCatalogVideos().length;
  const latestFeed = getLatestHomepageVideos(36);
  const latestIds = new Set(latestFeed.map((v) => v.id));
  const picks = getHomepagePicks(latestIds);
  const trendingHubs = getHomepageTrendingLinks(12);
  const collections = getCollections()
    .filter((collection) => isCollectionIndexable(collection, collection.videos))
    .slice(0, 8);

  return (
    <div className="home-page">
      <JsonLd data={[websiteSchema(), organizationSchema()]} />

      {/* 1. Above-the-Fold Compact Cinema Command Header (Primary H1) */}
      <section className="home-command-hero" aria-labelledby="home-title">
        <div className="page-wrapper home-command-inner">
          <div className="home-command-copy">
            <h1 id="home-title" className="home-command-title">
              Free HD Adult Videos, Ranked &amp; Organized Daily
            </h1>
            <p className="home-command-sub">
              {totalVideos.toLocaleString()}+ hand-indexed scenes, 45 US &amp; European star filmographies, and instant storyboard previews.
            </p>
          </div>
          <div className="home-command-actions">
            <Link href="/best" className="home-cmd-pill is-accent">
              <Award size={14} aria-hidden="true" />
              Top Ranked Guides
            </Link>
            <Link href="/movies" className="home-cmd-pill">
              <Film size={14} aria-hidden="true" />
              Full Movies 45m+
            </Link>
            <Link href="/pornstars" className="home-cmd-pill">
              <Star size={14} aria-hidden="true" />
              45 Stars A–Z
            </Link>
            <div className="home-eu-editions" aria-label="European language editions">
              <Globe size={13} aria-hidden="true" />
              {EU_EDITIONS.map((ed) => (
                <Link key={ed.code} href={ed.href} className="home-eu-link" hrefLang={ed.code.toLowerCase()}>
                  {ed.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Immediate Video Feed Above-the-Fold */}
      <SearchResultsShared
        query="all"
        pageTitle="Latest HD Additions"
        headingLevel="h2"
        initialVideos={latestFeed}
        perPage={24}
        trendTags={trendingHubs}
      />

      {/* 3. Asymmetric US & EU Discovery Bento */}
      <div className="page-wrapper">
        <section className="home-discovery-bridge" aria-labelledby="mid-discovery-title">
          <div className="home-niche-header">
            <h2 id="mid-discovery-title" className="home-niche-title">
              Explore US &amp; European Categories
            </h2>
            <Link href="/cats" className="home-niche-see-all">
              All categories &rarr;
            </Link>
          </div>
          <div className="home-niche-grid">
            {POPULAR_NICHES.map((niche) => (
              <Link
                key={niche.slug}
                href={`/cat/${niche.slug}`}
                className="home-niche-card"
              >
                <span className="home-niche-name">{niche.name}</span>
                <span className="home-niche-count">{niche.badge}</span>
              </Link>
            ))}
          </div>

          {/* Editorial Best-Of Guides */}
          <div className="home-discovery-collections" style={{ marginTop: "1.25rem" }}>
            <div className="home-discovery-collections-header">
              <span className="home-discovery-collections-title">
                <Award size={14} aria-hidden="true" /> Editorial Top-Ranked Guides
              </span>
              <Link href="/best" className="home-niche-see-all">
                All 12 guides &rarr;
              </Link>
            </div>
            <nav className="home-discovery-pills" aria-label="Editorial guides">
              {FEATURED_GUIDES.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/best/${guide.slug}`}
                  className="home-discovery-pill"
                >
                  {guide.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Featured Topic Collections */}
          {collections.length > 0 && (
            <div className="home-discovery-collections" style={{ marginTop: "1.1rem" }}>
              <div className="home-discovery-collections-header">
                <span className="home-discovery-collections-title">
                  <Sparkles size={14} aria-hidden="true" /> Specialized Topic Collections
                </span>
                <Link href="/collections" className="home-niche-see-all">
                  All collections &rarr;
                </Link>
              </div>
              <nav className="home-discovery-pills" aria-label="Featured collections">
                {collections.map((collection) => (
                  <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    className="home-discovery-pill"
                  >
                    {collection.name}
                  </Link>
                ))}
                <Link href="/collections" className="home-discovery-pill view-all">
                  All collections &rarr;
                </Link>
              </nav>
            </div>
          )}

          {/* Featured US & European Performers with Portraits */}
          <div className="home-discovery-collections" style={{ marginTop: "1.25rem" }}>
            <div className="home-discovery-collections-header">
              <span className="home-discovery-collections-title">
                <Star size={14} aria-hidden="true" /> Top US &amp; European Performers
              </span>
              <Link href="/pornstars" className="home-niche-see-all">
                All 45 stars &rarr;
              </Link>
            </div>
            <div className="home-stars-strip">
              {PORNSTARS.slice(0, 10).map((star) => (
                <Link
                  key={star.slug}
                  href={`/pornstar/${star.slug}`}
                  className="home-star-tile"
                >
                  <img
                    src={star.photo}
                    alt={star.name}
                    width="56"
                    height="56"
                    loading="lazy"
                    className="home-star-avatar"
                  />
                  <span className="home-star-name">{star.name}</span>
                  <span className="home-star-nat">{star.nationality}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 4. Top-Rated Catalog Highlights */}
      <section className="page-wrapper content-area" aria-labelledby="popular-picks-title">
        <div className="section-header">
          <div className="section-title-group">
            <h2 id="popular-picks-title" className="section-title">
              Highest Rated Catalog Picks
            </h2>
          </div>
          <Link href="/trends/weekly" className="home-niche-see-all">
            Trending this week &rarr;
          </Link>
        </div>
        <div className="video-grid home-picks-grid">
          {picks.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
}
