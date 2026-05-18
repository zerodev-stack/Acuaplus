import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { userRoutes } from '../modules/users/users.routes';
import { categoryRoutes } from '../modules/categories/categories.routes';
import { productRoutes } from '../modules/products/products.routes';
import { cartRoutes } from '../modules/cart/cart.routes';
import { orderRoutes } from '../modules/orders/orders.routes';
import { paymentRoutes } from '../modules/payments/payments.routes';
import { reviewRoutes } from '../modules/reviews/reviews.routes';
import { notificationRoutes } from '../modules/notifications/notifications.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);

export { router as routes };

export default router;
