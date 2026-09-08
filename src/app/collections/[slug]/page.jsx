import Link from 'next/link';
import { notFound } from 'next/navigation';
import VideoCard from '@/components/VideoCard';
import { getCollection, getCollectionVideos, getCollections, isCollectionIndexable } from '@/lib/catalog';
import '../../../pages/Pages.css';

export const runtime = 'edge';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: 'Collection not found — NICEVX', robots: { index: false, follow: false } };
  const videos = getCollectionVideos(collection);
  const indexable = isCollectionIndexable(collection, videos);
  return {
    title: `${collection.name} Curated Video Collection — NICEVX`,
    description: collection.intent,
    alternates: { canonical: `https://www.nicevx.com/collections/${collection.slug}` },
    robots: { index: indexable, follow: true },
  };
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();
  const videos = getCollectionVideos(collection);
  const related = getCollections().filter((item) => item.slug !== slug && item.videos.length > 0).slice(0, 4);
  const schema = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${collection.name} curated videos`, description: collection.intent, url: `https://www.nicevx.com/collections/${slug}` },
    { '@context': 'https://schema.org', '@type': 'ItemList', numberOfItems: videos.length, itemListElement: videos.slice(0, 36).map((video, index) => ({ '@type': 'ListItem', position: index + 1, url: video.canonicalUrl, name: video.title })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.nicevx.com/' },
      { '@type': 'ListItem', position: 2, name: 'Collections', item: 'https://www.nicevx.com/collections' },
      { '@type': 'ListItem', position: 3, name: collection.name, item: `https://www.nicevx.com/collections/${slug}` },
    ] },
  ];

  return (
    <main className="page-wrapper collection-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/collections">Collections</Link> / {collection.name}</nav>
      <h1>{collection.name} curated videos</h1>
      <p className="collection-lead">{collection.intent}</p>
      <div className="collection-stats"><span>{videos.length} verified videos</span><span>Updated from factual source snapshots</span></div>
      <section className="collection-editorial">
        {collection.editorialIntro.split('\n\n').map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>)}
      </section>
      <h2>Ranked discoveries</h2>
      {videos.length ? <div className="video-grid">{videos.map((video, index) => <VideoCard key={video.id} video={video} priority={index < 4} />)}</div> : <p>This collection has not yet reached its publication threshold.</p>}
      {related.length > 0 && <nav className="related-collections"><h2>Related collections</h2>{related.map((item) => <Link key={item.slug} href={`/collections/${item.slug}`}>{item.name}</Link>)}</nav>}
    </main>
  );
}
