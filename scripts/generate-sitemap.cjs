const fs = require('fs');
const path = require('path');
const { MAX_EDITORIALS_PER_RUN, MIN_COLLECTION_VIDEOS, bootstrapCollections, buildFacts, discoverCandidates, getCollectionVideos, getOverlapBlocker, isQualified, trimEditorialIntro, validateManifest, wordCount } = require('./collection-engine.cjs');

const SITE_URL = 'https://www.nicevx.com';
const API_BASE = 'https://www.eporner.com/api/v2';
const PER_PAGE = 50;
// Start with a crawlable batch instead of submitting the full upstream catalog
// at once. Increase this only after Search Console shows the current batch is
// being crawled and indexed consistently.
const HARD_MAX_SITEMAP_VIDEOS = 250;
const DEFAULT_MAX_SITEMAP_VIDEOS = HARD_MAX_SITEMAP_VIDEOS;
const requestedMaxVideos = Number.parseInt(process.env.SITEMAP_MAX_VIDEOS || '', 10);
const MAX_SITEMAP_VIDEOS = Number.isSafeInteger(requestedMaxVideos) && requestedMaxVideos > 0 ? Math.min(requestedMaxVideos, HARD_MAX_SITEMAP_VIDEOS) : DEFAULT_MAX_SITEMAP_VIDEOS;
const MAX_PAGES = Math.ceil(MAX_SITEMAP_VIDEOS / PER_PAGE);
const URLS_PER_SITEMAP = 5000; // Batas chunk
const BATCH_SIZE = 5;
// Expansion is opt-in. Existing curated records can refresh without spending
// DeepSeek credits or publishing a large untested batch.
const DEFAULT_MAX_AI_PER_RUN = 0;
const requestedAiBatchSize = Number.parseInt(process.env.SITEMAP_AI_BATCH_SIZE || '', 10);
const MAX_AI_PER_RUN = Number.isSafeInteger(requestedAiBatchSize) && requestedAiBatchSize >= 0 ? requestedAiBatchSize : DEFAULT_MAX_AI_PER_RUN;
const requestedCollectionBatchSize = Number.parseInt(process.env.COLLECTION_AI_BATCH_SIZE || '', 10);
const MAX_COLLECTION_AI_PER_RUN = Number.isSafeInteger(requestedCollectionBatchSize) && requestedCollectionBatchSize >= 0 ? Math.min(requestedCollectionBatchSize, MAX_EDITORIALS_PER_RUN) : 0;
const REQUIRE_AI_CURATION = process.env.SITEMAP_REQUIRE_AI_CURATION !== 'false';
const MIN_DESCRIPTION_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 180;
const API_RETRIES = 3;
const API_TIMEOUT_MS = 15000;

// Konfigurasi AI
let aiProcessedCount = 0;
const newlyCuratedIds = new Set();
const AI_SEO_FILE = path.join(__dirname, '../src/data/ai-seo.json');
const CATALOG_FILE = path.join(__dirname, '../src/data/curated-video-catalog.json');
const SNAPSHOTS_FILE = path.join(__dirname, '../src/data/discovery-snapshots.json');
const COLLECTIONS_FILE = path.join(__dirname, '../src/data/collections.json');
let aiSeoData = {};
if (fs.existsSync(AI_SEO_FILE)) {
  try {
    aiSeoData = JSON.parse(fs.readFileSync(AI_SEO_FILE, 'utf-8'));
  } catch (e) {}
} else {
  if (!fs.existsSync(path.dirname(AI_SEO_FILE))) fs.mkdirSync(path.dirname(AI_SEO_FILE), { recursive: true });
}

let DEEPSEEK_API_KEY = String(process.env.DEEPSEEK_API_KEY || '').trim() || null;
if (!DEEPSEEK_API_KEY) {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
    const match = envFile.match(/DEEPSEEK_API_KEY=["']?(.*?)["']?$/m);
    if (match) DEEPSEEK_API_KEY = match[1].trim();
  } catch (e) {}
}

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
let skippedInvalidDateCount = 0;
const catalogCandidates = [];
const previouslyPublishedIds = new Set();

if (fs.existsSync(sitemapsDir)) {
  for (const file of fs.readdirSync(sitemapsDir).filter((name) => /^sitemap-video-\d+\.xml$/.test(name))) {
    const xml = fs.readFileSync(path.join(sitemapsDir, file), 'utf8');
    for (const match of xml.matchAll(/\/video\/[^<]*-([A-Za-z0-9]{11})<\/loc>/g)) previouslyPublishedIds.add(match[1]);
  }
}

// Daftar kategori valid (top 80 berdasarkan allCategories.js)
const VALID_CATEGORIES = ['adult porn', 'amateur', 'american', 'anal', 'anal teen', 'asian', 'asian anal', 'bbc', 'bbc interracial', 'bbw', 'bdsm', 'big ass', 'big ass latina', 'big boobs', 'big natural tits', 'big tits', 'black', 'blonde', 'blowjob', 'bondage', 'busty', 'creampie', 'deepthroat', 'dildo', 'double penetration', 'ebony', 'ebony big ass', 'first time', 'free porn', 'gangbang', 'german', 'hairy', 'handjob', 'hardcore', 'hd porn', 'hentai', 'homemade', 'indian', 'indian homemade', 'interracial', 'interracial anal', 'japanese', 'japanese milf', 'japanese sex', 'latina', 'latina anal', 'lesbian', 'lesbians', 'lingerie', 'massage', 'masturbation', 'mature', 'mature anal', 'milf', 'milf mom', 'mom', 'old man', 'orgasm', 'orgy', 'outdoor', 'petite', 'POV', 'public', 'redhead', 'rough', 'solo', 'squirt', 'step', 'stepmom', 'teen', 'teen anal', 'threesome'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Eporner occasionally returns UTF-8 bytes that were decoded as Latin-1.
// Repair only when the candidate measurably removes mojibake markers, so valid
// accented text, Japanese, and emoji remain untouched.
function mojibakeScore(value) {
  const text = String(value || '');
  const replacementCharacters = (text.match(/\uFFFD/g) || []).length;
  const c1Controls = (text.match(/[\u0080-\u009F]/g) || []).length;
  const brokenUtf8Sequences = (text.match(/[\u00C2-\u00F4][\u0080-\u00BF]/g) || []).length;
  return replacementCharacters * 10 + c1Controls * 4 + brokenUtf8Sequences * 2;
}

function repairMojibake(value) {
  let current = String(value || '');

  for (let pass = 0; pass < 2; pass++) {
    const currentScore = mojibakeScore(current);
    if (currentScore === 0) break;

    // Latin-1 reversal is lossless only when every source character is a byte.
    if ([...current].some((character) => character.codePointAt(0) > 0xff)) break;

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
    keywords: repairMojibake(video?.keywords)
  };
}

function normalizeAiSeoEntry(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  return {
    ...entry,
    seoDescription: repairMojibake(entry.seoDescription),
    cleanedTags: Array.isArray(entry.cleanedTags) ? entry.cleanedTags.map((tag) => repairMojibake(tag)) : entry.cleanedTags,
    category: repairMojibake(entry.category)
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
        signal: controller.signal
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
  return !entry?.isSpam && typeof description === 'string' && description.length >= MIN_DESCRIPTION_LENGTH && description.length <= MAX_DESCRIPTION_LENGTH;
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
  const priorityScore = views > 100000 ? 1.0 : views > 50000 ? 0.9 : views > 10000 ? 0.8 : views > 1000 ? 0.7 : 0.6;

  const categoryList = VALID_CATEGORIES.join(', ');

  // Fetch keywords nyata dari endpoint /video/id/ — endpoint /search/ hanya mengembalikan judul sebagai keywords
  let realKeywords = repairMojibake(video.keywords || '');
  try {
    const detailData = await fetchJson(`${API_BASE}/video/id/?id=${video.id}&format=json`, `detail video ${video.id}`, {
      retries: 2,
      silent: true
    });
    if (detailData?.keywords && detailData.keywords !== video.title) {
      realKeywords = repairMojibake(detailData.keywords);
    }
  } catch (_) {}

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
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`
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

    const cleanedTags = Array.isArray(result.cleanedTags) ? [...new Set(result.cleanedTags.map((tag) => repairMojibake(tag).trim().toLowerCase()).filter((tag) => tag.length > 1 && tag.length <= 40))].slice(0, 8) : [];
    const normalizedCategory = repairMojibake(result.category).trim().toLowerCase();
    const category = VALID_CATEGORIES.includes(normalizedCategory) ? normalizedCategory : 'adult porn';

    // Simpan secara atomik agar file tidak korup atau terkunci sementara di Windows.
    aiSeoData[video.id] = {
      seoDescription,
      cleanedTags,
      category,
      isSpam: Boolean(result.isSpam),
      priorityScore,
      ...(getPublicationDate(video) && {
        uploadDate: getPublicationDate(video)
      })
    };
    newlyCuratedIds.add(video.id);
    await persistAiSeoData();
    return aiSeoData[video.id];
  } catch (e) {
    console.error(`[AI Error] Gagal memproses ${video.id}: ${e.message}`);
    return null;
  }
}

function hasUnsafeCollectionEditorial(value) {
  const text = String(value || '');
  return hasSuspiciousEncoding(text) || /https?:\/\//i.test(text) || /\b(?:19|20)\d{2}\b/.test(text) || /\d/.test(text) || /\bNICEVX\s+(?:hosts|owns|produces|created)\b/i.test(text) || /\b(?:guaranteed|buffer-free|exclusive footage|watch time|interaction patterns|completion rates|publication gate|quality gate|sitemap|noindex|metadata packet|ranking algorithm|legal age|consensual|properly licensed)\b/i.test(text);
}

async function curateCollectionEditorial(collection, facts) {
  if (!DEEPSEEK_API_KEY || MAX_COLLECTION_AI_PER_RUN === 0) return null;
  const prompt = `You are editing a factual collection page for NICEVX, an adult video discovery catalog that embeds third-party media.

Verified fact packet:
${JSON.stringify({
  name: facts.name,
  aliases: facts.aliases,
  videoCount: facts.videoCount,
  medianDurationSeconds: facts.medianDurationSeconds,
  totalViews: facts.totalViews,
  topTags: facts.topTags
})}

Return raw JSON with exactly these keys: intent, selectionRule, editorialIntro.

Rules:
- intent: one factual English sentence, between eighty and one hundred sixty characters.
- selectionRule: one factual English sentence, between eighty and two hundred twenty characters.
- editorialIntro: exactly five distinct paragraphs separated by blank lines. Each paragraph must contain ninety to one hundred five words, for a total between four hundred fifty and five hundred twenty five words.
- Write for a visitor choosing what to watch. Describe the category in plain English and explain how the visible duration, views, ratings, and related tags can help someone browse.
- Do not quote any number, date, performer, studio, website, or person name in the prose. The factual statistics panel displays numeric facts separately.
- Do not claim NICEVX hosts, owns, produces, endorses, or guarantees the videos.
- Do not invent scenes, performers, studios, production context, trends, or viewing quality.
- Do not discuss AI, prompts, metadata, algorithms, verification, publication rules, quality gates, indexing, sitemaps, APIs, or internal workflows.
- Do not claim access to watch time, interaction patterns, completion rates, consent checks, age checks, licensing reviews, or manual content reviews.
- Avoid repetitive promotional language and keyword stuffing.`;

  const messages = [{ role: 'user', content: prompt }];
  let previousDraft = '';
  let previousError = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`
      },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          response_format: { type: 'json_object' },
          max_tokens: 1800,
          temperature: 0.25
        })
      });
      if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}`);
      const payload = await response.json();
      previousDraft = payload?.choices?.[0]?.message?.content || '';
      const result = JSON.parse(previousDraft);
      const intent = repairMojibake(result.intent).trim();
      const selectionRule = repairMojibake(result.selectionRule).trim();
      const untrimmedIntro = repairMojibake(result.editorialIntro).trim();
      const editorialIntro = trimEditorialIntro(untrimmedIntro);
      const paragraphs = editorialIntro.split(/\n\s*\n/).filter(Boolean);
      if (intent.length < 80 || intent.length > 160) throw new Error('intent harus 80-160 karakter');
      if (selectionRule.length < 80 || selectionRule.length > 220) throw new Error('selectionRule harus 80-220 karakter');
      if (wordCount(editorialIntro) < 400 || wordCount(editorialIntro) > 650) throw new Error(`editorialIntro berisi ${wordCount(editorialIntro)} kata; wajib 400-650 kata`);
      if (paragraphs.length < 4 || paragraphs.length > 6) throw new Error(`editorialIntro berisi ${paragraphs.length} paragraf; wajib 4-6 paragraf`);
      if ([intent, selectionRule, editorialIntro].some(hasUnsafeCollectionEditorial)) throw new Error('editorial mengandung klaim yang tidak diizinkan');
      return {
        ...collection,
        intent,
        selectionRule,
        editorialIntro,
        status: 'editorial-approved',
        editorialUpdatedAt: new Date().toISOString(),
        editorialFactsHash: facts.hash,
        source: editorialIntro !== untrimmedIntro ? 'deepseek-trimmed' : attempt === 0 ? 'deepseek' : 'deepseek-repaired'
      };
    } catch (error) {
      previousError = error.message;
      if (attempt < 2) {
        console.warn(`[Collection AI] ${collection.slug} memperbaiki draf: ${error.message}`);
        messages.push({ role: 'assistant', content: previousDraft });
        messages.push({
          role: 'user',
          content: `Rewrite the entire JSON response to fix this validation error: ${previousError}. Do not return the same draft. Keep every statement grounded in the original verified fact packet. The editorialIntro must have exactly five blank-line-separated paragraphs and total between four hundred fifty and five hundred twenty five words.`
        });
      } else console.error(`[Collection AI] ${collection.slug} ditolak setelah perbaikan: ${error.message}`);
    }
  }
  return null;
}

async function refreshCollections(catalog) {
  const original = readJsonFile(COLLECTIONS_FILE, []);
  let collections = bootstrapCollections(original, catalog);

  if (MAX_COLLECTION_AI_PER_RUN > 0) {
    const discovered = discoverCandidates(collections, catalog);
    if (discovered.length) {
      collections = [...collections, ...discovered];
      console.log(`[Collections] ${discovered.length} kandidat baru: ${discovered.map((item) => item.slug).join(', ')}`);
    }

    const editorialQueue = collections
      .filter((collection) => collection.status !== 'editorial-approved')
      .filter((collection) => getCollectionVideos(collection, catalog).length >= MIN_COLLECTION_VIDEOS)
      .filter((collection) => !getOverlapBlocker(collection, collections, catalog))
      .sort((left, right) => Number(left.source === 'automatic') - Number(right.source === 'automatic') || getCollectionVideos(right, catalog).length - getCollectionVideos(left, catalog).length || left.slug.localeCompare(right.slug))
      .slice(0, MAX_COLLECTION_AI_PER_RUN);

    for (const queued of editorialQueue) {
      const curated = await curateCollectionEditorial(queued, buildFacts(queued, catalog));
      if (curated) collections = collections.map((collection) => (collection.slug === curated.slug ? curated : collection));
    }
  }

  const errors = validateManifest(collections, catalog);
  if (errors.length) throw new Error(`Manifest collection tidak valid: ${errors.join('; ')}`);
  if (JSON.stringify(collections) !== JSON.stringify(original)) await writeJsonAtomic(COLLECTIONS_FILE, collections);
  return collections;
}

function slugify(text) {
  return (
    repairMojibake(text)
      .toLowerCase()
      // Keep this transformation aligned with VideoCard.createSlug so sitemap
      // URLs and internal links always resolve to the same canonical URL.
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  );
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

  const files = fs.readdirSync(sitemapsDir).filter((f) => f.startsWith('sitemap-video-') && f.endsWith('.xml'));
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
      matches.forEach((m) => {
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
  const safeText = repairMojibake(unsafe).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  return safeText.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }
  });
}

function readJsonFile(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

async function writeJsonAtomic(file, value) {
  const temporaryFile = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(value, null, 2), 'utf8');
  try {
    await renameWithRetry(temporaryFile, file, `menyimpan ${path.basename(file)}`);
  } finally {
    if (fs.existsSync(temporaryFile)) fs.rmSync(temporaryFile, { force: true });
  }
}

function percentile(value, values) {
  if (values.length < 2) return 0.5;
  const below = values.filter((candidate) => candidate < value).length;
  const equal = values.filter((candidate) => candidate === value).length;
  return (below + (equal - 1) / 2) / (values.length - 1);
}

function isoDuration(seconds) {
  const duration = Number.parseInt(seconds, 10) || 0;
  if (!duration) return null;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const remainingSeconds = duration % 60;
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${remainingSeconds ? `${remainingSeconds}S` : ''}`;
}

function buildDiscoveryCatalog(videos) {
  const previous = readJsonFile(SNAPSHOTS_FILE, { history: {} });
  const history = previous.history && typeof previous.history === 'object' ? previous.history : {};
  const snapshotDate = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  const allRatings = videos.map((video) => video.rating);
  const byCategory = new Map();

  for (const video of videos) {
    const list = byCategory.get(video.category) || [];
    list.push(video.views);
    byCategory.set(video.category, list);
  }

  for (const video of videos) {
    const entries = Array.isArray(history[video.id]) ? history[video.id] : [];
    const withoutToday = entries.filter((entry) => entry.date !== snapshotDate);
    history[video.id] = [
      ...withoutToday,
      {
        date: snapshotDate,
        views: video.views,
        rating: video.rating,
        category: video.category,
        availability: video.availability
      }
    ].slice(-8);
  }

  const finalized = videos
    .map((video) => {
      const entries = history[video.id] || [];
      const previousEntry = entries.length >= 2 ? entries[entries.length - 2] : null;
      const viewGrowth = previousEntry ? Math.max(0, video.views - (Number(previousEntry.views) || 0)) : null;
      const sevenDayCutoff = new Date(`${snapshotDate}T00:00:00.000Z`).getTime() - 6 * 86400000;
      const sevenDayBaseline = entries.find((entry) => new Date(`${entry.date}T00:00:00.000Z`).getTime() <= sevenDayCutoff) || null;
      const viewGrowth7d = sevenDayBaseline ? Math.max(0, video.views - (Number(sevenDayBaseline.views) || 0)) : null;
      const velocityValues = videos.map((candidate) => {
        const candidateEntries = history[candidate.id] || [];
        const candidateBaseline = candidateEntries.find((entry) => new Date(`${entry.date}T00:00:00.000Z`).getTime() <= sevenDayCutoff) || null;
        return candidateBaseline ? Math.max(0, candidate.views - (Number(candidateBaseline.views) || 0)) : 0;
      });
      const velocity = sevenDayBaseline ? percentile(viewGrowth7d, velocityValues) : 0;
      const ratingPosition = percentile(video.rating, allRatings);
      const categoryViews = percentile(video.views, byCategory.get(video.category) || [video.views]);
      const ageDays = Math.max(0, (now - new Date(video.uploadDate).getTime()) / 86400000);
      const freshness = Math.max(0, 1 - Math.min(ageDays, 365) / 365);
      const completenessFields = [video.title, video.description, video.tags.length, video.thumbnail, video.embedUrl, video.durationSeconds, video.uploadDate, video.sourceUrl];
      const completeness = completenessFields.filter(Boolean).length / completenessFields.length;
      const score = Math.round((velocity * 40 + ratingPosition * 25 + categoryViews * 15 + freshness * 10 + completeness * 10) * 10) / 10;

      return {
        ...video,
        discoveryScore: score,
        scoreBreakdown: {
          viewGrowth7d: sevenDayBaseline ? Math.round(velocity * 400) / 10 : null,
          ratingPercentile: Math.round(ratingPosition * 250) / 10,
          categoryViewsPercentile: Math.round(categoryViews * 150) / 10,
          freshness: Math.round(freshness * 100) / 10,
          metadataCompleteness: Math.round(completeness * 100) / 10
        },
        viewGrowth,
        viewGrowth7d,
        trendStatus: previousEntry ? (viewGrowth > 0 ? 'rising' : 'steady') : 'insufficient-data',
        discoveryReason: sevenDayBaseline ? `Ranked from measured seven-day view growth, source rating, category popularity, freshness, and metadata completeness.` : `Ranked from source rating, category popularity, freshness, and metadata completeness; seven-day growth is waiting for enough snapshots.`
      };
    })
    .sort((a, b) => b.discoveryScore - a.discoveryScore || b.views - a.views);

  return {
    finalized,
    snapshots: { generatedAt: new Date().toISOString(), history }
  };
}

function writeChunk(index, urlsArray) {
  const xmlUrls = urlsArray
    .map(
      (item) => `
  <url>
    <loc>${item.url}</loc>
    <priority>${item.priority || 0.8}</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(item.thumbnail_loc)}</video:thumbnail_loc>
      <video:title>${escapeXml(item.title)}</video:title>
      <video:description>${escapeXml(item.description)}</video:description>
      <video:player_loc>${escapeXml(item.player_loc)}</video:player_loc>
      ${item.duration > 0 && item.duration <= 28800 ? `<video:duration>${item.duration}</video:duration>` : ''}
      <video:publication_date>${item.publication_date}</video:publication_date>
      <video:family_friendly>no</video:family_friendly>
      ${item.tags && item.tags.length > 0 ? item.tags.map((t) => `<video:tag>${escapeXml(t)}</video:tag>`).join('\n      ') : ''}
    </video:video>
  </url>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${xmlUrls}
</urlset>`.replace(/^[ \t]+$/gm, '');

  fs.writeFileSync(path.join(sitemapOutputDir, `sitemap-video-${index}.xml`), xml, 'utf-8');
}

function writeStaticSitemap(catalog, collections) {
  const now = new Date().toISOString();
  const qualifiedCollections = collections.filter((collection) => isQualified(collection, collections, catalog));

  const staticBaseUrls = [
    { route: '/', changefreq: 'daily', priority: '1.0', lastmod: now },
    { route: '/cats', changefreq: 'weekly', priority: '0.8', lastmod: now },
    {
      route: '/collections',
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: now
    },
    {
      route: '/methodology',
      changefreq: 'monthly',
      priority: '0.5',
      lastmod: now
    },
    {
      route: '/content-sources',
      changefreq: 'monthly',
      priority: '0.5',
      lastmod: now
    },
    {
      route: '/editorial-policy',
      changefreq: 'monthly',
      priority: '0.5',
      lastmod: now
    },
    { route: '/report', changefreq: 'monthly', priority: '0.5', lastmod: now },
    { route: '/about', changefreq: 'monthly', priority: '0.5', lastmod: now },
    ...(catalog.some((video) => Number.isFinite(video.viewGrowth7d))
      ? [
          {
            route: '/trends/weekly',
            changefreq: 'weekly',
            priority: '0.7',
            lastmod: now
          }
        ]
      : []),
    {
      route: '/terms',
      changefreq: 'monthly',
      priority: '0.3',
      lastmod: '2025-01-01'
    },
    {
      route: '/privacy',
      changefreq: 'monthly',
      priority: '0.3',
      lastmod: '2025-01-01'
    },
    {
      route: '/dmca',
      changefreq: 'monthly',
      priority: '0.3',
      lastmod: '2025-01-01'
    },
    {
      route: '/usc2257',
      changefreq: 'monthly',
      priority: '0.3',
      lastmod: '2025-01-01'
    }
  ]
    .map(
      (p) => `
  <url>
    <loc>${SITE_URL}${p.route}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('');

  const categoryUrls = qualifiedCollections
    .map(
      (collection) => `
  <url>
    <loc>${SITE_URL}/collections/${collection.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('');

  const staticXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticBaseUrls}\n${categoryUrls}\n</urlset>`;
  fs.writeFileSync(path.join(sitemapOutputDir, 'sitemap-static.xml'), staticXml, 'utf-8');
  console.log(`[Quality Gate] ${qualifiedCollections.length}/${collections.length} collection hub masuk sitemap.`);
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

  // The provider's removed endpoint is a ~150 MB newline-delimited file, not
  // JSON. Avoid downloading it on every run: records found in active search are
  // available, while every older curated ID is revalidated through /video/id/.
  const removedIds = new Set();

  initState();

  for (let i = startPage; i <= MAX_PAGES; i += BATCH_SIZE) {
    const batchPromises = [];
    const end = Math.min(i + BATCH_SIZE - 1, MAX_PAGES);

    console.log(`Mengambil halaman ${i} s/d ${end}...`);
    for (let p = i; p <= end; p++) {
      batchPromises.push(
        fetchJson(`${API_BASE}/video/search/?query=&per_page=${PER_PAGE}&page=${p}&order=latest`, `halaman API ${p}`).catch((e) => {
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

            // Existing AI output alone is not a publication authorization.
            // Preserve the published seed and admit new URLs only when they
            // were deliberately curated in this run.
            if (!previouslyPublishedIds.has(video.id) && !newlyCuratedIds.has(video.id)) {
              skippedUncuratedCount++;
              continue;
            }

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
            const finalPriority = aiData && aiData.priorityScore ? aiData.priorityScore : 0.8;

            // Tags: gunakan cleanedTags dari AI jika tersedia (bermakna).
            // API /search/ mengembalikan keywords = judul video (bukan tag asli),
            // sehingga rawTags dari API tidak memiliki nilai SEO tambahan.
            // Tag nyata hanya bisa didapat dari AI yang memproses data dari endpoint /video/id/.
            const finalTags = aiData && aiData.cleanedTags && aiData.cleanedTags.length > 0 ? aiData.cleanedTags.map((tag) => repairMojibake(tag)).slice(0, 32) : [];

            if ([video.title, finalDesc, ...finalTags].some(hasSuspiciousEncoding)) {
              skippedEncodingCount++;
              console.warn(`[Encoding] Video dilewati karena teks sumber masih rusak: ${video.id}`);
              continue;
            }

            const publicationDate = getPublicationDate(video);
            if (!publicationDate || !video.embed || !video.default_thumb?.src || !video.url) {
              skippedInvalidDateCount++;
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
              publication_date: publicationDate,
              tags: finalTags
            });

            catalogCandidates.push({
              id: video.id,
              canonicalSlug: `${slugify(video.title)}-${video.id}`,
              canonicalUrl: url,
              title: video.title,
              description: finalDesc,
              tags: finalTags,
              keywords: finalTags.join(', '),
              category: aiData?.category || 'adult porn',
              thumbnail: video.default_thumb.src,
              default_thumb: video.default_thumb,
              thumbs: Array.isArray(video.thumbs) ? video.thumbs : [],
              embedUrl: video.embed,
              embed: video.embed,
              sourceUrl: video.url,
              durationSeconds: Number.parseInt(video.length_sec, 10) || 0,
              duration: isoDuration(video.length_sec),
              length_sec: Number.parseInt(video.length_sec, 10) || 0,
              length_min: video.length_min || '',
              uploadDate: publicationDate,
              views: Number.parseInt(video.views, 10) || 0,
              rating: Number.parseFloat(video.rate) || 0,
              rate: Number.parseFloat(video.rate) || 0,
              availability: 'available',
              syncedAt: new Date().toISOString()
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

  // A curated video does not become unavailable merely because it moved beyond
  // the upstream "latest" window. Revalidate every previously curated ID via
  // the detail endpoint so refreshes preserve good URLs and remove only items
  // that are actually unavailable or fail a factual metadata gate.
  const catalogIds = new Set(catalogCandidates.map((video) => video.id));
  const existingIds = [...previouslyPublishedIds].filter((id) => hasUsableCuration(aiSeoData[id])).filter((id) => !catalogIds.has(id));

  for (let offset = 0; offset < existingIds.length && indexedVideoCount < MAX_SITEMAP_VIDEOS; offset += 10) {
    const ids = existingIds.slice(offset, offset + 10);
    const details = await Promise.all(
      ids.map((id) =>
        fetchJson(`${API_BASE}/video/id/?id=${id}&thumbsize=big&format=json`, `validasi video ${id}`, {
          retries: 2,
          silent: true
        }).catch(() => null)
      )
    );

    for (const rawVideo of details) {
      if (indexedVideoCount >= MAX_SITEMAP_VIDEOS) break;
      if (!rawVideo?.id || removedIds.has(rawVideo.id)) continue;
      const video = normalizeVideo(rawVideo);
      const entry = aiSeoData[video.id];
      const publicationDate = getPublicationDate(video) || entry?.uploadDate || null;
      const description = entry?.seoDescription?.trim();
      const tags = Array.isArray(entry?.cleanedTags) ? entry.cleanedTags.slice(0, 32) : [];
      const url = `${SITE_URL}/video/${slugify(video.title)}-${video.id}`;
      if (!publicationDate || !video.embed || !video.default_thumb?.src || !video.url || seenUrls.has(url)) continue;
      if ([video.title, description, ...tags].some(hasSuspiciousEncoding)) continue;

      seenUrls.add(url);
      indexedVideoCount++;
      currentChunkUrls.push({
        url,
        priority: entry.priorityScore || 0.8,
        title: video.title,
        description,
        thumbnail_loc: video.default_thumb.src,
        player_loc: video.embed,
        duration: video.length_sec || 0,
        publication_date: publicationDate,
        tags
      });
      catalogCandidates.push({
        id: video.id,
        canonicalSlug: `${slugify(video.title)}-${video.id}`,
        canonicalUrl: url,
        title: video.title,
        description,
        tags,
        keywords: tags.join(', '),
        category: entry.category || 'adult porn',
        thumbnail: video.default_thumb.src,
        default_thumb: video.default_thumb,
        thumbs: Array.isArray(video.thumbs) ? video.thumbs : [],
        embedUrl: video.embed,
        embed: video.embed,
        sourceUrl: video.url,
        durationSeconds: Number.parseInt(video.length_sec, 10) || 0,
        duration: isoDuration(video.length_sec),
        length_sec: Number.parseInt(video.length_sec, 10) || 0,
        length_min: video.length_min || '',
        uploadDate: publicationDate,
        views: Number.parseInt(video.views, 10) || 0,
        rating: Number.parseFloat(video.rate) || 0,
        rate: Number.parseFloat(video.rate) || 0,
        availability: 'available',
        syncedAt: new Date().toISOString()
      });
    }
  }

  const { finalized, snapshots } = buildDiscoveryCatalog(catalogCandidates);
  const scoreById = new Map(finalized.map((video) => [video.id, video.discoveryScore]));
  currentChunkUrls = currentChunkUrls.map((item) => {
    const id = item.url.match(/-([A-Za-z0-9]{11})$/)?.[1];
    const score = scoreById.get(id) || 0;
    return {
      ...item,
      priority: Math.max(0.5, Math.min(0.9, 0.5 + score / 250)).toFixed(1)
    };
  });

  if (currentChunkUrls.length > 0) {
    writeChunk(currentChunkIndex, currentChunkUrls);
    console.log(`💾 Tersimpan: sitemap-video-${currentChunkIndex}.xml (${currentChunkUrls.length} URLs)`);
  }

  const managedCollections = await refreshCollections(finalized);
  console.log('📦 Membuat sitemap-static.xml dan Index Sitemap...');
  writeStaticSitemap(finalized, managedCollections);
  writeIndexSitemap();
  await publishSitemaps();
  await writeJsonAtomic(CATALOG_FILE, {
    generatedAt: new Date().toISOString(),
    videos: finalized
  });
  await writeJsonAtomic(SNAPSHOTS_FILE, snapshots);

  console.log(`✅ Total URL video untuk sitemap: ${indexedVideoCount} (batas: ${MAX_SITEMAP_VIDEOS})`);
  console.log(`🧠 Kurasi AI: ${indexedVideoCount} diterbitkan, ${skippedUncuratedCount} belum layak, ${skippedSpamCount} spam, ${skippedEncodingCount} encoding rusak, ${skippedInvalidDateCount} metadata wajib tidak valid.`);
  console.log('🎉 Selesai 100%! Semua file tersimpan dengan aman.');
}

run().catch((error) => {
  console.error(`❌ Sitemap gagal diterbitkan: ${error.message}`);
  if (fs.existsSync(sitemapStagingDir)) fs.rmSync(sitemapStagingDir, { recursive: true, force: true });
  if (fs.existsSync(sitemapIndexStagingFile)) fs.rmSync(sitemapIndexStagingFile, { force: true });
  process.exitCode = 1;
});
