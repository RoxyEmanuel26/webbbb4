import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Globe, Tag, Sparkles } from 'lucide-react';
import SkeletonGrid from '@/components/SkeletonGrid';
import SearchResultsShared from '@/components/SearchResultsShared';
import VideoCard from '@/components/VideoCard';
import JsonLd from '@/components/JsonLd';
import {
  breadcrumbListSchema,
  faqPageSchema,
  itemListSchema,
  personSchema,
} from '@/lib/jsonld';
import { getCatalogVideos, toVideoCard } from '@/lib/catalog';
import { getTagHubHref } from '@/lib/hubs';
import {
  MIN_PERFORMER_INDEX_VIDEOS,
  PORNSTARS,
  getPornstarBySlug,
  getVideosForPerformer,
} from '@/data/pornstars';
import '../../../pages/Pages.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return PORNSTARS.map((star) => ({ slug: star.slug }));
}

function getMatchedSortedVideos(star) {
  return getVideosForPerformer(star, getCatalogVideos()).sort(
    (a, b) =>
      (Number(b.discoveryScore) || 0) - (Number(a.discoveryScore) || 0) ||
      (Number(b.views) || 0) - (Number(a.views) || 0)
  );
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const star = getPornstarBySlug(resolvedParams?.slug);
  if (!star) {
    return { title: 'Pornstar Not Found — NICEVX', robots: { index: false, follow: false } };
  }

  const matchedCount = getMatchedSortedVideos(star).length;
  const isIndexable = matchedCount >= MIN_PERFORMER_INDEX_VIDEOS;
  const seoTitle = `${star.name} HD Porn Videos, Scenes & Profile — NICEVX`;
  const seoDesc = `Watch ${star.name} in high-definition adult videos and scenes on NICEVX. Explore top ${star.topGenres?.slice(0, 3).join(', ') || 'HD'} clips starring ${star.name}.`;
  const seoCanonical = `https://www.nicevx.com/pornstar/${star.slug}`;

  return {
    title: seoTitle,
    description: seoDesc,
    robots: {
      index: isIndexable,
      follow: true,
    },
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

  const matchedVideos = getMatchedSortedVideos(star);
  const ssrCards = matchedVideos.slice(0, 24).map(toVideoCard);
  const starGenres = new Set((star.topGenres || []).map((g) => String(g).toLowerCase()));

  const relatedStars = PORNSTARS
    .filter((other) => other.slug !== star.slug)
    .map((other) => {
      const overlap = (other.topGenres || []).filter((g) =>
        starGenres.has(String(g).toLowerCase())
      ).length;
      return { other, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap || a.other.name.localeCompare(b.other.name))
    .slice(0, 8)
    .map(({ other }) => other);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Pornstars', url: '/pornstars' },
    { name: star.name, url: `/pornstar/${star.slug}` },
  ];

  const faqs = [
    {
      question: `What genres is ${star.name} known for on NICEVX?`,
      answer: `${star.name} (${star.nationality}) is frequently featured across ${(star.topGenres || []).join(', ')} adult scenes on NICEVX.`,
    },
    {
      question: `How can I watch ${star.name} videos in HD?`,
      answer: `All available ${star.name} scenes on NICEVX stream directly in the browser with storyboard previews and no registration required.`,
    },
  ];

  const jsonLdItems = [
    breadcrumbListSchema(breadcrumbs),
    personSchema({
      name: star.name,
      slug: star.slug,
      bio: star.bio,
      image: star.photo,
      topGenres: star.topGenres,
    }),
    faqPageSchema(faqs),
  ];
  if (matchedVideos.length > 0) {
    jsonLdItems.push(
      itemListSchema({
        name: `${star.name} HD Adult Videos`,
        url: `/pornstar/${star.slug}`,
        items: matchedVideos,
        maxItems: 24,
      })
    );
  }

  return (
    <div className="pornstar-profile-page">
      <JsonLd data={jsonLdItems} />

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
            <div className="pornstar-badge-verified" title="Featured Performer">
              <Star size={12} fill="currentColor" /> Performer
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
                {matchedVideos.length > 0 ? `${matchedVideos.length} Catalog Scenes` : 'Adult Film Star'}
              </span>
            </div>

            <p className="pornstar-hero-bio">{star.bio}</p>

            {star.topGenres && star.topGenres.length > 0 && (
              <div className="pornstar-genres-row">
                <span className="pornstar-genres-label">Top Genres:</span>
                <div className="pornstar-genres-list">
                  {star.topGenres.map((genre) => {
                    const hubHref = getTagHubHref(genre);
                    return hubHref ? (
                      <Link key={genre} href={hubHref} className="pornstar-genre-tag">
                        <Tag size={10} aria-hidden="true" />
                        {genre}
                      </Link>
                    ) : (
                      <span key={genre} className="pornstar-genre-tag">
                        <Tag size={10} aria-hidden="true" />
                        {genre}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {ssrCards.length > 0 && (
          <section style={{ marginTop: '1.75rem', marginBottom: '1rem' }} aria-labelledby="star-catalog-heading">
            <h2 id="star-catalog-heading" className="section-title" style={{ marginBottom: '1rem' }}>
              Featured {star.name} Videos ({matchedVideos.length})
            </h2>
            <div className="video-grid">
              {ssrCards.map((video, index) => (
                <VideoCard key={video.id} video={video} priority={index < 4} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Live Performer Videos Feed */}
      <Suspense fallback={<SkeletonGrid count={24} />}>
        <SearchResultsShared
          query={star.name}
          pageTitle={ssrCards.length > 0 ? `More ${star.name} Clips` : `${star.name}'s HD Videos`}
          headingLevel="h2"
          seoTitle={`${star.name} HD Porn Videos — NICEVX`}
          seoDesc={`Stream full HD porn videos starring ${star.name}. Browse high-definition scenes and playback clips on NICEVX.`}
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
