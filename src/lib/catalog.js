import catalog from "@/data/curated-video-catalog.json";
import collections from "@/data/collections.json";

const videos = Array.isArray(catalog.videos) ? catalog.videos : [];
const MIN_COLLECTION_VIDEOS = 12;
const MIN_EDITORIAL_WORDS = 400;
const MAX_EDITORIAL_WORDS = 650;
const MAX_COLLECTION_OVERLAP = 0.7;

const normalizeSignal = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

// Build immutable lookup indexes once when the generated catalog module is
// loaded. Before this index existed, every SSR request repeatedly scanned and
// normalized the full catalog for video, collection, cover, overlap, and
// related-video lookups.
const videoById = new Map(videos.map((video) => [video.id, video]));
const collectionBySlug = new Map(
  collections.map((collection) => [collection.slug, collection]),
);
const normalizedSignalsByVideoId = new Map(
  videos.map((video) => [
    video.id,
    [video.category, ...(video.tags || [])].map(normalizeSignal),
  ]),
);
const aliasesByCollectionSlug = new Map(
  collections.map((collection) => [
    collection.slug,
    new Set((collection.aliases || []).map(normalizeSignal)),
  ]),
);
const collectionVideosCache = new Map();
const collectionVideoIdsCache = new Map();
const overlapCache = new Map();
const collectionStatsCache = new Map();
const collectionCoverCache = new Map();
const relatedVideosCache = new Map();
let sortedCollectionsCache = null;
let trendTagsCache = null;

function collectionVideoIds(collection) {
  if (!collection) return new Set();
  if (!collectionVideoIdsCache.has(collection.slug)) {
    collectionVideoIdsCache.set(
      collection.slug,
      new Set(getCollectionVideos(collection).map((video) => video.id)),
    );
  }
  return collectionVideoIdsCache.get(collection.slug);
}

function overlapRatio(left, right) {
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  left.forEach((id) => {
    if (right.has(id)) intersection += 1;
  });
  return intersection / Math.min(left.size, right.size);
}

export function getCatalogVideos() {
  return videos;
}

export function getVideoById(id) {
  return videoById.get(id) || null;
}

export function getCollection(slug) {
  return collectionBySlug.get(slug) || null;
}

export function getCollections() {
  if (sortedCollectionsCache) return sortedCollectionsCache;
  sortedCollectionsCache = collections
    .map((collection) => ({
      ...collection,
      videos: getCollectionVideos(collection),
    }))
    .sort((left, right) => {
      const leftQualified = isCollectionIndexable(left, left.videos) ? 1 : 0;
      const rightQualified = isCollectionIndexable(right, right.videos) ? 1 : 0;
      return (
        rightQualified - leftQualified ||
        right.videos.length - left.videos.length ||
        left.name.localeCompare(right.name)
      );
    });
  return sortedCollectionsCache;
}

export function getCollectionVideos(collectionOrSlug) {
  const collection =
    typeof collectionOrSlug === "string"
      ? getCollection(collectionOrSlug)
      : collectionOrSlug;
  if (!collection) return [];
  if (collectionVideosCache.has(collection.slug)) {
    return collectionVideosCache.get(collection.slug);
  }
  const aliases = aliasesByCollectionSlug.get(collection.slug) || new Set();
  const matches = videos.filter((video) => {
    if (video.availability !== "available") return false;
    const signals = normalizedSignalsByVideoId.get(video.id) || [];
    return signals.some((signal) => aliases.has(signal));
  });
  collectionVideosCache.set(collection.slug, matches);
  return matches;
}

export function isCollectionIndexable(
  collection,
  collectionVideos = getCollectionVideos(collection),
) {
  if (!collection) return false;
  const words = String(collection.editorialIntro || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return (
    collection.status === "editorial-approved" &&
    collectionVideos.length >= MIN_COLLECTION_VIDEOS &&
    words >= MIN_EDITORIAL_WORDS &&
    words <= MAX_EDITORIAL_WORDS &&
    !getDominantCollectionOverlap(collection)
  );
}

export function getCollectionCover(collectionOrSlug) {
  const collection =
    typeof collectionOrSlug === "string"
      ? getCollection(collectionOrSlug)
      : collectionOrSlug;
  if (!collection) return null;
  if (collectionCoverCache.has(collection.slug)) {
    return collectionCoverCache.get(collection.slug);
  }
  const cover =
    getCollectionVideos(collectionOrSlug)
      .filter((video) => video.thumbnail)
      .sort(
        (left, right) =>
          (Number(right.discoveryScore) || 0) -
            (Number(left.discoveryScore) || 0) ||
          (Number(right.views) || 0) - (Number(left.views) || 0) ||
          String(left.id).localeCompare(String(right.id)),
      )[0] || null;
  collectionCoverCache.set(collection.slug, cover);
  return cover;
}

export function getDominantCollectionOverlap(collection) {
  if (!collection) return null;
  if (overlapCache.has(collection.slug)) return overlapCache.get(collection.slug);
  const sourceIds = collectionVideoIds(collection);
  for (const candidate of collections) {
    if (candidate.slug === collection.slug) continue;
    const candidateIds = collectionVideoIds(candidate);
    const candidateWins =
      candidateIds.size > sourceIds.size ||
      (candidateIds.size === sourceIds.size &&
        candidate.slug.localeCompare(collection.slug) < 0);
    if (!candidateWins) continue;
    const ratio = overlapRatio(sourceIds, candidateIds);
    if (ratio > MAX_COLLECTION_OVERLAP) {
      const overlap = { slug: candidate.slug, name: candidate.name, ratio };
      overlapCache.set(collection.slug, overlap);
      return overlap;
    }
  }
  overlapCache.set(collection.slug, null);
  return null;
}

export function getCollectionStats(collectionOrSlug) {
  const collection =
    typeof collectionOrSlug === "string"
      ? getCollection(collectionOrSlug)
      : collectionOrSlug;
  if (!collection) return null;
  if (collectionStatsCache.has(collection.slug)) {
    return collectionStatsCache.get(collection.slug);
  }
  const collectionVideos = getCollectionVideos(collection);
  const durations = collectionVideos
    .map((video) => Number(video.durationSeconds) || 0)
    .filter(Boolean)
    .sort((a, b) => a - b);
  const midpoint = Math.floor(durations.length / 2);
  const medianDurationSeconds = durations.length
    ? durations.length % 2
      ? durations[midpoint]
      : Math.round((durations[midpoint - 1] + durations[midpoint]) / 2)
    : 0;
  const hdSignals = collectionVideos.filter(
    (video) => typeof video.isHd === "boolean",
  );
  const aliases = new Set((collection?.aliases || []).map(normalizeSignal));
  const tagCounts = new Map();
  collectionVideos.forEach((video) =>
    (video.tags || []).forEach((rawTag) => {
      const tag = normalizeSignal(rawTag);
      if (tag && !aliases.has(tag))
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }),
  );
  const updatedAt = collectionVideos.reduce(
    (latest, video) =>
      video.syncedAt && (!latest || video.syncedAt > latest)
        ? video.syncedAt
        : latest,
    catalog.generatedAt || null,
  );

  const stats = {
    videoCount: collectionVideos.length,
    medianDurationSeconds,
    totalViews: collectionVideos.reduce(
      (total, video) => total + (Number(video.views) || 0),
      0,
    ),
    hdShare: hdSignals.length
      ? Math.round(
          (hdSignals.filter((video) => video.isHd).length / hdSignals.length) *
            100,
        )
      : null,
    updatedAt,
    relatedTags: [...tagCounts.entries()]
      .sort(
        (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
      )
      .slice(0, 5)
      .map(([tag]) => tag),
  };
  collectionStatsCache.set(collection.slug, stats);
  return stats;
}

export function getRelatedVideos(video, limit = 16) {
  const cacheKey = `${video.id}:${limit}`;
  if (relatedVideosCache.has(cacheKey)) return relatedVideosCache.get(cacheKey);
  const sourceTags = new Set(
    (video.tags || []).map((tag) => tag.toLowerCase()),
  );
  const related = videos
    .filter((candidate) => candidate.id !== video.id)
    .map((candidate) => {
      const overlap = (candidate.tags || []).filter((tag) =>
        sourceTags.has(tag.toLowerCase()),
      ).length;
      const categoryMatch = candidate.category === video.category ? 25 : 0;
      const durationDifference = Math.abs(
        candidate.durationSeconds - video.durationSeconds,
      );
      const durationFit =
        durationDifference < 120 ? 10 : durationDifference < 300 ? 5 : 0;
      return {
        ...candidate,
        relatedScore:
          overlap * 15 +
          categoryMatch +
          durationFit +
          candidate.discoveryScore / 10,
      };
    })
    .sort((a, b) => b.relatedScore - a.relatedScore)
    .slice(0, limit);
  relatedVideosCache.set(cacheKey, related);
  return related;
}

export function getTrendTags(limit = 20) {
  if (trendTagsCache) return trendTagsCache.slice(0, limit);
  const counts = new Map();
  videos.forEach((video) =>
    (video.tags || []).forEach((tag) =>
      counts.set(tag, (counts.get(tag) || 0) + 1),
    ),
  );
  trendTagsCache = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
  return trendTagsCache.slice(0, limit);
}
