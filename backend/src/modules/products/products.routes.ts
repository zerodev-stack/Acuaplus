import { Router } from 'express';
import { verifyToken, optionalAuth } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';
import { upload } from './upload';
import * as productsController from './products.controller';
import { getProductReviews } from '../reviews/reviews.controller';

const router = Router();

router.get('/mine', verifyToken, authorize('seller'), productsController.getMine);
router.get('/', optionalAuth, productsController.getAll);
router.get('/:id', optionalAuth, productsController.getById);
router.post('/', verifyToken, authorize('seller'), productsController.create);
router.patch('/:id', verifyToken, authorize('seller'), productsController.update);
router.delete('/:id', verifyToken, authorize('seller'), productsController.remove);
router.post('/:id/images', verifyToken, authorize('seller'), upload.single('image'), productsController.addImage);
router.get('/:id/reviews', getProductReviews);

export { router as productRoutes };
