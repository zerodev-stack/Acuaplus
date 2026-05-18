import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';
import * as paymentsController from './payments.controller';

const router = Router();

router.get('/cards', verifyToken, paymentsController.getMyCards);
router.post('/cards', verifyToken, paymentsController.saveCard);
router.post('/process', verifyToken, authorize('buyer'), paymentsController.processPayment);

export { router as paymentRoutes };
