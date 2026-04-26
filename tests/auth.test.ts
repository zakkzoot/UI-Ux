import './setup';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { createTestUser } from './helpers/auth';

describe('Auth API', () => {
  const validUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Secure@123!',
  };

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(validUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        user: { email: validUser.email, name: validUser.name },
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);
      const res = await request(app).post('/api/v1/auth/register').send(validUser);
      expect(res.status).toBe(409);
    });

    it('validates password strength', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validUser, password: 'weak' });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);
    });

    it('logs in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: validUser.password });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('rejects wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: 'WrongPass@1!' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns current user with valid token', async () => {
      const user = await createTestUser();
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(user.email);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
