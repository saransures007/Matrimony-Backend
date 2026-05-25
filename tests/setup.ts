/**
 * Jest setup file — runs before all tests
 * Sets up test environment, mocks, and global utilities
 */

// Make this file an ambient module (required for `declare global` to work)
export {};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_ACCESS_TOKEN_SECRET = 'test-jwt-secret';
process.env.LOG_LEVEL = 'silent';

// Increase Jest timeout for slow CI environments
jest.setTimeout(30000);

// Silence console output during tests (optional — enable if tests are noisy)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Suppress logs during tests (uncomment if needed)
  // console.error = jest.fn();
  // console.warn = jest.fn();
  // console.log = jest.fn();
});

afterAll(() => {
  // Restore console
  // console.error = originalConsoleError;
  // console.warn = originalConsoleWarn;
  // console.log = originalConsoleLog;
});

// Global test utilities
expect.extend({
  /**
   * Custom matcher: assert object has all given keys
   */
  toHaveKeys(received: any, keys: string[]) {
    const pass = keys.every((key) => key in received);
    return {
      pass,
      message: () => pass
        ? `expected object not to have keys: ${keys.join(', ')}`
        : `expected object to have keys: ${keys.join(', ')}`,
    };
  },

  /**
   * Custom matcher: assert HTTP-style success response
   */
  toBeApiSuccess(received: any) {
    const hasRequiredFields =
      typeof received === 'object' &&
      received !== null &&
      'success' in received &&
      'message' in received;
    return {
      pass: hasRequiredFields && received.success === true,
      message: () => 'expected response to be a standardized success response',
    };
  },
});

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveKeys(keys: string[]): R;
      toBeApiSuccess(): R;
    }
  }
}