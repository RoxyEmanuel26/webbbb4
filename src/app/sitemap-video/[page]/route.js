/**
 * Sub-sitemap video dinamis: /sitemap-videos-[page]
 *
 * CATATAN: Tidak menggunakan ekstensi .xml di URL karena
 * Next.js App Router tidak mendukung partial dynamic segments
 * (prefix-[param].ext) di folder name dengan benar di runtime.
 *
 * Google tidak memerlukan ekstensi .xml — yang penting
 * Content-Type: application/xml di response header.
 *
 * Contoh:
 *   GET /sitemap-videos-1    → 50 video dari Eporner halaman 1
 *   GET /sitemap-videos-2    → 50 video dari Eporner halaman 2
 *   ...
 *   GET /sitemap-videos-N    → 50 video dari Eporner halaman N
 *                              (N ditentukan dinamis oleh sitemap.xml)
 *
 * Tidak ada batas halaman atas — jumlahnya mengikuti total_count
 * yang dikembalikan Eporner API di sitemap.xml (sitemap index).
 * Halaman di luar jangkauan otomatis return empty <urlset> (valid).
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

/**
 * Parse tanggal API Eporner dengan aman.
 * Format dari API: "2024-01-15 10:30:00" atau "2024-01-15"
 * Mengembalikan fallback jika format tidak valid (cegah RangeError).
 */
function safeIso(dateStr, fallback) {
  if (!dateStr) return fallback;
  try {
    const d = new Date(String(dateStr).split(' ')[0]);
    return isNaN(d.getTime()) ? fallback : d.toISOString();
  } catch {
    return fallback;
  }
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
  // URL: /sitemap-videos-1 → params.page = "1"
  // URL: /sitemap-videos-2 → params.page = "2"
  const raw = resolvedParams?.page || '';
  const page = parseInt(raw, 10);

  // Validasi minimal: harus angka positif valid
  // Tidak ada batas atas — halaman > total tersedia akan return empty XML
  if (!page || page < 1 || isNaN(page)) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const apiUrl = `${API_BASE}/video/search/?query=&per_page=${PER_PAGE}&page=${page}&order=top-rated&gay=0&lq=1&format=json`;
    const res = await fetch(apiUrl, { 
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log(`[Sitemap] Fetching ${apiUrl} - Status: ${res.status}`);

    if (!res.ok) {
      return new Response(buildXml([]), {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
        },
      });
    }

    const data = await res.json();
    console.log(`[Sitemap] Data received, videos count: ${data?.videos?.length}`);
    const videos = data?.videos || [];
    const now = new Date().toISOString();

    const urls = videos
      .filter(v => v.id && v.title)
      .map(v => ({
        url: `${SITE_URL}/video/${slugify(v.title)}-${v.id}`,
        lastModified: safeIso(v.added, now),
      }));

    return new Response(buildXml(urls), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('[Sitemap] Error fetching videos:', error);
    return new Response(buildXml([]), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
      },
    });
  }
}
