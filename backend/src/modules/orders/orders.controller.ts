import { Request, Response, NextFunction } from 'express';
import { createOrderSchema, updateSellerOrderSchema } from './orders.schema';
import * as ordersService from './orders.service';
import { AppError } from '../../utils/AppError';

/**
 * Crea una nueva orden de compra.
 * Recibe los datos de envío, método de pago y procesa el carrito actual del usuario.
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createOrderSchema.parse(req.body);
    const order = await ordersService.createOrder(req.user!.userId, input);
    res.status(201).json({ data: order });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};

/**
 * Obtiene el historial de órdenes realizadas por el comprador autenticado.
 */
export const getMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ordersService.getMyOrders(req.user!.userId, req.query as any);
    res.json(result);
  } catch (error) {
    console.log('Error en getMine:', error);
    console.log('STACK:', (error as any).stack);
    next(error);
  }
};

/**
 * Obtiene el detalle completo de una orden específica, asegurando que 
 * pertenezca al usuario que hace la solicitud.
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const order = await ordersService.getOrderById(id, req.user!.userId);
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Permite a un vendedor actualizar el estado de su sub-orden 
 * (ej: de pendiente a enviado, o entregado).
 */
export const updateSellerOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const input = updateSellerOrderSchema.parse(req.body);
    const order = await ordersService.updateSellerOrderStatus(id, req.user!.userId, input);
    res.json({ data: order });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};

/**
 * Obtiene las sub-órdenes asignadas a un vendedor (productos que han sido comprados).
 */
export const getSellerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ordersService.getSellerOrders(req.user!.userId, req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
