/**
 * Unit tests for auth service
 * Tests: registerUser, loginUser, refreshUserToken, logoutUser
 */

import { registerUser, loginUser, refreshUserToken, logoutUser } from '../../modules/auth/auth.service';
import { AppError } from '../../utils/AppError';

// Mock database and utilities
jest.mock('../../config/db');
jest.mock('../../utils/logger');
jest.mock('../../utils/jwt');
jest.mock('bcryptjs');

import { query, transaction } from '../../config/db';
import { logger } from '../../utils/logger';
import * as jwt from '../../utils/jwt';
import * as bcrypt from 'bcryptjs';

const mockQuery = query as jest.Mock;
const mockTransaction = transaction as jest.Mock;
const mockLogger = logger as any;
const mockJWT = jwt as any;
const mockBcrypt = bcrypt as any;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementations
    mockJWT.signAccessToken.mockReturnValue('mock-access-token');
    mockJWT.generateRefreshToken.mockReturnValue('mock-refresh-token');
    mockJWT.hashToken.mockImplementation((token: string) => `hash-of-${token}`);
    mockJWT.calculateRefreshExpiry.mockReturnValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    mockBcrypt.hash.mockResolvedValue('hashed-password123');
    mockBcrypt.compare.mockResolvedValue(true);
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'buyer' as const,
        phone: '1234567890',
      };

      mockQuery.mockResolvedValueOnce([]); // No existing user

      const mockConn = {
        execute: jest.fn()
          .mockResolvedValueOnce([{ insertId: 1 }]) // User insert
          .mockResolvedValueOnce([{ affectedRows: 1 }]), // Cart insert
      };

      mockTransaction.mockImplementation(async (cb) => {
        await cb(mockConn);
        return { userId: 1, role: 'buyer', status: 'active' };
      });

      const result = await registerUser(input);

      expect(result).toEqual({
        userId: 1,
        role: 'buyer',
        status: 'active',
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const input = {
        name: 'Jane Doe',
        email: 'existing@example.com',
        password: 'password123',
        role: 'buyer' as const,
        phone: '1234567890',
      };

      mockQuery.mockResolvedValueOnce([{ id: 1 }]); // Existing user found

      await expect(registerUser(input)).rejects.toThrow(AppError);
    });
  });

  describe('loginUser', () => {
    it('should successfully login with valid credentials', async () => {
      const input = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'buyer',
        status: 'active',
        password_hash: 'hashed-password123',
        avatar_url: null,
      };

      mockQuery
        .mockResolvedValueOnce([mockUser]) // User found
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Refresh token insert
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Last login update

      const result = await loginUser(input);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result.user.id).toBe(1);
    });

    it('should throw error for invalid email', async () => {
      const input = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockQuery.mockResolvedValueOnce([]); // User not found

      await expect(loginUser(input)).rejects.toThrow(AppError);
    });

    it('should throw error for invalid password', async () => {
      const input = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'buyer',
        status: 'active',
        password_hash: 'hashed-correct-password',
        avatar_url: null,
      };

      mockQuery.mockResolvedValueOnce([mockUser]);
      mockBcrypt.compare.mockResolvedValueOnce(false); // Password mismatch

      await expect(loginUser(input)).rejects.toThrow(AppError);
    });

    it('should throw error if account is suspended', async () => {
      const input = {
        email: 'suspended@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        name: 'Suspended User',
        email: 'suspended@example.com',
        role: 'buyer',
        status: 'suspended',
        password_hash: 'hashed-password123',
        avatar_url: null,
      };

      mockQuery.mockResolvedValueOnce([mockUser]);

      await expect(loginUser(input)).rejects.toThrow(AppError);
    });
  });

  describe('refreshUserToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';

      const mockTokenRow = {
        id: 1,
        user_id: 1,
        token_hash: 'hash-of-valid-refresh-token',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        is_revoked: 0,
        user_role: 'buyer',
        user_status: 'active',
      };

      mockQuery
        .mockResolvedValueOnce([mockTokenRow]) // Get refresh token
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Revoke old token
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Insert new token

      const result = await refreshUserToken(refreshToken);

      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
    });

    it('should throw error for invalid refresh token', async () => {
      const refreshToken = 'invalid-token';

      mockQuery.mockResolvedValueOnce([]); // No token found

      await expect(refreshUserToken(refreshToken)).rejects.toThrow(AppError);
    });
  });

  describe('logoutUser', () => {
    it('should revoke refresh token on logout', async () => {
      const token = 'refresh-token';

      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await logoutUser(token);

      expect(mockQuery).toHaveBeenCalled();
    });
  });
});



