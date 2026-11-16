/**
 * Shared configuration for categories, collections, and non-category tag hubs.
 * Imported by both Next.js app code (via hubs.js) and Node sitemap/validation scripts.
 */

export const GENERIC_OR_BLOCKED_CATEGORY_SLUGS = new Set([
  'adult-porn',
  'free-porn',
  'hd-porn',
  'porn',
  'hd',
  'stripchat',
  'chaturbate',
  'bongacams',
  'myfreecams',
  'camsoda',
  'cam4',
  'lesbians',
  'teen',
  'teens',
  'teen-anal',
  'anal-teen',
  '',
]);

export const COLLECTION_OWNED_SLUGS = new Set([
  'brunette',
  'cumshot',
  'big-dick',
  'fetish',
  'facial',
  'deep-throat',
]);

export const CANONICAL_SLUG_ALIASES = {
  lesbians: '/cat/lesbian',
  'anal-sex': '/cat/anal',
  'pov-porn': '/cat/pov',
};

export const TAG_DENYLIST = new Set([
  ...GENERIC_OR_BLOCKED_CATEGORY_SLUGS,
  ...Object.keys(CANONICAL_SLUG_ALIASES),
  'pornstar',
  'pornstars',
]);

export function toTagSlug(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Compute all non-category, non-collection tag slugs qualifying as indexable hubs (>= minVideos).
 */
export function getQualifiedTagHubs(videos = [], allCategories = [], minVideos = 12, extraExcluded = COLLECTION_OWNED_SLUGS) {
  const catSlugs = new Set(
    (allCategories || []).map((c) => toTagSlug(c?.name || ''))
  );
  const grouped = new Map();
  for (const video of videos || []) {
    if (!video || (video.availability && video.availability !== 'available')) continue;
    const seen = new Set();
    for (const rawTag of video.tags || []) {
      const slug = toTagSlug(rawTag);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      if (TAG_DENYLIST.has(slug) || catSlugs.has(slug) || extraExcluded.has(slug)) continue;
      if (!grouped.has(slug)) grouped.set(slug, []);
      grouped.get(slug).push(video);
    }
  }
  return [...grouped.entries()]
    .filter(([, list]) => list.length >= minVideos)
    .map(([slug, list]) => ({ slug, videos: list, count: list.length }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}
