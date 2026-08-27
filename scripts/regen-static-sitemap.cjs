const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.nicevx.com';
const now = new Date().toISOString();
const sitemapsDir = path.join(__dirname, '../public/sitemaps');

// Baca ALL_CATEGORIES dinamis dari allCategories.js
const catFile = path.join(__dirname, '../src/data/allCategories.js');
const rawCat = fs.readFileSync(catFile, 'utf8');
// Strip ESM export, evaluate as CJS, capture return value
const cjsRaw = rawCat.replace('export const ALL_CATEGORIES', 'ALL_CATEGORIES');
const ALL_CATEGORIES = (new Function('return ' + cjsRaw))();


const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

// Deduplicate slugs
const seenSlugs = new Set();
const uniqueSlugs = [];
for (const cat of ALL_CATEGORIES) {
  const slug = toSlug(cat.name);
  if (!seenSlugs.has(slug)) {
    seenSlugs.add(slug);
    uniqueSlugs.push(slug);
  }
}

console.log('Total kategori unik:', uniqueSlugs.length);

// Static base pages
const staticBase = [
  { url: SITE_URL + '/',        lastmod: now,          changefreq: 'daily',   priority: '1.0' },
  { url: SITE_URL + '/cats',    lastmod: now,          changefreq: 'daily',   priority: '1.0' },
  { url: SITE_URL + '/terms',   lastmod: '2025-01-01', changefreq: 'monthly', priority: '0.3' },
  { url: SITE_URL + '/privacy', lastmod: '2025-01-01', changefreq: 'monthly', priority: '0.3' },
  { url: SITE_URL + '/dmca',    lastmod: '2025-01-01', changefreq: 'monthly', priority: '0.3' },
  { url: SITE_URL + '/usc2257', lastmod: '2025-01-01', changefreq: 'monthly', priority: '0.3' },
];

function makeUrl(loc, lastmod, changefreq, priority) {
  return '  <url>\n    <loc>' + loc + '</loc>\n    <lastmod>' + lastmod + '</lastmod>\n    <changefreq>' + changefreq + '</changefreq>\n    <priority>' + priority + '</priority>\n  </url>';
}

const baseXml = staticBase.map(function(p) {
  return makeUrl(p.url, p.lastmod, p.changefreq, p.priority);
}).join('\n');

const catXml = uniqueSlugs.map(function(slug) {
  return makeUrl(SITE_URL + '/cat/' + slug, now, 'daily', '0.8');
}).join('\n');

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n' + baseXml + '\n\n' + catXml + '\n</urlset>';

fs.writeFileSync(path.join(sitemapsDir, 'sitemap-static.xml'), xml, 'utf8');

const finalSize = (fs.statSync(path.join(sitemapsDir, 'sitemap-static.xml')).size / 1024).toFixed(1);
console.log('sitemap-static.xml ditulis ulang!');
console.log('Ukuran file:', finalSize, 'KB');
console.log('Total URL:', staticBase.length + uniqueSlugs.length);
console.log('  Base pages:', staticBase.length);
console.log('  /cat/* entries:', uniqueSlugs.length);
