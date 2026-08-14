const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://nicevx.com';
const API_BASE = 'https://www.eporner.com/api/v2';
const PER_PAGE = 50;
const MAX_PAGES = 10000; // 50,000 video
const URLS_PER_SITEMAP = 49000; // Batas chunk
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
  const xmlUrls = urlsArray.map(url => `
  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
  
  fs.writeFileSync(path.join(sitemapsDir, `sitemap-video-${index}.xml`), xml, 'utf-8');
}

function writeStaticSitemap() {
  const now = new Date().toISOString();

  // Baca ALL_CATEGORIES dari allCategories.js secara dinamis
  // Sehingga setiap penambahan keyword baru otomatis masuk sitemap
  const catFile = path.join(__dirname, '../src/data/allCategories.js');
  const rawCat = fs.readFileSync(catFile, 'utf8');
  const cjsRaw = rawCat.replace('export const ALL_CATEGORIES', 'const ALL_CATEGORIES');
  eval(cjsRaw);
  // ALL_CATEGORIES sekarang tersedia sebagai variabel

  // Generate slug sama dengan toSlug() di frontend
  const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');
  const STATIC_CATEGORIES = ALL_CATEGORIES.map(c => toSlug(c.name));


  const staticBaseUrls = [
    { route: '/',       changefreq: 'daily',   priority: '1.0', lastmod: now },
    { route: '/cats',   changefreq: 'weekly',  priority: '0.8', lastmod: now },
    { route: '/terms',  changefreq: 'monthly', priority: '0.3', lastmod: '2025-01-01' },
    { route: '/privacy',changefreq: 'monthly', priority: '0.3', lastmod: '2025-01-01' },
    { route: '/dmca',   changefreq: 'monthly', priority: '0.3', lastmod: '2025-01-01' },
    { route: '/usc2257',changefreq: 'monthly', priority: '0.3', lastmod: '2025-01-01' },
  ].map(p => `
  <url>
    <loc>${SITE_URL}${p.route}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
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
