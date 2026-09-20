/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Every public route has a finite build-time inventory. Export plain files so
  // Cloudflare Pages can serve them without invoking a Worker.
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
