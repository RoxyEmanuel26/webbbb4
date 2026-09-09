const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const MIN_COLLECTION_VIDEOS = 12;
const MIN_EDITORIAL_WORDS = 400;
const MAX_EDITORIAL_WORDS = 650;
const MAX_COLLECTION_OVERLAP = 0.7;
const MAX_NEW_COLLECTIONS_PER_RUN = 2;
const MAX_EDITORIALS_PER_RUN = 2;

const BOOTSTRAP_TAGS = [
  "blowjob",
  "brunette",
  "big ass",
  "toys",
  "blonde",
  "webcam",
  "cumshot",
  "latina",
];
const AUTO_COLLECTION_TAXONOMY = new Set([
  "amateur",
  "anal",
  "asian",
  "bbw",
  "bdsm",
  "big ass",
  "big boobs",
  "big natural tits",
  "big tits",
  "black",
  "blonde",
  "blowjob",
  "bondage",
  "brunette",
  "busty",
  "cosplay",
  "creampie",
  "cumshot",
  "deepthroat",
  "dildo",
  "double penetration",
  "ebony",
  "fetish",
  "gangbang",
  "german",
  "group sex",
  "hairy",
  "handjob",
  "hardcore",
  "hentai",
  "indian",
  "interracial",
  "japanese",
  "latina",
  "lesbian",
  "lesbians",
  "lingerie",
  "massage",
  "masturbation",
  "mature",
  "milf",
  "orgasm",
  "orgy",
  "outdoor",
  "petite",
  "pov",
  "redhead",
  "rough",
  "solo",
  "squirt",
  "stepmom",
  "striptease",
  "threesome",
  "toys",
  "vintage",
  "vr",
  "webcam",
]);
const BLOCKED_TAGS = new Set([
  "adult porn",
  "free porn",
  "hd porn",
  "teen",
  "teens",
  "teen anal",
  "anal teen",
]);

const normalizeSignal = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const wordCount = (value) =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

function trimEditorialIntro(value, maxWords = MAX_EDITORIAL_WORDS) {
  const original = String(value || "").trim();
  if (wordCount(original) <= maxWords) return original;
  const paragraphs = original.split(/\n\s*\n/).filter(Boolean);
  while (
    wordCount(paragraphs.join("\n\n")) > maxWords &&
    paragraphs.length >= 4
  ) {
    const lastIndex = paragraphs.length - 1;
    const sentences = paragraphs[lastIndex]
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
    if (sentences.length > 1)
      paragraphs[lastIndex] = sentences.slice(0, -1).join(" ");
    else if (paragraphs.length > 4) paragraphs.pop();
    else break;
  }
  const trimmed = paragraphs.join("\n\n").trim();
  return wordCount(trimmed) >= MIN_EDITORIAL_WORDS &&
    wordCount(trimmed) <= maxWords
    ? trimmed
    : original;
}
const slugify = (value) =>
  normalizeSignal(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const titleCase = (value) =>
  normalizeSignal(value)
    .split(/\s+/)
    .map((part) =>
      part === "pov" || part === "vr" || part === "bbw"
        ? part.toUpperCase()
        : `${part.charAt(0).toUpperCase()}${part.slice(1)}`,
    )
    .join(" ");

function getCollectionVideos(collection, catalog) {
  const aliases = new Set((collection?.aliases || []).map(normalizeSignal));
  return catalog.filter((video) => {
    if (video.availability !== "available") return false;
    return [video.category, ...(video.tags || [])]
      .map(normalizeSignal)
      .some((signal) => aliases.has(signal));
  });
}

function videoIds(collection, catalog) {
  return new Set(
    getCollectionVideos(collection, catalog).map((video) => video.id),
  );
}

function overlapRatio(left, right) {
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  left.forEach((id) => {
    if (right.has(id)) intersection += 1;
  });
  return intersection / Math.min(left.size, right.size);
}

function getOverlapBlocker(collection, collections, catalog) {
  const sourceIds = videoIds(collection, catalog);
  for (const candidate of collections) {
    if (candidate.slug === collection.slug) continue;
    const candidateIds = videoIds(candidate, catalog);
    const candidateWins =
      candidateIds.size > sourceIds.size ||
      (candidateIds.size === sourceIds.size &&
        candidate.slug.localeCompare(collection.slug) < 0);
    if (!candidateWins) continue;
    const ratio = overlapRatio(sourceIds, candidateIds);
    if (ratio > MAX_COLLECTION_OVERLAP) return { slug: candidate.slug, ratio };
  }
  return null;
}

function buildFacts(collection, catalog) {
  const matched = getCollectionVideos(collection, catalog);
  const durations = matched
    .map((video) => Number(video.durationSeconds) || 0)
    .filter(Boolean)
    .sort((a, b) => a - b);
  const midpoint = Math.floor(durations.length / 2);
  const medianDurationSeconds = durations.length
    ? durations.length % 2
      ? durations[midpoint]
      : Math.round((durations[midpoint - 1] + durations[midpoint]) / 2)
    : 0;
  const tagCounts = new Map();
  const aliases = new Set((collection.aliases || []).map(normalizeSignal));
  matched.forEach((video) =>
    (video.tags || []).forEach((tagValue) => {
      const tag = normalizeSignal(tagValue);
      if (tag && !aliases.has(tag))
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }),
  );
  const facts = {
    slug: collection.slug,
    name: collection.name,
    aliases: [...aliases].sort(),
    videoCount: matched.length,
    medianDurationSeconds,
    totalViews: matched.reduce(
      (total, video) => total + (Number(video.views) || 0),
      0,
    ),
    topTags: [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8),
    videoIds: matched.map((video) => video.id).sort(),
  };
  facts.hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(facts))
    .digest("hex");
  return facts;
}

function isQualified(collection, collections, catalog) {
  return (
    collection.status === "editorial-approved" &&
    getCollectionVideos(collection, catalog).length >= MIN_COLLECTION_VIDEOS &&
    wordCount(collection.editorialIntro) >= MIN_EDITORIAL_WORDS &&
    wordCount(collection.editorialIntro) <= MAX_EDITORIAL_WORDS &&
    !getOverlapBlocker(collection, collections, catalog)
  );
}

function makeCandidate(
  tag,
  now = new Date().toISOString(),
  source = "automatic",
) {
  const name = titleCase(tag);
  return {
    slug: slugify(tag),
    name,
    intent: `Curated ${name} discoveries from active catalog records`,
    aliases: [normalizeSignal(tag)],
    selectionRule: `Available catalog items with an exact ${name} category or tag signal.`,
    editorialIntro: `This candidate collection groups verified catalog records carrying an exact ${name} signal. It remains outside search results until its factual editorial review passes every publication gate.`,
    status: "candidate",
    generatedAt: now,
    editorialUpdatedAt: null,
    editorialFactsHash: null,
    source,
  };
}

function normalizeCollection(collection, now) {
  const editorialWords = wordCount(collection.editorialIntro);
  return {
    ...collection,
    status:
      collection.status ||
      (editorialWords >= MIN_EDITORIAL_WORDS
        ? "editorial-approved"
        : "candidate"),
    generatedAt: collection.generatedAt || now,
    editorialUpdatedAt:
      collection.editorialUpdatedAt ||
      (editorialWords >= MIN_EDITORIAL_WORDS ? now : null),
    editorialFactsHash:
      collection.editorialFactsHash ||
      (editorialWords >= MIN_EDITORIAL_WORDS
        ? `manual-review-${now.slice(0, 10)}`
        : null),
    source:
      collection.source ||
      (editorialWords >= MIN_EDITORIAL_WORDS ? "manual" : "bootstrap"),
  };
}

function bootstrapCollections(
  collections,
  catalog,
  now = new Date().toISOString(),
) {
  const normalized = collections.map((collection) =>
    normalizeCollection(collection, now),
  );
  const knownSlugs = new Set(normalized.map((collection) => collection.slug));
  for (const tag of BOOTSTRAP_TAGS) {
    const candidate = makeCandidate(tag, now, "bootstrap");
    if (
      knownSlugs.has(candidate.slug) ||
      getCollectionVideos(candidate, catalog).length < MIN_COLLECTION_VIDEOS
    )
      continue;
    normalized.push(candidate);
    knownSlugs.add(candidate.slug);
  }
  return normalized;
}

function discoverCandidates(
  collections,
  catalog,
  now = new Date().toISOString(),
) {
  const knownSignals = new Set(
    collections.flatMap((collection) =>
      [collection.slug, ...(collection.aliases || [])].map(normalizeSignal),
    ),
  );
  const tagCounts = new Map();
  catalog
    .filter((video) => video.availability === "available")
    .forEach((video) => {
      new Set(
        [video.category, ...(video.tags || [])].map(normalizeSignal),
      ).forEach((tag) => {
        if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

  return [...tagCounts.entries()]
    .filter(
      ([tag, count]) =>
        count >= MIN_COLLECTION_VIDEOS &&
        AUTO_COLLECTION_TAXONOMY.has(tag) &&
        !BLOCKED_TAGS.has(tag) &&
        !knownSignals.has(tag) &&
        slugify(tag),
    )
    .sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
    )
    .map(([tag]) => makeCandidate(tag, now))
    .filter((candidate) => !getOverlapBlocker(candidate, collections, catalog))
    .slice(0, MAX_NEW_COLLECTIONS_PER_RUN);
}

function validateManifest(collections, catalog) {
  const errors = [];
  const slugs = new Set();
  for (const collection of collections) {
    if (!collection.slug || collection.slug !== slugify(collection.slug))
      errors.push(`Invalid slug: ${collection.slug || "(missing)"}`);
    if (slugs.has(collection.slug))
      errors.push(`Duplicate slug: ${collection.slug}`);
    slugs.add(collection.slug);
    if (
      !collection.name ||
      !collection.intent ||
      !collection.selectionRule ||
      !collection.source ||
      !Array.isArray(collection.aliases) ||
      !collection.aliases.length
    )
      errors.push(`Missing fields: ${collection.slug}`);
    if (!["candidate", "editorial-approved"].includes(collection.status))
      errors.push(`Invalid status: ${collection.slug}`);
    if (
      !collection.generatedAt ||
      Number.isNaN(Date.parse(collection.generatedAt))
    )
      errors.push(`Invalid generatedAt: ${collection.slug}`);
    if (
      collection.editorialUpdatedAt &&
      Number.isNaN(Date.parse(collection.editorialUpdatedAt))
    )
      errors.push(`Invalid editorialUpdatedAt: ${collection.slug}`);
    if (
      collection.status === "editorial-approved" &&
      (wordCount(collection.editorialIntro) < MIN_EDITORIAL_WORDS ||
        wordCount(collection.editorialIntro) > MAX_EDITORIAL_WORDS ||
        !collection.editorialFactsHash)
    )
      errors.push(`Invalid approved editorial: ${collection.slug}`);
    if (
      getCollectionVideos(collection, catalog).some(
        (video) => !video.thumbnail || !video.canonicalUrl,
      )
    )
      errors.push(`Invalid collection video: ${collection.slug}`);
  }
  return errors;
}

function validateSitemapParity(collections, catalog, sitemapXml) {
  const expected = collections
    .filter((collection) => isQualified(collection, collections, catalog))
    .map((collection) => collection.slug)
    .sort();
  const actual = [
    ...String(sitemapXml || "").matchAll(
      /<loc>https:\/\/www\.nicevx\.com\/collections\/([^<]+)<\/loc>/g,
    ),
  ]
    .map((match) => match[1])
    .sort();
  if (new Set(actual).size !== actual.length)
    return ["Duplicate collection URL in sitemap"];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    return [
      `Collection sitemap mismatch: expected [${expected.join(", ")}], found [${actual.join(", ")}]`,
    ];
  }
  return [];
}

module.exports = {
  AUTO_COLLECTION_TAXONOMY,
  MAX_EDITORIALS_PER_RUN,
  MAX_EDITORIAL_WORDS,
  MIN_COLLECTION_VIDEOS,
  MIN_EDITORIAL_WORDS,
  bootstrapCollections,
  buildFacts,
  discoverCandidates,
  getCollectionVideos,
  getOverlapBlocker,
  isQualified,
  trimEditorialIntro,
  validateSitemapParity,
  validateManifest,
  wordCount,
};

if (require.main === module) {
  const command = process.argv[2];
  const root = path.join(__dirname, "..");
  const collectionsPath = path.join(root, "src/data/collections.json");
  const catalogPath = path.join(root, "src/data/curated-video-catalog.json");
  const collections = JSON.parse(fs.readFileSync(collectionsPath, "utf8"));
  const catalogPayload = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const catalog = Array.isArray(catalogPayload.videos)
    ? catalogPayload.videos
    : [];
  if (command === "bootstrap") {
    const next = bootstrapCollections(collections, catalog);
    fs.writeFileSync(
      collectionsPath,
      `${JSON.stringify(next, null, 2)}\n`,
      "utf8",
    );
    console.log(
      `Collections bootstrapped: ${collections.length} -> ${next.length}`,
    );
  } else if (command === "validate") {
    const sitemapPath = path.join(root, "public/sitemaps/sitemap-static.xml");
    const sitemapXml = fs.existsSync(sitemapPath)
      ? fs.readFileSync(sitemapPath, "utf8")
      : "";
    const errors = [
      ...validateManifest(collections, catalog),
      ...validateSitemapParity(collections, catalog, sitemapXml),
    ];
    if (errors.length) {
      errors.forEach((error) => console.error(error));
      process.exit(1);
    }
    console.log(`Collection manifest valid: ${collections.length} entries`);
  } else {
    console.error(
      "Usage: node scripts/collection-engine.cjs <bootstrap|validate>",
    );
    process.exit(1);
  }
}
