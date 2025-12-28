import { query } from '../database/connection';
import { SavingsAccount } from '../types';

export const getAllSavingsAccounts = async (userId: number): Promise<SavingsAccount[]> => {
  const result = await query(
    'SELECT id, user_id, name, type, balance, currency FROM savings_accounts WHERE user_id = $1 ORDER BY id',
    [userId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    balance: parseFloat(row.balance),
    currency: row.currency,
  }));
};

export const createSavingsAccount = async (
  userId: number,
  name: string,
  type: string,
  balance: number,
  currency: string
): Promise<SavingsAccount> => {
  const result = await query(
    'INSERT INTO savings_accounts (user_id, name, type, balance, currency) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, name, type, balance, currency',
    [userId, name, type, balance, currency]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    balance: parseFloat(row.balance),
    currency: row.currency,
  };
};

export const updateSavingsAccount = async (
  id: number,
  userId: number,
  updates: Partial<Pick<SavingsAccount, 'name' | 'type' | 'balance' | 'currency'>>
): Promise<SavingsAccount | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }
  if (updates.type !== undefined) {
    fields.push(`type = $${paramCount++}`);
    values.push(updates.type);
  }
  if (updates.balance !== undefined) {
    fields.push(`balance = $${paramCount++}`);
    values.push(updates.balance);
  }
  if (updates.currency !== undefined) {
    fields.push(`currency = $${paramCount++}`);
    values.push(updates.currency);
  }

  if (fields.length === 0) return null;

  values.push(id, userId);
  const result = await query(
    `UPDATE savings_accounts SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING id, user_id, name, type, balance, currency`,
    values
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    balance: parseFloat(row.balance),
    currency: row.currency,
  };
};

export const deleteSavingsAccount = async (id: number, userId: number): Promise<boolean> => {
  const result = await query(
    'DELETE FROM savings_accounts WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
};
