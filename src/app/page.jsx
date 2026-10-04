import { Suspense } from "react";
import Link from "next/link";
import SearchResultsShared from "@/components/SearchResultsShared";
import SkeletonGrid from "@/components/SkeletonGrid";
import VideoCard from "@/components/VideoCard";
import "../pages/Pages.css";
import {
  getCatalogVideos,
  getCollections,
  getTrendTags,
  isCollectionIndexable,
  toVideoCard,
} from "@/lib/catalog";

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
  const seoTitle = "NICEVX | Adult Video Collections and New Additions";
  const seoDesc = "Explore popular videos and focused collections. Compare duration and source views, then browse the latest additions.";
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
      images: [{ url: "/favicon.png", width: 512, height: 512, alt: "NICEVX" }],
    },
    twitter: {
      title: seoTitle,
      description: seoDesc,
      images: ["/favicon.png"],
    },
  };
}

export default function Home() {
  const picks = getHomepagePicks();
  const collections = getCollections()
    .filter((collection) => isCollectionIndexable(collection, collection.videos))
    .slice(0, 8);

  return (
    <main className="home-page">
      <section className="page-wrapper content-area" aria-labelledby="home-title">
        <h1 id="home-title" className="section-title">Adult videos</h1>
        <p className="home-intro">Find videos worth watching, then browse the latest additions below.</p>
        <h2 className="section-title">Popular videos</h2>
        <div className="video-grid home-picks-grid">
          {picks.map((video, index) => (
            <VideoCard key={video.id} video={video} priority={index < 4} />
          ))}
        </div>
        {collections.length > 0 && (
          <nav className="home-collection-links" aria-label="Browse collections">
            <h2 className="section-title">Browse collections</h2>
            <div>
              {collections.map((collection) => (
                <Link key={collection.slug} href={`/collections/${collection.slug}`}>
                  {collection.name}
                </Link>
              ))}
              <Link href="/collections">All collections</Link>
            </div>
          </nav>
        )}
      </section>
      <Suspense fallback={<SkeletonGrid />}>
        <SearchResultsShared
          query="all"
          pageTitle="Latest videos"
          headingLevel="h2"
          seoTitle="NICEVX | Adult Video Collections and New Additions"
          seoDesc="Explore popular videos and focused collections. Compare duration and source views, then browse the latest additions."
          seoCanonical="https://www.nicevx.com/"
          seoQuery="Videos"
          trendTags={getTrendTags(10)}
        />
      </Suspense>
    </main>
  );
}
