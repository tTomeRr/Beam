import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../../config';
import { JWTPayload, User, Category, Transaction, BudgetPlan, SavingsAccount } from '../../types';
import { testPool } from '../setup';

export const generateToken = (userId: number, email: string): string => {
  const payload: JWTPayload = { userId, email };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcryptRounds);
};

export const createTestUser = async (
  name = 'Test User',
  email = `test${Date.now()}@example.com`,
  password = 'password123'
): Promise<{ user: User; token: string; password: string }> => {
  const passwordHash = await hashPassword(password);

  const result = await testPool.query<User>(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at, updated_at',
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  const token = generateToken(user.id, user.email);

  return { user, token, password };
};

export const createTestCategory = async (
  userId: number,
  name = 'Test Category',
  icon = 'ShoppingCart',
  color = '#4F46E5'
): Promise<Category> => {
  const result = await testPool.query<Category>(
    'INSERT INTO categories (user_id, name, icon, color, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *',
    [userId, name, icon, color]
  );

  return result.rows[0];
};

export const createTestTransaction = async (
  userId: number,
  categoryId: number,
  amount = 100.50,
  date = '2026-01-07',
  description = 'Test transaction'
): Promise<Transaction> => {
  const result = await testPool.query<Transaction>(
    'INSERT INTO transactions (user_id, category_id, amount, date, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, categoryId, amount, date, description]
  );

  return result.rows[0];
};

export const createTestBudget = async (
  userId: number,
  categoryId: number,
  month = 1,
  year = 2026,
  plannedAmount = 500
): Promise<BudgetPlan> => {
  const result = await testPool.query<BudgetPlan>(
    'INSERT INTO budget_plans (user_id, category_id, month, year, planned_amount) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, categoryId, month, year, plannedAmount]
  );

  return result.rows[0];
};

export const createTestSavingsAccount = async (
  userId: number,
  name = 'Test Savings',
  type = 'savings',
  balance = 1000,
  currency = 'ILS'
): Promise<SavingsAccount> => {
  const result = await testPool.query<SavingsAccount>(
    'INSERT INTO savings_accounts (user_id, name, type, balance, currency) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, name, type, balance, currency]
  );

  return result.rows[0];
};

export const cleanupTestData = async (): Promise<void> => {
  await testPool.query('TRUNCATE TABLE transactions RESTART IDENTITY CASCADE');
  await testPool.query('TRUNCATE TABLE budget_plans RESTART IDENTITY CASCADE');
  await testPool.query('TRUNCATE TABLE savings_accounts RESTART IDENTITY CASCADE');
  await testPool.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');
  await testPool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
};
