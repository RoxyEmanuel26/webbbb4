const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.nicevx.com';
const API_BASE = 'https://www.eporner.com/api/v2';
const PER_PAGE = 50;
// Start with a crawlable batch instead of submitting the full upstream catalog
// at once. Increase this only after Search Console shows the current batch is
// being crawled and indexed consistently.
const DEFAULT_MAX_SITEMAP_VIDEOS = 1000;
const requestedMaxVideos = Number.parseInt(process.env.SITEMAP_MAX_VIDEOS || '', 10);
const MAX_SITEMAP_VIDEOS = Number.isSafeInteger(requestedMaxVideos) && requestedMaxVideos > 0
  ? requestedMaxVideos
  : DEFAULT_MAX_SITEMAP_VIDEOS;
const MAX_PAGES = Math.ceil(MAX_SITEMAP_VIDEOS / PER_PAGE);
const URLS_PER_SITEMAP = 5000; // Batas chunk
const BATCH_SIZE = 5;
const DEFAULT_MAX_AI_PER_RUN = 50;
const requestedAiBatchSize = Number.parseInt(process.env.SITEMAP_AI_BATCH_SIZE || '', 10);
const MAX_AI_PER_RUN = Number.isSafeInteger(requestedAiBatchSize) && requestedAiBatchSize > 0
  ? requestedAiBatchSize
  : DEFAULT_MAX_AI_PER_RUN;
const REQUIRE_AI_CURATION = process.env.SITEMAP_REQUIRE_AI_CURATION !== 'false';
const MIN_DESCRIPTION_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 180;
const API_RETRIES = 3;
const API_TIMEOUT_MS = 15000;

// Konfigurasi AI
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
const sitemapStagingDir = path.join(publicDir, `.sitemaps-staging-${process.pid}`);
const sitemapIndexFile = path.join(publicDir, 'sitemap.xml');
const sitemapIndexStagingFile = path.join(publicDir, `.sitemap-${process.pid}.xml`);
let sitemapOutputDir = sitemapsDir;

// Global Set untuk mencegah duplikat 100%
const seenUrls = new Set();
let startPage = 1;
let currentChunkIndex = 1;
let currentChunkUrls = [];
let indexedVideoCount = 0;
let skippedUncuratedCount = 0;
let skippedSpamCount = 0;
let skippedEncodingCount = 0;

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Eporner occasionally returns UTF-8 bytes that were decoded as Latin-1.
// Repair only when the candidate measurably removes mojibake markers, so valid
// accented text, Japanese, and emoji remain untouched.
function mojibakeScore(value) {
  const text = String(value || '');
  const replacementCharacters = (text.match(/\uFFFD/g) || []).length;
  const c1Controls = (text.match(/[\u0080-\u009F]/g) || []).length;
  const brokenUtf8Sequences = (text.match(/[\u00C2-\u00F4][\u0080-\u00BF]/g) || []).length;
  return (replacementCharacters * 10) + (c1Controls * 4) + (brokenUtf8Sequences * 2);
}

function repairMojibake(value) {
  let current = String(value || '');

  for (let pass = 0; pass < 2; pass++) {
    const currentScore = mojibakeScore(current);
    if (currentScore === 0) break;

    // Latin-1 reversal is lossless only when every source character is a byte.
    if ([...current].some((character) => character.codePointAt(0) > 0xFF)) break;

    const candidate = Buffer.from(current, 'latin1').toString('utf8');
    const candidateScore = mojibakeScore(candidate);
    if (candidate.includes('\uFFFD') || candidateScore >= currentScore) break;
    current = candidate;
  }

  return current.normalize('NFC');
}

function hasSuspiciousEncoding(value) {
  return mojibakeScore(value) > 0;
}

function normalizeVideo(video) {
  return {
    ...video,
    title: repairMojibake(video?.title),
    keywords: repairMojibake(video?.keywords),
  };
}

function normalizeAiSeoEntry(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  return {
    ...entry,
    seoDescription: repairMojibake(entry.seoDescription),
    cleanedTags: Array.isArray(entry.cleanedTags)
      ? entry.cleanedTags.map((tag) => repairMojibake(tag))
      : entry.cleanedTags,
    category: repairMojibake(entry.category),
  };
}

for (const [videoId, entry] of Object.entries(aiSeoData)) {
  aiSeoData[videoId] = normalizeAiSeoEntry(entry);
}

async function fetchJson(url, label, { retries = API_RETRIES, silent = false } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    let timeoutId;
    let timedOut = false;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, API_TIMEOUT_MS);
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      const body = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      try {
        return JSON.parse(body);
      } catch {
        throw new Error(`respons bukan JSON (${response.headers.get('content-type') || 'content-type tidak diketahui'})`);
      }
    } catch (error) {
      lastError = timedOut ? new Error(`timeout setelah ${API_TIMEOUT_MS / 1000} detik`) : error;
      if (!silent && attempt < retries) {
        console.warn(`[API] ${label} gagal (percobaan ${attempt}/${retries}): ${lastError.message}`);
      }
      if (attempt < retries) await sleep(attempt * 750);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
  throw new Error(`${label} gagal setelah ${retries} percobaan: ${lastError?.message || 'unknown error'}`);
}

async function renameWithRetry(source, destination, label) {
  let lastError;
  for (let attempt = 1; attempt <= API_RETRIES; attempt++) {
    try {
      fs.renameSync(source, destination);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < API_RETRIES) await sleep(attempt * 250);
    }
  }
  throw new Error(`${label} gagal: ${lastError?.message || 'unknown error'}`);
}

async function persistAiSeoData() {
  const temporaryFile = `${AI_SEO_FILE}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporaryFile, JSON.stringify(aiSeoData, null, 2), 'utf-8');
    await renameWithRetry(temporaryFile, AI_SEO_FILE, 'menyimpan ai-seo.json');
  } finally {
    if (fs.existsSync(temporaryFile)) fs.rmSync(temporaryFile, { force: true });
  }
}

function getPublicationDate(video) {
  const date = new Date(video?.added || '');
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function hasUsableCuration(entry) {
  const description = typeof entry?.seoDescription === 'string' ? entry.seoDescription.trim() : '';
  return !entry?.isSpam
    && typeof description === 'string'
    && description.length >= MIN_DESCRIPTION_LENGTH
    && description.length <= MAX_DESCRIPTION_LENGTH;
}

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
  let realKeywords = repairMojibake(video.keywords || '');
  try {
    const detailData = await fetchJson(`${API_BASE}/video/id/?id=${video.id}&format=json`, `detail video ${video.id}`, { retries: 2, silent: true });
    if (detailData?.keywords && detailData.keywords !== video.title) {
      realKeywords = repairMojibake(detailData.keywords);
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
    if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`);
    const data = await res.json();
    const result = JSON.parse(data?.choices?.[0]?.message?.content || '');
    const seoDescription = repairMojibake(result.seoDescription).trim();
    if (!result.isSpam && (seoDescription.length < MIN_DESCRIPTION_LENGTH || seoDescription.length > MAX_DESCRIPTION_LENGTH)) {
      throw new Error(`deskripsi AI harus ${MIN_DESCRIPTION_LENGTH}-${MAX_DESCRIPTION_LENGTH} karakter`);
    }

    const cleanedTags = Array.isArray(result.cleanedTags)
      ? [...new Set(result.cleanedTags
        .map((tag) => repairMojibake(tag).trim().toLowerCase())
        .filter((tag) => tag.length > 1 && tag.length <= 40))].slice(0, 8)
      : [];
    const normalizedCategory = repairMojibake(result.category).trim().toLowerCase();
    const category = VALID_CATEGORIES.includes(normalizedCategory)
      ? normalizedCategory
      : 'adult porn';

    // Simpan secara atomik agar file tidak korup atau terkunci sementara di Windows.
    aiSeoData[video.id] = {
      seoDescription,
      cleanedTags,
      category,
      isSpam: Boolean(result.isSpam),
      priorityScore,
      ...(getPublicationDate(video) && { uploadDate: getPublicationDate(video) }),
    };
    await persistAiSeoData();
    return aiSeoData[video.id];
  } catch (e) {
    console.error(`[AI Error] Gagal memproses ${video.id}: ${e.message}`);
    return null;
  }
}

function slugify(text) {
  return repairMojibake(text)
    .toLowerCase()
    // Keep this transformation aligned with VideoCard.createSlug so sitemap
    // URLs and internal links always resolve to the same canonical URL.
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function initState() {
  if (!isResumeMode) {
    console.log('🧪 [Fresh Mode] Membuat sitemap di staging; sitemap aktif akan diganti hanya setelah proses berhasil.');
    if (fs.existsSync(sitemapStagingDir)) fs.rmSync(sitemapStagingDir, { recursive: true, force: true });
    fs.mkdirSync(sitemapStagingDir, { recursive: true });
    sitemapOutputDir = sitemapStagingDir;
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
        indexedVideoCount++;
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
  const safeText = repairMojibake(unsafe)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  return safeText.replace(/[<>&'"]/g, function (c) {
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
      ${(item.duration > 0 && item.duration <= 28800) ? `<video:duration>${item.duration}</video:duration>` : ''}
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

  fs.writeFileSync(path.join(sitemapOutputDir, `sitemap-video-${index}.xml`), xml, 'utf-8');
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
  fs.writeFileSync(path.join(sitemapOutputDir, 'sitemap-static.xml'), staticXml, 'utf-8');
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
  fs.writeFileSync(isResumeMode ? sitemapIndexFile : sitemapIndexStagingFile, indexXml, 'utf-8');
}

async function publishSitemaps() {
  if (isResumeMode) return;
  const backupDir = `${sitemapsDir}.backup-${process.pid}`;
  let movedExistingSitemaps = false;

  try {
    if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
    if (fs.existsSync(sitemapsDir)) {
      await renameWithRetry(sitemapsDir, backupDir, 'membackup sitemap aktif');
      movedExistingSitemaps = true;
    }
    await renameWithRetry(sitemapStagingDir, sitemapsDir, 'menerbitkan sitemap baru');
    await renameWithRetry(sitemapIndexStagingFile, sitemapIndexFile, 'menerbitkan sitemap index baru');
    if (movedExistingSitemaps && fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
  } catch (error) {
    if (fs.existsSync(sitemapsDir) && !fs.existsSync(sitemapStagingDir)) {
      await renameWithRetry(sitemapsDir, sitemapStagingDir, 'memulihkan staging sitemap');
    }
    if (movedExistingSitemaps && fs.existsSync(backupDir) && !fs.existsSync(sitemapsDir)) {
      await renameWithRetry(backupDir, sitemapsDir, 'memulihkan sitemap aktif');
    }
    throw error;
  } finally {
    if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
  }
}

async function run() {
  console.log('dYs? Memulai pengumpulan data dari Eporner API...');

  console.log('dYs? Mengambil daftar video yang dihapus dari Eporner...');
  let removedIds = new Set();
  try {
    const removedData = await fetchJson(`${API_BASE}/video/removed/?format=json`, 'daftar video yang dihapus', { retries: 1 });
    if (Array.isArray(removedData)) {
      removedData.forEach(item => removedIds.add(item.id));
      console.log(`dY~" Berhasil mengambil ${removedIds.size} ID video yang dihapus.`);
    }
  } catch (err) {
    console.error('dY~! Gagal mengambil daftar video yang dihapus:', err.message);
  }

  initState();

  for (let i = startPage; i <= MAX_PAGES; i += BATCH_SIZE) {
    const batchPromises = [];
    const end = Math.min(i + BATCH_SIZE - 1, MAX_PAGES);

    console.log(`Mengambil halaman ${i} s/d ${end}...`);
    for (let p = i; p <= end; p++) {
      batchPromises.push(
        fetchJson(`${API_BASE}/video/search/?query=&per_page=${PER_PAGE}&page=${p}&order=latest`, `halaman API ${p}`)
          .catch(e => {
            console.error(`[API] Gagal mengambil halaman ${p}: ${e.message}`);
            return null;
          })
      );
    }

    const results = await Promise.all(batchPromises);

    if (results.some((data) => !Array.isArray(data?.videos))) {
      throw new Error('Sitemap tidak diterbitkan karena satu atau lebih halaman sumber gagal dimuat. Sitemap aktif dipertahankan.');
    }

    for (const data of results) {
      if (data && data.videos) {
        for (const rawVideo of data.videos) {
          const video = normalizeVideo(rawVideo);
          // GATEKEEPER 1: Skip if video has been removed by Eporner
          if (removedIds.has(video.id)) {
            console.log(`[Gatekeeper] dY~ Video dilewati karena sudah dihapus Eporner: ${video.id}`);
            continue;
          }

          const url = `${SITE_URL}/video/${slugify(video.title)}-${video.id}`;

          if (!seenUrls.has(url) && indexedVideoCount < MAX_SITEMAP_VIDEOS) {
            // ---> AI Curation Tembak Disini <---
            await curateWithDeepSeek(video);

            const aiData = aiSeoData[video.id];

            // GATEKEEPER: Buang video jika terdeteksi SPAM / Bukan Niche
            if (aiData && aiData.isSpam) {
              skippedSpamCount++;
              console.log(`[Gatekeeper] 🚫 Video diblokir karena terdeteksi spam: ${video.title}`);
              continue; // Langsung lompat ke video berikutnya, JANGAN dimasukkan ke sitemap
            }

            if (REQUIRE_AI_CURATION && !hasUsableCuration(aiData)) {
              skippedUncuratedCount++;
              continue;
            }

            const fallbackDesc = video.title + ' free HD porn video on NICEVX.';
            const finalDesc = hasUsableCuration(aiData) ? aiData.seoDescription.trim() : fallbackDesc;
            const finalPriority = (aiData && aiData.priorityScore) ? aiData.priorityScore : 0.8;

            // Tags: gunakan cleanedTags dari AI jika tersedia (bermakna).
            // API /search/ mengembalikan keywords = judul video (bukan tag asli),
            // sehingga rawTags dari API tidak memiliki nilai SEO tambahan.
            // Tag nyata hanya bisa didapat dari AI yang memproses data dari endpoint /video/id/.
            const finalTags = (aiData && aiData.cleanedTags && aiData.cleanedTags.length > 0)
              ? aiData.cleanedTags.map((tag) => repairMojibake(tag)).slice(0, 32)
              : [];

            if ([video.title, finalDesc, ...finalTags].some(hasSuspiciousEncoding)) {
              skippedEncodingCount++;
              console.warn(`[Encoding] Video dilewati karena teks sumber masih rusak: ${video.id}`);
              continue;
            }

            seenUrls.add(url);
            indexedVideoCount++;

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
              console.log(`💾 Tersimpan: sitemap-video-${currentChunkIndex}.xml (${URLS_PER_SITEMAP} URLs) - RAM Dikeringkan.`);
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
  await publishSitemaps();

  console.log(`✅ Total URL video untuk sitemap: ${indexedVideoCount} (batas: ${MAX_SITEMAP_VIDEOS})`);
  console.log(`🧠 Kurasi AI: ${indexedVideoCount} diterbitkan, ${skippedUncuratedCount} belum layak, ${skippedSpamCount} spam, ${skippedEncodingCount} encoding rusak.`);
  console.log('🎉 Selesai 100%! Semua file tersimpan dengan aman.');
}

run().catch((error) => {
  console.error(`❌ Sitemap gagal diterbitkan: ${error.message}`);
  if (fs.existsSync(sitemapStagingDir)) fs.rmSync(sitemapStagingDir, { recursive: true, force: true });
  if (fs.existsSync(sitemapIndexStagingFile)) fs.rmSync(sitemapIndexStagingFile, { force: true });
  process.exitCode = 1;
});
