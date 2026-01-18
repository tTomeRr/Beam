import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAllCategories, createCategory, updateCategory, getCategoryTree, getSubcategories, deleteCategory } from '../models/Category';
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
    const { name, icon, color, parentCategoryId } = req.body;

    if (!name || !icon || !color) {
      throw new AppError('Name, icon, and color are required', 400);
    }

    const category = await createCategory(userId, name, icon, color, parentCategoryId);
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
    if (error instanceof Error && error.message.includes('Cannot modify')) {
      next(new AppError(error.message, 403));
    } else {
      next(error);
    }
  }
};

export const getCategoryTreeHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const categoryTree = await getCategoryTree(userId);
    res.json(categoryTree);
  } catch (error) {
    next(error);
  }
};

export const getSubcategoriesHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const parentId = parseInt(req.params.id, 10);

    if (isNaN(parentId)) {
      throw new AppError('Invalid category ID', 400);
    }

    const subcategories = await getSubcategories(userId, parentId);
    res.json(subcategories);
  } catch (error) {
    next(error);
  }
};

export const removeCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw new AppError('Invalid category ID', 400);
    }

    await deleteCategory(id, userId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Category not found') {
        next(new AppError(error.message, 404));
      } else if (error.message.includes('לא ניתן')) {
        next(new AppError(error.message, 400));
      } else {
        next(error);
      }
    } else {
      next(error);
    }
  }
};
