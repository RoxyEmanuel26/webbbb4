import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_CATEGORIES } from '../src/data/allCategories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://nicevx.com';

const staticRoutes = [
  '/',
  '/cats',
  '/terms',
  '/privacy',
  '/dmca',
  '/2257'
];

// Generate category routes
const categoryRoutes = ALL_CATEGORIES.map(cat => 
  `/cat/${cat.name.toLowerCase().replace(/\s+/g, '-')}`
);

const allRoutes = [...staticRoutes, ...categoryRoutes];

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>${route === '/' ? 'always' : route.startsWith('/cat/') ? 'daily' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route.startsWith('/cat/') ? '0.8' : '0.5'}</priority>
  </url>`).join('\n')}
</urlset>`;

const outputPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(outputPath, sitemapContent, 'utf-8');
console.log(`Generated sitemap.xml at ${outputPath} with ${allRoutes.length} URLs.`);
