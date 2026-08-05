/**
 * ═══════════════════════════════════════════════════════════════
 * SITEMAP INDEX — /sitemap.xml
 * ═══════════════════════════════════════════════════════════════
 *
 * PENTING: File ini menggunakan route.js (bukan sitemap.js) karena
 * sitemap.js Next.js hanya bisa menghasilkan format <urlset>,
 * bukan <sitemapindex>. Google membutuhkan <sitemapindex> untuk
 * mengenali dan mengikuti link ke sub-sitemap.
 *
 * Format yang BENAR (file ini):
 *   <sitemapindex>
 *     <sitemap><loc>https://nicevx.com/sitemap-static.xml</loc></sitemap>
 *     <sitemap><loc>https://nicevx.com/sitemap-videos-1.xml</loc></sitemap>
 *     ...
 *   </sitemapindex>
 *
 * Format yang SALAH (dari sitemap.js default Next.js):
 *   <urlset>
 *     <url><loc>https://nicevx.com/sitemap-videos-1.xml</loc></url>
 *   </urlset>
 *   ← Google akan anggap ini halaman web biasa, BUKAN sub-sitemap!
 *
 * Arsitektur lengkap:
 *   /sitemap.xml              ← Index (file ini) — daftar semua sub-sitemap
 *   /sitemap-static.xml       ← Halaman statis + kategori
 *   /sitemap-videos-1.xml     ← 50 video halaman 1
 *   /sitemap-videos-2.xml     ← 50 video halaman 2
 *   ...
 *   /sitemap-videos-2000.xml  ← 50 video halaman 2000
 *   TOTAL: 100,000 video URLs
 * ═══════════════════════════════════════════════════════════════
 */

export const runtime = 'edge';

const SITE_URL        = 'https://nicevx.com';
const NUM_VIDEO_PAGES = 2000; // 2000 × 50 = 100,000 video

export async function GET() {
  const now = new Date().toISOString();

  // Bangun daftar semua sub-sitemap
  const sitemaps = [
    { loc: `${SITE_URL}/sitemap-static.xml`, lastmod: now },
    ...Array.from({ length: NUM_VIDEO_PAGES }, (_, i) => ({
      loc: `${SITE_URL}/sitemap-videos-${i + 1}.xml`,
      // Video sitemap tidak perlu lastmod di index level
    })),
  ];

  // Bangun XML sitemapindex yang benar
  const entries = sitemaps
    .map(({ loc, lastmod }) =>
      `  <sitemap>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </sitemap>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cache 24 jam — Google tidak perlu re-fetch index setiap hari
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}
