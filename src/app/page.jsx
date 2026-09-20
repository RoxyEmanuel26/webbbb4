import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import SkeletonGrid from "@/components/SkeletonGrid";
import "../pages/Pages.css";
import { getCatalogVideos, getTrendTags } from "@/lib/catalog";

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
  return (
    <Suspense fallback={<SkeletonGrid />}>
      <HomeClient initialVideos={catalog} initialTrendTags={getTrendTags(10)} />
    </Suspense>
  );
}
