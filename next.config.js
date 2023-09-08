/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '**' },
    ],
  },
  experimental: { serverActions: true },
};

module.exports = nextConfig;
