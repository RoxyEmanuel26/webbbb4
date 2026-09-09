import Link from "next/link";
import { notFound } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import {
  getCollection,
  getCollectionStats,
  getCollectionVideos,
  getCollections,
  isCollectionIndexable,
} from "@/lib/catalog";
import "../../../pages/Pages.css";

export const runtime = "edge";

const formatDuration = (seconds) => {
  const minutes = Math.round((Number(seconds) || 0) / 60);
  if (!minutes) return "Not available";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const formatViews = (views) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(views || 0);

const collectionDescription = (collection) =>
  `Browse ${collection.name} videos, compare the latest additions, and find related picks on NICEVX.`;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection)
    return {
      title: "Collection not found — NICEVX",
      robots: { index: false, follow: false },
    };
  const videos = getCollectionVideos(collection);
  const indexable = isCollectionIndexable(collection, videos);
  return {
    title: `${collection.name} Videos — NICEVX`,
    description: collectionDescription(collection),
    alternates: {
      canonical: `https://www.nicevx.com/collections/${collection.slug}`,
    },
    robots: { index: indexable, follow: true },
  };
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();
  const videos = getCollectionVideos(collection);
  const stats = getCollectionStats(collection);
  const related = getCollections()
    .filter((item) => item.slug !== slug && item.videos.length > 0)
    .slice(0, 4);
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${collection.name} videos`,
      description: collectionDescription(collection),
      url: `https://www.nicevx.com/collections/${slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      numberOfItems: videos.length,
      itemListElement: videos.slice(0, 36).map((video, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: video.canonicalUrl,
        name: video.title,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.nicevx.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Collections",
          item: "https://www.nicevx.com/collections",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: collection.name,
          item: `https://www.nicevx.com/collections/${slug}`,
        },
      ],
    },
  ];

  return (
    <main className="page-wrapper collection-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="breadcrumbs">
        <Link href="/">Home</Link> /{" "}
        <Link href="/collections">Collections</Link> / {collection.name}
      </nav>
      <h1>{collection.name} Videos</h1>
      <p className="collection-lead">{collectionDescription(collection)}</p>
      <div className="collection-stats">
        <span>{videos.length} videos</span>
        <span>Updated regularly</span>
      </div>
      <section
        className="collection-facts"
        aria-labelledby="collection-facts-heading"
      >
        <h2 id="collection-facts-heading">At a glance</h2>
        <dl>
          <div>
            <dt>Videos</dt>
            <dd>{stats.videoCount}</dd>
          </div>
          <div>
            <dt>Median duration</dt>
            <dd>{formatDuration(stats.medianDurationSeconds)}</dd>
          </div>
          <div>
            <dt>Total views</dt>
            <dd>{formatViews(stats.totalViews)}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>
              {stats.updatedAt
                ? new Date(stats.updatedAt).toISOString().slice(0, 10)
                : "Not available"}
            </dd>
          </div>
          <div>
            <dt>Explore similar</dt>
            <dd>{stats.relatedTags.join(", ") || "Not available"}</dd>
          </div>
        </dl>
      </section>
      <h2>Videos</h2>
      {videos.length ? (
        <div className="video-grid">
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} priority={index < 4} />
          ))}
        </div>
      ) : (
        <p>More videos are coming soon.</p>
      )}
      {related.length > 0 && (
        <nav className="related-collections">
          <h2>Related collections</h2>
          {related.map((item) => (
            <Link key={item.slug} href={`/collections/${item.slug}`}>
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
