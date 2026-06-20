/**
 * Unit tests for utility functions and classes
 * Tests: AppError, JWT utilities, pagination
 */

import { AppError } from '../../utils/AppError';
import { getPaginationParams, paginate } from '../../utils/pagination';

describe('Utility Functions', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError(400, 'Bad request', 'BAD_REQUEST', { field: 'email' });

      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.details).toEqual({ field: 'email' });
    });

    it('should create an AppError with default code', () => {
      const error = new AppError(500, 'Internal error');

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });

    it('should be throwable and catchable', () => {
      const testFn = () => {
        throw new AppError(403, 'Forbidden', 'FORBIDDEN_ACCESS');
      };

      expect(testFn).toThrow(AppError);
      expect(testFn).toThrow('Forbidden');
    });

    it('should maintain stack trace', () => {
      const error = new AppError(404, 'Not found', 'NOT_FOUND');

      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Pagination', () => {
    it('should calculate correct pagination params for page 1', () => {
      const filters = { page: '1', limit: '10' };
      const result = getPaginationParams(filters);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should calculate correct pagination params for page 2', () => {
      const filters = { page: '2', limit: '10' };
      const result = getPaginationParams(filters);

      expect(result).toEqual({
        page: 2,
        limit: 10,
        offset: 10,
      });
    });

    it('should use default values if not provided', () => {
      const filters = {};
      const result = getPaginationParams(filters);

      expect(result.page).toBe(1);
      expect(result.limit).toBeGreaterThan(0);
      expect(result.offset).toBe(0);
    });

    it('should apply max limit if exceeded', () => {
      const filters = { page: '1', limit: '1000' };
      const result = getPaginationParams(filters);

      expect(result.limit).toBeLessThanOrEqual(100); // Assuming max is 100
    });

    it('should format paginate response correctly', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
      const total = 25;
      const page = 1;
      const limit = 10;

      const result = paginate(data, total, page, limit);

      expect(result).toHaveProperty('data', data);
      expect(result).toHaveProperty('total', 25);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalPages', 3);
    });

    it('should handle empty data in pagination', () => {
      const data: any[] = [];
      const total = 0;
      const page = 1;
      const limit = 10;

      const result = paginate(data, total, page, limit);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(1);
    });

    it('should calculate pages correctly for partial last page', () => {
      const data = new Array(5);
      const total = 25;
      const page = 3;
      const limit = 10;

      const result = paginate(data, total, page, limit);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('Error handling', () => {
    it('should handle null details in AppError', () => {
      const error = new AppError(400, 'Invalid input', 'INVALID_INPUT', null);

      expect(error.details).toBeNull();
    });

    it('should handle undefined details in AppError', () => {
      const error = new AppError(400, 'Invalid input', 'INVALID_INPUT');

      expect(error.details).toBeUndefined();
    });

    it('should allow custom error codes', () => {
      const error = new AppError(400, 'Custom error', 'CUSTOM_ERROR_CODE');

      expect(error.code).toBe('CUSTOM_ERROR_CODE');
    });
  });
});



