import { Router } from 'express';
import * as categoriesController from './categories.controller';

const router = Router();

router.get('/', categoriesController.getAll);

export { router as categoryRoutes };
