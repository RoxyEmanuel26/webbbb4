/** @type {import('next').NextConfig} */
// Build: 2026-07-29
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      // ── Security headers untuk semua route ──────────────────────────────
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self';" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            // no-referrer-when-downgrade: kirim full URL ke Adsterra via Referer header.
            // Penting agar Adsterra deteksi konteks halaman → CPM lebih tinggi.
            value: 'no-referrer-when-downgrade'
          },
        ],
      },
      // ── Cache halaman STATIS (terms, privacy, dmca, usc2257, cats) ───────
      // s-maxage: Cloudflare CDN cache 24 jam → Worker TIDAK dijalankan ulang
      // stale-while-revalidate: perpanjang cache sambil refresh di background
      {
        source: '/(terms|privacy|dmca|usc2257|cats)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=86400' },
        ],
      },
      // ── Cache Sitemap Dinamis ─────────────────────────────────────────────
      // Sitemap.js memanggil Eporner API untuk 1000 video.
      // Cache 24 jam di Cloudflare agar tidak membebani API Eporner.
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=43200' },
        ],
      },
      // ── Cache halaman DINAMIS (home, video, cat, search, tag) ───────────

      // s-maxage=600: Cloudflare CDN cache 10 menit → bot yg crawl URL sama
      // dalam 10 menit hanya memanggil Worker 1x, sisanya dari cache CDN.
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/video/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/cat/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/search',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=60' },
        ],
      },
      {
        source: '/tag/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=300' },
        ],
      },
    ];
  }
};

export default nextConfig;
