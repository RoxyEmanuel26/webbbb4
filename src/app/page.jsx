import { Suspense } from "react";
import Link from "next/link";
import SearchResultsShared from "@/components/SearchResultsShared";
import SkeletonGrid from "@/components/SkeletonGrid";
import VideoCard from "@/components/VideoCard";
import JsonLd from "@/components/JsonLd";
import { websiteSchema, organizationSchema } from "@/lib/jsonld";
import "../pages/Pages.css";
import {
  getCatalogVideos,
  getCollections,
  getTrendTags,
  isCollectionIndexable,
  toVideoCard,
} from "@/lib/catalog";

const POPULAR_NICHES = [
  { name: "Japanese", slug: "japanese", count: "10,000+" },
  { name: "Milf", slug: "milf", count: "20,000+" },
  { name: "Anal", slug: "anal", count: "20,000+" },
  { name: "Asian", slug: "asian", count: "15,000+" },
  { name: "Amateur", slug: "amateur", count: "20,000+" },
  { name: "Big Tits", slug: "big-tits", count: "20,000+" },
  { name: "Creampie", slug: "creampie", count: "15,000+" },
  { name: "POV", slug: "pov", count: "12,000+" },
  { name: "Cosplay", slug: "cosplay", count: "5,000+" },
  { name: "Blowjob", slug: "blowjob", count: "20,000+" },
  { name: "Ebony", slug: "ebony", count: "10,000+" },
  { name: "Hardcore", slug: "hardcore", count: "20,000+" },
];

function getHomepagePicks() {
  return getCatalogVideos()
    .filter((video) =>
      video.availability === "available" &&
      video.canonicalUrl &&
      video.thumbnail &&
      video.title?.length >= 14 &&
      !/^(?:sku\b|untitled$|hidden$|video$)/i.test(video.title) &&
      !/[\uFFFD\u0080-\u009F]/.test(video.title),
    )
    .sort((left, right) =>
      (Number(right.discoveryScore) || 0) - (Number(left.discoveryScore) || 0) ||
      (Number(right.views) || 0) - (Number(left.views) || 0) ||
      left.id.localeCompare(right.id),
    )
    .slice(0, 24)
    .map(toVideoCard);
}

export function generateMetadata() {
  const seoTitle = "Free HD Porn Videos & Curated Collections | NICEVX";
  const seoDesc = "Watch free HD adult videos and curated collections on NICEVX. Stream daily updated clips with verified durations, ratings, and smooth playback.";
  const seoCanonical = "https://www.nicevx.com/";

  return {
    title: seoTitle,
    description: seoDesc,
    robots: "index, follow",
    alternates: { canonical: seoCanonical },
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
  const picks = getHomepagePicks();
  const collections = getCollections()
    .filter((collection) => isCollectionIndexable(collection, collection.videos))
    .slice(0, 8);

  return (
    <div className="home-page">
      <JsonLd data={[websiteSchema(), organizationSchema()]} />

      {/* 1. Top Section: Trending Tags & Latest Videos Feed with Sort & Duration Filter */}
      <Suspense fallback={<SkeletonGrid />}>
        <SearchResultsShared
          query="all"
          pageTitle="Latest videos"
          headingLevel="h2"
          seoTitle="Free HD Porn Videos & Curated Collections | NICEVX"
          seoDesc="Watch free HD adult videos and curated collections on NICEVX. Stream high-definition scenes updated daily with verified durations, ratings, and smooth playback."
          seoCanonical="https://www.nicevx.com/"
          seoQuery="Videos"
          trendTags={getTrendTags(10)}
        />
      </Suspense>

      {/* 2. Middle Section (Option 1): Unified Niche & Collections Discovery Bridge */}
      <div className="page-wrapper">
        <section className="home-discovery-bridge" aria-labelledby="mid-discovery-title">
          <div className="home-niche-header">
            <h2 id="mid-discovery-title" className="home-niche-title">
              Explore Popular Categories
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
                <span className="home-niche-count">{niche.count}</span>
              </Link>
            ))}
          </div>

          {collections.length > 0 && (
            <div className="home-discovery-collections">
              <div className="home-discovery-collections-header">
                <span className="home-discovery-collections-title">
                  Featured Topic Collections
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
        </section>
      </div>

      {/* 3. Bottom Section: Curated Daily Picks ("Popular Videos" 24 cards) */}
      <section className="page-wrapper content-area" aria-labelledby="home-title">
        <h1 id="home-title" className="section-title">Free HD adult videos, curated daily</h1>
        <p className="home-intro">Find videos worth watching, compare duration and ratings across our curated catalog.</p>
        <h2 className="section-title">Popular videos</h2>
        <div className="video-grid home-picks-grid">
          {picks.map((video, index) => (
            <VideoCard key={video.id} video={video} priority={index < 4} />
          ))}
        </div>
      </section>
    </div>
  );
}
