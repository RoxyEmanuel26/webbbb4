const assert = require("assert/strict");
const {
  bootstrapCollections,
  discoverCandidates,
  getCollectionVideos,
  getOverlapBlocker,
  isQualified,
  trimEditorialIntro,
  validateManifest,
  validateSitemapParity,
  wordCount,
} = require("./collection-engine.cjs");

const intro = Array.from({ length: 420 }, (_, index) => `word${index}`).join(
  " ",
);
const makeVideo = (id, tags = ["alpha"]) => ({
  id: String(id).padStart(11, "0"),
  category: tags[0],
  tags,
  availability: "available",
  thumbnail: `https://example.test/${id}.jpg`,
  canonicalUrl: `https://www.nicevx.com/video/test-${String(id).padStart(11, "0")}`,
  durationSeconds: 600,
  views: 100,
});
const makeCollection = (
  slug,
  aliases,
  status = "candidate",
  editorialIntro = "draft",
) => ({
  slug,
  name: slug,
  intent: `A factual collection for ${slug}`,
  aliases,
  selectionRule: `Match the exact ${slug} source signal.`,
  editorialIntro,
  status,
  generatedAt: "2026-09-09T00:00:00.000Z",
  editorialUpdatedAt:
    status === "editorial-approved" ? "2026-09-09T00:00:00.000Z" : null,
  editorialFactsHash: status === "editorial-approved" ? "test-hash" : null,
  source: "test",
});

const elevenVideos = Array.from({ length: 11 }, (_, index) =>
  makeVideo(index + 1),
);
const twelveVideos = [...elevenVideos, makeVideo(12)];
const approved = makeCollection(
  "alpha",
  ["alpha"],
  "editorial-approved",
  intro,
);
assert.equal(
  getCollectionVideos(approved, []).length,
  0,
  "empty catalog must produce an empty collection",
);
assert.equal(
  isQualified(approved, [approved], elevenVideos),
  false,
  "eleven videos must remain noindex",
);
assert.equal(
  isQualified(makeCollection("alpha", ["alpha"]), [approved], twelveVideos),
  false,
  "short editorial must remain noindex",
);
assert.equal(
  isQualified(approved, [approved], twelveVideos),
  true,
  "exact threshold plus approved editorial must qualify",
);

const dominant = makeCollection(
  "dominant",
  ["alpha"],
  "editorial-approved",
  intro,
);
const overlap = makeCollection(
  "overlap",
  ["alpha"],
  "editorial-approved",
  intro,
);
assert.ok(
  getOverlapBlocker(overlap, [dominant, overlap], twelveVideos),
  "a duplicate intent must receive an overlap blocker",
);
assert.equal(
  isQualified(overlap, [dominant, overlap], twelveVideos),
  false,
  "overlapping collection must remain noindex",
);

const automaticCatalog = Array.from({ length: 12 }, (_, index) =>
  makeVideo(index + 100, ["webcam"]),
);
const discovered = discoverCandidates([], automaticCatalog);
assert.equal(
  discovered[0]?.slug,
  "webcam",
  "a safe exact tag at the threshold should be discovered",
);
const blockedCatalog = Array.from({ length: 12 }, (_, index) =>
  makeVideo(index + 200, ["teens"]),
);
assert.equal(
  discoverCandidates([], blockedCatalog).length,
  0,
  "blocked sensitive tags must never become collections",
);

const bootstrapped = bootstrapCollections(
  [makeCollection("base", ["base"])],
  [],
);
assert.equal(
  bootstrapped.length,
  1,
  "bootstrap must not add empty collections",
);
assert.deepEqual(
  validateManifest([approved], twelveVideos),
  [],
  "valid approved manifest should pass",
);
const qualifiedSitemap = "<loc>https://www.nicevx.com/collections/alpha</loc>";
assert.deepEqual(
  validateSitemapParity([approved], twelveVideos, qualifiedSitemap),
  [],
  "qualified collections must match sitemap URLs",
);
assert.equal(
  validateSitemapParity([approved], twelveVideos, "").length,
  1,
  "missing qualified sitemap URL must fail",
);
const overlong = Array.from(
  { length: 5 },
  (_, paragraph) =>
    `${Array.from({ length: 120 }, (_, word) => `p${paragraph}w${word}`).join(" ")}. ${Array.from({ length: 12 }, (_, word) => `tail${paragraph}w${word}`).join(" ")}.`,
).join("\n\n");
assert.ok(
  wordCount(trimEditorialIntro(overlong)) <= 650,
  "overlong editorial should trim at a sentence or paragraph boundary",
);

console.log("Collection engine tests passed.");
