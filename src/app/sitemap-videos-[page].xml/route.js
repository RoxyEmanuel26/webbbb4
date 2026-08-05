/**
 * Sub-sitemap video dinamis: /sitemap-videos-[page].xml
 *
 * Contoh:
 *   GET /sitemap-videos-1.xml  → 50 video dari Eporner halaman 1
 *   GET /sitemap-videos-2.xml  → 50 video dari Eporner halaman 2
 *   ...
 *   GET /sitemap-videos-2000.xml → 50 video dari Eporner halaman 2000
 *
 * Total: 2000 × 50 = 100,000 video — semua katalog Eporner top-rated.
 *
 * Tiap request hanya membuat 1 API call ke Eporner.
 * Di-cache 24 jam oleh Cloudflare CDN via Cache-Control header.
 */

export const runtime = 'edge';

const SITE_URL = 'https://nicevx.com';
const API_BASE = 'https://www.eporner.com/api/v2';
const PER_PAGE = 50;

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function buildXml(urls) {
  const now = new Date().toISOString();
  const urlset = urls.map(({ url, lastModified }) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
}

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const raw = resolvedParams?.page || '';

  // URL format: /sitemap-videos-[page].xml → extract page number
  // The folder is named [page] but Next.js strips the .xml extension
  // Actual param received: "1" from /sitemap-videos-1.xml
  const page = parseInt(raw, 10);

  // Validasi: harus angka valid antara 1 dan 2000
  if (!page || page < 1 || page > 2000 || isNaN(page)) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const apiUrl = `${API_BASE}/video/search/?query=&per_page=${PER_PAGE}&page=${page}&order=top-rated&gay=0&lq=1&format=json`;
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) {
      return new Response(buildXml([]), {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }

    const data = await res.json();
    const videos = data?.videos || [];
    const now = new Date().toISOString();

    const urls = videos
      .filter(v => v.id && v.title)
      .map(v => ({
        url: `${SITE_URL}/video/${slugify(v.title)}-${v.id}`,
        lastModified: v.added
          ? new Date(v.added.split(' ')[0]).toISOString()
          : now,
      }));

    return new Response(buildXml(urls), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch {
    return new Response(buildXml([]), {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
