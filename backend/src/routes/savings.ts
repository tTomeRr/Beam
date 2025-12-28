import { Router } from 'express';
import { getSavingsAccounts, addSavingsAccount, modifySavingsAccount, removeSavingsAccount } from '../controllers/savingsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getSavingsAccounts);
router.post('/', addSavingsAccount);
router.put('/:id', modifySavingsAccount);
router.delete('/:id', removeSavingsAccount);

export default router;
