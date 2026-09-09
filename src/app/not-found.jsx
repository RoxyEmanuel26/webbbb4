import Link from "next/link";

export const metadata = {
  title: "Page Not Found — NICEVX",
  description: "The page you requested could not be found.",
};

export default function NotFound() {
  return (
    <main className="page-wrapper empty-page">
      <div className="empty-block">
        <span className="empty-code">404</span>
        <h1>Page not found</h1>
        <p>The link may be outdated, or the video is no longer available.</p>
        <Link href="/" className="back-btn">
          Browse videos
        </Link>
      </div>
    </main>
  );
}
