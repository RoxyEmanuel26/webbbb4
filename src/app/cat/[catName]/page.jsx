import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import SearchResultsShared from '@/components/SearchResultsShared';
import JsonLd from '@/components/JsonLd';
import { breadcrumbListSchema, itemListSchema, faqPageSchema } from '@/lib/jsonld';
import { toVideoCard } from '@/lib/catalog';
import {
  getCategoryVideos,
  isCategoryIndexable,
  getCategoryStats,
  getCategoryIntro,
} from '@/lib/hubs';
import { ALL_CATEGORIES } from '@/data/allCategories';
import { CANONICAL_SLUG_ALIASES } from '@/data/tagConfig';
import { EU_CATEGORY_LABELS, buildMultilingualCategoryAlternates } from '@/lib/i18n';

export const dynamicParams = false;

// Set valid slugs untuk O(1) lookup validasi kategori
const VALID_CAT_SLUGS = new Set(
  ALL_CATEGORIES.map((c) => c.name.toLowerCase().replace(/\s+/g, '-'))
);

const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

// Index Bloat Pruning: only pre-render populated, indexable categories (>= 12 videos)
// so Googlebot sees a >95% high-quality indexable domain instead of 630+ thin noindex stubs.
export function generateStaticParams() {
  return ALL_CATEGORIES
    .map((category) => toSlug(category.name))
    .filter((catName) => !CANONICAL_SLUG_ALIASES[catName] && isCategoryIndexable(catName))
    .map((catName) => ({ catName }));
}

function getRelatedCategories(currentSlug, limit = 18) {
  const indexable = ALL_CATEGORIES.filter((c) => {
    const candidateSlug = toSlug(c.name);
    return candidateSlug !== currentSlug && isCategoryIndexable(candidateSlug);
  });
  if (indexable.length === 0) return [];
  let hash = 0;
  for (let i = 0; i < currentSlug.length; i++) {
    hash = (hash * 31 + currentSlug.charCodeAt(i)) >>> 0;
  }
  const start = indexable.length ? hash % indexable.length : 0;
  const picked = [];
  for (let i = 0; i < Math.min(limit, indexable.length); i++) {
    picked.push(indexable[(start + i) % indexable.length]);
  }
  return picked;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const catName = resolvedParams?.catName || '';
  const slug = catName.toLowerCase();
  if (!VALID_CAT_SLUGS.has(slug)) {
    return { title: 'Category Not Found — NICEVX', robots: { index: false, follow: false } };
  }

  const query = catName.replace(/-/g, ' ');
  const titleCategory = query.replace(/\b\w/g, (l) => l.toUpperCase());
  const indexable = isCategoryIndexable(slug);
  const stats = getCategoryStats(slug);

  const title = `${titleCategory} Porn Videos – Free HD Clips | NICEVX`;
  const description = stats.videoCount >= 12
    ? `Watch free ${titleCategory} HD porn videos on NICEVX. Browse ${stats.videoCount} curated scenes with a median length of ${Math.round(stats.medianDurationSeconds / 60)} min.`
    : `Explore ${titleCategory} adult videos and clips on NICEVX. Free HD streaming updated regularly.`;

  return {
    title,
    description,
    alternates: buildMultilingualCategoryAlternates(
      slug,
      'en',
      indexable && Boolean(EU_CATEGORY_LABELS[slug])
    ),
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `https://www.nicevx.com/cat/${slug}`,
      siteName: 'NICEVX',
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: '/og-default.jpg',
          width: 1200,
          height: 630,
          alt: `${titleCategory} Videos — NICEVX`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-default.jpg'],
    },
  };
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const catName = resolvedParams?.catName || '';
  const slug = catName.toLowerCase();

  // Validasi: jika slug bukan kategori valid, kembalikan 404
  if (!catName || !VALID_CAT_SLUGS.has(slug)) {
    notFound();
  }
  if (CANONICAL_SLUG_ALIASES[slug]) {
    permanentRedirect(CANONICAL_SLUG_ALIASES[slug]);
  }

  const query = catName.replace(/-/g, ' ');
  const titleCategory = query.replace(/\b\w/g, (l) => l.toUpperCase());
  const related = getRelatedCategories(slug);
  const catVideos = getCategoryVideos(slug);
  const stats = getCategoryStats(slug);
  const intro = getCategoryIntro(slug);
  const indexable = isCategoryIndexable(slug);

  // Render top curated catalog videos directly inside SSR HTML (0 skeletons on cold render)
  const featured = catVideos.slice(0, 48).map((video) => toVideoCard(video, { maxTags: 2 }));

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/cats' },
    { name: titleCategory, url: `/cat/${slug}` },
  ];

  const categoryFaqs = indexable
    ? [
        {
          question: `What ${titleCategory} videos are featured on NICEVX?`,
          answer: `This hub brings together ${stats.count > 0 ? stats.count : 'selected'} ${titleCategory} videos in HD, combining top-rated releases with fresh additions sorted by popularity, rating, and length.`,
        },
        {
          question: `Can I filter ${titleCategory} videos by duration or sort order?`,
          answer: `Yes. Use the interactive filter bar below the featured grid to sort ${titleCategory} clips by Latest, Top Rated, Most Viewed, or filter by short, medium, and full-length scenes.`,
        },
        {
          question: `Where can I find full-length ${titleCategory} movies and performers?`,
          answer: `You can jump from this category to NICEVX Full-Length Movies (25+ min), browse the Pornstars directory, or explore related topic collections.`,
        },
      ]
    : [];

  const jsonLdData = [
    breadcrumbListSchema(breadcrumbs),
  ];
  if (catVideos.length > 0) {
    jsonLdData.push(
      itemListSchema({
        name: `${titleCategory} Videos`,
        url: `/cat/${slug}`,
        items: catVideos,
        maxItems: 36,
      })
    );
  }
  if (categoryFaqs.length > 0) {
    jsonLdData.push(faqPageSchema(categoryFaqs));
  }

  return (
    <div className="category-page">
      <JsonLd data={jsonLdData} />
      <section className="page-wrapper category-intro">
        <nav className="breadcrumb-nav" aria-label="Breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          <Link href="/" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <Link href="/cats" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Categories</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span style={{ color: 'var(--color-text)' }}>{titleCategory}</span>
        </nav>

        <h1 className="section-title">{titleCategory} videos</h1>

        {stats.videoCount > 0 && (
          <div className="category-stats-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            <span><strong>{stats.videoCount}</strong> verified videos</span>
            {stats.medianDurationSeconds > 0 && (
              <>
                <span>•</span>
                <span><strong>{Math.round(stats.medianDurationSeconds / 60)} min</strong> median duration</span>
              </>
            )}
            {stats.hdShare !== null && stats.hdShare > 0 && (
              <>
                <span>•</span>
                <span><strong>{stats.hdShare}%</strong> HD clips</span>
              </>
            )}
          </div>
        )}

        <p className="category-description-text" style={{ maxWidth: '800px', lineHeight: '1.65', marginBottom: '0.75rem', color: 'var(--color-muted)' }}>
          {intro}
        </p>
      </section>

      <SearchResultsShared
        isCat={true}
        isTag={false}
        query={query}
        initialVideos={featured}
        perPage={36}
        pageTitle={`Curated ${titleCategory} Videos`}
        headingLevel="h2"
      />

      {categoryFaqs.length > 0 && (
        <section className="page-wrapper" style={{ marginTop: '2.5rem', marginBottom: '1.5rem', maxWidth: '860px' }}>
          <h2 className="related-cats-title" style={{ marginBottom: '1rem' }}>
            About {titleCategory} Videos &amp; FAQ
          </h2>
          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {categoryFaqs.map((faq) => (
              <div
                key={faq.question}
                style={{
                  padding: '0.95rem 1.15rem',
                  borderRadius: '10px',
                  background: 'var(--color-surface, rgba(255,255,255,0.03))',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                }}
              >
                <h3 style={{ fontSize: '0.98rem', marginBottom: '0.35rem' }}>{faq.question}</h3>
                <p style={{ margin: 0, color: 'var(--color-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link href="/movies" prefetch={false} className="related-cat-link">
              Full-Length Movies (25+ min)
            </Link>
            <Link href="/pornstars" prefetch={false} className="related-cat-link">
              Popular Pornstars
            </Link>
            <Link href="/collections" prefetch={false} className="related-cat-link">
              Topic Collections
            </Link>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <nav className="related-cats" aria-label="Browse more categories">
          <div className="page-wrapper">
            <h2 className="related-cats-title">Browse More Categories</h2>
            <div className="related-cats-list">
              {related.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/cat/${toSlug(cat.name)}`}
                  prefetch={false}
                  className="related-cat-link"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/cats" prefetch={false} className="related-cat-link related-cat-all">
                All Categories
              </Link>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
