import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';
import * as usersController from './users.controller';

const router = Router();

router.get('/me', verifyToken, usersController.getMe);
router.patch('/me', verifyToken, usersController.updateMe);
router.get('/pending-sellers', verifyToken, authorize('admin'), usersController.getPendingSellers);
router.patch('/:id/approve', verifyToken, authorize('admin'), usersController.approveSeller);
router.patch('/:id/suspend', verifyToken, authorize('admin'), usersController.suspendUser);

export { router as userRoutes };
