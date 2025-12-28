import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAllBudgets, createBudget, deleteBudget } from '../models/BudgetPlan';
import { AppError } from '../middleware/errorHandler';

export const getBudgets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const budgets = await getAllBudgets(userId);
    res.json(budgets);
  } catch (error) {
    next(error);
  }
};

export const addBudget = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { categoryId, month, year, plannedAmount } = req.body;

    if (!categoryId || !month || !year || plannedAmount === undefined) {
      throw new AppError('CategoryId, month, year, and plannedAmount are required', 400);
    }

    const budget = await createBudget(userId, categoryId, month, year, plannedAmount);
    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

export const removeBudget = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw new AppError('Invalid budget ID', 400);
    }

    const deleted = await deleteBudget(id, userId);
    if (!deleted) {
      throw new AppError('Budget not found', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
