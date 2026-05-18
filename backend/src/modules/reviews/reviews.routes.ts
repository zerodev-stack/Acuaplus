import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';
import * as reviewsController from './reviews.controller';

const router = Router();

router.post('/', verifyToken, authorize('buyer'), reviewsController.create);
router.get('/product/:productId', reviewsController.getProductReviews);

export { router as reviewRoutes };
