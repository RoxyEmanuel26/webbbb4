import Link from "next/link";
import { notFound } from "next/navigation";
import { Award } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbListSchema,
  buildCanonicalAlternates,
  faqPageSchema,
  itemListSchema,
} from "@/lib/jsonld";
import { getCatalogVideos, toVideoCard } from "@/lib/catalog";
import { isCategoryIndexable } from "@/lib/hubs";
import {
  BEST_GUIDES,
  getBestGuideBySlug,
  getVideosForBestGuide,
} from "@/data/bestGuides";
import "../../../pages/Pages.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return BEST_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getBestGuideBySlug(slug);
  if (!guide) {
    return { title: "Guide Not Found | NICEVX", robots: { index: false, follow: false } };
  }

  const canonical = `https://www.nicevx.com/best/${guide.slug}`;
  return {
    title: guide.seoTitle,
    description: guide.description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: buildCanonicalAlternates(canonical),
    openGraph: {
      title: guide.seoTitle,
      description: guide.description,
      url: canonical,
      type: "article",
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.seoTitle,
      description: guide.description,
      images: ["/og-default.jpg"],
    },
  };
}

export default async function BestGuideDetailPage({ params }) {
  const { slug } = await params;
  const guide = getBestGuideBySlug(slug);
  if (!guide) notFound();

  const matchedVideos = getVideosForBestGuide(guide, getCatalogVideos());
  const topVideos = matchedVideos.slice(0, 24);
  const cards = topVideos.map((v) => toVideoCard(v, { maxTags: 2 }));

  const durations = matchedVideos
    .map((v) => Number(v.durationSeconds) || 0)
    .filter(Boolean)
    .sort((a, b) => a - b);
  const medianSec = durations.length ? durations[Math.floor(durations.length / 2)] : 0;
  const medianMins = medianSec ? Math.max(1, Math.round(medianSec / 60)) : 15;
  const rated = matchedVideos.map((v) => Number(v.rating) || 0).filter((r) => r > 0);
  const avgRating = rated.length
    ? (rated.reduce((sum, r) => sum + r, 0) / rated.length).toFixed(2)
    : "4.40";
  const totalViews = matchedVideos.reduce((sum, v) => sum + (Number(v.views) || 0), 0);
  const compactViews = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(totalViews);

  const relatedCategories = (guide.relatedCategories || []).filter((catSlug) =>
    isCategoryIndexable(catSlug)
  );
  const siblingGuides = BEST_GUIDES.filter((other) => other.slug !== guide.slug).slice(0, 6);

  const canonical = `https://www.nicevx.com/best/${guide.slug}`;
  const schemas = [
    breadcrumbListSchema([
      { name: "Home", url: "/" },
      { name: "Top Ranked Guides", url: "/best" },
      { name: guide.title, url: canonical },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: guide.title,
      description: guide.description,
      url: canonical,
      inLanguage: "en",
    },
    itemListSchema({
      name: guide.title,
      url: `/best/${guide.slug}`,
      items: topVideos,
      maxItems: 24,
    }),
    faqPageSchema(guide.faqs || []),
  ];

  return (
    <div className="page-wrapper" style={{ paddingTop: "1.25rem", paddingBottom: "4rem" }}>
      <JsonLd data={schemas} />

      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/best">Top Ranked Guides</Link>
        <span>/</span>
        <span className="current">{guide.badge}</span>
      </nav>

      <section className="best-hero" aria-labelledby="guide-h1">
        <span className="best-guide-badge" style={{ marginBottom: "10px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <Award size={12} aria-hidden="true" /> {guide.badge}
        </span>
        <h1 id="guide-h1">{guide.title}</h1>
        <p className="best-lead">{guide.lead}</p>

        <dl className="best-stats-strip">
          <div className="best-stat-box">
            <dt>Ranked Scenes</dt>
            <dd>{matchedVideos.length}</dd>
          </div>
          <div className="best-stat-box">
            <dt>Median Runtime</dt>
            <dd>{medianMins} min</dd>
          </div>
          <div className="best-stat-box">
            <dt>Avg Rating</dt>
            <dd>{avgRating} / 5</dd>
          </div>
          <div className="best-stat-box">
            <dt>Combined Views</dt>
            <dd>{compactViews}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="guide-grid-heading">
        <div className="section-header">
          <h2 id="guide-grid-heading" className="section-title">
            Top {cards.length} Ranked HD Scenes
          </h2>
          <Link href="/best" className="home-niche-see-all">
            All 12 guides &rarr;
          </Link>
        </div>
        <div className="video-grid">
          {cards.map((video, idx) => (
            <VideoCard key={video.id} video={video} priority={idx < 4} />
          ))}
        </div>
      </section>

      {/* Deep Editorial Guide Article */}
      <article className="best-editorial-article">
        {guide.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        ))}

        {guide.faqs?.length > 0 && (
          <>
            <h3>Frequently Asked Questions</h3>
            <div className="best-faq-list">
              {guide.faqs.map((faq) => (
                <div key={faq.question} className="best-faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </article>

      {/* Related Categories & Sibling Guides */}
      {relatedCategories.length > 0 && (
        <section className="related-cats" aria-labelledby="guide-related-cats">
          <h2 id="guide-related-cats" className="related-cats-title">
            Explore Related HD Categories
          </h2>
          <div className="related-cats-list">
            {relatedCategories.map((catSlug) => (
              <Link key={catSlug} href={`/cat/${catSlug}`} className="related-cat-link">
                {catSlug.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="related-cats" aria-labelledby="guide-more-rankings">
        <h2 id="guide-more-rankings" className="related-cats-title">
          More Top-Ranked US &amp; EU Guides
        </h2>
        <div className="related-cats-list">
          {siblingGuides.map((other) => (
            <Link key={other.slug} href={`/best/${other.slug}`} className="related-cat-link">
              {other.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
