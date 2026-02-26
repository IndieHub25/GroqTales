/**
 * @fileoverview Next.js configuration for GroqTales
 * @description Enterprise-grade Next.js configuration with performance and security optimizations
 */

const fs = require('fs');
const path = require('path');

/**
 * Read the canonical app version at build time.
 *
 * Priority order:
 *   1. Root VERSION file  (single source of truth — keep this in sync with package.json)
 *   2. package.json "version" field  (fallback if VERSION is missing)
 *   3. '0.0.0'  (last-resort sentinel — a value this obvious makes misconfiguration visible)
 *
 * The resolved value is injected as NEXT_PUBLIC_VERSION so it is baked
 * into the JS bundle at build time and available in every environment
 * (Cloudflare Pages, Vercel, Docker, local) without any filesystem reads at runtime.
 */
function resolveAppVersion() {
  // 1. VERSION file (preferred)
  try {
    const versionFilePath = path.resolve(__dirname, 'VERSION');
    const raw = fs.readFileSync(versionFilePath, 'utf8').trim();
    if (raw) return raw;
  } catch (_) {
    // VERSION file not present — fall through
  }

  // 2. package.json version
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')
    );
    if (pkg.version) return pkg.version;
  } catch (_) {
    // Should never happen in a valid project tree
  }

  // 3. Sentinel fallback
  return '0.0.0';
}

const APP_VERSION = resolveAppVersion();
console.log(`[next.config.js] Resolved app version: ${APP_VERSION}`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core settings
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,

  // Transpile Spline packages to fix "Super constructor null" error in production
  transpilePackages: ['@splinetool/react-spline', '@splinetool/runtime'],

  // Performance optimizations
  compress: true,
  optimizeFonts: true,

  // Image optimization
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'blogger.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'escapetoromance.com',
      },
      {
        protocol: 'https',
        hostname: 'www.nyfa.edu',
      },
      {
        protocol: 'https',
        hostname: 'celadonbooks.com',
      },
      {
        protocol: 'https',
        hostname: 'advicewonders.wordpress.com',
      },
      {
        protocol: 'https',
        hostname: 'motivatevalmorgan.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Fix path aliases for webpack - ensures models and other @/* imports resolve correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
      '@/models': require('path').resolve(__dirname, 'models'),
      '@/lib': require('path').resolve(__dirname, 'lib'),
      '@/components': require('path').resolve(__dirname, 'components'),
    };

    // Silence warnings for specific packages
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Environment variables
  // NEXT_PUBLIC_VERSION is resolved from the VERSION file at build time so
  // the correct version is always baked into the bundle — no runtime fs reads.
  env: {
    NEXT_PUBLIC_VERSION: APP_VERSION,
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects and rewrites
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiUrl = (envUrl && envUrl.startsWith('http'))
      ? envUrl
      : 'http://localhost:3001';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  // Output configuration for static export if needed
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'date-fns',
      'recharts',
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app', 'components', 'lib', 'hooks', 'utils'],
  },

  // Build ID generation
  generateBuildId: async () => {
    return `groqtales-${Date.now()}`;
  },
};

module.exports = nextConfig;
