/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,

  // Enable experimental features for better module resolution
  experimental: {
    esmExternals: true,
  },

  // Webpack configuration for better path resolution
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname, "."),
      "@/lib": require("path").resolve(__dirname, "./lib"),
      "@/components": require("path").resolve(__dirname, "./components"),
      "@/app": require("path").resolve(__dirname, "./app"),
      "@/models": require("path").resolve(__dirname, "./models"),
    };
    return config;
  },
};

module.exports = nextConfig;
