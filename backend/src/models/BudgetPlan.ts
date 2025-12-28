import { query } from '../database/connection';
import { BudgetPlan } from '../types';

export const getAllBudgets = async (userId: number): Promise<BudgetPlan[]> => {
  const result = await query(
    'SELECT id, user_id, category_id, month, year, planned_amount FROM budget_plans WHERE user_id = $1 ORDER BY year DESC, month DESC',
    [userId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    month: row.month,
    year: row.year,
    plannedAmount: parseFloat(row.planned_amount),
  }));
};

export const createBudget = async (
  userId: number,
  categoryId: number,
  month: number,
  year: number,
  plannedAmount: number
): Promise<BudgetPlan> => {
  const result = await query(
    'INSERT INTO budget_plans (user_id, category_id, month, year, planned_amount) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, category_id, month, year) DO UPDATE SET planned_amount = $5 RETURNING id, user_id, category_id, month, year, planned_amount',
    [userId, categoryId, month, year, plannedAmount]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    month: row.month,
    year: row.year,
    plannedAmount: parseFloat(row.planned_amount),
  };
};

export const deleteBudget = async (id: number, userId: number): Promise<boolean> => {
  const result = await query(
    'DELETE FROM budget_plans WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
};
