/**
 * Unit tests for products service
 * Tests: createProduct, getProductById, listProducts, updateProduct, deleteProduct
 */

import {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  deleteProduct,
  addProductImage,
} from '../../modules/products/products.service';
import { AppError } from '../../utils/AppError';

jest.mock('../../config/db');
jest.mock('../../utils/logger');

import { query, transaction } from '../../config/db';
import { logger } from '../../utils/logger';

const mockQuery = query as jest.Mock;
const mockTransaction = transaction as jest.Mock;
const mockLogger = logger as any;

describe('Products Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const sellerId = 1;
      const input = {
        categoryid: 1,
        name: 'Test Product',
        description: 'A test product',
        sku: 'SKU123',
        price: 100,
        stock: 50,
        min_order_qty: 1,
        status: 'draft' as const,
        unit: 'kg',
        weight_kg: 2.5,
        specs: [{ spec_key: 'color', spec_value: 'red', spec_type: 'text' as const }],
        images: [{ image_url: 'http://example.com/image.jpg', alt_text: 'test', source: 'url' as const, is_primary: true }],
      };

      mockQuery.mockResolvedValueOnce([{ id: 1 }]); // Seller profile found

      const mockConn = {
        execute: jest
          .fn()
          .mockResolvedValueOnce([{ insertId: 1 }]) // Product insert
          .mockResolvedValueOnce([{ affectedRows: 1 }]) // Spec insert
          .mockResolvedValueOnce([{ affectedRows: 1 }]), // Image insert
      };

      mockTransaction.mockImplementation(async (cb) => {
        await cb(mockConn);
        return getProductByIdMocked();
      });

      mockQuery.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Test Product',
          category_name: 'Category',
          seller_name: 'Seller',
          price: 100,
          stock: 50,
        },
      ]); // Get product
      mockQuery.mockResolvedValueOnce([]); // Get images
      mockQuery.mockResolvedValueOnce([]); // Get specs

      const result = await createProduct(sellerId, input);

      expect(result).toHaveProperty('id', 1);
      expect(mockLogger.info).toHaveBeenCalledWith('Products', 'Producto creado', { productId: 1, sellerId: 1 });
    });

    it('should throw error if seller profile not found', async () => {
      const sellerId = 999;
      const input = {
        categoryid: 1,
        name: 'Test Product',
        description: 'A test product',
        price: 100,
        stock: 50,
        min_order_qty: 1,
        status: 'draft' as const,
      };

      mockQuery.mockResolvedValueOnce([]); // No seller profile

      await expect(createProduct(sellerId, input)).rejects.toThrow(AppError);
    });
  });

  describe('getProductById', () => {
    it('should retrieve product by id with images and specs', async () => {
      const productId = 1;

      const mockProduct = {
        id: 1,
        name: 'Test Product',
        category_name: 'Electronics',
        seller_name: 'Test Seller',
        price: 100,
        stock: 50,
      };

      const mockImages = [{ id: 1, product_id: 1, image_url: 'http://example.com/image.jpg' }];
      const mockSpecs = [{ id: 1, product_id: 1, spec_key: 'color', spec_value: 'red' }];

      mockQuery
        .mockResolvedValueOnce([mockProduct]) // Get product
        .mockResolvedValueOnce(mockImages) // Get images
        .mockResolvedValueOnce(mockSpecs); // Get specs

      const result = await getProductById(productId);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('images', mockImages);
      expect(result).toHaveProperty('specs', mockSpecs);
    });

    it('should throw error if product not found', async () => {
      const productId = 999;

      mockQuery.mockResolvedValueOnce([]); // Product not found

      await expect(getProductById(productId)).rejects.toThrow(AppError);
    });
  });

  describe('listProducts', () => {
    it('should list products with pagination', async () => {
      const filters = { page: '1', limit: '10' };

      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100, category_name: 'Cat1', seller_name: 'Seller1' },
        { id: 2, name: 'Product 2', price: 200, category_name: 'Cat2', seller_name: 'Seller2' },
      ];

      mockQuery
        .mockResolvedValueOnce([{ total: 2 }]) // Count query
        .mockResolvedValueOnce(mockProducts) // Get products
        .mockResolvedValueOnce([]); // Get primary images

      const result = await listProducts(filters);

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(2);
    });

    it('should filter products by category', async () => {
      const filters = { page: '1', limit: '10', categoryid: '1' };

      mockQuery
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce([{ id: 1, name: 'Product 1', price: 100 }])
        .mockResolvedValueOnce([]);

      const result = await listProducts(filters);

      expect(result.data).toHaveLength(1);
    });

    it('should filter products by search term', async () => {
      const filters = { page: '1', limit: '10', search: 'water' };

      mockQuery
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce([{ id: 1, name: 'Water Filter', price: 50 }])
        .mockResolvedValueOnce([]);

      const result = await listProducts(filters);

      expect(result.data).toHaveLength(1);
    });

    it('should filter products by price range', async () => {
      const filters = { page: '1', limit: '10', min_price: '50', max_price: '150' };

      mockQuery
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce([{ id: 1, name: 'Product', price: 100 }])
        .mockResolvedValueOnce([]);

      const result = await listProducts(filters);

      expect(result.data).toHaveLength(1);
    });

    it('should sort products by price ascending', async () => {
      const filters = { page: '1', limit: '10', sort: 'price_asc' };

      mockQuery
        .mockResolvedValueOnce([{ total: 2 }])
        .mockResolvedValueOnce([
          { id: 1, name: 'Cheap Product', price: 50 },
          { id: 2, name: 'Expensive Product', price: 100 },
        ])
        .mockResolvedValueOnce([]);

      const result = await listProducts(filters);

      expect(result.data[0].price).toBe(50);
      expect(result.data[1].price).toBe(100);
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const productId = 1;
      const userId = 1;
      const input = { name: 'Updated Product', price: 150 };

      const mockProduct = {
        id: 1,
        name: 'Test Product',
        seller_id: 1,
        sp_user_id: 1,
      };

      mockQuery
        .mockResolvedValueOnce([mockProduct]) // Verify owner
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update product
        .mockResolvedValueOnce([mockProduct]) // Get updated product
        .mockResolvedValueOnce([]) // Get images
        .mockResolvedValueOnce([]); // Get specs

      const result = await updateProduct(productId, userId, input);

      expect(result).toHaveProperty('id', 1);
      expect(mockLogger.info).toHaveBeenCalledWith('Products', 'Producto actualizado', { productId });
    });

    it('should throw error if user is not product owner', async () => {
      const productId = 1;
      const userId = 999;
      const input = { name: 'Updated Product' };

      const mockProduct = {
        id: 1,
        sp_user_id: 1,
      };

      mockQuery.mockResolvedValueOnce([mockProduct]);

      await expect(updateProduct(productId, userId, input)).rejects.toThrow(AppError);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const productId = 1;
      const userId = 1;

      const mockProduct = {
        id: 1,
        sp_user_id: 1,
      };

      mockQuery
        .mockResolvedValueOnce([mockProduct]) // Verify owner
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete product

      const result = await deleteProduct(productId, userId);

      expect(result).toHaveProperty('message', 'Producto eliminado exitosamente');
      expect(mockLogger.info).toHaveBeenCalledWith('Products', 'Producto eliminado', { productId });
    });

    it('should throw error if product not found', async () => {
      const productId = 999;
      const userId = 1;

      mockQuery.mockResolvedValueOnce([]); // Product not found

      await expect(deleteProduct(productId, userId)).rejects.toThrow(AppError);
    });
  });

  describe('addProductImage', () => {
    it('should add product image from URL', async () => {
      const productId = 1;
      const userId = 1;
      const imageUrl = 'http://example.com/image.jpg';

      const mockProduct = {
        id: 1,
        sp_user_id: 1,
      };

      mockQuery
        .mockResolvedValueOnce([mockProduct]) // Verify owner
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Add image
        .mockResolvedValueOnce([mockProduct]) // Get product
        .mockResolvedValueOnce([]) // Get images
        .mockResolvedValueOnce([]); // Get specs

      const result = await addProductImage(productId, userId, undefined, imageUrl);

      expect(result).toHaveProperty('id', 1);
    });

    it('should throw error if no file or URL provided', async () => {
      const productId = 1;
      const userId = 1;

      const mockProduct = {
        id: 1,
        sp_user_id: 1,
      };

      mockQuery.mockResolvedValueOnce([mockProduct]); // Verify owner

      await expect(addProductImage(productId, userId)).rejects.toThrow(AppError);
    });
  });
});

// Helper function to mock getProductById response
function getProductByIdMocked() {
  return {
    id: 1,
    name: 'Test Product',
    category_name: 'Category',
    seller_name: 'Seller',
    price: 100,
    stock: 50,
    images: [],
    specs: [],
  };
}










