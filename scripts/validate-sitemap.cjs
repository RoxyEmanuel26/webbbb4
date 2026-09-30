const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const indexPath = path.join(publicDir, 'sitemap.xml');
const catalogPath = path.join(root, 'src/data/curated-video-catalog.json');
const MAX_URLS = 50000;
const MAX_BYTES = 50 * 1024 * 1024;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function matches(xml, pattern) {
  return Array.from(xml.matchAll(pattern), (match) => match[1]);
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function assertValidLastmods(xml, label) {
  const values = matches(xml, /<lastmod>([^<]+)<\/lastmod>/g);
  assert(values.length > 0, `${label} must contain lastmod values`);
  for (const value of values) {
    assert(!Number.isNaN(Date.parse(value)), `${label} contains invalid lastmod: ${value}`);
    assert(Date.parse(value) <= Date.now() + 300000, `${label} contains a future lastmod: ${value}`);
  }
  return values;
}

function maxDate(values) {
  return new Date(Math.max(...values.map((value) => Date.parse(value)))).toISOString();
}

assert(fs.existsSync(indexPath), 'public/sitemap.xml is missing');
const indexXml = read(indexPath);
assert.match(indexXml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
assert.match(indexXml, /<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
assert.doesNotMatch(indexXml, /<priority>|<changefreq>/, 'Sitemap index contains ignored tags');
const indexLastmods = assertValidLastmods(indexXml, 'sitemap.xml');
const childUrls = matches(indexXml, /<loc>([^<]+)<\/loc>/g).map(decodeXml);
assert(childUrls.length > 0, 'Sitemap index has no child sitemaps');
assert.equal(new Set(childUrls).size, childUrls.length, 'Sitemap index contains duplicate child URLs');

const allPageUrls = new Set();
const catalog = JSON.parse(read(catalogPath));
const catalogVideos = (catalog.videos || []).filter((video) => video.availability === 'available');
const canonicalVideos = new Set(catalogVideos.map((video) => video.canonicalUrl));
assert.equal(new Set(catalogVideos.map((video) => video.id)).size, catalogVideos.length, 'Catalog contains duplicate video IDs');
assert.equal(canonicalVideos.size, catalogVideos.length, 'Catalog contains duplicate canonical URLs');
for (const video of catalogVideos) {
  assert.match(video.canonicalSlug || '', /^[a-z0-9][a-z0-9-]*-[A-Za-z0-9]+$/, `Invalid canonical video slug: ${video.canonicalSlug}`);
  assert.equal(video.canonicalUrl, `https://www.nicevx.com/video/${video.canonicalSlug}`, `Canonical URL/slug mismatch: ${video.id}`);
}
let videoUrlCount = 0;

for (let index = 0; index < childUrls.length; index++) {
  const childUrl = new URL(childUrls[index]);
  assert.equal(childUrl.protocol, 'https:', `Child sitemap is not HTTPS: ${childUrl}`);
  assert.equal(childUrl.hostname, 'www.nicevx.com', `Child sitemap has the wrong host: ${childUrl}`);
  const childPath = path.join(publicDir, childUrl.pathname.replace(/^\//, ''));
  assert(fs.existsSync(childPath), `Referenced child sitemap is missing: ${childUrl.pathname}`);
  assert(fs.statSync(childPath).size <= MAX_BYTES, `${childUrl.pathname} exceeds 50MB`);
  const xml = read(childPath);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.doesNotMatch(xml, /<priority>|<changefreq>/, `${childUrl.pathname} contains tags ignored by Google`);
  const childLastmods = assertValidLastmods(xml, childUrl.pathname);
  assert.equal(
    new Date(Date.parse(indexLastmods[index])).toISOString(),
    maxDate(childLastmods),
    `${childUrl.pathname} index lastmod must match its newest URL`,
  );
  const urlBlocks = matches(xml, /<url>([\s\S]*?)<\/url>/g);
  assert(urlBlocks.length <= MAX_URLS, `${childUrl.pathname} exceeds 50,000 URLs`);

  for (const block of urlBlocks) {
    const loc = decodeXml(matches(block, /<loc>([^<]+)<\/loc>/g)[0] || '');
    assert(loc, `${childUrl.pathname} contains a URL without loc`);
    const parsed = new URL(loc);
    assert.equal(parsed.protocol, 'https:', `Non-HTTPS URL in sitemap: ${loc}`);
    assert.equal(parsed.hostname, 'www.nicevx.com', `Wrong host in sitemap: ${loc}`);
    assert.equal(parsed.search, '', `Query URL must not be in sitemap: ${loc}`);
    assert(!allPageUrls.has(loc), `Duplicate sitemap URL: ${loc}`);
    allPageUrls.add(loc);

    if (childUrl.pathname.includes('sitemap-video-')) {
      videoUrlCount++;
      assert(canonicalVideos.has(loc), `Video sitemap URL is not an active canonical catalog URL: ${loc}`);
      assert.match(block, /<video:video>/);
      assert.match(block, /<video:thumbnail_loc>https:\/\//);
      assert.match(block, /<video:title>[^<]+<\/video:title>/);
      assert.match(block, /<video:description>[^<]+<\/video:description>/);
      assert.match(block, /<video:player_loc>https:\/\//);
      assert.match(block, /<video:family_friendly>no<\/video:family_friendly>/);
      const description = decodeXml(matches(block, /<video:description>([^<]+)<\/video:description>/g)[0] || '');
      assert(description.length <= 2048, `Video description exceeds 2048 characters: ${loc}`);
      assert(!/[\uFFFD\u0080-\u009F]|(?:Ã.|Â.|â.)/.test(block), `Possible mojibake in video sitemap: ${loc}`);
      const duration = Number(matches(block, /<video:duration>(\d+)<\/video:duration>/g)[0] || 0);
      assert(!duration || (duration > 0 && duration <= 28800), `Invalid video duration: ${loc}`);
    } else {
      assert(!parsed.pathname.startsWith('/watch'), 'Live noindex watch URLs must stay out of sitemap');
      assert(!parsed.pathname.startsWith('/cat/'), 'Noindex category URLs must stay out of sitemap');
    }
  }
}

assert.equal(videoUrlCount, canonicalVideos.size, `Video sitemap/catalog mismatch: ${videoUrlCount}/${canonicalVideos.size}`);
console.log(`Sitemap validation passed: ${childUrls.length} child files, ${allPageUrls.size} canonical URLs, ${videoUrlCount} videos.`);
