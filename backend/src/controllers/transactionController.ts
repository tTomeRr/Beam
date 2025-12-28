import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAllTransactions, createTransaction, updateTransaction, deleteTransaction } from '../models/Transaction';
import { AppError } from '../middleware/errorHandler';

export const getTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const transactions = await getAllTransactions(userId);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

export const addTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { categoryId, amount, date, description } = req.body;

    if (!categoryId || !amount || !date) {
      throw new AppError('CategoryId, amount, and date are required', 400);
    }

    const transaction = await createTransaction(userId, categoryId, amount, date, description || '');
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

export const modifyTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id, 10);
    const updates = req.body;

    if (isNaN(id)) {
      throw new AppError('Invalid transaction ID', 400);
    }

    const transaction = await updateTransaction(id, userId, updates);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

export const removeTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw new AppError('Invalid transaction ID', 400);
    }

    const deleted = await deleteTransaction(id, userId);
    if (!deleted) {
      throw new AppError('Transaction not found', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
