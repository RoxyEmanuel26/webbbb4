/** @type {import('next').NextConfig} */
// Build: 2026-07-29
const nextConfig = {
  reactStrictMode: true,
  /**
   * Redirect URL lama /video/ID/slug ke format baru /video/slug-ID
   * 
   * Regex :id([A-Za-z0-9]{8,12}) memastikan hanya ID Eporner asli yang di-redirect,
   * bukan slug baru yang kebetulan punya 1 segmen.
   * 
   * Contoh:
   *   /video/DJ999oYH9ei/blonde-girl → /video/blonde-girl-DJ999oYH9ei ✅
   *   /video/blonde-girl-DJ999oYH9ei  → TIDAK kena redirect, lanjut ke [...]slug ✅
   */
  async redirects() {
    return [
      {
        source: '/video/:id([A-Za-z0-9]{8,12})/:slug+',
        destination: '/video/:slug-:id',
        permanent: true,
      },
    ];
  },

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
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=43200' },
        ],
      },
      {
        source: '/sitemaps/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=43200' },
        ],
      },
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
