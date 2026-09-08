import catalog from '@/data/curated-video-catalog.json';
import collections from '@/data/collections.json';

const videos = Array.isArray(catalog.videos) ? catalog.videos : [];

export function getCatalogVideos() {
  return videos;
}

export function getVideoById(id) {
  return videos.find((video) => video.id === id) || null;
}

export function getCollection(slug) {
  return collections.find((collection) => collection.slug === slug) || null;
}

export function getCollections() {
  return collections.map((collection) => ({
    ...collection,
    videos: getCollectionVideos(collection),
  }));
}

export function getCollectionVideos(collectionOrSlug) {
  const collection = typeof collectionOrSlug === 'string' ? getCollection(collectionOrSlug) : collectionOrSlug;
  if (!collection) return [];
  const aliases = new Set(collection.aliases.map((alias) => alias.toLowerCase()));
  return videos.filter((video) => {
    const signals = [video.category, ...(video.tags || [])].map((signal) => String(signal).toLowerCase());
    return signals.some((signal) => aliases.has(signal));
  });
}

export function isCollectionIndexable(collection, collectionVideos = getCollectionVideos(collection)) {
  const words = String(collection?.editorialIntro || '').trim().split(/\s+/).filter(Boolean).length;
  return Boolean(collection && collectionVideos.length >= 12 && words >= 400);
}

export function getRelatedVideos(video, limit = 16) {
  const sourceTags = new Set((video.tags || []).map((tag) => tag.toLowerCase()));
  return videos
    .filter((candidate) => candidate.id !== video.id)
    .map((candidate) => {
      const overlap = (candidate.tags || []).filter((tag) => sourceTags.has(tag.toLowerCase())).length;
      const categoryMatch = candidate.category === video.category ? 25 : 0;
      const durationDifference = Math.abs(candidate.durationSeconds - video.durationSeconds);
      const durationFit = durationDifference < 120 ? 10 : durationDifference < 300 ? 5 : 0;
      return { ...candidate, relatedScore: overlap * 15 + categoryMatch + durationFit + candidate.discoveryScore / 10 };
    })
    .sort((a, b) => b.relatedScore - a.relatedScore)
    .slice(0, limit);
}

export function getTrendTags(limit = 20) {
  const counts = new Map();
  videos.forEach((video) => (video.tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([tag]) => tag);
}
