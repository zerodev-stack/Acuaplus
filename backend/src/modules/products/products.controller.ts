import { Request, Response, NextFunction } from 'express';
import { createProductSchema, updateProductSchema } from './products.schema';
import * as productsService from './products.service';
import { AppError } from '../../utils/AppError';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));

    const parsed = createProductSchema.safeParse(req.body);

    if (!parsed.success) {
      console.log('❌ Zod issues:', JSON.stringify(parsed.error.issues, null, 2));
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', parsed.error.issues));
    }

    const product = await productsService.createProduct(req.user!.userId, parsed.data);
    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
};

export const getMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productsService.listMyProducts(req.user!.userId, req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productsService.listProducts(req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

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

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) throw new AppError(400, 'ID inválido', 'INVALID_ID');

    console.log('🟡 UPDATE params.id:', req.params.id);
    console.log('🟡 UPDATE body:', JSON.stringify(req.body, null, 2));

    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
      console.log('🔴 UPDATE issues:', JSON.stringify(parsed.error.issues, null, 2));
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', parsed.error.issues));
    }

    const product = await productsService.updateProduct(id, req.user!.userId, parsed.data);
    res.json({ data: product });
  } catch (error) {
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

    console.log('🖼️ ADD IMAGE file:', req.file ? req.file.filename : null);
    console.log('🖼️ ADD IMAGE body:', JSON.stringify(req.body, null, 2));

    const rawImageUrl =
      req.body?.imageUrl ??
      req.body?.image_url ??
      req.body?.imageurl ??
      null;

    const imageUrl =
      typeof rawImageUrl === 'string' && rawImageUrl.trim() !== ''
        ? rawImageUrl.trim()
        : undefined;

    if (!req.file && !imageUrl) {
      throw new AppError(400, 'Debe proporcionar un archivo o una URL válida', 'IMAGE_REQUIRED');
    }

    const product = await productsService.addProductImage(
      id,
      req.user!.userId,
      req.file,
      imageUrl
    );

    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
};