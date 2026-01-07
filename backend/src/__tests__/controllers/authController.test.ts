import request from 'supertest';
import app from '../../index';
import { testPool } from '../setup';
import { cleanupTestData, createTestUser } from '../helpers/testUtils';

describe('Auth Controller', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'securePass123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.name).toBe('John Doe');
      expect(response.body.user.email).toBe('john@example.com');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'john@example.com',
          password: 'securePass123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Name, email, and password are required');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          password: 'securePass123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 when user already exists', async () => {
      const email = 'duplicate@example.com';

      await request(app).post('/api/auth/register').send({
        name: 'First User',
        email,
        password: 'password123',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email,
          password: 'password456',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('User already exists');
    });

    it('should hash the password before storing', async () => {
      const password = 'plainTextPassword';
      const email = 'secure@example.com';

      await request(app).post('/api/auth/register').send({
        name: 'Secure User',
        email,
        password,
      });

      const result = await testPool.query(
        'SELECT password_hash FROM users WHERE email = $1',
        [email]
      );

      const storedHash = result.rows[0].password_hash;
      expect(storedHash).not.toBe(password);
      expect(storedHash).toHaveLength(60);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const { user, password } = await createTestUser(
        'Test User',
        'login@example.com',
        'correctPassword'
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.id).toBe(user.id);
      expect(response.body.user.email).toBe(user.email);
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email and password are required');
    });

    it('should return 401 with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somePassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return 401 with incorrect password', async () => {
      const { user } = await createTestUser(
        'Test User',
        'test@example.com',
        'correctPassword'
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return a valid JWT token', async () => {
      const { user, password } = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.split('.')).toHaveLength(3);
    });
  });
});
