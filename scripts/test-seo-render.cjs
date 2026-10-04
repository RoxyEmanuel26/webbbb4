const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, 'out', relativePath), 'utf8');
const catalog = require('../src/data/curated-video-catalog.json');
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

const featuredVideoPath = [...categoryVideos][0];
const watchPage = read(`${featuredVideoPath.slice(1)}.html`);
assert.equal((watchPage.match(/<h1\b/g) || []).length, 1, 'Watch page must have one H1');
assert(watchPage.includes(`href="/collections/${qualifiedHub}"`), 'Watch page must link back to its qualified collection');
assert.match(watchPage, /VideoObject/, 'Watch page must retain video structured data');

console.log(`SEO render gate passed: ${homepageVideos.size} homepage videos, ${categoryVideos.size} category videos, and a linked watch page.`);
