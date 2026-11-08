import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Globe, Tag, ChevronRight, Sparkles } from 'lucide-react';
import SkeletonGrid from '@/components/SkeletonGrid';
import SearchResultsShared from '@/components/SearchResultsShared';
import JsonLd from '@/components/JsonLd';
import { breadcrumbListSchema, personSchema } from '@/lib/jsonld';
import { PORNSTARS, getPornstarBySlug } from '@/data/pornstars';
import '../../../pages/Pages.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return PORNSTARS.map((star) => ({ slug: star.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const star = getPornstarBySlug(resolvedParams?.slug);
  if (!star) {
    return { title: 'Pornstar Not Found — NICEVX', robots: { index: false, follow: false } };
  }

  const seoTitle = `${star.name} HD Porn Videos, Scenes & Biography — NICEVX`;
  const seoDesc = `Watch ${star.name} in full HD adult videos and scenes on NICEVX. Stream verified high definition clips starring ${star.name} with crisp playback.`;
  const seoCanonical = `https://www.nicevx.com/pornstar/${star.slug}`;

  return {
    title: seoTitle,
    description: seoDesc,
    robots: 'index, follow',
    alternates: { canonical: seoCanonical },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: seoCanonical,
      type: 'profile',
      images: [{ url: star.photo, width: 640, height: 360, alt: star.name }],
    },
    twitter: {
      title: seoTitle,
      description: seoDesc,
      images: [star.photo],
    },
  };
}

export default async function PornstarProfilePage({ params }) {
  const resolvedParams = await params;
  const star = getPornstarBySlug(resolvedParams?.slug);
  if (!star) notFound();

  // Find related stars (other stars sharing similar genres or random picks)
  const relatedStars = PORNSTARS
    .filter((s) => s.slug !== star.slug)
    .slice(0, 8);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Pornstars', url: '/pornstars' },
    { name: star.name, url: `/pornstar/${star.slug}` },
  ];

  return (
    <div className="pornstar-profile-page">
      <JsonLd
        data={[
          breadcrumbListSchema(breadcrumbs),
          personSchema({
            name: star.name,
            slug: star.slug,
            bio: star.bio,
            image: star.photo,
            topGenres: star.topGenres,
          }),
        ]}
      />

      <div className="page-wrapper" style={{ paddingTop: '1.25rem' }}>
        {/* Breadcrumb Nav */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/pornstars">Pornstars</Link>
          <span>/</span>
          <span className="current">{star.name}</span>
        </nav>

        {/* Profile Hero Card */}
        <section className="pornstar-hero-card" aria-labelledby="star-heading">
          <div className="pornstar-avatar-wrap">
            <img
              src={star.photo}
              alt={star.name}
              className="pornstar-avatar-img"
              width="160"
              height="160"
              loading="eager"
            />
            <div className="pornstar-badge-verified" title="Verified Performer">
              <Star size={12} fill="currentColor" /> Verified
            </div>
          </div>

          <div className="pornstar-hero-info">
            <h1 id="star-heading" className="pornstar-hero-title">
              {star.name}
            </h1>

            <div className="pornstar-meta-row">
              <span className="pornstar-meta-item">
                <Globe size={13} aria-hidden="true" />
                {star.nationality}
              </span>
              <span className="pornstar-meta-item">
                <Sparkles size={13} aria-hidden="true" />
                Adult Film Star
              </span>
            </div>

            <p className="pornstar-hero-bio">{star.bio}</p>

            {star.topGenres && star.topGenres.length > 0 && (
              <div className="pornstar-genres-row">
                <span className="pornstar-genres-label">Top Genres:</span>
                <div className="pornstar-genres-list">
                  {star.topGenres.map((genre) => (
                    <Link
                      key={genre}
                      href={`/cat/${genre.toLowerCase().replace(/\s+/g, '-')}`}
                      className="pornstar-genre-tag"
                    >
                      <Tag size={10} aria-hidden="true" />
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Star Videos Feed */}
      <Suspense fallback={<SkeletonGrid count={24} />}>
        <SearchResultsShared
          query={star.name}
          pageTitle={`${star.name}'s HD Videos`}
          headingLevel="h2"
          seoTitle={`${star.name} HD Porn Videos — NICEVX`}
          seoDesc={`Stream full HD porn videos starring ${star.name}. Daily updated verified clips with high definition scenes.`}
          seoCanonical={`https://www.nicevx.com/pornstar/${star.slug}`}
          seoQuery={star.name}
          trendTags={star.topGenres || []}
        />
      </Suspense>

      {/* Related Performers Section */}
      <div className="page-wrapper" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
        <section className="related-stars-section" aria-labelledby="related-stars-title">
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h2 id="related-stars-title" className="section-title">
              Fans of {star.name} also watch
            </h2>
            <Link href="/pornstars" className="home-niche-see-all">
              All Stars &rarr;
            </Link>
          </div>
          <div className="related-stars-grid">
            {relatedStars.map((other) => (
              <Link
                key={other.slug}
                href={`/pornstar/${other.slug}`}
                className="related-star-card"
              >
                <img
                  src={other.photo}
                  alt={other.name}
                  className="related-star-thumb"
                  width="72"
                  height="72"
                  loading="lazy"
                />
                <span className="related-star-name">{other.name}</span>
                <span className="related-star-nationality">{other.nationality}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
