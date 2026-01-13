import { query } from '../database/connection';
import { DEFAULT_CATEGORIES } from '../database/seeds/defaultCategories';

export const seedDefaultCategoriesForUser = async (userId: number): Promise<void> => {
  try {
    await query('BEGIN');

    for (const category of DEFAULT_CATEGORIES) {
      const parentResult = await query(
        'INSERT INTO categories (user_id, name, icon, color, is_default, parent_category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [userId, category.name, category.icon, category.color, true, null]
      );

      const parentId = parentResult.rows[0].id;

      for (const subcategory of category.subcategories) {
        await query(
          'INSERT INTO categories (user_id, name, icon, color, is_default, parent_category_id) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, subcategory.name, subcategory.icon, subcategory.color, true, parentId]
        );
      }
    }

    await query('COMMIT');
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
};

export const seedDefaultCategoriesForAllUsers = async (): Promise<void> => {
  try {
    const usersResult = await query('SELECT id FROM users');
    const userIds = usersResult.rows.map(row => row.id);

    for (const userId of userIds) {
      const existingDefaults = await query(
        'SELECT COUNT(*) as count FROM categories WHERE user_id = $1 AND is_default = true',
        [userId]
      );

      if (parseInt(existingDefaults.rows[0].count, 10) === 0) {
        await seedDefaultCategoriesForUser(userId);
      }
    }
  } catch (error) {
    throw error;
  }
};
