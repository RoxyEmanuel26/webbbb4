const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://nicevx.com';
const API_BASE = 'https://www.eporner.com/api/v2';
const PER_PAGE = 50;
const MAX_PAGES = 400; // 50,000 video
const URLS_PER_SITEMAP = 5000; // Batas chunk
const BATCH_SIZE = 5;

// Konfigurasi AI
const MAX_AI_PER_RUN = 50; // Batasi max 50 video AI per run agar tidak lama & mahal
let aiProcessedCount = 0;
const AI_SEO_FILE = path.join(__dirname, '../src/data/ai-seo.json');
let aiSeoData = {};
if (fs.existsSync(AI_SEO_FILE)) {
  try { aiSeoData = JSON.parse(fs.readFileSync(AI_SEO_FILE, 'utf-8')); } catch (e) { }
} else {
  if (!fs.existsSync(path.dirname(AI_SEO_FILE))) fs.mkdirSync(path.dirname(AI_SEO_FILE), { recursive: true });
}

let DEEPSEEK_API_KEY = null;
try {
  const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
  const match = envFile.match(/DEEPSEEK_API_KEY=["']?(.*?)["']?$/m);
  if (match) DEEPSEEK_API_KEY = match[1].trim();
} catch (e) { }

const isResumeMode = process.argv.includes('--resume');

const sitemapsDir = path.join(__dirname, '../public/sitemaps');
const publicDir = path.join(__dirname, '../public');

// Global Set untuk mencegah duplikat 100%
const seenUrls = new Set();
let startPage = 1;
let currentChunkIndex = 1;
let currentChunkUrls = [];

// Daftar kategori valid (top 80 berdasarkan allCategories.js)
const VALID_CATEGORIES = [
  "adult porn", "amateur", "american", "anal", "anal teen", "asian", "asian anal",
  "bbc", "bbc interracial", "bbw", "bdsm", "big ass", "big ass latina", "big boobs",
  "big natural tits", "big tits", "black", "blonde", "blowjob", "bondage", "busty",
  "creampie", "deepthroat", "dildo", "double penetration", "ebony", "ebony big ass",
  "first time", "free porn", "gangbang", "german", "hairy", "handjob", "hardcore",
  "hd porn", "hentai", "homemade", "indian", "indian homemade", "interracial",
  "interracial anal", "japanese", "japanese milf", "japanese sex", "latina",
  "latina anal", "lesbian", "lesbians", "lingerie", "massage", "masturbation",
  "mature", "mature anal", "milf", "milf mom", "mom", "old man", "orgasm", "orgy",
  "outdoor", "petite", "POV", "public", "redhead", "rough", "solo", "squirt", "step",
  "stepmom", "teen", "teen anal", "threesome"
];

async function curateWithDeepSeek(video) {
  if (!DEEPSEEK_API_KEY) return null;
  if (aiSeoData[video.id]) return aiSeoData[video.id]; // Sudah pernah diproses
  if (aiProcessedCount >= MAX_AI_PER_RUN) return null; // Limit tercapai

  aiProcessedCount++;
  console.log(`[AI] Menganalisis video: ${video.title}`);

  // priorityScore dihitung dari data views asli (bukan tebakan AI)
  // Views > 100k = 1.0, > 50k = 0.9, > 10k = 0.8, > 1k = 0.7, else = 0.6
  const views = parseInt(video.views) || 0;
  const priorityScore = views > 100000 ? 1.0
    : views > 50000 ? 0.9
      : views > 10000 ? 0.8
        : views > 1000 ? 0.7
          : 0.6;

  const categoryList = VALID_CATEGORIES.join(', ');

  // Fetch keywords nyata dari endpoint /video/id/ — endpoint /search/ hanya mengembalikan judul sebagai keywords
  let realKeywords = video.keywords || '';
  try {
    const detailRes = await fetch(`${API_BASE}/video/id/?id=${video.id}&format=json`);
    if (detailRes.ok) {
      const detailData = await detailRes.json();
      if (detailData && detailData.keywords && detailData.keywords !== video.title) {
        realKeywords = detailData.keywords;
      }
    }
  } catch (_) { }

  const prompt = `Video details:
- Title: "${video.title}"
- Tags/keywords: ${realKeywords || 'none'}
- Views: ${views}

Tasks:
1. SEO Writer: Write a factually accurate, unique 2-sentence SEO description in English (140–160 characters total).
   Rules:
   - MUST naturally incorporate 2–3 of the most relevant keywords from the Tags/keywords list above.
   - Base it strictly on the title AND tags — do NOT invent content not hinted at by the data.
   - Write for an adult (18+) audience. Do not hide the nature of the content.
   - Each video must have a structurally different sentence pattern — avoid starting every description with "Watch".

2. Keyword Cleanser: From the Tags/keywords above, return max 8 lowercase tags that are genuinely relevant to this specific video. Remove duplicates, typos, and tags unrelated to the title or content.

3. Category: Pick the single most accurate category from this list ONLY: ${categoryList}. If nothing fits, use "adult porn".

4. Spam Detection: Set isSpam: true ONLY if the title shows clear signs of deception — e.g. keywords completely unrelated to each other (spam stuffing), nonsensical random characters, or obvious clickbait with no real content signal. Content category (straight, gay, lesbian, trans, etc.) is NEVER a spam indicator.

Respond ONLY with raw JSON:
{
  "seoDescription": "...",
  "cleanedTags": ["tag1", "tag2"],
  "category": "...",
  "isSpam": false
}`;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });
    const data = await res.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Simpan ke memory & file (tambahkan priorityScore dari views asli)
    aiSeoData[video.id] = { ...result, priorityScore };
    fs.writeFileSync(AI_SEO_FILE, JSON.stringify(aiSeoData, null, 2), 'utf-8');
    return aiSeoData[video.id];
  } catch (e) {
    console.error(`[AI Error] Gagal memproses ${video.id}: ${e.message}`);
    return null;
  }
}

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

  // Start a new chunk instead of appending to avoid parsing complex Video XMLs
  currentChunkIndex++;
  currentChunkUrls = [];

  // Hitung harus mulai dari halaman API ke berapa
  startPage = Math.floor(totalVideoUrls / PER_PAGE) + 1;
  if (startPage > 1) {
    console.log(`[Emergency Resume] Ditemukan ${totalVideoUrls} video di disk. Melanjutkan dari Halaman API ${startPage}...`);
  }
}

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function writeChunk(index, urlsArray) {
  const xmlUrls = urlsArray.map(item => `
  <url>
    <loc>${item.url}</loc>
    <priority>${item.priority || 0.8}</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(item.thumbnail_loc)}</video:thumbnail_loc>
      <video:title>${escapeXml(item.title)}</video:title>
      <video:description>${escapeXml(item.description)}</video:description>
      <video:player_loc>${escapeXml(item.player_loc)}</video:player_loc>
      <video:duration>${item.duration}</video:duration>
      <video:publication_date>${item.publication_date}</video:publication_date>
      <video:family_friendly>no</video:family_friendly>
      ${(item.tags && item.tags.length > 0) ? item.tags.map(t => `<video:tag>${escapeXml(t)}</video:tag>`).join('\n      ') : ''}
    </video:video>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
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
  let ALL_CATEGORIES = [];
  const cjsRaw = rawCat.replace('export const ALL_CATEGORIES', 'ALL_CATEGORIES');
  eval(cjsRaw);
  // ALL_CATEGORIES sekarang tersedia sebagai variabel

  // Generate slug sama dengan toSlug() di frontend
  const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');
  const STATIC_CATEGORIES = ALL_CATEGORIES.map(c => toSlug(c.name));


  const staticBaseUrls = [
    { route: '/', changefreq: 'daily', priority: '1.0', lastmod: now },
    { route: '/cats', changefreq: 'weekly', priority: '0.8', lastmod: now },
    { route: '/terms', changefreq: 'monthly', priority: '0.3', lastmod: '2025-01-01' },
    { route: '/privacy', changefreq: 'monthly', priority: '0.3', lastmod: '2025-01-01' },
    { route: '/dmca', changefreq: 'monthly', priority: '0.3', lastmod: '2025-01-01' },
    { route: '/usc2257', changefreq: 'monthly', priority: '0.3', lastmod: '2025-01-01' },
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
        fetch(`${API_BASE}/video/search/?query=&per_page=${PER_PAGE}&page=${p}&order=new`)
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
            // ---> AI Curation Tembak Disini <---
            await curateWithDeepSeek(video);

            const aiData = aiSeoData[video.id];

            // GATEKEEPER: Buang video jika terdeteksi SPAM / Bukan Niche
            if (aiData && aiData.isSpam) {
              console.log(`[Gatekeeper] 🚫 Video diblokir karena terdeteksi spam: ${video.title}`);
              continue; // Langsung lompat ke video berikutnya, JANGAN dimasukkan ke sitemap
            }

            const fallbackDesc = video.title + ' free HD porn video on NICEVX.';
            const finalDesc = aiData ? aiData.seoDescription : fallbackDesc;
            const finalPriority = (aiData && aiData.priorityScore) ? aiData.priorityScore : 0.8;

            seenUrls.add(url);

            // Tags: gunakan cleanedTags dari AI jika tersedia (bermakna).
            // API /search/ mengembalikan keywords = judul video (bukan tag asli),
            // sehingga rawTags dari API tidak memiliki nilai SEO tambahan.
            // Tag nyata hanya bisa didapat dari AI yang memproses data dari endpoint /video/id/.
            const finalTags = (aiData && aiData.cleanedTags && aiData.cleanedTags.length > 0)
              ? aiData.cleanedTags.slice(0, 32)
              : [];

            currentChunkUrls.push({
              url: url,
              priority: finalPriority,
              title: video.title,
              description: finalDesc,
              thumbnail_loc: video.default_thumb ? video.default_thumb.src : '',
              player_loc: video.embed,
              duration: video.length_sec || 0,
              publication_date: (video.added && !isNaN(new Date(video.added).getTime()))
                ? new Date(video.added).toISOString()
                : new Date().toISOString(),
              tags: finalTags,
            });

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
