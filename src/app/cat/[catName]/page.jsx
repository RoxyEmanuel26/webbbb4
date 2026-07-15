export const runtime = 'edge';
import { Suspense } from 'react';
import Link from 'next/link';
import SearchResultsShared from '@/components/SearchResultsShared';
import { getSearchMetadata } from '@/utils/seo';
import { ALL_CATEGORIES } from '@/data/allCategories';

const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

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
  return getSearchMetadata({ query, isCat: true, isTag: false, page: 1, catName });
}

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const catName = resolvedParams?.catName || '';
  const query = catName.replace(/-/g, ' ');
  const page = parseInt(resolvedSearchParams?.page) || 1;
  const currentOrder = resolvedSearchParams?.order || 'top-weekly';
  
  const seo = getSearchMetadata({ query, isCat: true, isTag: false, page, catName });
  const related = getRelatedCategories(catName.toLowerCase());

  return (
    <>
      <Suspense fallback={<div className="loading-block"><div className="loading-spinner" /></div>}>
        <SearchResultsShared 
          isCat={true} 
          isTag={false} 
          query={query} 
          page={page}
          currentOrder={currentOrder}
          seoTitle={seo.title} 
          seoDesc={seo.description} 
          seoCanonical={seo.alternates.canonical} 
          seoQuery={query}
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
                  className="related-cat-link"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/cats" className="related-cat-link related-cat-all">
                All Categories
              </Link>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
