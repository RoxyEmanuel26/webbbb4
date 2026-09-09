import React from "react";
import CategoriesClient from "./CategoriesClient";

export const metadata = {
  title: "Video Categories — NICEVX",
  description:
    "Browse adult video categories on NICEVX and find something that matches your interests.",
  alternates: {
    canonical: "https://www.nicevx.com/cats",
  },
  openGraph: {
    title: "Video Categories — NICEVX",
    description: "Browse adult video categories on NICEVX.",
    url: "https://www.nicevx.com/cats",
    type: "website",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "Video Categories — NICEVX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Categories — NICEVX",
    description: "Browse adult video categories on NICEVX.",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Video Categories — NICEVX",
              description: "Browse adult video categories on NICEVX.",
              url: "https://www.nicevx.com/cats",
            },
            breadcrumbsSchema,
          ]),
        }}
      />
      <CategoriesClient />
    </>
  );
}
