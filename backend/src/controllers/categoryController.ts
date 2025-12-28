import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAllCategories, createCategory, updateCategory } from '../models/Category';
import { AppError } from '../middleware/errorHandler';

export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const categories = await getAllCategories(userId);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const addCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, icon, color } = req.body;

    if (!name || !icon || !color) {
      throw new AppError('Name, icon, and color are required', 400);
    }

    const category = await createCategory(userId, name, icon, color);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const modifyCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id, 10);
    const updates = req.body;

    if (isNaN(id)) {
      throw new AppError('Invalid category ID', 400);
    }

    const category = await updateCategory(id, userId, updates);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};
