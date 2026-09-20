import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import SkeletonGrid from "@/components/SkeletonGrid";
import "../pages/Pages.css";
import { getCatalogVideos, getTrendTags, toVideoCard } from "@/lib/catalog";

export function generateMetadata() {
  const currentYear = new Date().getFullYear();
  const seoTitle = `NICEVX — Adult Videos ${currentYear}`;
  const seoDesc = "Browse adult videos, popular categories, and new daily additions on NICEVX.";
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
  const catalog = getCatalogVideos();
  const featured = [];
  const seen = new Set();
  const add = (items) => items.forEach((video) => {
    if (!seen.has(video.id) && featured.length < 180) {
      seen.add(video.id);
      featured.push(video);
    }
  });
  add([...catalog].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 72));
  add([...catalog].sort((a, b) => b.discoveryScore - a.discoveryScore).slice(0, 54));
  add([...catalog].sort((a, b) => b.views - a.views).slice(0, 36));
  add([...catalog].sort((a, b) => b.rating - a.rating || b.views - a.views).slice(0, 36));
  return (
    <Suspense fallback={<SkeletonGrid />}>
      <HomeClient
        initialVideos={featured.map(toVideoCard)}
        totalCatalogCount={catalog.length}
        initialTrendTags={getTrendTags(10)}
      />
    </Suspense>
  );
}
