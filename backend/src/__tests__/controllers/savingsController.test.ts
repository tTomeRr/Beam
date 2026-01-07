import request from 'supertest';
import app from '../../index';
import {
  cleanupTestData,
  createTestUser,
  createTestSavingsAccount,
} from '../helpers/testUtils';

describe('Savings Controller', () => {
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

  describe('GET /api/savings', () => {
    it('should return empty array when user has no savings accounts', async () => {
      const response = await request(app)
        .get('/api/savings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return user savings accounts', async () => {
      await createTestSavingsAccount(userId, 'Emergency Fund', 'savings', 5000, 'ILS');
      await createTestSavingsAccount(userId, 'Vacation Fund', 'goal', 2000, 'USD');

      const response = await request(app)
        .get('/api/savings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('balance');
      expect(response.body[0]).toHaveProperty('currency');
    });

    it('should not return other users savings accounts', async () => {
      await createTestSavingsAccount(userId, 'My Savings', 'savings', 1000, 'ILS');
      await createTestSavingsAccount(otherUserId, 'Other Savings', 'savings', 2000, 'ILS');

      const response = await request(app)
        .get('/api/savings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('My Savings');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/api/savings');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/savings', () => {
    it('should create a new savings account with valid data', async () => {
      const savingsData = {
        name: 'New Car Fund',
        type: 'goal',
        balance: 3000,
        currency: 'ILS',
      };

      const response = await request(app)
        .post('/api/savings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(savingsData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(savingsData.name);
      expect(response.body.type).toBe(savingsData.type);
      expect(parseFloat(response.body.balance)).toBe(3000.00);
      expect(response.body.currency).toBe(savingsData.currency);
      expect(response.body.userId).toBe(userId);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/savings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'savings',
          balance: 1000,
          currency: 'ILS',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when type is missing', async () => {
      const response = await request(app)
        .post('/api/savings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Account',
          balance: 1000,
          currency: 'ILS',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when balance is missing', async () => {
      const response = await request(app)
        .post('/api/savings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Account',
          type: 'savings',
          currency: 'ILS',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when currency is missing', async () => {
      const response = await request(app)
        .post('/api/savings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Account',
          type: 'savings',
          balance: 1000,
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/savings')
        .send({
          name: 'Test Account',
          type: 'savings',
          balance: 1000,
          currency: 'ILS',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/savings/:id', () => {
    it('should update savings account name', async () => {
      const account = await createTestSavingsAccount(userId, 'Old Name', 'savings', 1000, 'ILS');

      const response = await request(app)
        .put(`/api/savings/${account.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(account.id);
      expect(response.body.name).toBe('New Name');
    });

    it('should update savings account balance', async () => {
      const account = await createTestSavingsAccount(userId, 'Savings', 'savings', 1000, 'ILS');

      const response = await request(app)
        .put(`/api/savings/${account.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ balance: 2500 });

      expect(response.status).toBe(200);
      expect(parseFloat(response.body.balance)).toBe(2500.00);
    });

    it('should update savings account type', async () => {
      const account = await createTestSavingsAccount(userId, 'Savings', 'savings', 1000, 'ILS');

      const response = await request(app)
        .put(`/api/savings/${account.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'goal' });

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('goal');
    });

    it('should return 404 when savings account not found', async () => {
      const response = await request(app)
        .put('/api/savings/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
    });

    it('should return 400 with invalid savings account ID', async () => {
      const response = await request(app)
        .put('/api/savings/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(400);
    });

    it('should not update another users savings account', async () => {
      const otherAccount = await createTestSavingsAccount(otherUserId, 'Other Account', 'savings', 1000, 'ILS');

      const response = await request(app)
        .put(`/api/savings/${otherAccount.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked Name' });

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const account = await createTestSavingsAccount(userId, 'Savings', 'savings', 1000, 'ILS');

      const response = await request(app)
        .put(`/api/savings/${account.id}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/savings/:id', () => {
    it('should delete a savings account', async () => {
      const account = await createTestSavingsAccount(userId, 'To Delete', 'savings', 1000, 'ILS');

      const response = await request(app)
        .delete(`/api/savings/${account.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      const getResponse = await request(app)
        .get('/api/savings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 when savings account not found', async () => {
      const response = await request(app)
        .delete('/api/savings/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 with invalid savings account ID', async () => {
      const response = await request(app)
        .delete('/api/savings/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should not delete another users savings account', async () => {
      const otherAccount = await createTestSavingsAccount(otherUserId, 'Other Account', 'savings', 1000, 'ILS');

      const response = await request(app)
        .delete(`/api/savings/${otherAccount.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const account = await createTestSavingsAccount(userId, 'To Delete', 'savings', 1000, 'ILS');

      const response = await request(app)
        .delete(`/api/savings/${account.id}`);

      expect(response.status).toBe(401);
    });
  });
});
