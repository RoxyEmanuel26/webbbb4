const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  PORNSTARS,
  MIN_PERFORMER_INDEX_VIDEOS,
  getVideosForPerformer,
} = require('../src/data/pornstars');

const SITE_URL = 'https://www.nicevx.com';
const CATALOG_FILE = path.join(__dirname, '../src/data/curated-video-catalog.json');

function toValidIsoDate(value) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  const now = Date.now();
  return new Date(Math.min(parsed, now)).toISOString();
}

function latestIsoDate(values, fallback) {
  const valid = values.map(toValidIsoDate).filter(Boolean);
  if (valid.length === 0) return fallback || new Date().toISOString();
  return valid.sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}

function getFileGitLastmod(relativePath, fallback) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', relativePath], {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
    }).trim();
    return toValidIsoDate(out) || fallback || new Date().toISOString();
  } catch {
    return fallback || new Date().toISOString();
  }
}

/**
 * Generate sitemap-models.xml containing /pornstars and indexable /pornstar/<slug> profiles.
 */
function buildModelsSitemap({ catalogVideos, outputDir, fallbackLastmod } = {}) {
  const available = Array.isArray(catalogVideos)
    ? catalogVideos.filter((v) => !v.availability || v.availability === 'available')
    : JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8')).videos.filter(
        (v) => v.availability === 'available'
      );

  const fallback =
    toValidIsoDate(fallbackLastmod) ||
    latestIsoDate(available.map((v) => v.sitemapLastmod || v.uploadDate), new Date().toISOString());

  const directoryLastmod = latestIsoDate(
    [
      getFileGitLastmod('src/app/pornstars/page.jsx', fallback),
      getFileGitLastmod('src/data/pornstars.js', fallback),
    ],
    fallback
  );

  const qualified = [];
  for (const star of PORNSTARS) {
    const matched = getVideosForPerformer(star, available);
    if (matched.length >= MIN_PERFORMER_INDEX_VIDEOS) {
      qualified.push({
        slug: star.slug,
        count: matched.length,
        lastmod: latestIsoDate(
          matched.map((v) => v.sitemapLastmod || v.uploadDate),
          directoryLastmod
        ),
      });
    }
  }

  const urls = [
    `  <url>\n    <loc>${SITE_URL}/pornstars</loc>\n    <lastmod>${directoryLastmod}</lastmod>\n  </url>`,
    ...qualified.map(
      (star) =>
        `  <url>\n    <loc>${SITE_URL}/pornstar/${star.slug}</loc>\n    <lastmod>${star.lastmod}</lastmod>\n  </url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  const targetDir = outputDir || path.join(__dirname, '../public/sitemaps');
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'sitemap-models.xml'), xml, 'utf8');

  const modelsSitemapLastmod = latestIsoDate(
    [directoryLastmod, ...qualified.map((q) => q.lastmod)],
    fallback
  );

  return {
    lastmod: modelsSitemapLastmod,
    totalUrls: urls.length,
    qualifiedStars: qualified.length,
  };
}

module.exports = { buildModelsSitemap };

if (require.main === module) {
  const result = buildModelsSitemap();
  console.log(
    `Generated public/sitemaps/sitemap-models.xml with ${result.totalUrls} URLs (${result.qualifiedStars} indexable model profiles).`
  );

  const sitemapIndexPath = path.join(__dirname, '../public/sitemap.xml');
  let indexXml = fs.readFileSync(sitemapIndexPath, 'utf8');

  if (!indexXml.includes('sitemap-models.xml')) {
    const modelEntry = `  <sitemap>\n    <loc>${SITE_URL}/sitemaps/sitemap-models.xml</loc>\n    <lastmod>${result.lastmod}</lastmod>\n  </sitemap>\n</sitemapindex>`;
    indexXml = indexXml.replace('</sitemapindex>', modelEntry);
    fs.writeFileSync(sitemapIndexPath, indexXml, 'utf8');
    console.log('Added sitemap-models.xml to public/sitemap.xml.');
  } else {
    indexXml = indexXml.replace(
      /(<loc>https:\/\/www\.nicevx\.com\/sitemaps\/sitemap-models\.xml<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
      `$1${result.lastmod}$2`
    );
    fs.writeFileSync(sitemapIndexPath, indexXml, 'utf8');
    console.log('Updated lastmod for sitemap-models.xml in public/sitemap.xml.');
  }
}
