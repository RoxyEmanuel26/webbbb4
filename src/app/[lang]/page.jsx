import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, Layers, Star, Award } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import JsonLd from "@/components/JsonLd";
import { breadcrumbListSchema, faqPageSchema, itemListSchema } from "@/lib/jsonld";
import { getCatalogVideos, toVideoCard } from "@/lib/catalog";
import { isCategoryIndexable, getCategoryVideos } from "@/lib/hubs";
import { PORNSTARS } from "@/data/pornstars";
import {
  EU_LANGS,
  EU_LOCALIZED_CATEGORY_SLUGS,
  LANG_CONFIG,
  buildMultilingualHomeAlternates,
  getLocalizedCategoryLabel,
} from "@/lib/i18n";
import "../../pages/Pages.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return EU_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const cfg = LANG_CONFIG[lang];
  if (!cfg) return { title: "Not Found | NICEVX", robots: { index: false, follow: false } };

  return {
    title: cfg.homeTitle,
    description: cfg.homeDesc,
    robots: { index: true, follow: true },
    alternates: buildMultilingualHomeAlternates(lang),
    openGraph: {
      title: cfg.homeTitle,
      description: cfg.homeDesc,
      url: `https://www.nicevx.com/${lang}`,
      type: "website",
      locale: cfg.ogLocale,
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: cfg.homeTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: cfg.homeTitle,
      description: cfg.homeDesc,
      images: ["/og-default.jpg"],
    },
  };
}

export default async function LocalizedHomePage({ params }) {
  const { lang } = await params;
  const cfg = LANG_CONFIG[lang];
  if (!cfg) notFound();

  const allVideos = getCatalogVideos().filter((v) => v.availability === "available");
  const prioritySet = new Set(cfg.prioritySignals || []);

  const rankedVideos = [...allVideos]
    .sort((a, b) => {
      const aBoost = [a.category, ...(a.tags || [])].some((t) =>
        prioritySet.has(String(t || "").toLowerCase())
      )
        ? 1
        : 0;
      const bBoost = [b.category, ...(b.tags || [])].some((t) =>
        prioritySet.has(String(t || "").toLowerCase())
      )
        ? 1
        : 0;
      return (
        bBoost - aBoost ||
        (Number(b.discoveryScore) || 0) - (Number(a.discoveryScore) || 0) ||
        (Number(b.views) || 0) - (Number(a.views) || 0)
      );
    })
    .slice(0, 36);

  const cards = rankedVideos.map((v) => toVideoCard(v, { maxTags: 2 }));

  const localizedCategories = EU_LOCALIZED_CATEGORY_SLUGS.filter((slug) =>
    isCategoryIndexable(slug)
  ).map((slug) => ({
    slug,
    label: getLocalizedCategoryLabel(slug, lang),
    count: getCategoryVideos(slug).length,
  }));

  const faqs = cfg.homeFaqs(allVideos.length);
  const schemas = [
    breadcrumbListSchema([
      { name: "NICEVX", url: "/" },
      { name: cfg.nativeName, url: `/${lang}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: cfg.homeH1,
      description: cfg.homeDesc,
      url: `https://www.nicevx.com/${lang}`,
      inLanguage: cfg.hreflang,
    },
    itemListSchema({
      name: cfg.latestHeading,
      url: `/${lang}`,
      items: rankedVideos,
      maxItems: 24,
    }),
    faqPageSchema(faqs),
  ];

  return (
    <div className="page-wrapper" style={{ paddingBottom: "4rem" }}>
      <JsonLd data={schemas} />

      <section className="eu-hub-hero" aria-labelledby="eu-home-h1">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--color-accent)", fontSize: "0.78rem", fontWeight: 700 }}>
          <Globe size={14} aria-hidden="true" />
          <span>{cfg.regionLabel}</span>
        </div>
        <h1 id="eu-home-h1">{cfg.homeH1}</h1>
        <p className="eu-hub-lead">{cfg.homeSub}</p>

        <div className="home-command-actions" style={{ marginTop: "14px" }}>
          <Link href="/" className="home-cmd-pill" hrefLang="en">
            English (US / UK)
          </Link>
          {EU_LANGS.filter((code) => code !== lang).map((code) => (
            <Link key={code} href={`/${code}`} className="home-cmd-pill" hrefLang={code}>
              {LANG_CONFIG[code].nativeName}
            </Link>
          ))}
          <Link href="/best" className="home-cmd-pill is-accent">
            <Award size={14} aria-hidden="true" />
            {cfg.allEnglishLabel}
          </Link>
        </div>
      </section>

      {/* Localized Categories Grid */}
      <section style={{ marginBottom: "2.25rem" }} aria-labelledby="eu-cats-title">
        <div className="section-header">
          <div className="section-title-group">
            <Layers size={20} style={{ color: "var(--color-accent)" }} aria-hidden="true" />
            <h2 id="eu-cats-title" className="section-title">
              {cfg.categoriesHeading}
            </h2>
          </div>
          <Link href="/cats" className="home-niche-see-all">
            {cfg.categoriesNavLabel} &rarr;
          </Link>
        </div>
        <div className="home-niche-grid">
          {localizedCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${lang}/cat/${cat.slug}`}
              className="home-niche-card"
            >
              <span className="home-niche-name">{cat.label}</span>
              <span className="home-niche-count">
                {cat.count} {cfg.videosLabel}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Curated HD Videos Feed */}
      <section style={{ marginBottom: "2.5rem" }} aria-labelledby="eu-videos-title">
        <div className="section-header">
          <h2 id="eu-videos-title" className="section-title">
            {cfg.latestHeading}
          </h2>
          <span className="section-count">{allVideos.length.toLocaleString()} {cfg.videosLabel}</span>
        </div>
        <div className="video-grid">
          {cards.map((video, idx) => (
            <VideoCard key={video.id} video={video} priority={idx < 4} />
          ))}
        </div>
      </section>

      {/* Top Performers */}
      <section style={{ marginBottom: "2.5rem" }} aria-labelledby="eu-stars-title">
        <div className="section-header">
          <div className="section-title-group">
            <Star size={18} style={{ color: "var(--color-accent)" }} aria-hidden="true" />
            <h2 id="eu-stars-title" className="section-title">
              {cfg.starsHeading}
            </h2>
          </div>
          <Link href="/pornstars" className="home-niche-see-all">
            45 Stars A–Z &rarr;
          </Link>
        </div>
        <div className="home-stars-strip">
          {PORNSTARS.slice(0, 10).map((star) => (
            <Link key={star.slug} href={`/pornstar/${star.slug}`} className="home-star-tile">
              <img
                src={star.photo}
                alt={star.name}
                width="56"
                height="56"
                loading="lazy"
                className="home-star-avatar"
              />
              <span className="home-star-name">{star.name}</span>
              <span className="home-star-nat">{star.nationality}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Localized FAQ */}
      <section className="best-editorial-article" aria-labelledby="eu-faq-title">
        <h2 id="eu-faq-title">{cfg.faqHeading}</h2>
        <div className="best-faq-list">
          {faqs.map((item) => (
            <div key={item.question} className="best-faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
