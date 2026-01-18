import { Router } from 'express';
import { getCategories, addCategory, modifyCategory, getCategoryTreeHandler, getSubcategoriesHandler, removeCategory } from '../controllers/categoryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getCategories);
router.get('/tree', getCategoryTreeHandler);
router.get('/:id/subcategories', getSubcategoriesHandler);
router.post('/', addCategory);
router.put('/:id', modifyCategory);
router.delete('/:id', removeCategory);

export default router;
