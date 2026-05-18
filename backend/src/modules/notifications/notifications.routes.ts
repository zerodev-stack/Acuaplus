import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import * as notificationsController from './notifications.controller';

const router = Router();

router.get('/', verifyToken, notificationsController.getMine);
router.patch('/:id/read', verifyToken, notificationsController.markAsRead);

export { router as notificationRoutes };
