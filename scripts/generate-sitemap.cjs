const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://nicevx.com';
const API_BASE = 'https://www.eporner.com/api/v2';
const PER_PAGE = 50;
const MAX_PAGES = 1000; // 50,000 video (Batas maksimal 1 sitemap file dari Google)

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
  
  // Karena rate limit, kita fetch secara paralel batch per batch
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

  console.log(`✅ Total URL yang berhasil diambil: ${allUrls.length}`);
  
  const urlset = allUrls.map(({ url, lastModified }) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xmlContent, 'utf-8');
  console.log(`🎉 Berhasil! Sitemap disimpan di: ${outputPath}`);
}

main();
