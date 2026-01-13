import { query } from '../database/connection';
import { Category, CategoryTree } from '../types';

export const getAllCategories = async (userId: number): Promise<Category[]> => {
  const result = await query(
    'SELECT id, user_id, name, icon, color, is_active, parent_category_id, is_default FROM categories WHERE user_id = $1 ORDER BY id',
    [userId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isActive: row.is_active,
    parentCategoryId: row.parent_category_id,
    isDefault: row.is_default,
  }));
};

export const createCategory = async (
  userId: number,
  name: string,
  icon: string,
  color: string,
  parentCategoryId?: number | null,
  isDefault?: boolean
): Promise<Category> => {
  if (parentCategoryId) {
    const parentResult = await query(
      'SELECT id, user_id, parent_category_id FROM categories WHERE id = $1 AND user_id = $2',
      [parentCategoryId, userId]
    );
    if (parentResult.rows.length === 0) {
      throw new Error('Parent category not found or does not belong to user');
    }
    if (parentResult.rows[0].parent_category_id !== null) {
      throw new Error('Cannot create subcategory of a subcategory (max depth is 1)');
    }
  }

  const result = await query(
    'INSERT INTO categories (user_id, name, icon, color, parent_category_id, is_default) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, user_id, name, icon, color, is_active, parent_category_id, is_default',
    [userId, name, icon, color, parentCategoryId || null, isDefault || false]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isActive: row.is_active,
    parentCategoryId: row.parent_category_id,
    isDefault: row.is_default,
  };
};

export const updateCategory = async (
  id: number,
  userId: number,
  updates: Partial<Pick<Category, 'name' | 'icon' | 'color' | 'isActive' | 'parentCategoryId'>>
): Promise<Category | null> => {
  const categoryResult = await query(
    'SELECT is_default, parent_category_id FROM categories WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (categoryResult.rows.length === 0) return null;

  const isDefault = categoryResult.rows[0].is_default;

  if (isDefault && (updates.name || updates.icon || updates.color)) {
    throw new Error('Cannot modify name, icon, or color of default categories');
  }

  if (updates.parentCategoryId) {
    const parentResult = await query(
      'SELECT id, user_id, parent_category_id FROM categories WHERE id = $1 AND user_id = $2',
      [updates.parentCategoryId, userId]
    );
    if (parentResult.rows.length === 0) {
      throw new Error('Parent category not found or does not belong to user');
    }
    if (parentResult.rows[0].parent_category_id !== null) {
      throw new Error('Cannot create subcategory of a subcategory (max depth is 1)');
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (updates.name !== undefined && !isDefault) {
    fields.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }
  if (updates.icon !== undefined && !isDefault) {
    fields.push(`icon = $${paramCount++}`);
    values.push(updates.icon);
  }
  if (updates.color !== undefined && !isDefault) {
    fields.push(`color = $${paramCount++}`);
    values.push(updates.color);
  }
  if (updates.isActive !== undefined) {
    fields.push(`is_active = $${paramCount++}`);
    values.push(updates.isActive);
  }
  if (updates.parentCategoryId !== undefined && !isDefault) {
    fields.push(`parent_category_id = $${paramCount++}`);
    values.push(updates.parentCategoryId);
  }

  if (fields.length === 0) return null;

  values.push(id, userId);
  const result = await query(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING id, user_id, name, icon, color, is_active, parent_category_id, is_default`,
    values
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isActive: row.is_active,
    parentCategoryId: row.parent_category_id,
    isDefault: row.is_default,
  };
};

export const getCategoryTree = async (userId: number): Promise<CategoryTree[]> => {
  const allCategories = await getAllCategories(userId);
  const parentCategories = allCategories.filter(c => c.parentCategoryId === null);

  return parentCategories.map(parent => ({
    ...parent,
    subcategories: allCategories.filter(c => c.parentCategoryId === parent.id),
  }));
};

export const getSubcategories = async (userId: number, parentId: number): Promise<Category[]> => {
  const result = await query(
    'SELECT id, user_id, name, icon, color, is_active, parent_category_id, is_default FROM categories WHERE user_id = $1 AND parent_category_id = $2 ORDER BY id',
    [userId, parentId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isActive: row.is_active,
    parentCategoryId: row.parent_category_id,
    isDefault: row.is_default,
  }));
};
