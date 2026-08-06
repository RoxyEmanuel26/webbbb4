const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://nicevx.com';
const API_BASE = 'https://www.eporner.com/api/v2';
const PER_PAGE = 50;
const MAX_PAGES = 5000; // 50,000 video
const URLS_PER_SITEMAP = 10000; // Batas chunk
const BATCH_SIZE = 5;

const isResumeMode = process.argv.includes('--resume');

const sitemapsDir = path.join(__dirname, '../public/sitemaps');
const publicDir = path.join(__dirname, '../public');

// Global Set untuk mencegah duplikat 100%
const seenUrls = new Set();
let startPage = 1;
let currentChunkIndex = 1;
let currentChunkUrls = [];

function slugify(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function initState() {
  if (!isResumeMode) {
    console.log('🧹 [Fresh Mode] Menghapus sitemap lama untuk menghindari Pagination Shift Bug...');
    if (fs.existsSync(sitemapsDir)) {
      fs.rmSync(sitemapsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(sitemapsDir, { recursive: true });
    return;
  }

  if (!fs.existsSync(sitemapsDir)) fs.mkdirSync(sitemapsDir, { recursive: true });

  const files = fs.readdirSync(sitemapsDir).filter(f => f.startsWith('sitemap-video-') && f.endsWith('.xml'));
  if (files.length === 0) return;

  let totalVideoUrls = 0;
  for (const file of files) {
    const num = parseInt(file.replace('sitemap-video-', '').replace('.xml', ''));
    if (num > currentChunkIndex) {
      currentChunkIndex = num;
    }
    
    const content = fs.readFileSync(path.join(sitemapsDir, file), 'utf-8');
    const matches = content.match(/<loc>(.*?)<\/loc>/g);
    if (matches) {
      matches.forEach(m => {
        const url = m.replace('<loc>', '').replace('</loc>', '');
        seenUrls.add(url);
        totalVideoUrls++;
      });
    }
  }

  // Jika ada file yang sudah diproses, baca URL-nya ke dalam chunk berjalan agar bisa di-append
  const lastChunkFile = path.join(sitemapsDir, `sitemap-video-${currentChunkIndex}.xml`);
  if (fs.existsSync(lastChunkFile)) {
    const content = fs.readFileSync(lastChunkFile, 'utf-8');
    const matches = content.match(/<loc>(.*?)<\/loc>/g);
    if (matches) {
      currentChunkUrls = matches.map(m => m.replace('<loc>', '').replace('</loc>', ''));
    }
    
    // Jika chunk terakhir sudah penuh, loncat ke chunk berikutnya
    if (currentChunkUrls.length >= URLS_PER_SITEMAP) {
      currentChunkIndex++;
      currentChunkUrls = [];
    }
  }

  // Hitung harus mulai dari halaman API ke berapa
  startPage = Math.floor(totalVideoUrls / PER_PAGE) + 1;
  if (startPage > 1) {
    console.log(`[Emergency Resume] Ditemukan ${totalVideoUrls} video di disk. Melanjutkan dari Halaman API ${startPage}...`);
  }
}

function writeChunk(index, urlsArray) {
  const now = new Date().toISOString();
  const xmlUrls = urlsArray.map(url => `
  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls}\n</urlset>`;
  
  fs.writeFileSync(path.join(sitemapsDir, `sitemap-video-${index}.xml`), xml, 'utf-8');
}

function writeStaticSitemap() {
  const now = new Date().toISOString();
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

  const staticXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticBaseUrls}\n${categoryUrls}\n</urlset>`;
  fs.writeFileSync(path.join(sitemapsDir, 'sitemap-static.xml'), staticXml, 'utf-8');
}

function writeIndexSitemap() {
  const now = new Date().toISOString();
  let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  indexXml += `  <sitemap>\n    <loc>${SITE_URL}/sitemaps/sitemap-static.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>\n`;
  
  const maxChunk = currentChunkUrls.length > 0 ? currentChunkIndex : currentChunkIndex - 1;
  
  for (let i = 1; i <= maxChunk; i++) {
    indexXml += `  <sitemap>\n    <loc>${SITE_URL}/sitemaps/sitemap-video-${i}.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>\n`;
  }
  
  indexXml += `</sitemapindex>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), indexXml, 'utf-8');
}

async function run() {
  console.log('🚀 Memulai pengumpulan data dari Eporner API...');
  
  initState();

  for (let i = startPage; i <= MAX_PAGES; i += BATCH_SIZE) {
    const batchPromises = [];
    const end = Math.min(i + BATCH_SIZE - 1, MAX_PAGES);
    
    console.log(`Mengambil halaman ${i} s/d ${end}...`);
    for (let p = i; p <= end; p++) {
      batchPromises.push(
        fetch(`${API_BASE}/video/search/?query=&per_page=${PER_PAGE}&page=${p}&order=top-rated`)
          .then(res => res.json())
          .catch(e => {
            console.error(`Gagal mengambil halaman ${p}`);
            return null;
          })
      );
    }

    const results = await Promise.all(batchPromises);
    
    for (const data of results) {
      if (data && data.videos) {
        for (const video of data.videos) {
          const url = `${SITE_URL}/video/${slugify(video.title)}-${video.id}`;
          
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            currentChunkUrls.push(url);

            if (currentChunkUrls.length >= URLS_PER_SITEMAP) {
              writeChunk(currentChunkIndex, currentChunkUrls);
              console.log(`💾 Tersimpan: sitemap-video-${currentChunkIndex}.xml (10,000 URLs) - RAM Dikeringkan.`);
              currentChunkIndex++;
              currentChunkUrls = [];
            }
          }
        }
      }
    }
  }

  if (currentChunkUrls.length > 0) {
    writeChunk(currentChunkIndex, currentChunkUrls);
    console.log(`💾 Tersimpan: sitemap-video-${currentChunkIndex}.xml (${currentChunkUrls.length} URLs)`);
  }

  console.log('📦 Membuat sitemap-static.xml dan Index Sitemap...');
  writeStaticSitemap();
  writeIndexSitemap();

  console.log(`✅ Total URL unik yang dikumpulkan: ${seenUrls.size}`);
  console.log('🎉 Selesai 100%! Semua file tersimpan dengan aman.');
}

run();
