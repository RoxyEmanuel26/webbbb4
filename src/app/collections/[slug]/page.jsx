import Link from "next/link";
import { notFound } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import {
  getCollection,
  getCollectionHighlights,
  getCollectionStats,
  getCollectionVideos,
  getCollections,
  isCollectionIndexable,
  toVideoCard,
} from "@/lib/catalog";
import "../../../pages/Pages.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCollections().map((collection) => ({ slug: collection.slug }));
}

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

const collectionDescription = (collection, stats) => {
  if (!stats?.videoCount) return `Browse ${collection.name} videos on NICEVX.`;
  const duration = stats.medianDurationSeconds
    ? ` The median video length is ${formatDuration(stats.medianDurationSeconds)}.`
    : "";
  const tags = stats.relatedTags.length
    ? ` Common related tags include ${stats.relatedTags.slice(0, 3).join(", ")}.`
    : "";
  return `Explore ${stats.videoCount} available ${collection.name} videos on NICEVX.${duration}${tags}`;
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection)
    return {
      title: "Collection not found — NICEVX",
      robots: { index: false, follow: false },
    };
  const videos = getCollectionVideos(collection);
  const stats = getCollectionStats(collection);
  const indexable = isCollectionIndexable(collection, videos);
  return {
    title: `${collection.name} Videos — NICEVX`,
    description: collectionDescription(collection, stats),
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
  const highlights = getCollectionHighlights(collection);
  const videoIds = new Set(videos.map((video) => video.id));
  const related = getCollections()
    .filter((item) => item.slug !== slug && item.videos.length > 0)
    .map((item) => ({
      ...item,
      sharedVideos: item.videos.filter((video) => videoIds.has(video.id)).length,
    }))
    .filter((item) => item.sharedVideos > 0)
    .sort((left, right) =>
      Number(isCollectionIndexable(right, right.videos)) -
        Number(isCollectionIndexable(left, left.videos)) ||
      right.sharedVideos - left.sharedVideos ||
      left.name.localeCompare(right.name),
    )
    .slice(0, 4);
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${collection.name} videos`,
      description: collectionDescription(collection, stats),
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
      <p className="collection-lead">{collectionDescription(collection, stats)}</p>
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
            <dt>Views on original platform</dt>
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
      {videos.length >= 8 && (
        <section className="collection-discovery" aria-labelledby="collection-discovery-heading">
          <h2 id="collection-discovery-heading">Find something to watch</h2>
          <div className="collection-discovery-grid">
            {[
              { title: "Recently published", videos: highlights.recentlyPublished, detail: (video) => new Date(video.uploadDate).toISOString().slice(0, 10) },
              { title: "Most viewed", videos: highlights.mostViewed, detail: (video) => `${formatViews(video.views)} views on original platform` },
              { title: "Shorter videos", videos: highlights.shorter, detail: (video) => formatDuration(video.durationSeconds) },
            ].filter((group) => group.videos.length > 0).map((group) => (
              <div className="collection-discovery-group" key={group.title}>
                <h3>{group.title}</h3>
                <ol>
                  {group.videos.map((video) => (
                    <li key={video.id}>
                      <Link href={`/video/${video.canonicalSlug}`}>{video.title}</Link>
                      <span>{group.detail(video)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}
      <h2>Videos</h2>
      {videos.length ? (
        <div className="video-grid">
          {videos.slice(0, 180).map((video, index) => (
            <VideoCard key={video.id} video={toVideoCard(video)} priority={index < 4} />
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
              {item.name} <span>({item.sharedVideos} shared)</span>
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
