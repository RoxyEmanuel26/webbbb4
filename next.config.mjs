/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self';"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            // no-referrer-when-downgrade: kirim full URL (termasuk path & query) ke
            // Adsterra melalui Referer header. Ini penting agar Adsterra bisa
            // mendeteksi konteks halaman (mis. /video/xxx-sexy-milf) dan menampilkan
            // iklan yang relevan → CPM lebih tinggi.
            // JANGAN gunakan strict-origin-when-cross-origin — itu memotong path/query
            // sehingga Adsterra hanya menerima origin (nicevx.com) tanpa konteks.
            value: 'no-referrer-when-downgrade'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
