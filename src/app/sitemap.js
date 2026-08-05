/**
 * Dynamic Sitemap untuk NICEVX
 * 
 * Menghasilkan sitemap yang mencakup:
 * 1. Halaman statis (home, cats, privacy, terms, dmca, usc2257)
 * 2. Semua halaman kategori (dari API Eporner)
 * 3. Top 500 video terpopuler (dari API Eporner) — INI YANG PALING PENTING UNTUK SEO
 * 
 * Sitemap ini di-generate secara dinamis oleh Cloudflare Edge Worker.
 * Cloudflare CDN meng-cache response ini 24 jam via Cache-Control di next.config.mjs.
 */

export const runtime = 'edge'; // Wajib untuk Cloudflare Pages

const SITE_URL = 'https://nicevx.com';
const API_BASE = 'https://www.eporner.com/api/v2';

/** Slugify helper — harus identik dengan yang di VideoCard.jsx */
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/** Daftar kategori statis (dari sitemap.xml lama) */
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

/**
 * Ambil top video dari Eporner API.
 * Kita ambil 20 video × 50 halaman = 1000 video top-rated.
 * Ini dipanggil saat Googlebot mengakses /sitemap.xml
 */
async function fetchTopVideos() {
  const videos = [];
  const perPage = 50;     // Eporner API max per page
  const totalPages = 10;  // 500 video total — cukup untuk SEO, aman untuk wall clock Cloudflare

  // Fetch paralel dalam batch 5 → 2 batch total (aman dari rate limit)
  const batchSize = 5;
  for (let batchStart = 1; batchStart <= totalPages; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize - 1, totalPages);
    const batchPromises = [];

    for (let page = batchStart; page <= batchEnd; page++) {
      const url = `${API_BASE}/video/search/?query=&per_page=${perPage}&page=${page}&order=top-rated&gay=0&lq=1&format=json`;
      batchPromises.push(
        fetch(url, { cache: 'no-store' }) // edge runtime: gunakan cache CF via header, bukan next cache
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      );
    }

    const results = await Promise.all(batchPromises);
    for (const data of results) {
      if (data?.videos) {
        for (const v of data.videos) {
          if (v.id && v.title) {
            videos.push(v);
          }
        }
      }
    }
  }

  return videos;
}

export default async function sitemap() {
  const now = new Date().toISOString();

  // 1. Halaman statis
  const staticPages = [
    { url: `${SITE_URL}/`,        lastModified: now, changeFrequency: 'always',  priority: 1.0 },
    { url: `${SITE_URL}/cats`,    lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms`,   lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/dmca`,    lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/usc2257`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  // 2. Halaman kategori
  const categoryPages = STATIC_CATEGORIES.map(cat => ({
    url: `${SITE_URL}/cat/${cat}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 3. Top 500 video (paling penting untuk SEO!)
  let videoPages = [];
  try {
    const videos = await fetchTopVideos();
    videoPages = videos.map(v => {
      const slug = slugify(v.title);
      return {
        url: `${SITE_URL}/video/${slug}-${v.id}`,
        lastModified: v.added ? new Date(v.added).toISOString() : now,
        changeFrequency: 'weekly',
        priority: 0.9,
      };
    });
  } catch (err) {
    console.error('Sitemap: failed to fetch videos', err);
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...videoPages,
  ];
}
