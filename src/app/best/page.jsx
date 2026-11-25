import Link from "next/link";
import { Award } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbListSchema,
  buildCanonicalAlternates,
  faqPageSchema,
} from "@/lib/jsonld";
import { getCatalogVideos } from "@/lib/catalog";
import { BEST_GUIDES, getVideosForBestGuide } from "@/data/bestGuides";
import "../../pages/Pages.css";

export const metadata = {
  title: "Best HD Adult Video Guides & Top Rankings (US & EU) | NICEVX",
  description:
    "Explore 12 curated editorial rankings of the best full-length HD movies, European & British amateur scenes, American pornstars, POV, MILF, and more on NICEVX.",
  alternates: buildCanonicalAlternates("https://www.nicevx.com/best"),
  robots: { index: true, follow: true },
  openGraph: {
    title: "Best HD Adult Video Guides & Top Rankings | NICEVX",
    description:
      "12 curated rankings of full-length HD movies, European scenes, top American stars, POV, MILF, and Big Natural Tits on NICEVX.",
    url: "https://www.nicevx.com/best",
    type: "website",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "NICEVX Top Ranked Guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best HD Adult Video Guides & Top Rankings | NICEVX",
    description:
      "12 curated rankings of full-length HD movies, European scenes, top American stars, POV, MILF, and Big Natural Tits on NICEVX.",
    images: ["/og-default.jpg"],
  },
};

const HUB_FAQS = [
  {
    question: "How are NICEVX Top Ranked Guides compiled?",
    answer:
      "Each guide ranks active HD catalog videos using source approval ratings, measured runtime filters (such as 45+ minute full movies), performer stage-name verification, and view popularity.",
  },
  {
    question: "Are all ranked videos free to stream without an account?",
    answer:
      "Yes. Every video linked inside our 12 editorial rankings streams free in HD with interactive storyboard previews and zero registration.",
  },
];

export default function BestGuidesIndexPage() {
  const catalogVideos = getCatalogVideos();
  const guideCards = BEST_GUIDES.map((guide) => {
    const matched = getVideosForBestGuide(guide, catalogVideos);
    return {
      ...guide,
      count: matched.length,
    };
  });

  const schemas = [
    breadcrumbListSchema([
      { name: "Home", url: "/" },
      { name: "Top Ranked Guides", url: "/best" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Best HD Adult Video Guides & Top Rankings — NICEVX",
      url: "https://www.nicevx.com/best",
      description:
        "Curated editorial rankings of full-length movies, European & US scenes, and top adult niches.",
      numberOfItems: guideCards.length,
    },
    faqPageSchema(HUB_FAQS),
  ];

  return (
    <div className="page-wrapper" style={{ paddingTop: "1.25rem", paddingBottom: "4rem" }}>
      <JsonLd data={schemas} />

      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="current">Top Ranked Guides</span>
      </nav>

      <section className="best-hero" aria-labelledby="best-index-h1">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-accent)", fontSize: "0.78rem", fontWeight: 700, marginBottom: "8px" }}>
          <Award size={15} aria-hidden="true" />
          <span>US &amp; European Discovery Guides</span>
        </div>
        <h1 id="best-index-h1">Best HD Adult Video Guides &amp; Top Rankings</h1>
        <p className="best-lead">
          Skip endless generic lists. Each editorial guide below ranks top-performing HD scenes
          by runtime, viewer approval score, regional specialty, and performer filmography.
        </p>
      </section>

      <div className="best-guides-grid">
        {guideCards.map((guide) => (
          <Link key={guide.slug} href={`/best/${guide.slug}`} className="best-guide-card">
            <span className="best-guide-badge">{guide.badge}</span>
            <h2>{guide.title}</h2>
            <p>{guide.lead}</p>
            <div className="best-guide-meta">
              <span>{guide.count} ranked HD scenes</span>
              <span className="best-guide-cta">Read guide &rarr;</span>
            </div>
          </Link>
        ))}
      </div>

      <section className="best-editorial-article" aria-labelledby="best-hub-faq">
        <h2 id="best-hub-faq">Frequently Asked Questions</h2>
        <div className="best-faq-list">
          {HUB_FAQS.map((faq) => (
            <div key={faq.question} className="best-faq-item">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
