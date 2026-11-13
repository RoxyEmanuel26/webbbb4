/**
 * Shared configuration for non-category tag hubs.
 * Imported by both Next.js app code (via hubs.js) and Node sitemap/validation scripts.
 */

export const TAG_DENYLIST = new Set([
  'pornstar',
  'pornstars',
  'chaturbate',
  'adult-porn',
  'free-porn',
  'hd-porn',
  'porn',
  'hd',
]);

export function toTagSlug(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Compute all non-category tag slugs qualifying as indexable hubs (>= minVideos).
 */
export function getQualifiedTagHubs(videos = [], allCategories = [], minVideos = 12) {
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
      if (TAG_DENYLIST.has(slug) || catSlugs.has(slug)) continue;
      if (!grouped.has(slug)) grouped.set(slug, []);
      grouped.get(slug).push(video);
    }
  }
  return [...grouped.entries()]
    .filter(([, list]) => list.length >= minVideos)
    .map(([slug, list]) => ({ slug, videos: list, count: list.length }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}
