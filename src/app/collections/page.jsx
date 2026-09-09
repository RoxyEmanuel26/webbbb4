import Link from "next/link";
import CollectionCover from "@/components/CollectionCover";
import { getCollectionCover, getCollections } from "@/lib/catalog";
import "../../pages/Pages.css";

export const runtime = "edge";
export const metadata = {
  title: "Video Collections — NICEVX",
  description:
    "Browse NICEVX video collections by category and find something worth watching.",
  alternates: { canonical: "https://www.nicevx.com/collections" },
};

export default function CollectionsPage() {
  const collections = getCollections();
  return (
    <main className="page-wrapper collection-page">
      <h1>Browse collections</h1>
      <p>Pick a category and start watching.</p>
      <div className="collection-directory">
        {collections.map((collection, index) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="collection-directory-card"
          >
            <CollectionCover
              cover={getCollectionCover(collection)}
              name={collection.name}
              priority={index === 0}
            />
            <div className="collection-directory-content">
              <strong>{collection.name}</strong>
              <span>{collection.videos.length} videos</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
