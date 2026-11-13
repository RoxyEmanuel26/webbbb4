import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import JsonLd from "@/components/JsonLd";
import { breadcrumbListSchema, itemListSchema } from "@/lib/jsonld";
import { getCatalogVideos, toVideoCard } from "@/lib/catalog";
import "../../../pages/Pages.css";

export async function generateMetadata() {
  const hasEvidence = getCatalogVideos().some((video) =>
    Number.isFinite(video.viewGrowth7d),
  );
  const title = "Trending Adult Videos This Week — Fastest Rising | NICEVX";
  const description =
    "Watch the fastest rising HD adult videos on NICEVX this week. Compare top-viewed clips, duration, and ratings across trending categories.";
  return {
    title,
    description,
    alternates: { canonical: "https://www.nicevx.com/trends/weekly" },
    robots: { index: hasEvidence, follow: true },
    openGraph: {
      title,
      description,
      url: "https://www.nicevx.com/trends/weekly",
      type: "website",
      images: [{ url: "/favicon.png", width: 512, height: 512, alt: "Trending This Week — NICEVX" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/favicon.png"],
    },
  };
}

export default function WeeklyTrendsPage() {
  const rising = getCatalogVideos()
    .filter(
      (video) => Number.isFinite(video.viewGrowth7d) && video.viewGrowth7d > 0,
    )
    .sort((a, b) => b.viewGrowth7d - a.viewGrowth7d)
    .slice(0, 36);

  const jsonLdData = [
    breadcrumbListSchema([
      { name: "Home", url: "/" },
      { name: "Trending This Week", url: "/trends/weekly" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Trending Adult Videos This Week — NICEVX",
      url: "https://www.nicevx.com/trends/weekly",
      description:
        "Fastest rising HD adult videos on NICEVX this week ranked by 7-day view momentum.",
    },
  ];
  if (rising.length > 0) {
    jsonLdData.push(
      itemListSchema({
        name: "Trending Videos This Week",
        url: "/trends/weekly",
        items: rising,
        maxItems: 36,
      }),
    );
  }

  return (
    <div className="page-wrapper" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
      <JsonLd data={jsonLdData} />
      <nav
        className="breadcrumb-nav"
        aria-label="Breadcrumb"
        style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "var(--color-muted)" }}
      >
        <Link href="/" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
          Home
        </Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <span style={{ color: "var(--color-text)" }}>Trending This Week</span>
      </nav>
      <h1>Trending This Week</h1>
      <p className="collection-lead">
        See which HD videos are gaining the most views right now across NICEVX, ranked by 7-day
        momentum and popularity.
      </p>
      {rising.length ? (
        <div className="video-grid">
          {rising.map((video) => (
            <VideoCard key={video.id} video={toVideoCard(video)} />
          ))}
        </div>
      ) : (
        <div className="empty-block">
          <p>Weekly trends will appear when there is enough recent activity.</p>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "2rem" }}>
        <Link href="/cats" className="related-cat-link">
          All Categories A-Z
        </Link>
        <Link href="/collections" className="related-cat-link">
          Topic Collections
        </Link>
        <Link href="/movies" className="related-cat-link">
          Full-Length Movies (25+ min)
        </Link>
        <Link href="/pornstars" className="related-cat-link">
          Popular Pornstars
        </Link>
      </div>
    </div>
  );
}
