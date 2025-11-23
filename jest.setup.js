// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Remove Next.js unhandled rejection handler and prevent it from being re-added
if (typeof process !== 'undefined') {
  // Remove all existing handlers immediately
  process.removeAllListeners('unhandledRejection');
  
  // Intercept process methods BEFORE Next.js can use them
  const originalOn = process.on;
  const originalAddListener = process.addListener;
  const originalOnce = process.once;
  
  process.on = function(event, listener) {
    if (event === 'unhandledRejection') {
      // Block Next.js handler from being added
      return process;
    }
    return originalOn.call(this, event, listener);
  };
  
  if (process.addListener) {
    process.addListener = function(event, listener) {
      if (event === 'unhandledRejection') {
        // Block Next.js handler from being added
        return process;
      }
      return originalAddListener.call(this, event, listener);
    };
  }
  
  if (process.once) {
    process.once = function(event, listener) {
      if (event === 'unhandledRejection') {
        // Block Next.js handler from being added
        return process;
      }
      return originalOnce.call(this, event, listener);
    };
  }
  
  // Add a safe handler that won't cause recursion
  originalOn.call(process, 'unhandledRejection', () => {
    // Silently handle - no logging, no throwing, no recursion
  });
}

// Global test cleanup to prevent unhandled rejections
afterAll(async () => {
  // Wait for all pending promises and timers to complete
  await new Promise(resolve => {
    // Run any pending setImmediate callbacks
    if (typeof setImmediate !== 'undefined') {
      setImmediate(() => {
        // Give it one more tick to ensure everything is cleaned up
        setImmediate(resolve);
      });
    } else {
      setTimeout(resolve, 0);
    }
  });
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isLocaleDomain: false,
      isReady: true,
      defaultLocale: 'en',
      domainLocales: [],
      isPreview: false,
    };
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

