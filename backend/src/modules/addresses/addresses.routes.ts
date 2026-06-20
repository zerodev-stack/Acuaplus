import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import * as addressesController from './addresses.controller';

const router = Router();

router.get('/',    verifyToken, addressesController.getMyAddresses);
router.post('/',   verifyToken, addressesController.create);

export { router as addressRoutes };