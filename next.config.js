/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to load these modules on the server
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        zlib: false,
      };
    }
    return config;
  },
  experimental: {
    turbo: {
      loaders: {
        // Configure loaders for Turbopack here if needed
      },
    },
  },
};

module.exports = nextConfig;
