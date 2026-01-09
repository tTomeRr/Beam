import request from 'supertest';
import app from '../../index';
import {
  cleanupTestData,
  createTestUser,
  createTestCategory,
  createTestBudget,
} from '../helpers/testUtils';

describe('Budget Controller', () => {
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

  describe('GET /api/budgets', () => {
    it('should return empty array when user has no budgets', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return user budgets', async () => {
      await createTestBudget(userId, categoryId, 1, 2026, 500);
      await createTestBudget(userId, categoryId, 2, 2026, 600);

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('categoryId');
      expect(response.body[0]).toHaveProperty('month');
      expect(response.body[0]).toHaveProperty('year');
      expect(response.body[0]).toHaveProperty('plannedAmount');
    });

    it('should not return other users budgets', async () => {
      const otherCategory = await createTestCategory(otherUserId, 'Transport', 'Car', '#00FF00');
      await createTestBudget(userId, categoryId, 1, 2026, 500);
      await createTestBudget(otherUserId, otherCategory.id, 1, 2026, 300);

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(parseFloat(response.body[0].plannedAmount)).toBe(500.00);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/api/budgets');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/budgets', () => {
    it('should create a new budget with valid data', async () => {
      const budgetData = {
        categoryId,
        month: 3,
        year: 2026,
        plannedAmount: 750,
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.categoryId).toBe(categoryId);
      expect(response.body.month).toBe(3);
      expect(response.body.year).toBe(2026);
      expect(parseFloat(response.body.plannedAmount)).toBe(750.00);
      expect(response.body.userId).toBe(userId);
    });

    it('should return 400 when categoryId is missing', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          month: 3,
          year: 2026,
          plannedAmount: 750,
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when month is missing', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          year: 2026,
          plannedAmount: 750,
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when year is missing', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          month: 3,
          plannedAmount: 750,
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when plannedAmount is missing', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          month: 3,
          year: 2026,
        });

      expect(response.status).toBe(400);
    });

    it('should validate month is between 1 and 12', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          month: 13,
          year: 2026,
          plannedAmount: 750,
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .send({
          categoryId,
          month: 3,
          year: 2026,
          plannedAmount: 750,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    it('should delete a budget', async () => {
      const budget = await createTestBudget(userId, categoryId, 1, 2026, 500);

      const response = await request(app)
        .delete(`/api/budgets/${budget.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 when budget not found', async () => {
      const response = await request(app)
        .delete('/api/budgets/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 with invalid budget ID', async () => {
      const response = await request(app)
        .delete('/api/budgets/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should not delete another users budget', async () => {
      const otherCategory = await createTestCategory(otherUserId, 'Transport', 'Car', '#00FF00');
      const otherBudget = await createTestBudget(otherUserId, otherCategory.id, 1, 2026, 300);

      const response = await request(app)
        .delete(`/api/budgets/${otherBudget.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const budget = await createTestBudget(userId, categoryId, 1, 2026, 500);

      const response = await request(app)
        .delete(`/api/budgets/${budget.id}`);

      expect(response.status).toBe(401);
    });
  });
});
