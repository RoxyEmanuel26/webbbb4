import { Suspense } from 'react';
import SkeletonGrid from '@/components/SkeletonGrid';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SearchResultsShared from '@/components/SearchResultsShared';
import VideoCard from '@/components/VideoCard';
import { getCollection, getCollectionVideos, toVideoCard } from '@/lib/catalog';
import { getSearchMetadata } from '@/utils/seo';
import { ALL_CATEGORIES } from '@/data/allCategories';

export const dynamicParams = false;

// Set valid slugs untuk O(1) lookup validasi kategori
const VALID_CAT_SLUGS = new Set(
  ALL_CATEGORIES.map((c) => c.name.toLowerCase().replace(/\s+/g, '-'))
);

const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

export function generateStaticParams() {
  return ALL_CATEGORIES
    .map((category) => toSlug(category.name))
    .map((catName) => ({ catName }));
}

// Deterministically pick sibling categories to cross-link from a category page.
// Server-rendered (this is a server component) so the links are crawlable, which
// gives every /cat/<slug> page incoming internal links beyond the /cats hub.
function getRelatedCategories(currentSlug, limit = 24) {
  const others = ALL_CATEGORIES.filter((c) => toSlug(c.name) !== currentSlug);
  if (others.length === 0) return [];
  // Stable offset derived from the slug so each page shows a consistent,
  // varied slice (not always the same first N).
  let hash = 0;
  for (let i = 0; i < currentSlug.length; i++) {
    hash = (hash * 31 + currentSlug.charCodeAt(i)) >>> 0;
  }
  const start = others.length ? hash % others.length : 0;
  const picked = [];
  for (let i = 0; i < Math.min(limit, others.length); i++) {
    picked.push(others[(start + i) % others.length]);
  }
  return picked;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const catName = resolvedParams?.catName || '';
  const query = catName.replace(/-/g, ' ');
  const metadata = getSearchMetadata({ query, isCat: true, isTag: false, page: 1, catName });
  return { ...metadata, robots: { index: false, follow: true } };
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const catName = resolvedParams?.catName || '';

  // Validasi: jika slug bukan kategori valid, kembalikan 404 (bukan soft 404)
  if (!catName || !VALID_CAT_SLUGS.has(catName.toLowerCase())) {
    notFound();
  }
  const query = catName.replace(/-/g, ' ');
  const seo = getSearchMetadata({ query, isCat: true, isTag: false, page: 1, catName });
  const related = getRelatedCategories(catName.toLowerCase());
  const collection = getCollection(catName.toLowerCase());
  const featured = collection ? getCollectionVideos(collection).slice(0, 12).map(toVideoCard) : [];

  return (
    <main className="category-page">
      <section className="page-wrapper category-intro">
        <h1 className="section-title">{query.replace(/\b\w/g, (letter) => letter.toUpperCase())} videos</h1>
        {featured.length > 0 && (
          <>
            <p>Start with these videos, or browse more below.</p>
            <div className="video-grid category-picks-grid">
              {featured.map((video, index) => (
                <VideoCard key={video.id} video={video} priority={index < 4} />
              ))}
            </div>
            <p className="category-collection-link">
              <Link href={`/collections/${collection.slug}`}>Browse the {collection.name} collection</Link>
            </p>
          </>
        )}
      </section>
      <Suspense fallback={<SkeletonGrid />}>
        <SearchResultsShared 
          isCat={true} 
          isTag={false} 
          query={query} 
          seoTitle={seo.title} 
          seoDesc={seo.description} 
          seoCanonical={seo.alternates.canonical} 
          seoQuery={query}
          pageTitle={`More ${query} videos`}
          headingLevel="h2"
        />
      </Suspense>

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
    </main>
  );
}
