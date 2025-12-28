import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAllSavingsAccounts, createSavingsAccount, updateSavingsAccount, deleteSavingsAccount } from '../models/SavingsAccount';
import { AppError } from '../middleware/errorHandler';

export const getSavingsAccounts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const accounts = await getAllSavingsAccounts(userId);
    res.json(accounts);
  } catch (error) {
    next(error);
  }
};

export const addSavingsAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, type, balance, currency } = req.body;

    if (!name || !type || balance === undefined || !currency) {
      throw new AppError('Name, type, balance, and currency are required', 400);
    }

    const account = await createSavingsAccount(userId, name, type, balance, currency);
    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
};

export const modifySavingsAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id, 10);
    const updates = req.body;

    if (isNaN(id)) {
      throw new AppError('Invalid savings account ID', 400);
    }

    const account = await updateSavingsAccount(id, userId, updates);
    if (!account) {
      throw new AppError('Savings account not found', 404);
    }

    res.json(account);
  } catch (error) {
    next(error);
  }
};

export const removeSavingsAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw new AppError('Invalid savings account ID', 400);
    }

    const deleted = await deleteSavingsAccount(id, userId);
    if (!deleted) {
      throw new AppError('Savings account not found', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
