const fs = require('fs');
const path = require('path');
const { getAllPornstars } = require('../src/data/pornstars');

const SITE_URL = 'https://www.nicevx.com';
const lastmod = new Date().toISOString();

const stars = getAllPornstars();

const urls = [
  `  <url>\n    <loc>${SITE_URL}/pornstars</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
  ...stars.map(
    (star) =>
      `  <url>\n    <loc>${SITE_URL}/pornstar/${star.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

const sitemapsDir = path.join(__dirname, '../public/sitemaps');
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-models.xml'), xml, 'utf8');
console.log(`Generated public/sitemaps/sitemap-models.xml with ${urls.length} model URLs.`);

// Update sitemap index
const sitemapIndexPath = path.join(__dirname, '../public/sitemap.xml');
let indexXml = fs.readFileSync(sitemapIndexPath, 'utf8');

if (!indexXml.includes('sitemap-models.xml')) {
  const modelEntry = `  <sitemap>
    <loc>${SITE_URL}/sitemaps/sitemap-models.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
  indexXml = indexXml.replace('</sitemapindex>', modelEntry);
  fs.writeFileSync(sitemapIndexPath, indexXml, 'utf8');
  console.log('Added sitemap-models.xml to public/sitemap.xml.');
} else {
  // Update lastmod for sitemap-models.xml
  indexXml = indexXml.replace(
    /(<loc>https:\/\/www\.nicevx\.com\/sitemaps\/sitemap-models\.xml<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
    `$1${lastmod}$2`
  );
  fs.writeFileSync(sitemapIndexPath, indexXml, 'utf8');
  console.log('Updated lastmod for sitemap-models.xml in public/sitemap.xml.');
}
