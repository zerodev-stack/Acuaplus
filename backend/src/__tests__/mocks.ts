/**
 * Common mocks for database, logger, and JWT utilities
 */

export const mockQuery = jest.fn();
export const mockTransaction = jest.fn();

export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

export const mockJWT = {
  signAccessToken: jest.fn((payload) => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
  hashToken: jest.fn((token) => `hash-of-${token}`),
  calculateRefreshExpiry: jest.fn(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
};

export const mockBcrypt = {
  hash: jest.fn(async (password) => `hashed-${password}`),
  compare: jest.fn(async (password, hash) => password === hash.replace('hashed-', '')),
};


