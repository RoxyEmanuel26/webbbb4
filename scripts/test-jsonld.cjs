const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, 'out', rel), 'utf8');

function extractSchemas(html) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return matches.flatMap((m) => {
    try {
      const parsed = JSON.parse(m[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      assert.fail(`Invalid JSON-LD syntax: ${e.message}\nSnippet: ${m[1].slice(0, 100)}`);
    }
  });
}

// 1. Homepage
const homeHtml = read('index.html');
const homeSchemas = extractSchemas(homeHtml);
assert(homeSchemas.some((s) => s['@type'] === 'WebSite' && s.potentialAction?.['@type'] === 'SearchAction'), 'Homepage must contain WebSite schema with SearchAction');
assert(homeSchemas.some((s) => s['@type'] === 'Organization'), 'Homepage must contain Organization schema');
assert(!homeSchemas.some((s) => s['@type'] === 'VideoObject'), 'Homepage should not contain standalone VideoObject schema');

// 2. Category Hub
const catHtml = read('cat/amateur.html');
const catSchemas = extractSchemas(catHtml);
assert(!catSchemas.some((s) => s['@type'] === 'WebSite'), 'Category page must NOT contain WebSite schema');
const catBreadcrumbs = catSchemas.find((s) => s['@type'] === 'BreadcrumbList');
assert(catBreadcrumbs, 'Category page must have BreadcrumbList schema');
assert.equal(catBreadcrumbs.itemListElement.length, 3, 'Category breadcrumb must have 3 levels');
assert.equal(catBreadcrumbs.itemListElement[0].name, 'Home');
assert.equal(catBreadcrumbs.itemListElement[1].name, 'Categories');
assert.equal(catBreadcrumbs.itemListElement[2].name, 'Amateur');
const catItemList = catSchemas.find((s) => s['@type'] === 'ItemList');
assert(catItemList, 'Category hub must have ItemList schema');
assert(catItemList.itemListElement.length >= 12, 'Category ItemList must list items');

// 3. Collection Page
const colHtml = read('collections/amateur.html');
const colSchemas = extractSchemas(colHtml);
assert(colSchemas.some((s) => s['@type'] === 'CollectionPage'), 'Collection must have CollectionPage schema');
assert(colSchemas.some((s) => s['@type'] === 'BreadcrumbList'), 'Collection must have BreadcrumbList schema');
assert(colSchemas.some((s) => s['@type'] === 'ItemList'), 'Collection must have ItemList schema');

// 4. Video Page
const catalog = require('../src/data/curated-video-catalog.json');
const firstVideo = catalog.videos.find((v) => v.availability === 'available' && v.canonicalSlug);
const videoHtml = read(`video/${firstVideo.canonicalSlug}.html`);
const videoSchemas = extractSchemas(videoHtml);
assert(!videoSchemas.some((s) => s['@type'] === 'WebSite'), 'Video page must NOT contain WebSite schema');
const videoObj = videoSchemas.find((s) => s['@type'] === 'VideoObject');
assert(videoObj, 'Video page must contain VideoObject schema');
assert.equal(videoObj.name, firstVideo.title);
assert(videoObj.thumbnailUrl?.length > 0, 'VideoObject must contain thumbnailUrl');
assert(videoObj.uploadDate, 'VideoObject must contain uploadDate');
assert(videoObj.duration && /^PT/i.test(videoObj.duration), 'VideoObject must contain ISO 8601 duration');
assert.equal(videoObj.isFamilyFriendly, false, 'VideoObject isFamilyFriendly must be false');
const videoBreadcrumb = videoSchemas.find((s) => s['@type'] === 'BreadcrumbList');
assert(videoBreadcrumb, 'Video page must have BreadcrumbList schema');
assert.equal(videoBreadcrumb.itemListElement.length, 3, 'Video breadcrumbs must have 3 levels: Home > Category > Video');

console.log('All JSON-LD Structured Data tests passed successfully!');
