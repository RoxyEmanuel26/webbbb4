import Link from "next/link";
import { notFound } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import JsonLd from "@/components/JsonLd";
import { breadcrumbListSchema, faqPageSchema, itemListSchema } from "@/lib/jsonld";
import { toVideoCard } from "@/lib/catalog";
import { getCategoryStats, getCategoryVideos, isCategoryIndexable } from "@/lib/hubs";
import {
  EU_LANGS,
  EU_LOCALIZED_CATEGORY_SLUGS,
  LANG_CONFIG,
  buildMultilingualCategoryAlternates,
  getLocalizedCategoryLabel,
} from "@/lib/i18n";
import "../../../../pages/Pages.css";

export const dynamicParams = false;

export function generateStaticParams() {
  const indexableSlugs = EU_LOCALIZED_CATEGORY_SLUGS.filter((slug) =>
    isCategoryIndexable(slug)
  );
  const params = [];
  for (const lang of EU_LANGS) {
    for (const catName of indexableSlugs) {
      params.push({ lang, catName });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { lang, catName } = await params;
  const cfg = LANG_CONFIG[lang];
  const slug = String(catName || "").toLowerCase();
  if (!cfg || !isCategoryIndexable(slug)) {
    return { title: "Not Found | NICEVX", robots: { index: false, follow: false } };
  }

  const label = getLocalizedCategoryLabel(slug, lang);
  const stats = getCategoryStats(slug);
  const medianMins = stats.medianDurationSeconds
    ? Math.max(1, Math.round(stats.medianDurationSeconds / 60))
    : 12;

  const title = cfg.catTitleTemplate(label);
  const description = cfg.catDescTemplate(label, stats.videoCount, medianMins);

  return {
    title,
    description,
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
    alternates: buildMultilingualCategoryAlternates(slug, lang, true),
    openGraph: {
      title,
      description,
      url: `https://www.nicevx.com/${lang}/cat/${slug}`,
      type: "website",
      locale: cfg.ogLocale,
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.jpg"],
    },
  };
}

export default async function LocalizedCategoryPage({ params }) {
  const { lang, catName } = await params;
  const cfg = LANG_CONFIG[lang];
  const slug = String(catName || "").toLowerCase();
  if (!cfg || !isCategoryIndexable(slug)) notFound();

  const label = getLocalizedCategoryLabel(slug, lang);
  const matchedVideos = [...getCategoryVideos(slug)].sort(
    (a, b) =>
      (Number(b.discoveryScore) || 0) - (Number(a.discoveryScore) || 0) ||
      (Number(b.views) || 0) - (Number(a.views) || 0)
  );
  const cards = matchedVideos.slice(0, 36).map((v) => toVideoCard(v, { maxTags: 2 }));
  const stats = getCategoryStats(slug);
  const medianMins = stats.medianDurationSeconds
    ? Math.max(1, Math.round(stats.medianDurationSeconds / 60))
    : 12;

  const relatedLocalCats = EU_LOCALIZED_CATEGORY_SLUGS.filter(
    (otherSlug) => otherSlug !== slug && isCategoryIndexable(otherSlug)
  )
    .slice(0, 12)
    .map((otherSlug) => ({
      slug: otherSlug,
      label: getLocalizedCategoryLabel(otherSlug, lang),
    }));

  const relatedNames = relatedLocalCats
    .slice(0, 3)
    .map((c) => c.label)
    .join(", ");
  const editorialParagraphs = cfg.catEditorial(label, stats.videoCount, medianMins, relatedNames);
  const faqs = cfg.catFaqs(label, stats.videoCount, medianMins);

  const schemas = [
    breadcrumbListSchema([
      { name: cfg.backHomeLabel, url: `/${lang}` },
      { name: label, url: `/${lang}/cat/${slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: cfg.catH1Template(label),
      description: cfg.catDescTemplate(label, stats.videoCount, medianMins),
      url: `https://www.nicevx.com/${lang}/cat/${slug}`,
      inLanguage: cfg.hreflang,
    },
    itemListSchema({
      name: cfg.catH1Template(label),
      url: `/${lang}/cat/${slug}`,
      items: matchedVideos,
      maxItems: 36,
    }),
    faqPageSchema(faqs),
  ];

  return (
    <div className="page-wrapper" style={{ paddingTop: "1.25rem", paddingBottom: "4rem" }}>
      <JsonLd data={schemas} />

      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link href={`/${lang}`}>{cfg.backHomeLabel}</Link>
        <span>/</span>
        <span className="current">{label}</span>
      </nav>

      <section className="eu-hub-hero" aria-labelledby="eu-cat-h1">
        <h1 id="eu-cat-h1">{cfg.catH1Template(label)}</h1>
        <p className="eu-hub-lead">{editorialParagraphs[0]}</p>

        <dl className="best-stats-strip">
          <div className="best-stat-box">
            <dt>{cfg.videosLabel}</dt>
            <dd>{stats.videoCount}</dd>
          </div>
          <div className="best-stat-box">
            <dt>{cfg.medianLengthLabel}</dt>
            <dd>{medianMins} min</dd>
          </div>
          <div className="best-stat-box">
            <dt>{cfg.watchNowLabel}</dt>
            <dd>HD Free</dd>
          </div>
        </dl>

        <div className="home-command-actions">
          <Link href={`/cat/${slug}`} className="home-cmd-pill" hrefLang="en">
            English Version
          </Link>
          {EU_LANGS.filter((code) => code !== lang).map((code) => (
            <Link
              key={code}
              href={`/${code}/cat/${slug}`}
              className="home-cmd-pill"
              hrefLang={code}
            >
              {LANG_CONFIG[code].nativeName}
            </Link>
          ))}
        </div>
      </section>

      <div className="video-grid">
        {cards.map((video, idx) => (
          <VideoCard key={video.id} video={video} priority={idx < 4} />
        ))}
      </div>

      <article className="best-editorial-article">
        <h2>{label} — {cfg.regionLabel}</h2>
        {editorialParagraphs.map((para) => (
          <p key={para}>{para}</p>
        ))}

        <div className="best-faq-list">
          {faqs.map((faq) => (
            <div key={faq.question} className="best-faq-item">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </article>

      <section className="related-cats" aria-labelledby="eu-related-cats">
        <h2 id="eu-related-cats" className="related-cats-title">
          {cfg.relatedHeading}
        </h2>
        <div className="related-cats-list">
          {relatedLocalCats.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${lang}/cat/${cat.slug}`}
              className="related-cat-link"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
