/**
 * ═══════════════════════════════════════════════════════════════
 * SITEMAP INDEX DINAMIS — /sitemap.xml
 * ═══════════════════════════════════════════════════════════════
 *
 * TANPA BATAS HARDCODE:
 *   Fetch total_count dari Eporner API → hitung otomatis berapa
 *   sub-sitemap yang dibutuhkan. Kalau Eporner tambah video,
 *   sitemap index ini ikut berkembang sendiri tanpa perlu edit kode.
 *
 *   Hari ini: 100,000 video → 2,000 sub-sitemap
 *   Bulan depan: 120,000 video → 2,400 sub-sitemap (otomatis!)
 *   Tahun depan: 200,000 video → 4,000 sub-sitemap (otomatis!)
 *
 * Sub-sitemap URL format: /sitemap-videos-N (tanpa ekstensi .xml)
 *   Alasan: Next.js App Router tidak support partial dynamic segments
 *   (prefix-[param].ext) di folder name. Google tidak memerlukan
 *   ekstensi .xml — yang penting Content-Type: application/xml.
 *
 * Format: <sitemapindex> yang benar (Google-compliant)
 * Cache: 24 jam di Cloudflare CDN (1 API call per hari)
 * ═══════════════════════════════════════════════════════════════
 */

export const runtime = 'edge';

const SITE_URL = 'https://nicevx.com';
const API_BASE = 'https://www.eporner.com/api/v2';
const PER_PAGE = 50;

// Fallback jika API Eporner tidak bisa dihubungi saat generate sitemap
const FALLBACK_PAGES = 2000;

// Hard cap: Google merekomendasikan max 50,000 sitemap per index
const MAX_PAGES = 50000;

export async function GET() {
  const now = new Date().toISOString();

  // ── Fetch total video count dari Eporner API ───────────────────
  // Hanya 1 request ringan (per_page=1) untuk mendapat total_count.
  let numVideoPages = FALLBACK_PAGES;
  try {
    const res = await fetch(
      `${API_BASE}/video/search/?query=&per_page=1&page=1&order=top-rated&gay=0&lq=1&format=json`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.total_count && data.total_count > 0) {
        numVideoPages = Math.min(
          Math.ceil(data.total_count / PER_PAGE),
          MAX_PAGES
        );
      }
    }
  } catch {
    // API tidak tersedia → gunakan fallback 2000 halaman
  }

  // ── Bangun <sitemapindex> XML ──────────────────────────────────
  // 1 entry untuk sub-sitemap statis
  const staticEntry = `  <sitemap>\n    <loc>${SITE_URL}/sitemap-static.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`;

  // N entries untuk sub-sitemap video (tanpa .xml di URL)
  const videoEntries = Array.from(
    { length: numVideoPages },
    (_, i) => `  <sitemap>\n    <loc>${SITE_URL}/sitemap-video/${i + 1}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`
  ).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    staticEntry,
    videoEntries,
    '</sitemapindex>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}
