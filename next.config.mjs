/** @type {import('next').NextConfig} */
// Build: 2026-07-29
const catalogCacheControl = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';

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
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
      // Catalog pages are generated during the daily publication workflow.
      // Cache the generated HTML at the edge instead of re-rendering it in a
      // Worker for every visitor and crawler request.
      ...[
        '/video/:path*',
        '/cat/:path*',
        '/tag/:path*',
        '/cats',
        '/collections/:path*',
        '/saved',
        '/trends/:path*',
        '/search',
      ].map((source) => ({
        source,
        headers: [{ key: 'Cache-Control', value: catalogCacheControl }],
      })),
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' },
        ],
      },
      {
        source: '/sitemaps/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' },
        ],
      },
      // ── Homepage: cache singkat karena konten berubah sering ──────────────
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: catalogCacheControl },
        ],
      },
    ];
  }
};

export default nextConfig;
