/**
 * Sub-sitemap statis: /sitemap-static.xml
 * Berisi halaman utama + semua halaman kategori.
 * Di-cache 24 jam oleh Cloudflare CDN.
 */

export const runtime = 'edge';

const SITE_URL = 'https://nicevx.com';

const STATIC_PAGES = [
  { url: `${SITE_URL}/`,        changeFrequency: 'always',  priority: 1.0 },
  { url: `${SITE_URL}/cats`,    changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/terms`,   changeFrequency: 'monthly', priority: 0.3 },
  { url: `${SITE_URL}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
  { url: `${SITE_URL}/dmca`,    changeFrequency: 'monthly', priority: 0.3 },
  { url: `${SITE_URL}/usc2257`, changeFrequency: 'monthly', priority: 0.3 },
];

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

function buildXml(urls) {
  const now = new Date().toISOString();
  const urlset = urls.map(({ url, lastModified, changeFrequency, priority }) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified || now}</lastmod>
    ${changeFrequency ? `<changefreq>${changeFrequency}</changefreq>` : ''}
    ${priority != null ? `<priority>${priority.toFixed(1)}</priority>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
}

export async function GET() {
  const now = new Date().toISOString();

  const urls = [
    ...STATIC_PAGES.map(p => ({ ...p, lastModified: now })),
    ...STATIC_CATEGORIES.map(cat => ({
      url: `${SITE_URL}/cat/${cat}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    })),
  ];

  return new Response(buildXml(urls), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}
