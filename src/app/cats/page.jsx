import React from "react";
import CategoriesClient from "./CategoriesClient";
import JsonLd from "@/components/JsonLd";
import { faqPageSchema } from "@/lib/jsonld";
import { getCategoryHubs } from "@/lib/hubs";
import { getCollections, isCollectionIndexable } from "@/lib/catalog";

export const metadata = {
  title: "Browse Adult Video Categories & Genres | NICEVX",
  description:
    "Explore populated adult video categories and curated topic collections on NICEVX. Filter by niche, compare scene counts, and stream free HD clips.",
  alternates: {
    canonical: "https://www.nicevx.com/cats",
  },
  openGraph: {
    title: "Browse Adult Video Categories & Genres | NICEVX",
    description:
      "Explore populated adult video categories and curated topic collections on NICEVX. Filter by niche, compare scene counts, and stream free HD clips.",
    url: "https://www.nicevx.com/cats",
    type: "website",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Adult Video Categories — NICEVX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Adult Video Categories & Genres | NICEVX",
    description:
      "Explore populated adult video categories and curated topic collections on NICEVX. Filter by niche, compare scene counts, and stream free HD clips.",
    images: ["/og-default.jpg"],
  },
};

export default function CategoriesPage() {
  const activeCategories = getCategoryHubs().map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    count: cat.count,
    medianMinutes: cat.stats?.medianDurationSeconds
      ? Math.max(1, Math.round(cat.stats.medianDurationSeconds / 60))
      : null,
  }));

  const featuredCollections = getCollections()
    .filter((collection) => isCollectionIndexable(collection, collection.videos))
    .map((collection) => ({
      slug: collection.slug,
      name: collection.name,
      count: collection.videos.length,
    }));

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.nicevx.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: "https://www.nicevx.com/cats",
      },
    ],
  };

  const catsFaqs = [
    {
      question: "How are NICEVX categories organized?",
      answer: `NICEVX groups ${activeCategories.length} active genre categories alongside ${featuredCollections.length} specialized thematic collections, displaying live catalog scene counts and typical durations so visitors can pick focused niches fast.`,
    },
    {
      question: "Can I search niche topics outside the featured genres?",
      answer:
        "Yes. Use the built-in topic finder on this page or the sitewide search bar to locate hundreds of niche adult tags across the upstream streaming archive.",
    },
  ];

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Video Categories & Genres — NICEVX",
      description:
        "Explore populated adult video categories and curated topic collections on NICEVX.",
      url: "https://www.nicevx.com/cats",
      isPartOf: {
        "@type": "WebSite",
        name: "NICEVX",
        url: "https://www.nicevx.com",
      },
    },
    breadcrumbsSchema,
    faqPageSchema(catsFaqs),
  ];

  return (
    <>
      <JsonLd data={schema} />
      <CategoriesClient
        activeCategories={activeCategories}
        featuredCollections={featuredCollections}
      />
    </>
  );
}
