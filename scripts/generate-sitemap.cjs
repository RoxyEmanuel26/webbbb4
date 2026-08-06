const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://nicevx.com';
const API_BASE = 'https://www.eporner.com/api/v2';
const PER_PAGE = 70;
const MAX_PAGES = 1500; // 50,000 video (Batas maksimal 1 sitemap file dari Google)

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function safeIso(dateStr, fallback) {
  if (!dateStr) return fallback;
  try {
    const d = new Date(String(dateStr).split(' ')[0]);
    return isNaN(d.getTime()) ? fallback : d.toISOString();
  } catch {
    return fallback;
  }
}

async function fetchVideosPage(page) {
  const apiUrl = `${API_BASE}/video/search/?query=&per_page=${PER_PAGE}&page=${page}&order=top-rated&gay=0&lq=1&format=json`;
  try {
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.error(`[Error] Page ${page} returned status ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.videos || [];
  } catch (error) {
    console.error(`[Error] Fetching page ${page} failed:`, error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Memulai pengumpulan data dari Eporner API...');
  const now = new Date().toISOString();
  
  const BATCH_SIZE = 5; 
  let allUrls = [];
  
  for (let i = 1; i <= MAX_PAGES; i += BATCH_SIZE) {
    const batchPromises = [];
    for (let j = 0; j < BATCH_SIZE && (i + j) <= MAX_PAGES; j++) {
      batchPromises.push(fetchVideosPage(i + j));
    }
    
    console.log(`Mengambil halaman ${i} s/d ${Math.min(i + BATCH_SIZE - 1, MAX_PAGES)}...`);
    const results = await Promise.all(batchPromises);
    
    results.forEach(videos => {
      videos.filter(v => v.id && v.title).forEach(v => {
        allUrls.push({
          url: `${SITE_URL}/video/${slugify(v.title)}-${v.id}`,
          lastModified: safeIso(v.added, now),
        });
      });
    });
  }

  console.log(`✅ Total URL video yang berhasil diambil: ${allUrls.length}`);
  
  const publicDir = path.join(__dirname, '..', 'public');
  const sitemapsDir = path.join(publicDir, 'sitemaps');
  
  // Buat folder sitemaps jika belum ada
  if (!fs.existsSync(sitemapsDir)) {
    fs.mkdirSync(sitemapsDir, { recursive: true });
  }

  // 1. Buat Sitemap Statis (Homepage, Cats, Terms, dll)
  const STATIC_CATEGORIES = [
    '3d','3d-animation','3d-hentai','4k','pov','abella-danger','adult','african',
    'african-casting','ai','amateur','american','anal','anal-compilation','anal-creampie',
    'anal-sex','animation','anime','arab','asian','asian-amateur','babe','bbw','bdsm',
    'big-ass','big-cock','big-dick','big-natural-tits','big-nipples','big-tits',
    'bisexual','black','black-cock','blowjob','bondage','british','brunette','bukakke',
    'casting','caught','celebrity','compilation','cosplay','couple','creampie',
    'cuckold','cumshot','deepthroat','dildo','dirty-talk','doctor','domination',
    'double','double-penetration','ebony','erotic','exotic','facial','family',
    'fantasy','fat','feet','female','femdom','fetish','fingering','fisting',
    'flexible','french','full-movie','gangbang','german','glasses','gloryhole',
    'granny','group-sex','gym','hairy','handjob','hardcore','hd','hentai',
    'hidden-camera','homemade','housewife','indian','indonesia','interracial',
    'italian','japanese','jav','latina','lesbian','lingerie','massage','masturbation',
    'mature','milf','missionary','model','mom','monster-cock','multiple-orgasms',
    'natural','nipples','nuru-massage','office','old','old-man','oral','orgasm',
    'orgy','outdoor','peta-jensen','petite','pornstar','pregnant','public','pussy',
    'reality','redhead','riding','rimjob','rough','russian','school','secretary',
    'skinny','slave','sleeping','slim','small-tits','solowork','squirt','stepmom',
    'stockings','strapon','strip','student','submissive','swallow','swinger',
    'teacher','teen','threesome','tied','toys','uniforms','verified-amateurs',
    'verified-couples','vibrator','video','virgin','vixen','vr','vr-porn',
    'web-series','webcam','wife','wife-bbc','wife-swap','woodman-casting',
    'xlxx','xxx-download','yiny-leon','yoga','youjizz',
  ];

  const staticBaseUrls = [
    '/', '/cats', '/terms', '/privacy', '/dmca', '/usc2257'
  ].map(route => `
  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`).join('');

  const categoryUrls = STATIC_CATEGORIES.map(cat => `
  <url>
    <loc>${SITE_URL}/cat/${cat}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const staticXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticBaseUrls}
${categoryUrls}
</urlset>`;
  fs.writeFileSync(path.join(sitemapsDir, 'sitemap-static.xml'), staticXml, 'utf-8');

  // 2. Pecah Video menjadi beberapa file (Maks 10.000 URL per file)
  const URLS_PER_FILE = 10000;
  const numFiles = Math.ceil(allUrls.length / URLS_PER_FILE);
  const sitemapFiles = ['sitemap-static.xml'];

  for (let i = 0; i < numFiles; i++) {
    const chunk = allUrls.slice(i * URLS_PER_FILE, (i + 1) * URLS_PER_FILE);
    const chunkXml = chunk.map(({ url, lastModified }) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunkXml}
</urlset>`;
    
    const fileName = `sitemap-video-${i + 1}.xml`;
    fs.writeFileSync(path.join(sitemapsDir, fileName), fileContent, 'utf-8');
    sitemapFiles.push(fileName);
  }

  // 3. Buat Sitemap Index (sitemap.xml tetap di root public/)
  const indexContent = sitemapFiles.map(file => `
  <sitemap>
    <loc>${SITE_URL}/sitemaps/${file}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('');

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexContent}
</sitemapindex>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), indexXml, 'utf-8');
  console.log(`🎉 Berhasil! Sitemap Index disimpan di public/sitemap.xml dan ${numFiles} sub-sitemap disimpan di public/sitemaps/`);
}

main();
