import Link from "next/link";
import CollectionCover from "@/components/CollectionCover";
import JsonLd from "@/components/JsonLd";
import { getCollectionCover, getCollections } from "@/lib/catalog";
import { breadcrumbListSchema, faqPageSchema } from "@/lib/jsonld";
import "../../pages/Pages.css";

export const metadata = {
  title: "Video Collections & Curated Hubs — NICEVX",
  description:
    "Browse NICEVX video collections by topic and category. Explore HD clips, themed playlists, and top-rated picks organized for fast discovery.",
  alternates: { canonical: "https://www.nicevx.com/collections" },
  openGraph: {
    title: "Video Collections & Curated Hubs — NICEVX",
    description:
      "Browse NICEVX video collections by topic and category. Explore HD clips, themed playlists, and top-rated picks organized for fast discovery.",
    url: "https://www.nicevx.com/collections",
    type: "website",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "Video Collections — NICEVX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Collections & Curated Hubs — NICEVX",
    description:
      "Browse NICEVX video collections by topic and category. Explore HD clips, themed playlists, and top-rated picks organized for fast discovery.",
    images: ["/favicon.png"],
  },
};

const COLLECTIONS_FAQS = [
  {
    question: "How are NICEVX video collections organized?",
    answer:
      "Each collection groups high-definition videos around a dedicated theme, style, or category so visitors can jump directly into focused playlists without sifting through unrelated uploads.",
  },
  {
    question: "Are videos in these collections free to stream?",
    answer:
      "Yes. Every video featured in a NICEVX collection streams free in HD without registration, subscriptions, or paywalls.",
  },
  {
    question: "How can I explore beyond these collections?",
    answer:
      "You can browse the full A-Z Categories index, filter full-length scenes in Full Movies, discover top talent in Pornstars, or check weekly momentum in Trending.",
  },
];

export default function CollectionsPage() {
  const collections = getCollections();
  const totalVideos = collections.reduce(
    (sum, col) => sum + (col.videos ? col.videos.length : 0),
    0
  );

  const jsonLdData = [
    breadcrumbListSchema([
      { name: "Home", url: "/" },
      { name: "Collections", url: "/collections" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "NICEVX Video Collections",
      url: "https://www.nicevx.com/collections",
      description:
        "Browse NICEVX video collections by topic and category for fast HD streaming discovery.",
      numberOfItems: collections.length,
    },
    faqPageSchema(COLLECTIONS_FAQS),
  ];

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
        <span style={{ color: "var(--color-text)" }}>Collections</span>
      </nav>

      <h1>Browse collections</h1>
      <p className="collection-lead" style={{ maxWidth: "740px", marginBottom: "1.5rem" }}>
        Explore {collections.length} themed video collections featuring {totalVideos}+ selected HD
        clips across popular genres. Pick any collection below to preview top-rated entries,
        compare durations, and start watching right away.
      </p>

      <div className="collection-directory">
        {collections.map((collection, index) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="collection-directory-card"
          >
            <CollectionCover
              cover={getCollectionCover(collection)}
              name={collection.name}
              priority={index === 0}
            />
            <div className="collection-directory-content">
              <strong>{collection.name}</strong>
              <span>{collection.videos.length} videos</span>
            </div>
          </Link>
        ))}
      </div>

      <section style={{ marginTop: "3rem", maxWidth: "820px" }}>
        <h2>About NICEVX Topic Collections</h2>
        <p style={{ color: "var(--color-muted)", lineHeight: 1.7 }}>
          Instead of forcing visitors to scroll through unorganized feeds, NICEVX groups standout
          releases into dedicated topic hubs. Each collection highlights consistent visual quality,
          clear duration metadata, and related tags so you can move seamlessly between short clips
          and longer scenes.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginTop: "1rem",
            marginBottom: "2rem",
          }}
        >
          <Link href="/cats" className="related-cat-link">
            Browse A-Z Categories
          </Link>
          <Link href="/movies" className="related-cat-link">
            Full-Length Movies (25+ min)
          </Link>
          <Link href="/pornstars" className="related-cat-link">
            Popular Pornstars
          </Link>
          <Link href="/trends/weekly" className="related-cat-link">
            Trending This Week
          </Link>
        </div>

        <h2>Frequently Asked Questions</h2>
        <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
          {COLLECTIONS_FAQS.map((faq) => (
            <div
              key={faq.question}
              style={{
                padding: "1rem 1.25rem",
                borderRadius: "10px",
                background: "var(--color-surface, rgba(255,255,255,0.03))",
                border: "1px solid var(--color-border, rgba(255,255,255,0.08))",
              }}
            >
              <h3 style={{ fontSize: "1rem", marginBottom: "0.4rem" }}>{faq.question}</h3>
              <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.6 }}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
