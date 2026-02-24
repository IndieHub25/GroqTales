const nextJest = require('next/jest');

// Tell Next.js where the app lives
const createJestConfig = nextJest({
dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
// Required for testing React components
testEnvironment: 'jest-environment-jsdom',

// Testing Library setup (matchers like toBeInTheDocument)
setupFilesAfterEnv: ['<rootDir>/tests/setup-jest.ts'],

// Support @/ path aliases (same as tsconfig.json)
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

// Where Jest should look for tests
testMatch: [
'<rootDir>/tests/**/*.test.{ts,tsx}',
'<rootDir>/components/**/**tests**/**/*.test.{ts,tsx}',
],

// Ignore build + dependencies
testPathIgnorePatterns: [
'<rootDir>/.next/',
'<rootDir>/node_modules/',
],

// Ignore unrelated nested projects
modulePathIgnorePatterns: [
'<rootDir>/GroqTales/',
'<rootDir>/src/blockchain/alchemy/node_modules/',
],

// Coverage (optional but useful for PR reviewers)
collectCoverageFrom: [
'app/**/*.{ts,tsx}',
'components/**/*.{ts,tsx}',
'lib/**/*.{ts,tsx}',
'!**/*.d.ts',
'!**/node_modules/**',
],
};

// Export Next-aware Jest config
module.exports = createJestConfig(customJestConfig);
