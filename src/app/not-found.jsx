import Link from "next/link";

export const metadata = {
  title: "Page Not Found (404) | NICEVX",
  description: "The page or video you requested could not be found. Explore popular categories and curated collections on NICEVX.",
};

const POPULAR_CATS = [
  { name: "Amateur", slug: "amateur" },
  { name: "Blowjob", slug: "blowjob" },
  { name: "Big Tits", slug: "big-tits" },
  { name: "MILF", slug: "milf" },
  { name: "Big Ass", slug: "big-ass" },
  { name: "Homemade", slug: "homemade" },
  { name: "Asian", slug: "asian" },
  { name: "Blonde", slug: "blonde" },
  { name: "Anal", slug: "anal" },
  { name: "Latina", slug: "latina" },
  { name: "Masturbation", slug: "masturbation" },
  { name: "Webcam", slug: "webcam" },
];

export default function NotFound() {
  return (
    <div className="page-wrapper empty-page" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <div className="empty-block" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <span className="empty-code" style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--color-accent)' }}>404</span>
        <h1 style={{ fontSize: '1.75rem', margin: '0.75rem 0' }}>Page or Video Not Found</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          The link you followed may be outdated, or the video has been retired. Please explore our most popular categories or return home to discover hundreds of verified clips.
        </p>
        
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" className="back-btn" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' }}>
            Browse All Videos
          </Link>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'left', background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text)' }}>Popular Categories</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {POPULAR_CATS.map((cat) => (
              <Link
                key={cat.slug}
                href={`/cat/${cat.slug}`}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  border: '1px solid var(--color-border)',
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
