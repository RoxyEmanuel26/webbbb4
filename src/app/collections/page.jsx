import Link from 'next/link';
import { getCollections, isCollectionIndexable } from '@/lib/catalog';
import '../../pages/Pages.css';

export const runtime = 'edge';
export const metadata = {
  title: 'Curated Video Collections — NICEVX',
  description: 'Browse focused adult video collections built from verified catalog records and transparent ranking signals.',
  alternates: { canonical: 'https://www.nicevx.com/collections' },
};

export default function CollectionsPage() {
  const collections = getCollections();
  return (
    <main className="page-wrapper legal-page">
      <h1>Curated collections</h1>
      <p>These discovery hubs are published gradually. A hub becomes indexable only after it has at least 12 active videos and a substantial editorial introduction.</p>
      <div className="collection-directory">
        {collections.map((collection) => (
          <Link key={collection.slug} href={`/collections/${collection.slug}`} className="collection-directory-card">
            <strong>{collection.name}</strong>
            <span>{collection.videos.length} verified videos</span>
            <small>{isCollectionIndexable(collection, collection.videos) ? 'Quality gate passed' : 'Growing collection — noindex'}</small>
          </Link>
        ))}
      </div>
    </main>
  );
}
