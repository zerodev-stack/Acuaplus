import { Request, Response, NextFunction } from 'express';
import { createAddressSchema } from './addresses.schema';
import * as addressesService from './addresses.service';
import { AppError } from '../../utils/AppError';

export const getMyAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addresses = await addressesService.getAddresses(req.user!.userId);
    res.json({ data: addresses });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createAddressSchema.parse(req.body);
    const address = await addressesService.createAddress(req.user!.userId, input);
    res.status(201).json({ data: address });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError')
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    next(error);
  }
};