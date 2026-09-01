module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/__tests__/test-utils\\.tsx$',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/navigation/**',
    '!src/config/**',
    '!src/api/types.ts',
    '!src/theme/tokens.ts',
  ],
};