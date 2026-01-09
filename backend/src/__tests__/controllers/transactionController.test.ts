import request from 'supertest';
import app from '../../index';
import {
  cleanupTestData,
  createTestUser,
  createTestCategory,
  createTestTransaction,
} from '../helpers/testUtils';

describe('Transaction Controller', () => {
  let authToken: string;
  let userId: number;
  let categoryId: number;
  let otherUserId: number;

  beforeEach(async () => {
    await cleanupTestData();

    const { user, token } = await createTestUser('Test User', 'test@example.com');
    authToken = token;
    userId = user.id;

    const category = await createTestCategory(userId, 'Food', 'Utensils', '#FF0000');
    categoryId = category.id;

    const otherUser = await createTestUser('Other User', 'other@example.com');
    otherUserId = otherUser.user.id;
  });

  describe('GET /api/transactions', () => {
    it('should return empty array when user has no transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return user transactions', async () => {
      await createTestTransaction(userId, categoryId, 50.25, '2026-01-05', 'Coffee');
      await createTestTransaction(userId, categoryId, 100.00, '2026-01-06', 'Dinner');

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('amount');
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[0]).toHaveProperty('description');
    });

    it('should not return other users transactions', async () => {
      const otherCategory = await createTestCategory(otherUserId, 'Transport', 'Car', '#00FF00');
      await createTestTransaction(userId, categoryId, 50.25, '2026-01-05', 'My Transaction');
      await createTestTransaction(otherUserId, otherCategory.id, 100.00, '2026-01-06', 'Other Transaction');

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].description).toBe('My Transaction');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/api/transactions');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction with valid data', async () => {
      const transactionData = {
        categoryId,
        amount: 75.50,
        date: '2026-01-07',
        description: 'Lunch at restaurant',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.categoryId).toBe(categoryId);
      expect(parseFloat(response.body.amount)).toBe(75.50);
      expect(response.body.date).toContain('2026-01-07');
      expect(response.body.description).toBe('Lunch at restaurant');
      expect(response.body.userId).toBe(userId);
    });

    it('should return 400 when categoryId is missing', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 75.50,
          date: '2026-01-07',
          description: 'Lunch',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when amount is missing', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          date: '2026-01-07',
          description: 'Lunch',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when date is missing', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          amount: 75.50,
          description: 'Lunch',
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          categoryId,
          amount: 75.50,
          date: '2026-01-07',
          description: 'Lunch',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update transaction amount', async () => {
      const transaction = await createTestTransaction(userId, categoryId, 100.00, '2026-01-05', 'Original');

      const response = await request(app)
        .put(`/api/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 150.75 });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(transaction.id);
      expect(parseFloat(response.body.amount)).toBe(150.75);
    });

    it('should update transaction description', async () => {
      const transaction = await createTestTransaction(userId, categoryId, 100.00, '2026-01-05', 'Original');

      const response = await request(app)
        .put(`/api/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated description' });

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description');
    });

    it('should update transaction date', async () => {
      const transaction = await createTestTransaction(userId, categoryId, 100.00, '2026-01-05', 'Original');

      const response = await request(app)
        .put(`/api/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: '2026-01-10' });

      expect(response.status).toBe(200);
      expect(response.body.date).toContain('2026-01-10');
    });

    it('should return 404 when transaction not found', async () => {
      const response = await request(app)
        .put('/api/transactions/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 200 });

      expect(response.status).toBe(404);
    });

    it('should return 400 with invalid transaction ID', async () => {
      const response = await request(app)
        .put('/api/transactions/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 200 });

      expect(response.status).toBe(400);
    });

    it('should not update another users transaction', async () => {
      const otherCategory = await createTestCategory(otherUserId, 'Transport', 'Car', '#00FF00');
      const otherTransaction = await createTestTransaction(otherUserId, otherCategory.id, 100.00, '2026-01-05', 'Other');

      const response = await request(app)
        .put(`/api/transactions/${otherTransaction.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 999 });

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const transaction = await createTestTransaction(userId, categoryId, 100.00, '2026-01-05', 'Original');

      const response = await request(app)
        .put(`/api/transactions/${transaction.id}`)
        .send({ amount: 200 });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete a transaction', async () => {
      const transaction = await createTestTransaction(userId, categoryId, 100.00, '2026-01-05', 'To Delete');

      const response = await request(app)
        .delete(`/api/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 when transaction not found', async () => {
      const response = await request(app)
        .delete('/api/transactions/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 with invalid transaction ID', async () => {
      const response = await request(app)
        .delete('/api/transactions/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should not delete another users transaction', async () => {
      const otherCategory = await createTestCategory(otherUserId, 'Transport', 'Car', '#00FF00');
      const otherTransaction = await createTestTransaction(otherUserId, otherCategory.id, 100.00, '2026-01-05', 'Other');

      const response = await request(app)
        .delete(`/api/transactions/${otherTransaction.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const transaction = await createTestTransaction(userId, categoryId, 100.00, '2026-01-05', 'To Delete');

      const response = await request(app)
        .delete(`/api/transactions/${transaction.id}`);

      expect(response.status).toBe(401);
    });
  });
});
