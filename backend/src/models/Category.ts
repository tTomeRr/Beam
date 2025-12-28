import { query } from '../database/connection';
import { Category } from '../types';

export const getAllCategories = async (userId: number): Promise<Category[]> => {
  const result = await query(
    'SELECT id, user_id, name, icon, color, is_active FROM categories WHERE user_id = $1 ORDER BY id',
    [userId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isActive: row.is_active,
  }));
};

export const createCategory = async (
  userId: number,
  name: string,
  icon: string,
  color: string
): Promise<Category> => {
  const result = await query(
    'INSERT INTO categories (user_id, name, icon, color) VALUES ($1, $2, $3, $4) RETURNING id, user_id, name, icon, color, is_active',
    [userId, name, icon, color]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isActive: row.is_active,
  };
};

export const updateCategory = async (
  id: number,
  userId: number,
  updates: Partial<Pick<Category, 'name' | 'icon' | 'color' | 'isActive'>>
): Promise<Category | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }
  if (updates.icon !== undefined) {
    fields.push(`icon = $${paramCount++}`);
    values.push(updates.icon);
  }
  if (updates.color !== undefined) {
    fields.push(`color = $${paramCount++}`);
    values.push(updates.color);
  }
  if (updates.isActive !== undefined) {
    fields.push(`is_active = $${paramCount++}`);
    values.push(updates.isActive);
  }

  if (fields.length === 0) return null;

  values.push(id, userId);
  const result = await query(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING id, user_id, name, icon, color, is_active`,
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
  };
};
