import { Router } from 'express';
import { getCategories, addCategory, modifyCategory } from '../controllers/categoryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getCategories);
router.post('/', addCategory);
router.put('/:id', modifyCategory);

export default router;
