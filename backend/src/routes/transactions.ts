import { Router } from 'express';
import { getTransactions, addTransaction, modifyTransaction, removeTransaction } from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getTransactions);
router.post('/', addTransaction);
router.put('/:id', modifyTransaction);
router.delete('/:id', removeTransaction);

export default router;
