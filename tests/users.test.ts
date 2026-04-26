import './setup';
import request from 'supertest';
import { app } from '../src/app';
import { createTestUser } from './helpers/auth';

describe('Users API', () => {
  describe('GET /api/v1/users', () => {
    it('returns paginated users for admin', async () => {
      const admin = await createTestUser({ role: 'ADMIN' });
      await createTestUser();
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${admin.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
    });

    it('returns 403 for non-admin', async () => {
      const user = await createTestUser();
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('returns user by id', async () => {
      const user = await createTestUser();
      const res = await request(app)
        .get(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(user.id);
    });

    it('returns 404 for unknown id', async () => {
      const user = await createTestUser();
      const res = await request(app)
        .get('/api/v1/users/clxxxxxxxxxxxxxxxxxxxxxx')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('allows user to update own profile', async () => {
      const user = await createTestUser();
      const res = await request(app)
        .patch(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ name: 'Updated Name' });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('prevents user from updating another user', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const res = await request(app)
        .patch(`/api/v1/users/${user2.id}`)
        .set('Authorization', `Bearer ${user1.token}`)
        .send({ name: 'Hacked' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('allows admin to soft-delete user', async () => {
      const admin = await createTestUser({ role: 'ADMIN' });
      const user = await createTestUser();
      const res = await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${admin.token}`);
      expect(res.status).toBe(204);
    });

    it('returns 403 for non-admin', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const res = await request(app)
        .delete(`/api/v1/users/${user2.id}`)
        .set('Authorization', `Bearer ${user1.token}`);
      expect(res.status).toBe(403);
    });
  });
});
