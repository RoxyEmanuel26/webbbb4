/**
 * ═══════════════════════════════════════════════════════════════
 * SITEMAP INDEX — NICEVX
 * ═══════════════════════════════════════════════════════════════
 *
 * Arsitektur Sitemap Index:
 *
 *  GET /sitemap.xml
 *    └─ Sitemap INDEX  → daftar semua sub-sitemap:
 *         ├─ /sitemap-static.xml     → halaman statis + kategori
 *         ├─ /sitemap-videos-1.xml   → video halaman 1  (50 video)
 *         ├─ /sitemap-videos-2.xml   → video halaman 2  (50 video)
 *         ├─ ...
 *         └─ /sitemap-videos-2000.xml → video halaman 2000 (50 video)
 *
 * Total: 2000 × 50 = 100,000 video — SEMUA video top-rated Eporner
 *
 * Tiap sub-sitemap = 1 API call ke Eporner → aman dari timeout.
 * Cache 24 jam di Cloudflare CDN via next.config.mjs.
 * ═══════════════════════════════════════════════════════════════
 */

export const runtime = 'edge';

const SITE_URL       = 'https://nicevx.com';
const NUM_VIDEO_PAGES = 2000; // 2000 × 50 = 100,000 video

export default async function sitemap() {
  const now = new Date().toISOString();

  // Sitemap INDEX: daftar semua sub-sitemap yang ada
  return [
    // Sub-sitemap statis (halaman utama + kategori)
    {
      url: `${SITE_URL}/sitemap-static.xml`,
      lastModified: now,
    },
    // Sub-sitemap video: 1 s/d 2000
    ...Array.from({ length: NUM_VIDEO_PAGES }, (_, i) => ({
      url: `${SITE_URL}/sitemap-videos-${i + 1}.xml`,
      lastModified: now,
    })),
  ];
}
