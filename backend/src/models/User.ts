import { query } from '../database/connection';
import { User } from '../types';

export const createUser = async (
  name: string,
  email: string,
  passwordHash: string
): Promise<User> => {
  const result = await query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at as "createdAt", updated_at as "updatedAt"',
    [name, email, passwordHash]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query(
    'SELECT id, name, email, password_hash as "passwordHash", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const result = await query(
    'SELECT id, name, email, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};
