import request from 'supertest';
import app from '../../index';
import { cleanupTestData, createTestUser, createTestCategory } from '../helpers/testUtils';

describe('Category Controller', () => {
  let authToken: string;
  let userId: number;
  let otherUserId: number;

  beforeEach(async () => {
    await cleanupTestData();

    const { user, token } = await createTestUser('Test User', 'test@example.com');
    authToken = token;
    userId = user.id;

    const otherUser = await createTestUser('Other User', 'other@example.com');
    otherUserId = otherUser.user.id;
  });

  describe('GET /api/categories', () => {
    it('should return empty array when user has no categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return user categories', async () => {
      await createTestCategory(userId, 'Food', 'Utensils', '#FF0000');
      await createTestCategory(userId, 'Transport', 'Car', '#00FF00');

      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('icon');
      expect(response.body[0]).toHaveProperty('color');
      expect(response.body[0]).toHaveProperty('isActive');
    });

    it('should not return other users categories', async () => {
      await createTestCategory(userId, 'My Category', 'Star', '#FF0000');
      await createTestCategory(otherUserId, 'Other Category', 'Circle', '#00FF00');

      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('My Category');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category with valid data', async () => {
      const categoryData = {
        name: 'Groceries',
        icon: 'ShoppingCart',
        color: '#4F46E5',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(categoryData.name);
      expect(response.body.icon).toBe(categoryData.icon);
      expect(response.body.color).toBe(categoryData.color);
      expect(response.body.userId).toBe(userId);
      expect(response.body.isActive).toBe(true);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          icon: 'ShoppingCart',
          color: '#4F46E5',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Name, icon, and color are required');
    });

    it('should return 400 when icon is missing', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Groceries',
          color: '#4F46E5',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Name, icon, and color are required');
    });

    it('should return 400 when color is missing', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Groceries',
          icon: 'ShoppingCart',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Name, icon, and color are required');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          name: 'Groceries',
          icon: 'ShoppingCart',
          color: '#4F46E5',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update category name', async () => {
      const category = await createTestCategory(userId, 'Old Name', 'Star', '#FF0000');

      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(category.id);
      expect(response.body.name).toBe('New Name');
      expect(response.body.icon).toBe('Star');
    });

    it('should update category icon', async () => {
      const category = await createTestCategory(userId, 'Food', 'OldIcon', '#FF0000');

      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ icon: 'NewIcon' });

      expect(response.status).toBe(200);
      expect(response.body.icon).toBe('NewIcon');
    });

    it('should update category color', async () => {
      const category = await createTestCategory(userId, 'Food', 'Star', '#FF0000');

      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ color: '#00FF00' });

      expect(response.status).toBe(200);
      expect(response.body.color).toBe('#00FF00');
    });

    it('should update isActive flag', async () => {
      const category = await createTestCategory(userId, 'Food', 'Star', '#FF0000');

      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.isActive).toBe(false);
    });

    it('should return 404 when category not found', async () => {
      const response = await request(app)
        .put('/api/categories/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Category not found');
    });

    it('should return 400 with invalid category ID', async () => {
      const response = await request(app)
        .put('/api/categories/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid category ID');
    });

    it('should not update another users category', async () => {
      const otherCategory = await createTestCategory(otherUserId, 'Other Category', 'Star', '#FF0000');

      const response = await request(app)
        .put(`/api/categories/${otherCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked Name' });

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const category = await createTestCategory(userId, 'Food', 'Star', '#FF0000');

      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(401);
    });
  });
});
