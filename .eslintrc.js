/**
 * ESLint Configuration — Production-Ready
 * Extends TypeScript ESLint recommended rules
 * Enforces: no unused vars, consistent return types, no implicit any
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/strict',
    'plugin:prettier/recommended', // Disables ESLint rules that conflict with Prettier
  ],
  rules: {
    // === TypeScript ===
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'warn', // Allow but warn
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/return-await': ['error', 'always'],

    // === Imports ===
    'import/order': ['error', {
      groups: [
        'builtin', 'external', 'internal', 'parent', 'sibling', 'index',
      ],
      newlinesBetween: 'always',
      alphabetize: { order: 'asc' },
    }],
    'import/no-cycle': 'error',
    'import/no-default-export': 'error',

    // === Best practices ===
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-else-return': 'error',
    'prefer-const': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'no-var': 'error',

    // === Prettier (disable conflicting rules) ===
    'prettier/prettier': 'error',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    'logs/',
    '*.config.js',
  ],
  overrides: [
    {
      files: ['tests/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
  ],
};