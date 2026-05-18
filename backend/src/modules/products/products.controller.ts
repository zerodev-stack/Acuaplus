import { Request, Response, NextFunction } from 'express';
import { createProductSchema, updateProductSchema } from './products.schema';
import * as productsService from './products.service';
import { AppError } from '../../utils/AppError';

/**
 * Crea un nuevo producto.
 * Valida los datos de entrada con Zod y asigna el producto al usuario autenticado (vendedor).
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createProductSchema.parse(req.body);
    // req.user!.userId viene del middleware de autenticación (JWT)
    const product = await productsService.createProduct(req.user!.userId, input);
    res.status(201).json({ data: product });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};

/**
 * Obtiene la lista de todos los productos (con paginación y filtros).
 * Es un endpoint público para que los compradores vean el catálogo.
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productsService.listProducts(req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene los detalles de un producto específico por su ID.
 * Útil para la página de detalles del producto en el frontend.
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const product = await productsService.getProductById(id);
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza la información de un producto.
 * Valida que el usuario que intenta modificar sea el vendedor dueño del producto.
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const input = updateProductSchema.parse(req.body);
    const product = await productsService.updateProduct(id, req.user!.userId, input);
    res.json({ data: product });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const result = await productsService.deleteProduct(id, req.user!.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const addImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const product = await productsService.addProductImage(
      id,
      req.user!.userId,
      req.file,
      req.body.image_url
    );
    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
};
