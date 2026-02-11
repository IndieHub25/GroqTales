/** @type {import('jest').Config} */
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Use jsdom for React component tests
  testEnvironment: 'jest-environment-jsdom',

  // Module path aliases — mirrors tsconfig.json paths.
  // Specific paths MUST come before the catch-all to resolve correctly.
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test file locations — support both directories
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/components/__tests__/**/*.test.{ts,tsx}',
  ],

  // Ignore build output and node_modules
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Transform TypeScript / TSX via ts-jest
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowJs: true,
          module: 'commonjs',
          moduleResolution: 'node',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          strict: false,
          baseUrl: '.',
          paths: {},
        },
        diagnostics: false,
      },
    ],
  },

  // Don't try to transform node_modules (except specific ESM packages)
  transformIgnorePatterns: [
    '/node_modules/(?!(lucide-react|framer-motion)/)',
  ],

  // Coverage collection targets
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
