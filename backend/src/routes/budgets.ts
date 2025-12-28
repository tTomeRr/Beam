import { Router } from 'express';
import { getBudgets, addBudget, removeBudget } from '../controllers/budgetController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getBudgets);
router.post('/', addBudget);
router.delete('/:id', removeBudget);

export default router;
