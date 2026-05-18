import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import * as cartController from './cart.controller';

const router = Router();

router.get('/', verifyToken, cartController.getCart);
router.post('/items', verifyToken, cartController.addItem);
router.patch('/items/:id', verifyToken, cartController.updateItem);
router.delete('/items/:id', verifyToken, cartController.removeItem);

export { router as cartRoutes };
