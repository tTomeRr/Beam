import { query } from '../database/connection';
import { Transaction } from '../types';

const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') return date;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getAllTransactions = async (userId: number): Promise<Transaction[]> => {
  const result = await query(
    'SELECT id, user_id, category_id, amount, date, description FROM transactions WHERE user_id = $1 ORDER BY date DESC, id DESC',
    [userId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    amount: parseFloat(row.amount),
    date: formatDate(row.date),
    description: row.description,
  }));
};

export const createTransaction = async (
  userId: number,
  categoryId: number,
  amount: number,
  date: string,
  description: string
): Promise<Transaction> => {
  const result = await query(
    'INSERT INTO transactions (user_id, category_id, amount, date, description) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, category_id, amount, date, description',
    [userId, categoryId, amount, date, description]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    amount: parseFloat(row.amount),
    date: formatDate(row.date),
    description: row.description,
  };
};

export const updateTransaction = async (
  id: number,
  userId: number,
  updates: Partial<Pick<Transaction, 'categoryId' | 'amount' | 'date' | 'description'>>
): Promise<Transaction | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (updates.categoryId !== undefined) {
    fields.push(`category_id = $${paramCount++}`);
    values.push(updates.categoryId);
  }
  if (updates.amount !== undefined) {
    fields.push(`amount = $${paramCount++}`);
    values.push(updates.amount);
  }
  if (updates.date !== undefined) {
    fields.push(`date = $${paramCount++}`);
    values.push(updates.date);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(updates.description);
  }

  if (fields.length === 0) return null;

  values.push(id, userId);
  const result = await query(
    `UPDATE transactions SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING id, user_id, category_id, amount, date, description`,
    values
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    amount: parseFloat(row.amount),
    date: formatDate(row.date),
    description: row.description,
  };
};

export const deleteTransaction = async (id: number, userId: number): Promise<boolean> => {
  const result = await query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
};
