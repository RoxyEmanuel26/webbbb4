const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, 'out', relativePath), 'utf8');
const catalog = require('../src/data/curated-video-catalog.json');
const collections = require('../src/data/collections.json');
const publishedUrls = new Set(catalog.videos.map((video) => video.canonicalUrl));
const staticSitemap = fs.readFileSync(path.join(root, 'public/sitemaps/sitemap-static.xml'), 'utf8');
const qualifiedHub = staticSitemap.match(/<loc>https:\/\/www\.nicevx\.com\/collections\/([a-z0-9-]+)<\/loc>/)?.[1];
assert(qualifiedHub, 'At least one qualified collection must exist in the sitemap');
const localVideoLinks = (html) => new Set(
  [...html.matchAll(/href="(\/video\/[^"?#]+)"/g)].map((match) => match[1]),
);

const homepage = read('index.html');
const homepageVideos = localVideoLinks(homepage);
assert.equal((homepage.match(/<h1\b/g) || []).length, 1, 'Homepage must have one H1 in the initial HTML');
assert(homepageVideos.size >= 24, `Homepage has only ${homepageVideos.size} canonical video links`);
for (const href of homepageVideos) {
  assert(publishedUrls.has(`https://www.nicevx.com${href}`), `Homepage links to an unpublished video: ${href}`);
}
assert(homepage.includes(`href="/collections/${qualifiedHub}"`), 'Homepage must link to an indexable collection');
assert.doesNotMatch(homepage, /href="\/tag\//, 'Published cards must not link to noindex or missing tag pages');
assert.doesNotMatch(homepage, /<meta name="robots" content="noindex/, 'Homepage must remain indexable');

const category = read(`cat/${qualifiedHub}.html`);
const categoryVideos = localVideoLinks(category);
assert.equal((category.match(/<h1\b/g) || []).length, 1, 'Category must have one H1 in the initial HTML');
assert(categoryVideos.size >= 12, `Featured category has only ${categoryVideos.size} canonical video links`);
assert.match(category, /<meta name="robots" content="noindex/, 'Category must remain noindex until it has distinct editorial value');
assert(category.includes(`href="/collections/${qualifiedHub}"`), 'Category must link to its collection');

const collection = read(`collections/${qualifiedHub}.html`);
assert.match(collection, /Find something to watch/, 'Collection must offer a useful discovery guide');
assert.match(collection, /Recently published/, 'Collection must show publication-based picks');
assert.match(collection, /Most viewed/, 'Collection must show source-view-based picks');
assert.match(collection, /Shorter videos/, 'Collection must show duration-based picks');
for (const href of localVideoLinks(collection)) {
  assert(publishedUrls.has(`https://www.nicevx.com${href}`), `Collection links to an unpublished video: ${href}`);
}
const collectionRecord = collections.find((item) => item.slug === qualifiedHub);
const aliases = new Set(collectionRecord.aliases.map((alias) => alias.toLowerCase()));
const collectionVideos = catalog.videos.filter((video) =>
  video.availability === 'available' &&
  [video.category, ...(video.tags || [])].some((signal) => aliases.has(String(signal).trim().toLowerCase())) &&
  video.title?.trim().length >= 10 && video.title.trim().length <= 140 &&
  !/^(?:sku\b|untitled$|hidden$|video$)/i.test(video.title.trim()) &&
  !/[\uFFFD\u0080-\u009F]/.test(video.title) &&
  !/[\p{Extended_Pictographic}\p{So}]/u.test(video.title),
);
const firstVideoInGroup = (heading) => {
  const group = collection.match(new RegExp(`<h3>${heading}</h3><ol><li><a href="(/video/[^"?#]+)"`));
  assert(group, `Missing populated ${heading} discovery group`);
  return group[1];
};
const byId = (left, right) => String(left.id).localeCompare(String(right.id));
const mostViewed = collectionVideos.filter((video) => Number(video.views) > 0)
  .sort((left, right) => Number(right.views) - Number(left.views) || byId(left, right))[0];
const shorter = collectionVideos.filter((video) => Number(video.durationSeconds) > 0)
  .sort((left, right) => Number(left.durationSeconds) - Number(right.durationSeconds) || byId(left, right))[0];
const recent = collectionVideos.filter((video) => Number.isFinite(Date.parse(video.uploadDate)))
  .sort((left, right) => Date.parse(right.uploadDate) - Date.parse(left.uploadDate) || byId(left, right))[0];
assert.equal(firstVideoInGroup('Recently published'), `/video/${recent.canonicalSlug}`);
assert.equal(firstVideoInGroup('Most viewed'), `/video/${mostViewed.canonicalSlug}`);
assert.equal(firstVideoInGroup('Shorter videos'), `/video/${shorter.canonicalSlug}`);

const featuredVideoPath = [...categoryVideos][0];
const watchPage = read(`${featuredVideoPath.slice(1)}.html`);
assert.equal((watchPage.match(/<h1\b/g) || []).length, 1, 'Watch page must have one H1');
assert(watchPage.includes(`href="/collections/${qualifiedHub}"`), 'Watch page must link back to its qualified collection');
assert.match(watchPage, /VideoObject/, 'Watch page must retain video structured data');
assert.match(watchPage, /How this video compares/, 'Watch page must render a factual catalog comparison');
assert.match(watchPage, /Similar length and tags/, 'Watch page must link to comparable videos');
assert.doesNotMatch(watchPage, /median of NaN|ranks -1 of|undefined views/, 'Comparison must contain only factual numbers');

console.log(`SEO render gate passed: ${homepageVideos.size} homepage videos, ${categoryVideos.size} category videos, collection guide, and a contextual watch page.`);
