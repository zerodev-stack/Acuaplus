import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';
import * as ordersController from './orders.controller';

const router = Router();

router.post('/', verifyToken, authorize('buyer'), ordersController.create);
router.get('/mine', verifyToken, ordersController.getMine);
router.get('/seller', verifyToken, authorize('seller'), ordersController.getSellerOrders);
router.get('/:id', verifyToken, ordersController.getById);
router.patch('/seller-orders/:id/status', verifyToken, authorize('seller'), ordersController.updateSellerOrder);

export { router as orderRoutes };
