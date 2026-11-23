import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import * as db from '../src/config/database';

describe('Health Checks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health/live', () => {
    it('debe responder 200 OK con status UP', async () => {
      const res = await request(app).get('/health/live');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'UP' });
    });
  });

  describe('GET /health/ready', () => {
    it('debe responder 200 OK cuando la base de datos responde exitosamente', async () => {
      vi.spyOn(db, 'checkDatabaseConnection').mockResolvedValue(true);

      const res = await request(app).get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: 'UP',
        database: 'connected'
      });
    });

    it('debe responder 503 Service Unavailable cuando la base de datos no está disponible', async () => {
      vi.spyOn(db, 'checkDatabaseConnection').mockResolvedValue(false);

      const res = await request(app).get('/health/ready');

      expect(res.status).toBe(503);
      expect(res.body).toEqual({
        status: 'DOWN',
        database: 'disconnected'
      });
    });
  });
});
