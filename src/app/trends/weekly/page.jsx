import VideoCard from "@/components/VideoCard";
import { getCatalogVideos } from "@/lib/catalog";
import "../../../pages/Pages.css";

export const runtime = "edge";

export async function generateMetadata() {
  const hasEvidence = getCatalogVideos().some((video) =>
    Number.isFinite(video.viewGrowth7d),
  );
  return {
    title: "Fastest Rising This Week — NICEVX",
    description: "See the videos gaining the most views this week on NICEVX.",
    alternates: { canonical: "https://www.nicevx.com/trends/weekly" },
    robots: { index: hasEvidence, follow: true },
  };
}

export default function WeeklyTrendsPage() {
  const rising = getCatalogVideos()
    .filter(
      (video) => Number.isFinite(video.viewGrowth7d) && video.viewGrowth7d > 0,
    )
    .sort((a, b) => b.viewGrowth7d - a.viewGrowth7d)
    .slice(0, 36);
  return (
    <main className="page-wrapper collection-page">
      <h1>Trending This Week</h1>
      <p className="collection-lead">
        See which videos are gaining the most views right now.
      </p>
      {rising.length ? (
        <div className="video-grid">
          {rising.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="empty-block">
          <p>Weekly trends will appear when there is enough recent activity.</p>
        </div>
      )}
    </main>
  );
}
