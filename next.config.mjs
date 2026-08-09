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
      // ── Halaman CATS (semi-static, bisa di-cache lebih lama) ─────────────
      {
        source: '/cats',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=3600' },
        ],
      },
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
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=60' },
        ],
      },
      // ── SSR pages: NO CACHE — harus render fresh setiap request ───────────
      // Video, Cat, Tag pages mengandung metadata SEO (title, canonical, schema)
      // yang harus selalu akurat. s-maxage menyebabkan Cloudflare menyajikan
      // HTML lama bahkan setelah deploy baru.
      {
        source: '/video/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/cat/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/tag/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/search',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  }
};

export default nextConfig;
