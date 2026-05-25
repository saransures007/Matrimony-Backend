/**
 * Jest Configuration
 * TypeScript support via ts-jest, supertest for HTTP integration tests
 */

module.exports = {
  // Root config
  rootDir: '.',

  // Test directories
  testMatch: ['<rootDir>/tests/**/*.test.ts'],

  // TypeScript transformer
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Path aliases (must match tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@schemas/(.*)$': '<rootDir>/src/schemas/$1',
    '^@config$': '<rootDir>/src/config/index.ts',
  },

  // Coverage (disabled for now — enable per-module as coverage improves)
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/',
    '/src/@types/',
    '/src/database/',
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Test timeout
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests — only removes call history, NOT implementations
  clearMocks: true,
  resetMocks: false,
};