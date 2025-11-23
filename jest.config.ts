import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^next/dist/server/node-environment-extensions/unhandled-rejection$': '<rootDir>/jest.mocks/next-unhandled-rejection.js',
  },
  // Setup files run BEFORE Next.js loads
  setupFiles: ['<rootDir>/jest.env.js'],
  // Setup files run AFTER Next.js loads
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/test/**/*.test.{js,jsx,ts,tsx}',
  ],
};

export default createJestConfig(config);
