import { Pool } from 'pg';
import pool from '../database/connection';
import { config } from '../config';

export const testDbConfig = {
  ...config.database,
  database: process.env.DB_NAME_TEST || 'beam_test',
};

export const testPool = new Pool(testDbConfig);

afterAll(async () => {
  await testPool.end();
  await pool.end();
});
