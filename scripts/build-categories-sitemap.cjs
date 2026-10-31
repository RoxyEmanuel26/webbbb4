const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.nicevx.com';
const catalog = require('../src/data/curated-video-catalog.json').videos;
const catFile = path.join(__dirname, '../src/data/allCategories.js');
const rawCat = fs.readFileSync(catFile, 'utf8');
const cjsRaw = rawCat.replace('export const ALL_CATEGORIES', 'ALL_CATEGORIES');
const ALL_CATEGORIES = (new Function('return ' + cjsRaw))();

const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');
const normalize = (value) => String(value || '').trim().toLowerCase();

const signalsByVideo = new Map(
  catalog.map((v) => [v.id, new Set([v.category, ...(v.tags || [])].map(normalize))])
);

const latestDate = (dates) => {
  const valid = dates.filter(Boolean).map((d) => Date.parse(d)).filter(Number.isFinite);
  return new Date(Math.max(...valid)).toISOString();
};

const qualifiedCategories = [];
for (const cat of ALL_CATEGORIES) {
  const slug = toSlug(cat.name);
  const targetSignal = normalize(cat.name);
  const matches = catalog.filter((v) => {
    if (v.availability !== 'available') return false;
    const signals = signalsByVideo.get(v.id);
    return signals && (signals.has(targetSignal) || signals.has(slug));
  });

  if (matches.length >= 12) {
    const lastmod = latestDate(matches.map((v) => v.syncedAt || v.uploadDate));
    qualifiedCategories.push({ slug, name: cat.name, count: matches.length, lastmod });
  }
}

const catUrlXml = qualifiedCategories
  .map(
    (c) => `
  <url>
    <loc>${SITE_URL}/cat/${c.slug}</loc>
    <lastmod>${c.lastmod}</lastmod>
  </url>`
  )
  .join('');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${catUrlXml}\n</urlset>`;
fs.writeFileSync(path.join(__dirname, '../public/sitemaps/sitemap-categories.xml'), xml, 'utf8');
console.log('Wrote public/sitemaps/sitemap-categories.xml with', qualifiedCategories.length, 'categories');

const catLastmod = latestDate(qualifiedCategories.map((c) => c.lastmod));

const staticXml = fs.readFileSync(path.join(__dirname, '../public/sitemaps/sitemap-static.xml'), 'utf8');
const staticDates = Array.from(staticXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g), (m) => m[1]);
const staticLastmod = latestDate(staticDates);

const videoXml = fs.readFileSync(path.join(__dirname, '../public/sitemaps/sitemap-video-1.xml'), 'utf8');
const videoDates = Array.from(videoXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g), (m) => m[1]);
const videoLastmod = latestDate(videoDates);

const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemaps/sitemap-static.xml</loc>
    <lastmod>${staticLastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemaps/sitemap-categories.xml</loc>
    <lastmod>${catLastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemaps/sitemap-video-1.xml</loc>
    <lastmod>${videoLastmod}</lastmod>
  </sitemap>
</sitemapindex>
`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), indexXml, 'utf8');
console.log('Updated public/sitemap.xml with static, categories, and video sitemaps');
