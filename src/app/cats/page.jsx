import React from "react";
import CategoriesClient from "./CategoriesClient";
import JsonLd from "@/components/JsonLd";
import { faqPageSchema } from "@/lib/jsonld";

export const metadata = {
  title: "Browse Adult Video Categories A-Z | NICEVX",
  description:
    "Explore hundreds of verified adult video categories on NICEVX. Stream free high-definition clips and curated collections indexed from A to Z.",
  alternates: {
    canonical: "https://www.nicevx.com/cats",
  },
  openGraph: {
    title: "Browse Adult Video Categories A-Z | NICEVX",
    description:
      "Explore hundreds of verified adult video categories on NICEVX. Stream free high-definition clips and curated collections indexed from A to Z.",
    url: "https://www.nicevx.com/cats",
    type: "website",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "Adult Video Categories — NICEVX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Adult Video Categories A-Z | NICEVX",
    description:
      "Explore hundreds of verified adult video categories on NICEVX. Stream free high-definition clips and curated collections indexed from A to Z.",
    images: ["/favicon.png"],
  },
};

export default function CategoriesPage() {
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
      question: "How many video categories are indexed on NICEVX?",
      answer:
        "NICEVX indexes hundreds of adult video categories from A to Z, allowing visitors to browse popular niches, jump directly by starting letter, or filter categories in real time.",
    },
    {
      question: "What is the canonical URL for the NICEVX categories directory?",
      answer:
        "The canonical URL for the A-Z categories directory is https://www.nicevx.com/cats (without a trailing slash).",
    },
  ];

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Video Categories A-Z — NICEVX",
      description:
        "Explore hundreds of verified adult video categories on NICEVX. Stream free high-definition clips and curated collections indexed from A to Z.",
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
      <CategoriesClient />
    </>
  );
}
