import { Suspense } from "react";
import SearchResultsShared from "@/components/SearchResultsShared";
import SkeletonGrid from "@/components/SkeletonGrid";
import "../pages/Pages.css";
import { getTrendTags } from "@/lib/catalog";

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
  return (
    <Suspense fallback={<SkeletonGrid />}>
      <SearchResultsShared
        query="all"
        pageTitle="Adult Videos"
        seoTitle="NICEVX — Adult Videos"
        seoDesc="Browse adult videos, popular categories, and new additions on NICEVX."
        seoCanonical="https://www.nicevx.com/"
        seoQuery="Videos"
        trendTags={getTrendTags(10)}
      />
    </Suspense>
  );
}
